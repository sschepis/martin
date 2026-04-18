export interface MartinConfig {
    llmProvider?: string;
    apiKey?: string;
    model?: string;
    promptCompactness?: 'full' | 'compact' | 'minimal';
}
export interface CameraDetails {
    movement: string;
    angle: string;
    lens?: string;
}
export interface LightingDetails {
    style: string;
    colorTemp?: string;
    contrast?: string;
}
export interface Shot {
    id: string;
    description: string;
    camera: CameraDetails;
    lighting: LightingDetails;
    duration?: string;
    subject?: string;
    environment?: string;
}
export interface ProductionManifest {
    title: string;
    mood: string;
    colorPalette: string[];
    aspectRatio: string;
    shots: Shot[];
}
export interface Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot): string;
}
