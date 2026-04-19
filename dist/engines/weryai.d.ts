export declare class WeryAIEngine {
    private apiKey;
    constructor();
    generateImage(prompt: string, aspectRatio?: string): Promise<string>;
    generateVideo(prompt: string, aspectRatio?: string, imageUrl?: string): Promise<string>;
}
