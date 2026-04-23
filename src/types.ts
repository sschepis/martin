export interface MartinConfig {
  llmProvider?: string;
  apiKey?: string;
  shotstackApiKey?: string;
  model?: string;
  promptCompactness?: 'full' | 'compact' | 'minimal';
  defaultNegativePrompt?: string;
  defaultStyleGuards?: string[];
  cacheDir?: string;
  cacheTTL?: number;
}

export interface VoiceSettings {
  stability?: number;
  similarityBoost?: number;
}

export interface CharacterDefinition {
  id: string;
  name?: string;
  faceDescription: string;
  bodyType?: string;
  hair?: string;
  wardrobe: string;
  distinguishingFeatures?: string;
  voiceDescription?: string;
  voiceId?: string;
  voiceSettings?: VoiceSettings;
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
  speakerId?: string;
  characterIds?: string[];
  environmentId?: string;
  transition?: ShotTransition;
  videoEngine?: string;
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
  audioLandscape?: AudioLandscape;
  narratorVoiceId?: string;
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

export interface VideoEngineResult {
  url: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface VideoEngine {
  name: string;
  maxDuration: number;
  supportedAspectRatios: string[];
  generateVideo(prompt: string, options: VideoGenerationOptions): Promise<VideoEngineResult>;
}

export interface VideoGenerationOptions {
  aspectRatio: string;
  duration: number;
  imageUrl?: string;
  negativePrompt?: string;
  motionControl?: MotionControl;
}

export interface MotionControl {
  trajectory?: CameraTrajectory;
  motionBrush?: boolean;
  motionStrength?: number;
}

export interface CameraTrajectory {
  type: string;
  direction?: string;
  speed?: 'slow' | 'medium' | 'fast';
  startPosition?: { x: number; y: number };
  endPosition?: { x: number; y: number };
}

export type LayoutMode = 'sequential' | 'split-screen' | 'picture-in-picture' | 'overlay';

export interface AudioLandscape {
  musicUrl?: string;
  musicMood?: string;
  sfxEnabled?: boolean;
  sfxKeywordOverrides?: Record<string, string>;
}

export interface AudioMixLevels {
  narrationVolume: number;
  musicVolume: number;
  sfxVolume: number;
}

export interface StoryboardFrame {
  shotId: string;
  imageUrl: string;
  shot: Shot;
  annotations: StoryboardAnnotation;
}

export interface StoryboardAnnotation {
  cameraMovement: string;
  cameraAngle: string;
  lens?: string;
  lightingStyle: string;
  duration: string;
  narration?: string;
  environment?: string;
  characters?: string[];
  transition?: string;
}

export interface StoryboardResult {
  title: string;
  mood: string;
  frames: StoryboardFrame[];
  totalDuration: number;
  costEstimate?: CostEstimate;
}

export interface CostEstimate {
  totalCost: number;
  currency: string;
  breakdown: CostBreakdownItem[];
  summary: Record<string, number>;
}

export interface CostBreakdownItem {
  shotId: string;
  category: 'video' | 'image' | 'audio' | 'reference-image';
  engine: string;
  unitCost: number;
  quantity: number;
  subtotal: number;
}

export interface EngineRates {
  video: Record<string, number>;
  image: Record<string, number>;
  audio: Record<string, number>;
}

export interface PromptVariant {
  id: string;
  prompt: string;
  strategy: VariationStrategy;
  result?: VideoEngineResult;
  validationScore?: number;
}

export type VariationStrategy = 'rephrase' | 'emphasize-subject' | 'emphasize-environment' | 'vary-style' | 'original';

export interface VariantComparisonResult {
  shotId: string;
  variants: PromptVariant[];
  selectedVariant: PromptVariant;
  selectionMethod: 'validation-score' | 'llm-vision' | 'first-valid';
}

export interface PromptResultRecord {
  engine: string;
  adapter: string;
  prompt: string;
  strategy: VariationStrategy;
  score: number;
  timestamp: number;
}

export interface ProduceOptions {
  videoEngine?: string;
  audioEngine?: 'elevenlabs' | 'mock';
  imageEngine?: 'weryai' | 'mock';
  useImageToVideo?: boolean;
  useReferenceImages?: boolean;
  resolution?: { width: number; height: number };
  compositionMode?: 'programmatic' | 'llm';
  layoutMode?: LayoutMode;
  maxRetries?: number;
  qualityValidation?: boolean;
  musicUrl?: string;
  sfxEnabled?: boolean;
  audioMixLevels?: Partial<AudioMixLevels>;
  storyboardOnly?: boolean;
  variantsPerShot?: number;
  variantSelection?: 'auto' | 'best-score' | 'llm';
  cache?: boolean | 'read-only' | 'write-only';
}