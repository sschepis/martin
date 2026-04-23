import { MartinConfig, ProductionManifest, Adapter } from './types.ts';
import { ProduceOptions } from './types.ts';
export * from './types.ts';
export { ShotstackCompiler } from './compiler.ts';
export type { SceneClip } from './compiler.ts';
export { TimelineBuilder } from './timeline-builder.ts';
export { generateReferenceImages } from './reference-images.ts';
export type { ReferenceImageSet } from './reference-images.ts';
export { getTempoDefaults } from './tempo.ts';
export { resolveClipDuration, estimateNarrationDuration } from './audio-timing.ts';
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
