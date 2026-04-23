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

## Local Asset Serving

When working with APIs that require publicly accessible asset URLs (like Shotstack for compiling or image-to-video engines that need a starting frame), Martin supports a local asset pipeline:

1. **Local Audio Generation:** The `ElevenLabsEngine` downloads generated `.mp3` files locally to an `assets/` directory.
2. **Public Routing:** Set `PUBLIC_ASSET_URL` in your environment (e.g., to an ngrok tunnel URL: `PUBLIC_ASSET_URL=https://<your-ngrok-id>.ngrok-free.app`). Martin will format the URL of the generated assets to route through your public tunnel.
3. **Local Server:** You can run a simple HTTP server (e.g., `python -m http.server 8081`) to serve the `assets/` folder to the internet so remote compiling APIs can access them.

## Engine Fallback Logic

To prevent long production pipelines from crashing due to transient API failures or strict prompt safety filters, engines feature built-in fallback logic:

- If a Video Engine API fails to create a task or polling times out, it gracefully logs the error and returns a predefined `FALLBACK_VIDEO_URL`.
- If an Image Engine API fails (for `useReferenceImages: true`), it returns a predefined `FALLBACK_IMAGE_URL`.

This ensures the pipeline completes its run, allowing you to preview the overall composition in Shotstack before selectively rerunning the failed shots.
