import { MartinConfig, ProductionManifest, Adapter, ShotContext, ImageEngine, VideoEngine, VideoGenerationOptions, VideoEngineResult, StoryboardResult, PromptResultRecord } from './types.ts';
import { LLMEngine } from './llm.ts';
import { RunwayGen3Adapter } from './adapters/runway-gen3.ts';
import { LumaDreamMachineAdapter } from './adapters/luma.ts';
import { SoraAdapter } from './adapters/sora.ts';
import { WeryAIAdapter } from './adapters/weryai.ts';
import { ShotstackAdapter } from './adapters/shotstack.ts';
import { WeryAIEngine } from './engines/weryai.ts';
import { LumaEngine } from './engines/luma.ts';
import { RunwayEngine } from './engines/runway.ts';
import { KlingEngine } from './engines/kling.ts';
import { FalEngine } from './engines/fal.ts';
import { ElevenLabsEngine } from './engines/elevenlabs.ts';
import { ProduceOptions } from './types.ts';
import { ShotstackCompiler } from './compiler.ts';
import type { SceneClip } from './compiler.ts';
import { getTempoDefaults } from './tempo.ts';
import { generateReferenceImages } from './reference-images.ts';
import type { ReferenceImageSet } from './reference-images.ts';
import { TimelineBuilder } from './timeline-builder.ts';
import { resolveMotionControl, applyTempoToMotion } from './motion.ts';
import { resolveSmartDuration } from './duration.ts';
import { validateVideoResult, buildRetryPrompt } from './validation.ts';
import { resolveMusicUrl, resolveSfxUrl, resolveAudioMixLevels } from './audio-landscape.ts';
import { generateStoryboard } from './storyboard.ts';
import { estimateCost } from './cost-estimate.ts';
import { generatePromptVariants } from './prompt-variants.ts';
import { generateAndSelectVariant, PromptHistory, toPromptRecord } from './variant-selector.ts';
import { AssetCache, isMockResult } from './cache.ts';
import type { AssetType } from './cache.ts';

export * from './types.ts';
export { ShotstackCompiler } from './compiler.ts';
export type { SceneClip } from './compiler.ts';
export { TimelineBuilder } from './timeline-builder.ts';
export type { AudioMixOptions } from './timeline-builder.ts';
export { generateReferenceImages } from './reference-images.ts';
export type { ReferenceImageSet } from './reference-images.ts';
export { getTempoDefaults } from './tempo.ts';
export { resolveClipDuration, estimateNarrationDuration } from './audio-timing.ts';

export { ElevenLabsEngine } from './engines/elevenlabs.ts';
export { LumaEngine } from './engines/luma.ts';
export { RunwayEngine } from './engines/runway.ts';
export { KlingEngine } from './engines/kling.ts';
export { FalEngine } from './engines/fal.ts';

export { parseShotDuration, estimateContentDuration, resolveSmartDuration } from './duration.ts';
export type { DurationRange } from './duration.ts';

export { MOTION_PRESETS, resolveMotionControl, buildMotionDescription, applyTempoToMotion } from './motion.ts';

export { validateVideoResult, buildRetryPrompt } from './validation.ts';
export type { ValidationResult } from './validation.ts';

export { resolveMusicUrl, resolveSfxUrl, extractSfxKeywords, resolveAudioMixLevels, DEFAULT_MIX_LEVELS, MOOD_MUSIC_LIBRARY, SFX_LIBRARY } from './audio-landscape.ts';

export { generateStoryboard, buildStoryboardImagePrompt, buildAnnotation } from './storyboard.ts';
export { renderStoryboardHtml } from './storyboard-html.ts';
export { estimateCost, DEFAULT_ENGINE_RATES } from './cost-estimate.ts';

export { generatePromptVariants } from './prompt-variants.ts';
export { generateAndSelectVariant, PromptHistory, toPromptRecord } from './variant-selector.ts';

export { AssetCache, isMockResult } from './cache.ts';
export type { CacheConfig, CacheEntry, AssetType } from './cache.ts';

const ENGINE_ADAPTER_MAP: Record<string, string> = {
  'runway': 'runway-gen3',
  'kling': 'weryai',
  'fal': 'weryai',
};

export class Martin {
  private config: MartinConfig;
  private llmEngine: LLMEngine;
  private adapters: Map<string, Adapter>;
  private engines: Map<string, VideoEngine>;
  private promptHistory = new PromptHistory();
  private cache: AssetCache;

  constructor(config: MartinConfig = {}) {
    this.config = config;
    this.llmEngine = new LLMEngine(config);
    this.cache = new AssetCache({
      directory: config.cacheDir,
      defaultTTL: config.cacheTTL,
    });

    this.adapters = new Map();
    this.registerAdapter(new RunwayGen3Adapter());
    this.registerAdapter(new LumaDreamMachineAdapter());
    this.registerAdapter(new SoraAdapter());
    this.registerAdapter(new WeryAIAdapter());
    this.registerAdapter(new ShotstackAdapter());

    this.engines = new Map();
    this.registerEngine(new WeryAIEngine());
    this.registerEngine(new LumaEngine());
    this.registerEngine(new RunwayEngine());
    this.registerEngine(new KlingEngine());
    this.registerEngine(new FalEngine());
  }

  registerAdapter(adapter: Adapter) {
    this.adapters.set(adapter.name.toLowerCase(), adapter);
  }

  registerEngine(engine: VideoEngine) {
    this.engines.set(engine.name.toLowerCase(), engine);
  }

  private getEngine(name: string): VideoEngine {
    const engine = this.engines.get(name.toLowerCase());
    if (!engine) {
      throw new Error(`Video engine '${name}' not found. Available engines: ${Array.from(this.engines.keys()).join(', ')}`);
    }
    return engine;
  }

  private getAdapterForEngine(engineName: string): Adapter {
    const direct = this.adapters.get(engineName.toLowerCase());
    if (direct) return direct;

    const mapped = ENGINE_ADAPTER_MAP[engineName.toLowerCase()];
    if (mapped) {
      const adapter = this.adapters.get(mapped);
      if (adapter) return adapter;
    }

    return this.adapters.get('weryai')!;
  }

  private async cachedGenerate<T>(
    type: AssetType,
    key: string,
    generator: () => Promise<T>,
    cacheMode: boolean | 'read-only' | 'write-only',
    inputs?: Record<string, unknown>,
  ): Promise<T> {
    if (cacheMode === false) return generator();

    if (cacheMode !== 'write-only') {
      const cached = this.cache.get<T>(type, key);
      if (cached !== undefined) {
        console.log(`[Cache] HIT ${type}:${key.slice(0, 8)}...`);
        return cached;
      }
    }

    const result = await generator();

    if (cacheMode !== 'read-only' && result !== undefined && !isMockResult(result)) {
      this.cache.set(type, key, result, inputs);
      console.log(`[Cache] STORED ${type}:${key.slice(0, 8)}...`);
    }

    return result;
  }

  async plan(script: string, options?: { style?: string; aspectRatio?: string }): Promise<ProductionManifest & { export: (adapterName: string) => string[] }> {
    const manifest = await this.llmEngine.analyzeScript(script, options);

    return {
      ...manifest,
      export: (adapterName: string) => this.exportManifest(manifest, adapterName)
    };
  }

  async storyboard(manifest: ProductionManifest, options: ProduceOptions = {}): Promise<StoryboardResult> {
    const imageEngine = new WeryAIEngine();
    const cacheMode = options.cache ?? true;
    const cachedImageEngine: ImageEngine = {
      name: imageEngine.name,
      generateImage: (prompt: string, ar: string) => {
        const key = AssetCache.hashKey('image', prompt.trim(), ar);
        return this.cachedGenerate('image', key,
          () => imageEngine.generateImage(prompt, ar), cacheMode,
          { prompt: prompt.slice(0, 80), aspectRatio: ar });
      },
    };
    const result = await generateStoryboard(manifest, cachedImageEngine);
    result.costEstimate = estimateCost(manifest, options);
    return result;
  }

  getPromptHistory(): ReadonlyArray<PromptResultRecord> {
    return this.promptHistory.getRecords();
  }

  exportPromptHistory(): string {
    return this.promptHistory.toJSON();
  }

  importPromptHistory(json: string): void {
    this.promptHistory = PromptHistory.fromJSON(json);
  }

  async produce(manifest: ProductionManifest, options: ProduceOptions = {}): Promise<string> {
    const m = { ...manifest };
    if (!m.negativePrompt && this.config.defaultNegativePrompt) m.negativePrompt = this.config.defaultNegativePrompt;
    if (!m.styleGuards && this.config.defaultStyleGuards) m.styleGuards = [...this.config.defaultStyleGuards];

    const imageEngine = new WeryAIEngine();
    const elevenlabs = new ElevenLabsEngine();
    const compiler = new ShotstackCompiler(this.config);
    const cacheMode = options.cache ?? true;

    const cachedImageEngine: ImageEngine = {
      name: imageEngine.name,
      generateImage: (prompt: string, ar: string) => {
        const key = AssetCache.hashKey('image', prompt.trim(), ar);
        return this.cachedGenerate('image', key,
          () => imageEngine.generateImage(prompt, ar), cacheMode,
          { prompt: prompt.slice(0, 80), aspectRatio: ar });
      },
    };

    console.log('\n🎬 Starting Production Execution...');

    const clips: SceneClip[] = [];
    const tempoDefaults = getTempoDefaults(m.tempo);

    let referenceImages: ReferenceImageSet | undefined;
    if (options.useReferenceImages && (m.characters?.length || m.environments?.length)) {
      console.log('\n📸 Generating Reference Images...');
      referenceImages = await generateReferenceImages(m, cachedImageEngine, m.aspectRatio);
    }

    const characterVoices = new Map<string, string>();
    if (options.audioEngine === 'elevenlabs' && m.characters?.length) {
      for (const char of m.characters) {
        if (char.voiceId) {
          characterVoices.set(char.id, char.voiceId);
        } else if (char.voiceDescription) {
          console.log(`\n🎙️ Designing voice for "${char.name || char.id}"...`);
          const voiceKey = AssetCache.hashKey('voice', (char.name || char.id).trim(), char.voiceDescription.trim());
          const voiceId = await this.cachedGenerate('voice', voiceKey,
            () => elevenlabs.designVoice(char.name || char.id, char.voiceDescription!),
            cacheMode,
            { name: char.name || char.id, description: char.voiceDescription.slice(0, 80) });
          if (voiceId) {
            characterVoices.set(char.id, voiceId);
            char.voiceId = voiceId;
          }
        }
      }
    }

    const variantCount = options.variantsPerShot ?? 1;

    for (let i = 0; i < m.shots.length; i++) {
      const shot = m.shots[i];
      console.log(`\n--- Processing Shot ${i + 1}/${m.shots.length} ---`);

      const engineName = shot.videoEngine || options.videoEngine || 'weryai';
      const engine = this.getEngine(engineName);
      const adapter = this.getAdapterForEngine(engineName);

      const context: ShotContext = {
        shotIndex: i,
        totalShots: m.shots.length,
        previousShot: i > 0 ? m.shots[i - 1] : undefined,
        tempo: tempoDefaults,
      };

      let imageUrl: string | undefined;

      if (referenceImages) {
        if (shot.characterIds?.length) {
          imageUrl = referenceImages.characters.get(shot.characterIds[0]);
        } else if (shot.environmentId) {
          imageUrl = referenceImages.environments.get(shot.environmentId);
        }
      } else if (options.useImageToVideo && options.imageEngine === 'weryai') {
        const imgAdapter = this.adapters.get('weryai')!;
        const imagePrompt = imgAdapter.generateImagePrompt ? imgAdapter.generateImagePrompt(m, shot, context) : imgAdapter.generatePrompt(m, shot, context);
        console.log(`[Martin] Generating reference image...`);
        imageUrl = await cachedImageEngine.generateImage(imagePrompt, m.aspectRatio);
      }

      const motionControl = resolveMotionControl(shot);
      const adjustedMotion = applyTempoToMotion(motionControl, tempoDefaults);

      const clipDuration = resolveSmartDuration(shot, tempoDefaults, shot.narration, engine.maxDuration);

      const videoPrompt = adapter.generatePrompt(m, shot, context);

      const genOptions: VideoGenerationOptions = {
        aspectRatio: m.aspectRatio,
        duration: clipDuration,
        imageUrl,
        negativePrompt: m.negativePrompt,
        motionControl: adjustedMotion,
      };

      let videoResult: VideoEngineResult;

      const cachedVideoEngine: VideoEngine = {
        name: engine.name,
        maxDuration: engine.maxDuration,
        supportedAspectRatios: engine.supportedAspectRatios,
        generateVideo: (prompt: string, opts: VideoGenerationOptions) => {
          const key = AssetCache.hashKey('video', engine.name, prompt.trim(), opts);
          return this.cachedGenerate('video', key,
            () => engine.generateVideo(prompt, opts), cacheMode,
            { engine: engine.name, shotId: shot.id, prompt: prompt.slice(0, 80) });
        },
      };

      if (variantCount > 1) {
        const variants = generatePromptVariants(m, shot, adapter, context, variantCount);
        const comparison = await generateAndSelectVariant(
          shot.id, variants, cachedVideoEngine, genOptions,
          options.variantSelection || 'auto'
        );
        videoResult = comparison.selectedVariant.result || { url: '' };

        for (const v of comparison.variants) {
          this.promptHistory.add(toPromptRecord(v, engine.name, adapter.name));
        }
      } else {
        videoResult = { url: '' };
        const maxRetries = options.maxRetries ?? 0;
        let currentPrompt = videoPrompt;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          console.log(`[Martin] Generating video via ${engine.name}${attempt > 0 ? ` (retry ${attempt})` : ''}...`);
          videoResult = await cachedVideoEngine.generateVideo(currentPrompt, genOptions);

          if (options.qualityValidation && attempt < maxRetries) {
            const validation = validateVideoResult(videoResult, genOptions);
            if (!validation.valid) {
              console.log(`[Martin] Validation failed (score: ${validation.score.toFixed(2)}): ${validation.issues.join(', ')}`);
              currentPrompt = buildRetryPrompt(videoPrompt, validation.issues);
              continue;
            }
          }
          break;
        }
      }

      let audioUrlOrPath: string | undefined;
      if (options.audioEngine === 'elevenlabs' && shot.narration && shot.narration.trim().length > 0) {
        const voiceId = (shot.speakerId && characterVoices.get(shot.speakerId))
          || m.narratorVoiceId
          || undefined;
        const speaker = shot.speakerId ? m.characters?.find(c => c.id === shot.speakerId) : undefined;
        console.log(`[Martin] Generating audio narration${speaker ? ` (voice: ${speaker.name || speaker.id})` : ''}...`);
        const audioKey = AssetCache.hashKey('audio', shot.narration!.trim(), voiceId || 'default', speaker?.voiceSettings);
        audioUrlOrPath = await this.cachedGenerate('audio', audioKey,
          () => elevenlabs.generateAudio(shot.narration!, voiceId, speaker?.voiceSettings),
          cacheMode,
          { shotId: shot.id, text: shot.narration!.slice(0, 80) });
      }

      let sfxUrlOrPath: string | undefined;
      if (options.sfxEnabled !== false && (m.audioLandscape?.sfxEnabled !== false)) {
        const sfxOverride = m.audioLandscape?.sfxKeywordOverrides?.[shot.id];
        sfxUrlOrPath = resolveSfxUrl(shot, m, sfxOverride);
      }

      clips.push({
        videoUrlOrPath: videoResult.url,
        audioUrlOrPath,
        sfxUrlOrPath,
        duration: clipDuration,
        narrationText: shot.narration,
      });
    }

    const musicUrl = resolveMusicUrl(m, options.musicUrl);
    const mixLevels = resolveAudioMixLevels(options.audioMixLevels);

    let composition: any;
    if (options.compositionMode === 'llm') {
      console.log('\n🎬 Generating Shotstack Composition via LLM...');
      composition = await this.llmEngine.generateShotstackComposition(m, clips);
    } else {
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
          audioMix: {
            musicUrl,
            musicVolume: mixLevels.musicVolume,
            sfxVolume: mixLevels.sfxVolume,
            narrationVolume: mixLevels.narrationVolume,
          },
        });
      composition = builder.build();
    }

    console.log('\n🎬 Compiling Final Scene via Shotstack...');
    const outputUrl = await compiler.compile(composition);
    console.log(`\n🎉 Production Complete! Final video: ${outputUrl}`);
    return outputUrl;
  }

  exportManifest(manifest: ProductionManifest, adapterName: string): string[] {
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

export function createDirector(config?: MartinConfig) {
  return new Martin(config);
}
