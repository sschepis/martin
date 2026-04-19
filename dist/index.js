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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Martin = exports.LocalSceneCompiler = void 0;
exports.createDirector = createDirector;
const llm_1 = require("./llm");
const runway_gen3_1 = require("./adapters/runway-gen3");
const luma_1 = require("./adapters/luma");
const sora_1 = require("./adapters/sora");
const weryai_1 = require("./adapters/weryai");
const shotstack_1 = require("./adapters/shotstack");
const weryai_2 = require("./engines/weryai");
const elevenlabs_1 = require("./engines/elevenlabs");
const compiler_1 = require("./compiler");
__exportStar(require("./types"), exports);
var compiler_2 = require("./compiler");
Object.defineProperty(exports, "LocalSceneCompiler", { enumerable: true, get: function () { return compiler_2.LocalSceneCompiler; } });
class Martin {
    config;
    llmEngine;
    adapters;
    constructor(config = {}) {
        this.config = config;
        this.llmEngine = new llm_1.LLMEngine(config);
        // Register built-in adapters
        this.adapters = new Map();
        this.registerAdapter(new runway_gen3_1.RunwayGen3Adapter());
        this.registerAdapter(new luma_1.LumaDreamMachineAdapter());
        this.registerAdapter(new sora_1.SoraAdapter());
        this.registerAdapter(new weryai_1.WeryAIAdapter());
        this.registerAdapter(new shotstack_1.ShotstackAdapter());
    }
    /**
     * Registers a new video generation adapter.
     */
    registerAdapter(adapter) {
        this.adapters.set(adapter.name.toLowerCase(), adapter);
    }
    /**
     * Plans the production by analyzing the script and generating a manifest.
     */
    async plan(script, options) {
        const manifest = await this.llmEngine.analyzeScript(script, options);
        // Attach an export method to the manifest for convenience
        return {
            ...manifest,
            export: (adapterName) => this.exportManifest(manifest, adapterName)
        };
    }
    /**
     * Exports the manifest using a specific adapter.
     */
    /**
     * Produces the full video by executing the pipeline.
     */
    async produce(manifest, options = {}) {
        const weryai = new weryai_2.WeryAIEngine();
        const elevenlabs = new elevenlabs_1.ElevenLabsEngine();
        const compiler = new compiler_1.LocalSceneCompiler();
        console.log('\n🎬 Starting Production Execution...');
        const weryaiAdapter = this.adapters.get('weryai');
        const clips = [];
        for (let i = 0; i < manifest.shots.length; i++) {
            const shot = manifest.shots[i];
            console.log(`\n--- Processing Shot ${i + 1}/${manifest.shots.length} ---`);
            let imageUrl;
            if (options.useImageToVideo && options.imageEngine === 'weryai') {
                const imagePrompt = weryaiAdapter.generateImagePrompt ? weryaiAdapter.generateImagePrompt(manifest, shot) : weryaiAdapter.generatePrompt(manifest, shot);
                console.log(`[Martin] Generating reference image...`);
                imageUrl = await weryai.generateImage(imagePrompt, manifest.aspectRatio);
            }
            const videoPrompt = weryaiAdapter.generatePrompt(manifest, shot);
            console.log(`[Martin] Generating video...`);
            const videoUrl = await weryai.generateVideo(videoPrompt, manifest.aspectRatio, imageUrl);
            let audioUrlOrPath;
            if (options.audioEngine === 'elevenlabs' && shot.narration && shot.narration.trim().length > 0) {
                console.log(`[Martin] Generating audio narration...`);
                audioUrlOrPath = await elevenlabs.generateAudio(shot.narration);
            }
            clips.push({
                videoUrlOrPath: videoUrl,
                audioUrlOrPath,
                duration: 5.0
            });
        }
        console.log('\n🎬 Compiling Final Scene...');
        const outputPath = await compiler.compile(clips, 'final_output.mp4', options.resolution);
        console.log(`\n🎉 Production Complete! Final video saved to: ${outputPath}`);
        return outputPath;
    }
    exportManifest(manifest, adapterName) {
        const adapter = this.adapters.get(adapterName.toLowerCase());
        if (!adapter) {
            throw new Error(`Adapter '${adapterName}' not found. Available adapters: ${Array.from(this.adapters.keys()).join(', ')}`);
        }
        return manifest.shots.map(shot => adapter.generatePrompt(manifest, shot));
    }
}
exports.Martin = Martin;
// Export a default instance creator for convenience
function createDirector(config) {
    return new Martin(config);
}
