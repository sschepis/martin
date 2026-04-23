import { Adapter, ProductionManifest, Shot, ShotContext } from '../types.ts';
export declare class RunwayGen3Adapter implements Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot, context?: ShotContext): string;
}
