import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface SceneClip {
  videoUrlOrPath: string;
  audioUrlOrPath?: string;
  duration?: number;
}

export class LocalSceneCompiler {
  private async downloadFile(url: string, destPath: string): Promise<void> {
    if (!url.startsWith('http')) {
      fs.copyFileSync(url, destPath);
      return;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
  }

  async compile(clips: SceneClip[], outputPath: string, options: {width?: number, height?: number} = {}): Promise<string> {
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'martin-scene-'));
    console.log(`[LocalCompiler] Working directory: ${workDir}`);

    try {
      const processedClips: string[] = [];

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
          if (audioPathToUse !== clip.audioUrlOrPath) { fs.copyFileSync(audioPathToUse, audioPath); } else { await this.downloadFile(audioPathToUse, audioPath); }

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

    } finally {
      // Cleanup
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }
}
