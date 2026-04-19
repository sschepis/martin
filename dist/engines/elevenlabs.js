"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ElevenLabsEngine {
    apiKey;
    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    }
    async generateAudio(text, voiceId = '21m00Tcm4TlvDq8ikWAM') {
        if (!this.apiKey || this.apiKey === 'your_elevenlabs_api_key') {
            console.log(`[ElevenLabs Mock] Would generate audio for: "${text}"`);
            return undefined;
        }
        console.log(`[ElevenLabs] Generating audio: "${text.substring(0, 30)}..."`);
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: { stability: 0.5, similarity_boost: 0.5 }
                })
            });
            if (!response.ok) {
                console.error('[ElevenLabs] Failed to generate audio:', response.statusText);
                return undefined;
            }
            const buffer = await response.arrayBuffer();
            const fileName = `narration_${Date.now()}.mp3`;
            const filePath = path.join(process.cwd(), fileName);
            fs.writeFileSync(filePath, Buffer.from(buffer));
            return filePath;
        }
        catch (error) {
            console.error('[ElevenLabs] Error generating audio:', error);
            return undefined;
        }
    }
}
exports.ElevenLabsEngine = ElevenLabsEngine;
