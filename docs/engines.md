# Execution Engines

Engines are responsible for interacting with external APIs to generate media (video, images, audio). 

## Video Engines

Video engines implement the `VideoEngine` interface to generate video clips from prompts and optional reference images.

Built-in Video Engines:
- **WeryAIEngine**: Integrates with WeryAI for image and video generation.
- **LumaEngine**: Integrates with Luma Dream Machine.
- **RunwayEngine**: Integrates with Runway Gen-3.
- **KlingEngine**: Integrates with Kling AI.
- **FalEngine**: Integrates with Fal.ai.

## Audio Engines

Audio engines are responsible for generating voiceovers and sound effects.

Built-in Audio Engines:
- **ElevenLabsEngine**: Uses ElevenLabs for high-quality text-to-speech narration.

## Usage

Engines are automatically instantiated and used by the `Martin` class based on the `ProduceOptions` you provide:

```typescript
const finalVideoPath = await director.produce(manifest, {
  videoEngine: 'kling', // Uses KlingEngine
  audioEngine: 'elevenlabs', // Uses ElevenLabsEngine
  useImageToVideo: true
});
```
