export declare class ElevenLabsEngine {
    private apiKey;
    constructor();
    generateAudio(text: string, voiceId?: string): Promise<string | undefined>;
}
