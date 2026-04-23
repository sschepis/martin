import { Adapter, ProductionManifest, Shot, ShotContext } from '../types.ts';
export declare class ShotstackAdapter implements Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot, _context?: ShotContext): string;
}
