import * as fs from 'node:fs';
import * as path from 'node:path';
import type { VoiceSettings } from '../types.ts';

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
const API_BASE = 'https://api.elevenlabs.io/v1';

export class ElevenLabsEngine {
  private apiKey: string;
  private voiceCache = new Map<string, string>();

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
  }

  private get isMock(): boolean {
    return !this.apiKey || this.apiKey === 'your_elevenlabs_api_key';
  }

  private headers(): Record<string, string> {
    return {
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async designVoice(name: string, description: string, previewText?: string): Promise<string | undefined> {
    const cacheKey = `${name}:${description}`;
    const cached = this.voiceCache.get(cacheKey);
    if (cached) return cached;

    if (this.isMock) {
      const mockId = `mock-voice-${name.toLowerCase().replace(/\s+/g, '-')}`;
      console.log(`[ElevenLabs Mock] Would design voice "${name}": ${description}`);
      this.voiceCache.set(cacheKey, mockId);
      return mockId;
    }

    console.log(`[ElevenLabs] Designing voice for "${name}"...`);
    try {
      const previewResponse = await fetch(`${API_BASE}/text-to-voice/create-previews`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          voice_description: description,
          text: previewText || `Hello, my name is ${name}. I am ready for this production.`,
        }),
      });

      if (!previewResponse.ok) {
        console.error(`[ElevenLabs] Voice preview failed: ${previewResponse.status} ${previewResponse.statusText}`);
        return undefined;
      }

      const previewData = await previewResponse.json() as {
        previews: Array<{ generated_voice_id: string; audio_base_64: string }>;
      };

      if (!previewData.previews?.length) {
        console.error('[ElevenLabs] No voice previews returned');
        return undefined;
      }

      const generatedVoiceId = previewData.previews[0].generated_voice_id;

      const createResponse = await fetch(`${API_BASE}/text-to-voice/create-voice-from-preview`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          voice_name: name,
          voice_description: description,
          generated_voice_id: generatedVoiceId,
        }),
      });

      if (!createResponse.ok) {
        console.error(`[ElevenLabs] Voice creation failed: ${createResponse.status} ${createResponse.statusText}`);
        return undefined;
      }

      const createData = await createResponse.json() as { voice_id: string };
      const voiceId = createData.voice_id;

      console.log(`[ElevenLabs] Voice "${name}" created: ${voiceId}`);
      this.voiceCache.set(cacheKey, voiceId);
      return voiceId;
    } catch (error) {
      console.error('[ElevenLabs] Error designing voice:', error);
      return undefined;
    }
  }

  async generateAudio(
    text: string,
    voiceId?: string,
    settings?: VoiceSettings
  ): Promise<string | undefined> {
    const resolvedVoiceId = voiceId || DEFAULT_VOICE_ID;

    if (this.isMock) {
      console.log(`[ElevenLabs] Generating audio: "${text.substring(0, 30)}..."`);
      return undefined;
    }

    console.log(`[ElevenLabs] Generating audio (voice: ${resolvedVoiceId}): "${text.substring(0, 30)}..."`);
    try {
      const response = await fetch(`${API_BASE}/text-to-speech/${resolvedVoiceId}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: settings?.stability ?? 0.5,
            similarity_boost: settings?.similarityBoost ?? 0.5,
          },
        }),
      });

      if (!response.ok) {
        console.error('[ElevenLabs] Failed to generate audio:', response.statusText);
        return undefined;
      }

      const buffer = await response.arrayBuffer();
      const fileName = `narration_${Date.now()}.mp3`;
      const filePath = path.join(process.cwd(), 'assets', fileName);
      if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, new Uint8Array(buffer));
      
      const publicUrl = process.env.PUBLIC_ASSET_URL;
      if (publicUrl) {
        return `${publicUrl.replace(/\/$/, '')}/${fileName}`;
      }
      return filePath;
    } catch (error) {
      console.error('[ElevenLabs] Error generating audio:', error);
      return undefined;
    }
  }
}
