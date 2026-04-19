import { MartinConfig, ProductionManifest, Adapter } from './types';
import { LLMEngine } from './llm';
import { RunwayGen3Adapter } from './adapters/runway-gen3';
import { LumaDreamMachineAdapter } from './adapters/luma';
import { SoraAdapter } from './adapters/sora';
import { WeryAIAdapter } from './adapters/weryai';
import { ShotstackAdapter } from './adapters/shotstack';
import { WeryAIEngine } from './engines/weryai';
import { ElevenLabsEngine } from './engines/elevenlabs';
import { ProduceOptions } from './types';
import { LocalSceneCompiler, SceneClip } from './compiler';

export * from './types';
export { LocalSceneCompiler, SceneClip } from './compiler';

export class Martin {
  private config: MartinConfig;
  private llmEngine: LLMEngine;
  private adapters: Map<string, Adapter>;

  constructor(config: MartinConfig = {}) {
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
  registerAdapter(adapter: Adapter) {
    this.adapters.set(adapter.name.toLowerCase(), adapter);
  }

  /**
   * Plans the production by analyzing the script and generating a manifest.
   */
  async plan(script: string, options?: { style?: string; aspectRatio?: string }): Promise<ProductionManifest & { export: (adapterName: string) => string[] }> {
    const manifest = await this.llmEngine.analyzeScript(script, options);

    // Attach an export method to the manifest for convenience
    return {
      ...manifest,
      export: (adapterName: string) => this.exportManifest(manifest, adapterName)
    };
  }

  /**
   * Exports the manifest using a specific adapter.
   */

  /**
   * Produces the full video by executing the pipeline.
   */
  async produce(manifest: ProductionManifest, options: ProduceOptions = {}): Promise<string> {
    const weryai = new WeryAIEngine();
    const elevenlabs = new ElevenLabsEngine();
    const compiler = new LocalSceneCompiler();
    
    console.log('\n🎬 Starting Production Execution...');
    
    const weryaiAdapter = this.adapters.get('weryai')!;
    const clips: SceneClip[] = [];

    for (let i = 0; i < manifest.shots.length; i++) {
      const shot = manifest.shots[i];
      console.log(`\n--- Processing Shot ${i + 1}/${manifest.shots.length} ---`);
      
      let imageUrl: string | undefined;
      
      if (options.useImageToVideo && options.imageEngine === 'weryai') {
        const imagePrompt = weryaiAdapter.generateImagePrompt ? weryaiAdapter.generateImagePrompt(manifest, shot) : weryaiAdapter.generatePrompt(manifest, shot);
        console.log(`[Martin] Generating reference image...`);
        imageUrl = await weryai.generateImage(imagePrompt, manifest.aspectRatio);
      }

      const videoPrompt = weryaiAdapter.generatePrompt(manifest, shot);
      console.log(`[Martin] Generating video...`);
      const videoUrl = await weryai.generateVideo(videoPrompt, manifest.aspectRatio, imageUrl);
      
      let audioUrlOrPath: string | undefined;
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

  exportManifest(manifest: ProductionManifest, adapterName: string): string[] {
    const adapter = this.adapters.get(adapterName.toLowerCase());
    if (!adapter) {
      throw new Error(`Adapter '${adapterName}' not found. Available adapters: ${Array.from(this.adapters.keys()).join(', ')}`);
    }

    return manifest.shots.map(shot => adapter.generatePrompt(manifest, shot));
  }
}

// Export a default instance creator for convenience
export function createDirector(config?: MartinConfig) {
  return new Martin(config);
}
