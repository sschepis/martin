import { Adapter, ProductionManifest, Shot } from '../types.ts';
export declare class RunwayGen3Adapter implements Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot): string;
}
