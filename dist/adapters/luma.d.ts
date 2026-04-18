import { Adapter, ProductionManifest, Shot } from '../types';
export declare class LumaDreamMachineAdapter implements Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot): string;
}
