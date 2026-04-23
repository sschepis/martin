import { MartinConfig } from './types.ts';
export interface SceneClip {
    videoUrlOrPath: string;
    audioUrlOrPath?: string;
    duration?: number;
    narrationText?: string;
}
export declare class ShotstackCompiler {
    private apiKey;
    private apiUrl;
    constructor(config?: MartinConfig);
    private sanitize;
    compile(composition: any): Promise<string>;
    private pollRenderStatus;
}
