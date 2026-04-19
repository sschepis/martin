import * as fs from 'fs';
import * as path from 'path';

export class ElevenLabsEngine {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
  }

  async generateAudio(text: string, voiceId = '21m00Tcm4TlvDq8ikWAM'): Promise<string | undefined> {
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
    } catch (error) {
      console.error('[ElevenLabs] Error generating audio:', error);
      return undefined;
    }
  }
}
