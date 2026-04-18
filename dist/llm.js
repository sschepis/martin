"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEngine = void 0;
const knowledge_1 = require("./knowledge");
const schemas_1 = require("./prompts/schemas");
class LLMEngine {
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
            sdsSection = `\nHere is the Scene Design System (SDS) you must follow:\n---\n${knowledge_1.SDS_KNOWLEDGE_FULL}\n---\n`;
            fstSection = `\nHere is the Film Shot & Technique (FST) Cheat Sheet you must use for terminology:\n---\n${knowledge_1.FST_KNOWLEDGE_FULL}\n---\n`;
        }
        else if (compactness === 'compact') {
            sdsSection = `\nHere is the condensed Scene Design System (SDS) you must follow:\n---\n${knowledge_1.SDS_KNOWLEDGE_COMPACT}\n---\n`;
            fstSection = `\nHere is the condensed Film Shot & Technique (FST) vocabulary you must use:\n---\n${knowledge_1.FST_KNOWLEDGE_COMPACT}\n---\n`;
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
You must output valid JSON strictly adhering to the following JSON Schema:
${JSON.stringify(schemas_1.SPM_JSON_SCHEMA, null, 2)}
`;
    }
    /**
     * Simulates passing the script to an LLM with directorial schemas
     * and returning a structured ProductionManifest.
     */
    async analyzeScript(script, options) {
        const systemPrompt = this.generateSystemPrompt();
        if (this.config.llmProvider === 'lmstudio' || this.config.llmProvider === 'openai') {
            const apiUrl = this.config.apiKey?.startsWith('http')
                ? this.config.apiKey // If they passed the URL in apiKey
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
                            { role: 'user', content: `Analyze the following script and generate a production manifest:\n\n${script}` }
                        ],
                        temperature: 0.7,
                        response_format: { type: 'json_object' }
                    })
                });
                if (!response.ok) {
                    throw new Error(`LLM API Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    return JSON.parse(content);
                }
            }
            catch (err) {
                console.error('[LLMEngine] Failed to call LLM, falling back to mock.', err);
            }
        }
        // In a real implementation, this would build a prompt using schemas
        // and call OpenAI/Anthropic/etc., then parse the JSON response.
        console.log(`[LLMEngine] Analyzing script using ${this.config.llmProvider || 'default'}...`);
        console.log(`[LLMEngine] System Prompt Length (${this.config.promptCompactness || 'full'}): ${systemPrompt.length} characters`);
        // Mock response based on the script
        const mockManifest = {
            title: 'Generated Production',
            mood: 'noir-cinematic',
            colorPalette: ['Neon Blue', 'Rainy Grey', 'Deep Shadow'],
            aspectRatio: options?.aspectRatio || '21:9',
            shots: [
                {
                    id: 'shot-1',
                    description: 'Establishing shot of the environment.',
                    subject: 'The environment',
                    environment: 'Rainy neo-Tokyo alley',
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
}
exports.LLMEngine = LLMEngine;
