# 🎬 Martin: The AI Media Director

**`martin`** is an LLM-driven media director implemented as a framework-agnostic NPM package. It acts as an orchestration layer between human creative intent and AI video generation tools. It translates high-level scripts into a structured **Shot Production Manifest (SPM)**, providing precise, cinematic technical descriptions, and then **executes the entire production pipeline** (Video, Audio, and FFMPEG compositing) automatically.

## ✨ Features

- 🧠 **The Directorial Brain (FST/SDS):** Built-in knowledge of Film Shot Techniques (FST) and Scene Design Systems (SDS) compiled directly into the LLM system prompt.
- 🔌 **Adapter Pattern:** Future-proof architecture. Outputs prompts optimized for Runway Gen-3, Luma Dream Machine, Sora, WeryAI, and more.
- ⚙️ **Full Pipeline Execution:** Doesn't just generate prompts—it natively hooks into WeryAI (for video/image generation) and ElevenLabs (for voiceovers).
- 🎞️ **Local Scene Compiler:** Bypasses expensive cloud renderers. Uses local `ffmpeg` to automatically download assets, sync audio to video clips, standardize framerates/resolutions, and stitch everything into a seamless final MP4.
- 📱 **Format Agnostic:** Easily target 16:9 cinematic formats, 21:9 ultrawide, or 9:16 vertical TikTok/Reels formats.

## 📦 Installation

```bash
npm install martin
```
*(Note: You must have `ffmpeg` installed on your system to use the `LocalSceneCompiler`)*

## 🚀 Quick Start

Set up your `.env` file with your API keys:
```env
WERYAI_API_KEY=your_weryai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
LMSTUDIO_URL=http://127.0.0.1:1234/v1  # Or OpenAI URL
```

### End-to-End Production

Here is how you can use `martin` to plan, generate, and compile a complete TikTok ad from a simple script:

```typescript
import 'dotenv/config';
import { Martin } from 'martin';

async function main() {
  const director = new Martin({
    llmProvider: 'lmstudio', // or 'openai'
    promptCompactness: 'compact'
  });

  const script = `
    NARRATOR: Tired of dull, lifeless skin?
    (Close up of a glowing, elegant bottle of "Lumière Éternelle" serum resting on a marble pedestal, catching the light.)
    NARRATOR: Introducing Lumière Éternelle. The secret to a timeless glow.
    (A beautiful model gently applies the glowing serum to her cheek, her skin looking radiant and flawless.)
    NARRATOR: Get yours today and shine forever.
    (The bottle spins slowly in macro focus, with gold particles floating around it.)
  `;

  // 1. Plan the production (LLM analyzes script & generates Shot Production Manifest)
  const manifest = await director.plan(script, {
    style: 'Enchanted luxury, radiant allure',
    aspectRatio: '9:16'
  });

  // 2. Produce the video (Calls WeryAI, ElevenLabs, and FFMPEG)
  const finalVideoPath = await director.produce(manifest, {
    videoEngine: 'weryai',
    audioEngine: 'elevenlabs',
    useImageToVideo: false, // Set to true to generate a consistent base image first
    resolution: { width: 1080, height: 1920 }
  });

  console.log(`🎉 Production Complete! Final Video: ${finalVideoPath}`);
}

main();
```

## 🏗️ Architecture

The system follows a pipeline-based architecture composed of four distinct phases:

1. **Script Analysis (LLM Interface)**
   Parses raw text or JSON input into a cinematic structure using Directorial Schemas.
2. **Shot Deconstruction**
   Assigns specific, real-world filmmaking attributes (Camera Movement, Lighting, Lens Choice) to each shot.
3. **Generator Translation Layer (Adapters)**
   Translates the abstract Shot Production Manifest into vendor-specific prompts (Runway, Luma, Sora, WeryAI).
4. **Execution & Composition (Engines & Compiler)**
   Calls the respective APIs to generate media, downloads the assets, and uses `ffmpeg` to composite the timeline with synced audio.

## 🛠️ Extensibility

- **Modular LLM Providers:** Simple interfaces to swap LLM backends.
- **Adapter Registry:** Register custom adapters for new video generation models as they emerge.
- **Pluggable Engines:** Easily add new execution engines (e.g., Midjourney for images, Kling for video, PlayHT for audio).
