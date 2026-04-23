import { MartinConfig, ProductionManifest } from './types.ts';
import type { SceneClip } from './compiler.ts';
export declare class LLMEngine {
    private config;
    constructor(config: MartinConfig);
    /**
     * Generates the comprehensive system prompt for the LLM, combining
     * the Scene Design System, Film Shot Techniques, and JSON schema.
     */
    generateSystemPrompt(): string;
    private callLLM;
    analyzeScript(script: string, options?: any): Promise<ProductionManifest>;
    generateShotstackComposition(manifest: ProductionManifest, clips: SceneClip[]): Promise<any>;
}
