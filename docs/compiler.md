# The Compiler

The compiler is responsible for taking all generated media assets (video clips, audio narrations, sound effects) and stitching them together into a final output video.

## ShotstackCompiler

Martin uses the `ShotstackCompiler` to interface with the [Shotstack API](https://shotstack.io/). It uploads the assets, syncs them according to the `ProductionManifest` timeline, applies transitions, and renders the final MP4.

### Configuration

To use the compiler, you must provide a Shotstack API key:

```typescript
const director = new Martin({
  shotstackApiKey: process.env.SHOTSTACK_API_KEY
});
```

### Advanced Timeline Building

Internally, Martin uses a `TimelineBuilder` to construct the Shotstack JSON composition. It handles:
- Syncing audio narration timing with video clip durations.
- Applying background music (`resolveMusicUrl`) and sound effects (`resolveSfxUrl`).
- Mixing audio levels (`resolveAudioMixLevels`).
- Formatting the composition for the target aspect ratio (e.g. 16:9, 9:16).

### Direct Compilation

If you have a raw Shotstack JSON composition, you can compile it directly:

```typescript
import { ShotstackCompiler } from '@sschepis/martin';

const compiler = new ShotstackCompiler({ shotstackApiKey: '...' });
const videoUrl = await compiler.compile(myComposition);
```
