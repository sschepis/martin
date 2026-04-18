import { MartinConfig, ProductionManifest } from './types';
export declare class LLMEngine {
    private config;
    constructor(config: MartinConfig);
    /**
     * Simulates passing the script to an LLM with directorial schemas
     * and returning a structured ProductionManifest.
     */
    analyzeScript(script: string, options?: any): Promise<ProductionManifest>;
}
//# sourceMappingURL=llm.d.ts.map