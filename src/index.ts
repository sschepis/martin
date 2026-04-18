import { MartinConfig, ProductionManifest, Adapter } from './types';
import { LLMEngine } from './llm';
import { RunwayGen3Adapter } from './adapters/runway-gen3';
import { LumaDreamMachineAdapter } from './adapters/luma';
import { SoraAdapter } from './adapters/sora';
import { WeryAIAdapter } from './adapters/weryai';
import { ShotstackAdapter } from './adapters/shotstack';

export * from './types';

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
