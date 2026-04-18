## **`martin`**: The LLM-Driven Media Director

**`martin`** is a high-level, framework-agnostic NPM package designed to sit between human creative intent and the technical constraints of AI video generation. Just as Scorsese meticulously plans every frame, `martin` translates high-level prompts into a comprehensive **Shot Production Manifest (SPM)**.

It doesn’t generate the pixels; it generates the **vision**.

---

### **The Core Philosophy**
Traditional AI video generation often suffers from "prompt drift"—where the AI ignores specific camera angles or lighting cues. `martin` solves this by breaking down a request into a structured production pipeline, ensuring that every "shot" is technically described for downstream models (like Gen-3, Sora, or Kling).

---

### **The Production Pipeline**

The `martin` workflow is divided into four distinct phases:

#### **1. The Script Analysis (LLM Interface)**
`martin` takes a raw string or JSON input and routes it through your preferred LLM. It uses custom "Directorial Schemas" to force the LLM to think in cinematic terms rather than prose.
* **Input:** *"A lonely robot in a rainy neo-Tokyo alley, looking up at a neon billboard."*
* **Output:** A structured JSON object defining mood, color palette, and character consistency markers.

#### **2. Shot Deconstruction**
The package splits the narrative into a sequence of individual shots. Each shot is assigned:
* **Camera Movement:** (e.g., *Slow Push-in, Tracking, Low-Angle Tilt*)
* **Technical Lighting:** (e.g., *Rembrandt lighting, 4800K color temp, High Contrast*)
* **Lens Choice:** (e.g., *35mm anamorphic for cinematic wide*)



#### **3. The Generator Translation Layer**
Because every AI video generator has different "prompt weights" and syntax requirements, `martin` includes **Adapters**.
* **`martin.generate('runway-gen3')`**: Formats the prompt with specific keywords known to trigger high-fidelity motion in Runway.
* **`martin.generate('luma-dream-machine')`**: Focuses on spatial consistency and fluid character movement.

#### **4. Composition & Metadata Export**
Finally, `martin` exports a **Production Bundle**. This includes:
* **Prompts:** Optimized text for the video generator.
* **ControlNet Maps:** (Optional) If using Stable Video Diffusion.
* **Compositing Notes:** A `.json` or `.xml` file for video editors (like Premiere or DaVinci Resolve) to organize the shots in a timeline once they are rendered.

---

### **Technical Implementation**

```javascript
import { Martin } from 'martin-director';

const director = new Martin({
  llm: 'gpt-4o',
  style: 'noir-cinematic',
  aspectRatio: '21:9'
});

// Define the "Scene"
const production = await director.plan(`
  A high-speed chase through a glass-walled library. 
  The protagonist is a digital ghost.
`);

// Access the shot list
console.log(production.shots[0].camera); 
// Output: { movement: 'dolly-zoom', angle: 'low-level' }

// Export for specific video AI
const lumaPrompts = production.export('luma');
```

---

### **Why use `martin`?**

* **Modular Architecture:** Swap out your LLM (OpenAI, Anthropic, Llama 3) or your Video Gen provider without rewriting your creative logic.
* **Cinematic Accuracy:** Built-in dictionaries of real-world filmmaking terms ensure the LLM doesn't just say "make it look cool," but instead says "High-key lighting with a 50mm prime lens."
* **Batch Processing:** Generate an entire 2-minute short film's worth of shot instructions in seconds, ready for bulk-upload to rendering engines.

In the world of AI video, the generator is the camera, but **`martin`** is the person in the chair calling "Action."