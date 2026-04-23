import type { ImageEngine } from '../types.ts';
export declare class WeryAIEngine implements ImageEngine {
    name: string;
    private apiKey;
    constructor();
    generateImage(prompt: string, aspectRatio?: string): Promise<string>;
    generateVideo(prompt: string, aspectRatio?: string, imageUrl?: string): Promise<string>;
}
