import type { VideoEngine, VideoEngineResult, VideoGenerationOptions } from '../types.ts';

const FALLBACK_URL = 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';

export class LumaEngine implements VideoEngine {
  name = 'luma';
  maxDuration = 5;
  supportedAspectRatios = ['16:9', '9:16', '1:1'];
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.LUMA_API_KEY || '';
  }

  private get isMock(): boolean {
    return !this.apiKey || this.apiKey === 'your_luma_api_key';
  }

  async generateVideo(prompt: string, options: VideoGenerationOptions): Promise<VideoEngineResult> {
    const duration = Math.min(options.duration, this.maxDuration);

    if (this.isMock) {
      console.log(`[Luma Mock] Would generate video for: "${prompt.substring(0, 80)}..."`);
      return { url: FALLBACK_URL, duration };
    }

    console.log(`[Luma] Generating video...`);
    try {
      const body: Record<string, unknown> = {
        prompt: prompt.substring(0, 2000),
        aspect_ratio: options.aspectRatio,
        loop: false,
      };
      if (options.imageUrl) body.image_url = options.imageUrl;

      const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!data.id) {
        console.error('[Luma] Failed to start generation:', data);
        return { url: FALLBACK_URL, duration };
      }

      const url = await this.pollTask(data.id);
      console.log(`[Luma] Video generated: ${url}`);
      return { url, duration };
    } catch (error) {
      console.error('[Luma] Error generating video:', error);
      return { url: FALLBACK_URL, duration };
    }
  }

  private async pollTask(generationId: string): Promise<string> {
    while (true) {
      await new Promise(r => setTimeout(r, 5000));
      const response = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      const data = await response.json();

      if (data.state === 'completed') {
        return data.assets?.video || FALLBACK_URL;
      } else if (data.state === 'failed') {
        throw new Error(`Luma generation failed: ${data.failure_reason || 'unknown'}`);
      }
      console.log(`[Luma] Polling generation ${generationId}... state: ${data.state}`);
    }
  }
}
