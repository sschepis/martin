import { Adapter, ProductionManifest, Shot } from '../types';
export declare class WeryAIAdapter implements Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot): string;
}
