"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSceneCompiler = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class LocalSceneCompiler {
    async downloadFile(url, destPath) {
        if (!url.startsWith('http')) {
            fs.copyFileSync(url, destPath);
            return;
        }
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Failed to fetch ${url}`);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(buffer));
    }
    async compile(clips, outputPath, options = {}) {
        const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'martin-scene-'));
        console.log(`[LocalCompiler] Working directory: ${workDir}`);
        try {
            const processedClips = [];
            // Process each clip
            for (let i = 0; i < clips.length; i++) {
                const clip = clips[i];
                console.log(`[LocalCompiler] Processing clip ${i + 1}/${clips.length}...`);
                const videoExt = clip.videoUrlOrPath.split('.').pop()?.split('?')[0] || 'mp4';
                const rawVideoPath = path.join(workDir, `raw_video_${i}.${videoExt}`);
                await this.downloadFile(clip.videoUrlOrPath, rawVideoPath);
                let finalClipPath = rawVideoPath;
                // If there's audio, merge it with the video
                let audioPathToUse = clip.audioUrlOrPath;
                if (!audioPathToUse) {
                    audioPathToUse = path.join(workDir, `silent_audio_${i}.mp3`);
                    await execAsync(`ffmpeg -y -f lavfi -i anullsrc=r=48000:cl=stereo -t 60 -q:a 9 -acodec libmp3lame "${audioPathToUse}"`);
                }
                if (audioPathToUse) {
                    const audioExt = audioPathToUse.split('.').pop()?.split('?')[0] || 'mp3';
                    const audioPath = path.join(workDir, `audio_${i}.${audioExt}`);
                    if (audioPathToUse !== clip.audioUrlOrPath) {
                        fs.copyFileSync(audioPathToUse, audioPath);
                    }
                    else {
                        await this.downloadFile(audioPathToUse, audioPath);
                    }
                    const mergedPath = path.join(workDir, `merged_${i}.mp4`);
                    // Merge video and audio, truncating audio to video length or vice versa
                    // Using -shortest to stop encoding when the shortest stream ends
                    const cmd = `ffmpeg -y -i "${rawVideoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest "${mergedPath}"`;
                    await execAsync(cmd);
                    finalClipPath = mergedPath;
                }
                // Standardize the clip format for concatenation (1080p, 24fps, standard audio)
                const standardizedPath = path.join(workDir, `std_${i}.mp4`);
                const stdCmd = `ffmpeg -y -i "${finalClipPath}" -vf "scale=${options.width || 1920}:${options.height || 1080}:force_original_aspect_ratio=decrease,pad=${options.width || 1920}:${options.height || 1080}:(ow-iw)/2:(oh-ih)/2,fps=24" -c:v libx264 -preset fast -crf 22 -c:a aac -ar 48000 -ac 2 "${standardizedPath}"`;
                await execAsync(stdCmd);
                processedClips.push(standardizedPath);
            }
            // Concat all standardized clips
            console.log(`[LocalCompiler] Concatenating ${processedClips.length} clips...`);
            const listPath = path.join(workDir, 'list.txt');
            const listContent = processedClips.map(p => `file '${p}'`).join('\n');
            fs.writeFileSync(listPath, listContent);
            const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`;
            await execAsync(concatCmd);
            console.log(`[LocalCompiler] Scene compiled successfully: ${outputPath}`);
            return outputPath;
        }
        finally {
            // Cleanup
            fs.rmSync(workDir, { recursive: true, force: true });
        }
    }
}
exports.LocalSceneCompiler = LocalSceneCompiler;
