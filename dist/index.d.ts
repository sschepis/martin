import { MartinConfig, ProductionManifest, Adapter } from './types';
import { ProduceOptions } from './types';
export * from './types';
export { LocalSceneCompiler, SceneClip } from './compiler';
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
    /**
     * Produces the full video by executing the pipeline.
     */
    produce(manifest: ProductionManifest, options?: ProduceOptions): Promise<string>;
    exportManifest(manifest: ProductionManifest, adapterName: string): string[];
}
export declare function createDirector(config?: MartinConfig): Martin;
