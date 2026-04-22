# 🎬 Martin: The AI Media Director

**`martin`** is an LLM-driven media director implemented as a framework-agnostic NPM package. It acts as an orchestration layer between human creative intent and AI video generation tools. It translates high-level scripts into a structured **Shot Production Manifest (SPM)**, providing precise, cinematic technical descriptions, and then **executes the entire production pipeline** (Video, Audio, and compositing) automatically.

## ✨ Features

- 🧠 **The Directorial Brain (FST/SDS):** Built-in knowledge of Film Shot Techniques (FST) and Scene Design Systems (SDS) compiled directly into the LLM system prompt.
- 🔌 **Adapter Pattern:** Future-proof architecture. Outputs prompts optimized for Runway Gen-3, Luma Dream Machine, Sora, WeryAI, Kling, Fal, and more.
- ⚙️ **Full Pipeline Execution:** Doesn't just generate prompts—it natively hooks into Video Engines (Runway, Luma, Kling, Fal, WeryAI) and Audio Engines (ElevenLabs) for voiceovers.
- 🎞️ **Cloud Compositing:** Uses the `ShotstackCompiler` to automatically stitch everything into a seamless final MP4 with synced audio and background music.
- 📱 **Format Agnostic:** Easily target 16:9 cinematic formats, 21:9 ultrawide, or 9:16 vertical TikTok/Reels formats.
- 🦕 **Deno Support:** Fully compatible with ESM and Deno.

## 📦 Installation

```bash
npm install @sschepis/martin
```
*(Or use `deno add npm:@sschepis/martin`)*

## 🚀 Quick Start

Set up your `.env` file with your API keys:
```env
# Required for Video Generation (pick your preferred engine)
LUMA_API_KEY=your_luma_key
RUNWAY_API_KEY=your_runway_key
KLING_API_KEY=your_kling_key
FAL_KEY=your_fal_key
WERYAI_API_KEY=your_weryai_key

# Required for Audio & Compositing
ELEVENLABS_API_KEY=your_elevenlabs_key
SHOTSTACK_API_KEY=your_shotstack_key

# Required for the LLM Director
LMSTUDIO_URL=http://127.0.0.1:1234/v1  # Or use OpenAI URL
OPENAI_API_KEY=your_openai_key
```

### End-to-End Production

Here is how you can use `martin` to plan, generate, and compile a complete video from a simple script:

```typescript
import 'dotenv/config';
import { Martin } from '@sschepis/martin';

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

  // 2. Produce the video (Calls Video APIs, ElevenLabs, and Shotstack)
  const finalVideoUrl = await director.produce(manifest, {
    videoEngine: 'luma', // 'luma', 'runway', 'kling', 'fal', 'weryai'
    audioEngine: 'elevenlabs',
    useImageToVideo: false, // Set to true to generate a consistent base image first
    resolution: { width: 1080, height: 1920 }
  });

  console.log(`🎉 Production Complete! Final Video URL: ${finalVideoUrl}`);
}

main();
```

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [API Reference](./docs/api.md)
- [Shot Production Manifest](./docs/manifest.md)
- [Adapters](./docs/adapters.md)
- [Execution Engines](./docs/engines.md)
- [The Compiler](./docs/compiler.md)

## 🏗️ Architecture

The system follows a pipeline-based architecture composed of four distinct phases:

1. **Script Analysis (LLM Interface)**
   Parses raw text or JSON input into a cinematic structure using Directorial Schemas.
2. **Shot Deconstruction**
   Assigns specific, real-world filmmaking attributes (Camera Movement, Lighting, Lens Choice) to each shot.
3. **Generator Translation Layer (Adapters)**
   Translates the abstract Shot Production Manifest into vendor-specific prompts.
4. **Execution & Composition (Engines & Compiler)**
   Calls the respective APIs to generate media, uploads the assets, and uses `Shotstack` to composite the timeline with synced audio.

## 🛠️ Extensibility

- **Modular LLM Providers:** Simple interfaces to swap LLM backends.
- **Adapter Registry:** Register custom adapters for new video generation models as they emerge.
- **Pluggable Engines:** Easily add new execution engines.
