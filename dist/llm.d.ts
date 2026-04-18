import { MartinConfig, ProductionManifest } from './types';
export declare class LLMEngine {
    private config;
    constructor(config: MartinConfig);
    /**
     * Generates the comprehensive system prompt for the LLM, combining
     * the Scene Design System, Film Shot Techniques, and JSON schema.
     */
    generateSystemPrompt(): string;
    /**
     * Simulates passing the script to an LLM with directorial schemas
     * and returning a structured ProductionManifest.
     */
    analyzeScript(script: string, options?: any): Promise<ProductionManifest>;
}
