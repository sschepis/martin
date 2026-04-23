import { Adapter, ProductionManifest, Shot, ShotContext } from '../types.ts';
export declare class LumaDreamMachineAdapter implements Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot, context?: ShotContext): string;
}
