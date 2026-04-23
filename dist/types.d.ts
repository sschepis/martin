export interface MartinConfig {
    llmProvider?: string;
    apiKey?: string;
    shotstackApiKey?: string;
    model?: string;
    promptCompactness?: 'full' | 'compact' | 'minimal';
    defaultNegativePrompt?: string;
    defaultStyleGuards?: string[];
}
export interface CharacterDefinition {
    id: string;
    name?: string;
    faceDescription: string;
    bodyType?: string;
    hair?: string;
    wardrobe: string;
    distinguishingFeatures?: string;
}
export interface EnvironmentDefinition {
    id: string;
    name?: string;
    spatialDescription: string;
    props?: string[];
    atmosphere?: string;
    timeOfDay?: string;
}
export interface VisualStyle {
    contrastStyle?: string;
    grainLevel?: string;
    colorGradingNotes?: string;
    blackLevel?: string;
    saturationRange?: [number, number];
    colorTemperatureRange?: [number, number];
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
export interface ShotTransition {
    type: string;
    duration?: number;
}
export interface Shot {
    id: string;
    description: string;
    camera: CameraDetails;
    lighting: LightingDetails;
    duration?: string;
    subject?: string;
    environment?: string;
    narration?: string;
    characterIds?: string[];
    environmentId?: string;
    transition?: ShotTransition;
}
export type Tempo = 'fast-cut' | 'medium' | 'slow-burn';
export interface TempoDefaults {
    defaultShotDuration: number;
    cameraSpeedModifier: string;
    transitionTiming: string;
}
export interface ShotContext {
    shotIndex: number;
    totalShots: number;
    previousShot?: Shot;
    tempo?: TempoDefaults;
}
export interface ProductionManifest {
    title: string;
    mood: string;
    colorPalette: string[];
    aspectRatio: string;
    shots: Shot[];
    negativePrompt?: string;
    styleGuards?: string[];
    characters?: CharacterDefinition[];
    environments?: EnvironmentDefinition[];
    visualStyle?: VisualStyle;
    tempo?: Tempo;
}
export interface Adapter {
    name: string;
    generatePrompt(manifest: ProductionManifest, shot: Shot, context?: ShotContext): string;
    generateImagePrompt?(manifest: ProductionManifest, shot: Shot, context?: ShotContext): string;
}
export interface ImageEngine {
    name: string;
    generateImage(prompt: string, aspectRatio: string): Promise<string>;
}
export type LayoutMode = 'sequential' | 'split-screen' | 'picture-in-picture' | 'overlay';
export interface ProduceOptions {
    videoEngine?: 'weryai' | 'mock';
    audioEngine?: 'elevenlabs' | 'mock';
    imageEngine?: 'weryai' | 'mock';
    useImageToVideo?: boolean;
    useReferenceImages?: boolean;
    resolution?: {
        width: number;
        height: number;
    };
    compositionMode?: 'programmatic' | 'llm';
    layoutMode?: LayoutMode;
}
