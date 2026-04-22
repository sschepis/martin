# API Reference

## The `Martin` Class

The main entry point to the library.

### Constructor
```typescript
import { Martin } from '@sschepis/martin';

const director = new Martin({
  llmProvider: 'lmstudio', // or 'openai'
  apiKey: process.env.OPENAI_API_KEY,
  shotstackApiKey: process.env.SHOTSTACK_API_KEY,
  model: 'gpt-4o',
  promptCompactness: 'compact'
});
```

### Methods

- `plan(script: string, options?: PlanOptions): Promise<ProductionManifest>`
  Analyzes a script and generates a full Shot Production Manifest.

- `produce(manifest: ProductionManifest, options?: ProduceOptions): Promise<string>`
  Executes the manifest by generating video and audio assets, then composites them.

- `storyboard(manifest: ProductionManifest, options?: StoryboardOptions): Promise<StoryboardResult>`
  Generates a sequence of static reference images for the manifest to preview the visual style.

- `compile(composition: any): Promise<string>`
  Directly compiles a Shotstack JSON composition into a video.

## Configuration Types

### `MartinConfig`
- `llmProvider`: String (e.g. 'openai', 'lmstudio', 'anthropic')
- `apiKey`: String
- `shotstackApiKey`: String
- `model`: String
- `promptCompactness`: `'full' | 'compact' | 'minimal'`
- `defaultNegativePrompt`: String
- `defaultStyleGuards`: String[]
