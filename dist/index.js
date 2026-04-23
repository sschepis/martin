import { LLMEngine } from "./llm.js";
import { RunwayGen3Adapter } from "./adapters/runway-gen3.js";
import { LumaDreamMachineAdapter } from "./adapters/luma.js";
import { SoraAdapter } from "./adapters/sora.js";
import { WeryAIAdapter } from "./adapters/weryai.js";
import { ShotstackAdapter } from "./adapters/shotstack.js";
import { WeryAIEngine } from "./engines/weryai.js";
import { ElevenLabsEngine } from "./engines/elevenlabs.js";
import { ShotstackCompiler } from "./compiler.js";
import { getTempoDefaults } from "./tempo.js";
import { generateReferenceImages } from "./reference-images.js";
import { resolveClipDuration } from "./audio-timing.js";
import { TimelineBuilder } from "./timeline-builder.js";
export * from "./types.js";
export { ShotstackCompiler } from "./compiler.js";
export { TimelineBuilder } from "./timeline-builder.js";
export { generateReferenceImages } from "./reference-images.js";
export { getTempoDefaults } from "./tempo.js";
export { resolveClipDuration, estimateNarrationDuration } from "./audio-timing.js";
export class Martin {
    config;
    llmEngine;
    adapters;
    constructor(config = {}) {
        this.config = config;
        this.llmEngine = new LLMEngine(config);
        // Register built-in adapters
        this.adapters = new Map();
        this.registerAdapter(new RunwayGen3Adapter());
        this.registerAdapter(new LumaDreamMachineAdapter());
        this.registerAdapter(new SoraAdapter());
        this.registerAdapter(new WeryAIAdapter());
        this.registerAdapter(new ShotstackAdapter());
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
        const m = { ...manifest };
        if (!m.negativePrompt && this.config.defaultNegativePrompt)
            m.negativePrompt = this.config.defaultNegativePrompt;
        if (!m.styleGuards && this.config.defaultStyleGuards)
            m.styleGuards = [...this.config.defaultStyleGuards];
        const weryai = new WeryAIEngine();
        const elevenlabs = new ElevenLabsEngine();
        const compiler = new ShotstackCompiler(this.config);
        console.log('\n🎬 Starting Production Execution...');
        const weryaiAdapter = this.adapters.get('weryai');
        const clips = [];
        const tempoDefaults = getTempoDefaults(m.tempo);
        let referenceImages;
        if (options.useReferenceImages && (m.characters?.length || m.environments?.length)) {
            console.log('\n📸 Generating Reference Images...');
            referenceImages = await generateReferenceImages(m, weryai, m.aspectRatio);
        }
        for (let i = 0; i < m.shots.length; i++) {
            const shot = m.shots[i];
            console.log(`\n--- Processing Shot ${i + 1}/${m.shots.length} ---`);
            const context = {
                shotIndex: i,
                totalShots: m.shots.length,
                previousShot: i > 0 ? m.shots[i - 1] : undefined,
                tempo: tempoDefaults,
            };
            let imageUrl;
            if (referenceImages) {
                if (shot.characterIds?.length) {
                    imageUrl = referenceImages.characters.get(shot.characterIds[0]);
                }
                else if (shot.environmentId) {
                    imageUrl = referenceImages.environments.get(shot.environmentId);
                }
            }
            else if (options.useImageToVideo && options.imageEngine === 'weryai') {
                const imagePrompt = weryaiAdapter.generateImagePrompt ? weryaiAdapter.generateImagePrompt(m, shot, context) : weryaiAdapter.generatePrompt(m, shot, context);
                console.log(`[Martin] Generating reference image...`);
                imageUrl = await weryai.generateImage(imagePrompt, m.aspectRatio);
            }
            const videoPrompt = weryaiAdapter.generatePrompt(m, shot, context);
            console.log(`[Martin] Generating video...`);
            const videoUrl = await weryai.generateVideo(videoPrompt, m.aspectRatio, imageUrl);
            let audioUrlOrPath;
            if (options.audioEngine === 'elevenlabs' && shot.narration && shot.narration.trim().length > 0) {
                console.log(`[Martin] Generating audio narration...`);
                audioUrlOrPath = await elevenlabs.generateAudio(shot.narration);
            }
            const clipDuration = resolveClipDuration(tempoDefaults.defaultShotDuration, shot.narration);
            clips.push({
                videoUrlOrPath: videoUrl,
                audioUrlOrPath,
                duration: clipDuration,
                narrationText: shot.narration,
            });
        }
        let composition;
        if (options.compositionMode === 'llm') {
            console.log('\n🎬 Generating Shotstack Composition via LLM...');
            composition = await this.llmEngine.generateShotstackComposition(m, clips);
        }
        else {
            console.log('\n🎬 Building Shotstack Composition...');
            const resolution = options.resolution
                ? (options.resolution.width >= 3840 ? '4k' : options.resolution.width >= 1920 ? '1080' : 'hd')
                : 'hd';
            const builder = new TimelineBuilder();
            builder
                .setLayout(options.layoutMode || 'sequential')
                .setOutput('mp4', resolution)
                .buildFromClips(clips, {
                defaultTransition: 'fade',
                tempo: tempoDefaults,
            });
            composition = builder.build();
        }
        console.log('\n🎬 Compiling Final Scene via Shotstack...');
        const outputUrl = await compiler.compile(composition);
        console.log(`\n🎉 Production Complete! Final video: ${outputUrl}`);
        return outputUrl;
    }
    exportManifest(manifest, adapterName) {
        const adapter = this.adapters.get(adapterName.toLowerCase());
        if (!adapter) {
            throw new Error(`Adapter '${adapterName}' not found. Available adapters: ${Array.from(this.adapters.keys()).join(', ')}`);
        }
        const tempoDefaults = getTempoDefaults(manifest.tempo);
        return manifest.shots.map((shot, i) => adapter.generatePrompt(manifest, shot, {
            shotIndex: i,
            totalShots: manifest.shots.length,
            previousShot: i > 0 ? manifest.shots[i - 1] : undefined,
            tempo: tempoDefaults,
        }));
    }
}
// Export a default instance creator for convenience
export function createDirector(config) {
    return new Martin(config);
}
