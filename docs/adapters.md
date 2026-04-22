# Adapters

Adapters are responsible for translating the abstract `Shot` definitions in the `ProductionManifest` into vendor-specific prompt strings. They handle the nuances of how different AI video models interpret text.

## Built-in Adapters

The library includes the following adapters out of the box:

- **RunwayGen3Adapter**: Optimized for Runway Gen-3's prompt structure.
- **LumaDreamMachineAdapter**: Tailored for Luma Dream Machine.
- **SoraAdapter**: Formats prompts for OpenAI's Sora.
- **WeryAIAdapter**: Adapts prompts for WeryAI.
- **ShotstackAdapter**: Adapts for Shotstack's internal generation tools.

## Using Adapters

Adapters are primarily used internally by the `Martin` class during the `produce` phase, but you can use them directly if you only need prompt translation:

```typescript
import { RunwayGen3Adapter } from '@sschepis/martin/adapters/runway-gen3.ts';

const adapter = new RunwayGen3Adapter();
const prompt = adapter.generatePrompt(manifest, shot);
console.log(prompt);
```

## Creating Custom Adapters

You can create your own adapter by implementing the `Adapter` interface:

```typescript
import { Adapter, ProductionManifest, Shot } from '@sschepis/martin';

export class MyCustomAdapter implements Adapter {
  name = 'my-custom-model';

  generatePrompt(manifest: ProductionManifest, shot: Shot): string {
    // Implement your custom prompt generation logic here
    return `[${manifest.style}] ${shot.visual.subject} - ${shot.camera.movement}`;
  }
}
```
