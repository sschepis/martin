import { Adapter, ProductionManifest, Shot, ShotContext } from '../types.ts';
export declare class WeryAIAdapter implements Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot, context?: ShotContext): string;
    generateImagePrompt(manifest: ProductionManifest, shot: Shot, context?: ShotContext): string;
}
