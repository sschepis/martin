import { Adapter, ProductionManifest, Shot } from '../types.ts';
export declare class WeryAIAdapter implements Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot): string;
    generateImagePrompt(manifest: ProductionManifest, shot: Shot): string;
}
