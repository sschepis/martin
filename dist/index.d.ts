import { MartinConfig, ProductionManifest, Adapter } from './types';
export * from './types';
export declare class Martin {
    private config;
    private llmEngine;
    private adapters;
    constructor(config?: MartinConfig);
    /**
     * Registers a new video generation adapter.
     */
    registerAdapter(adapter: Adapter): void;
    /**
     * Plans the production by analyzing the script and generating a manifest.
     */
    plan(script: string, options?: {
        style?: string;
        aspectRatio?: string;
    }): Promise<ProductionManifest & {
        export: (adapterName: string) => string[];
    }>;
    /**
     * Exports the manifest using a specific adapter.
     */
    exportManifest(manifest: ProductionManifest, adapterName: string): string[];
}
export declare function createDirector(config?: MartinConfig): Martin;
