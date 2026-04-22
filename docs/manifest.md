# Shot Production Manifest (SPM)

The Shot Production Manifest is the core data structure of Martin. It acts as the blueprint for the entire video production. The LLM's primary job during the `plan` phase is to generate this structured manifest from a raw text script.

## Structure

```typescript
export interface ProductionManifest {
  title: string;
  logline: string;
  style: string;
  aspectRatio: string;
  fps: number;
  globalAudio?: {
    musicStyle?: string;
    ambientSound?: string;
  };
  characters: CharacterDefinition[];
  environments: EnvironmentDefinition[];
  visualStyle: VisualStyle;
  shots: Shot[];
}
```

## The `Shot` Object

Each shot represents a single continuous take in the video.

```typescript
export interface Shot {
  id: string;
  duration: number; // in seconds
  visual: {
    environmentId: string;
    subject: string;
    action: string;
  };
  camera: {
    movement: string;
    angle: string;
    lens?: string;
  };
  lighting: {
    style: string;
    colorTemp?: string;
    contrast?: string;
  };
  audio?: {
    narration?: {
      characterId?: string;
      text: string;
      emotion?: string;
    };
    sfx?: string[];
  };
}
```

The manifest ensures that all downstream systems (adapters, engines, compiler) have a consistent, deterministic set of instructions to follow.
