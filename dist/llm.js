import { FST_KNOWLEDGE_FULL, FST_KNOWLEDGE_COMPACT, SDS_KNOWLEDGE_FULL, SDS_KNOWLEDGE_COMPACT, SHOTSTACK_KNOWLEDGE_FULL, SHOTSTACK_KNOWLEDGE_COMPACT } from "./knowledge/index.js";
import { SPM_JSON_SCHEMA, SHOTSTACK_JSON_SCHEMA } from "./prompts/schemas.js";
export class LLMEngine {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Generates the comprehensive system prompt for the LLM, combining
     * the Scene Design System, Film Shot Techniques, and JSON schema.
     */
    generateSystemPrompt() {
        const compactness = this.config.promptCompactness || 'full';
        let sdsSection = '';
        let fstSection = '';
        if (compactness === 'full') {
            sdsSection = `\nHere is the Scene Design System (SDS) you must follow:\n---\n${SDS_KNOWLEDGE_FULL}\n---\n`;
            fstSection = `\nHere is the Film Shot & Technique (FST) Cheat Sheet you must use for terminology:\n---\n${FST_KNOWLEDGE_FULL}\n---\n`;
        }
        else if (compactness === 'compact') {
            sdsSection = `\nHere is the condensed Scene Design System (SDS) you must follow:\n---\n${SDS_KNOWLEDGE_COMPACT}\n---\n`;
            fstSection = `\nHere is the condensed Film Shot & Technique (FST) vocabulary you must use:\n---\n${FST_KNOWLEDGE_COMPACT}\n---\n`;
        }
        else if (compactness === 'minimal') {
            // In minimal mode, we omit the heavy markdown documents entirely
            // and rely on the LLM's intrinsic knowledge of cinematic terms.
            sdsSection = '\nApply expert cinematic scene design principles, focusing on emotional resonance, spatial dynamics, and narrative intent.\n';
            fstSection = '\nUse standard professional filmmaking terminology for camera movements, angles, shot sizes, and lighting.\n';
        }
        return `You are Martin, an expert AI Media Director.
Your job is to translate human creative intent into a structured Shot Production Manifest (SPM).
You do not generate pixels; you generate the cinematic vision.
${sdsSection}${fstSection}
Include a "negativePrompt" field with terms to avoid in generated visuals (e.g. "no text, no watermarks, no morphing, no extra limbs").
Include a "styleGuards" array with quality anchor tokens that should appear in every shot prompt (e.g. "cinematic film grain", "photorealistic", "professional color grade").

If the script features recurring characters, define them once in the "characters" array with id, faceDescription, wardrobe, and other visual details. Reference them by ID in each shot's "characterIds" array.
If the script reuses locations, define them once in the "environments" array with id and spatialDescription. Reference them by ID in each shot's "environmentId".
Generate a "visualStyle" object to lock color grading consistency across all shots (contrastStyle, grainLevel, colorGradingNotes).

Set "tempo" to one of "fast-cut", "medium", or "slow-burn" based on the script's pacing.
For each shot after the first, include a "transition" object with "type" (e.g. "fade", "wipeLeft", "dissolve", "cut") and optional "duration" in seconds.

You must output valid JSON strictly adhering to the following JSON Schema:
${JSON.stringify(SPM_JSON_SCHEMA, null, 2)}
`;
    }
    async callLLM(systemPrompt, userMessage) {
        if (this.config.llmProvider !== 'lmstudio' && this.config.llmProvider !== 'openai') {
            return undefined;
        }
        const apiUrl = this.config.apiKey?.startsWith('http')
            ? this.config.apiKey
            : process.env.LMSTUDIO_URL || 'http://127.0.0.1:1234/v1';
        const apiKey = this.config.apiKey && !this.config.apiKey.startsWith('http')
            ? this.config.apiKey
            : 'lm-studio';
        console.log(`[LLMEngine] Calling LLM API at ${apiUrl}/chat/completions ...`);
        try {
            const response = await fetch(`${apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: this.config.model || 'local-model',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7,
                })
            });
            if (!response.ok) {
                throw new Error(`LLM API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            let content = data.choices?.[0]?.message?.content;
            if (content && content.includes('```')) {
                const match = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
                if (match)
                    content = match[1];
            }
            return content?.trim();
        }
        catch (err) {
            console.error('[LLMEngine] Failed to call LLM.', err);
            return undefined;
        }
    }
    async analyzeScript(script, options) {
        const systemPrompt = this.generateSystemPrompt();
        const content = await this.callLLM(systemPrompt, `Analyze the following script and generate a production manifest:\n\n${script}`);
        if (content) {
            try {
                return JSON.parse(content);
            }
            catch {
                console.error('[LLMEngine] Failed to parse LLM response, falling back to mock.');
            }
        }
        console.log(`[LLMEngine] Analyzing script using ${this.config.llmProvider || 'default'}...`);
        console.log(`[LLMEngine] System Prompt Length (${this.config.promptCompactness || 'full'}): ${systemPrompt.length} characters`);
        const mockManifest = {
            title: 'Generated Production',
            mood: 'noir-cinematic',
            colorPalette: ['Neon Blue', 'Rainy Grey', 'Deep Shadow'],
            aspectRatio: options?.aspectRatio || '21:9',
            negativePrompt: 'no text, no watermarks, no morphing, no extra limbs, no blurry',
            styleGuards: ['cinematic film grain', 'photorealistic', 'professional color grade'],
            characters: [
                {
                    id: 'robot',
                    name: 'Unit-7',
                    faceDescription: 'humanoid face with glowing blue optical sensors, metallic silver skin with fine scratches',
                    bodyType: 'slim humanoid frame, slightly hunched',
                    hair: 'none',
                    wardrobe: 'tattered dark canvas poncho over exposed chrome chassis',
                    distinguishingFeatures: 'cracked optical lens over left eye, faint blue glow from chest core'
                }
            ],
            environments: [
                {
                    id: 'alley',
                    name: 'Neo-Tokyo Back Alley',
                    spatialDescription: 'narrow corridor between towering buildings, 3m wide, wet pavement',
                    props: ['neon signs', 'steam vents', 'dumpsters', 'flickering holographic ads'],
                    atmosphere: 'fog at knee height, rain drizzle, neon reflections on wet ground',
                    timeOfDay: 'night'
                }
            ],
            visualStyle: {
                contrastStyle: 'high-contrast noir',
                grainLevel: 'fine film grain',
                colorGradingNotes: 'teal and magenta push, desaturated midtones',
                blackLevel: 'crushed'
            },
            tempo: 'slow-burn',
            shots: [
                {
                    id: 'shot-1',
                    description: 'Establishing shot of the environment.',
                    subject: 'The environment',
                    environment: 'Rainy neo-Tokyo alley',
                    environmentId: 'alley',
                    camera: {
                        movement: 'Slow Push-in',
                        angle: 'Low-Angle Tilt',
                        lens: '35mm anamorphic'
                    },
                    lighting: {
                        style: 'Rembrandt lighting',
                        colorTemp: '4800K',
                        contrast: 'High Contrast'
                    },
                    duration: '5s'
                },
                {
                    id: 'shot-2',
                    description: 'Close up on the subject.',
                    subject: 'A lonely robot',
                    environment: 'Rainy neo-Tokyo alley',
                    characterIds: ['robot'],
                    environmentId: 'alley',
                    transition: { type: 'fade', duration: 1 },
                    camera: {
                        movement: 'Static',
                        angle: 'Eye-level',
                        lens: '85mm prime'
                    },
                    lighting: {
                        style: 'Neon rim light',
                        colorTemp: '6500K',
                        contrast: 'High Contrast'
                    },
                    duration: '3s'
                }
            ]
        };
        return mockManifest;
    }
    async generateShotstackComposition(manifest, clips) {
        const compactness = this.config.promptCompactness || 'full';
        const knowledge = compactness === 'full' ? SHOTSTACK_KNOWLEDGE_FULL : SHOTSTACK_KNOWLEDGE_COMPACT;
        const systemPrompt = `You are a Shotstack compositing expert. Given a production manifest and a list of media clips, generate a valid Shotstack JSON composition that arranges the clips into a timeline matching the manifest's mood and pacing.

Here is the Shotstack compositing knowledge you must follow:
---
${knowledge}
---

You must output valid JSON strictly adhering to the following JSON Schema:
${JSON.stringify(SHOTSTACK_JSON_SCHEMA, null, 2)}
`;
        const clipsDescription = clips.map((c, i) => `Clip ${i + 1}: video="${c.videoUrlOrPath}"${c.audioUrlOrPath ? `, audio="${c.audioUrlOrPath}"` : ''}, duration=${c.duration ?? 5}s`).join('\n');
        const userMessage = `Production manifest:
Title: ${manifest.title}
Mood: ${manifest.mood}
Aspect Ratio: ${manifest.aspectRatio}

Available clips:
${clipsDescription}

Generate a Shotstack timeline composition that arranges these clips with appropriate effects and transitions to match the "${manifest.mood}" mood.`;
        const content = await this.callLLM(systemPrompt, userMessage);
        if (content) {
            try {
                return JSON.parse(content);
            }
            catch {
                console.error('[LLMEngine] Failed to parse Shotstack composition, using fallback sequential timeline.');
            }
        }
        console.log('[LLMEngine] Generating fallback sequential Shotstack composition...');
        let start = 0;
        const videoClips = clips.map((clip) => {
            const length = clip.duration ?? 5;
            const entry = {
                asset: { type: 'video', src: clip.videoUrlOrPath },
                start,
                length,
                transition: { in: 'fade', out: 'fade' }
            };
            start += length;
            return entry;
        });
        const audioClips = clips
            .filter(c => c.audioUrlOrPath)
            .map((clip, _i) => {
            let audioStart = 0;
            for (let j = 0; j < clips.indexOf(clip); j++) {
                audioStart += clips[j].duration ?? 5;
            }
            return {
                asset: { type: 'audio', src: clip.audioUrlOrPath },
                start: audioStart,
                length: clip.duration ?? 5
            };
        });
        const tracks = [{ clips: videoClips }];
        if (audioClips.length > 0) {
            tracks.push({ clips: audioClips });
        }
        return {
            timeline: { tracks },
            output: { format: 'mp4', resolution: 'hd' }
        };
    }
}
