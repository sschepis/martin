import { Adapter, ProductionManifest, Shot } from '../types.ts';
export declare class ShotstackAdapter implements Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot): string;
}
