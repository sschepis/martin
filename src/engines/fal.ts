import type { VideoEngine, VideoEngineResult, VideoGenerationOptions } from '../types.ts';

const FALLBACK_URL = 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
const DEFAULT_MODEL = 'fal-ai/fast-svd';

export class FalEngine implements VideoEngine {
  name = 'fal';
  maxDuration = 5;
  supportedAspectRatios = ['16:9', '9:16', '1:1'];
  private apiKey: string;
  private modelId: string;

  constructor(modelId: string = DEFAULT_MODEL) {
    this.apiKey = process.env.FAL_API_KEY || '';
    this.modelId = modelId;
  }

  private get isMock(): boolean {
    return !this.apiKey || this.apiKey === 'your_fal_api_key';
  }

  private get baseUrl(): string {
    return `https://queue.fal.run/${this.modelId}`;
  }

  async generateVideo(prompt: string, options: VideoGenerationOptions): Promise<VideoEngineResult> {
    const duration = Math.min(options.duration, this.maxDuration);

    if (this.isMock) {
      console.log(`[fal.ai Mock] Would generate video for: "${prompt.substring(0, 80)}..."`);
      return { url: FALLBACK_URL, duration };
    }

    console.log(`[fal.ai] Generating video with model ${this.modelId}...`);
    try {
      const body: Record<string, unknown> = {
        prompt: prompt.substring(0, 2000),
        aspect_ratio: options.aspectRatio,
      };
      if (options.imageUrl) body.image_url = options.imageUrl;
      if (options.negativePrompt) body.negative_prompt = options.negativePrompt;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const requestId = data.request_id;
      if (!requestId) {
        console.error('[fal.ai] Failed to start generation:', data);
        return { url: FALLBACK_URL, duration };
      }

      const url = await this.pollTask(requestId);
      console.log(`[fal.ai] Video generated: ${url}`);
      return { url, duration };
    } catch (error) {
      console.error('[fal.ai] Error generating video:', error);
      return { url: FALLBACK_URL, duration };
    }
  }

  private async pollTask(requestId: string): Promise<string> {
    while (true) {
      await new Promise(r => setTimeout(r, 5000));
      const statusResponse = await fetch(`${this.baseUrl}/requests/${requestId}/status`, {
        headers: { 'Authorization': `Key ${this.apiKey}` },
      });
      const statusData = await statusResponse.json();

      if (statusData.status === 'COMPLETED') {
        const resultResponse = await fetch(`${this.baseUrl}/requests/${requestId}`, {
          headers: { 'Authorization': `Key ${this.apiKey}` },
        });
        const resultData = await resultResponse.json();
        return resultData.video?.url || resultData.output?.video_url || resultData.video_url || FALLBACK_URL;
      } else if (statusData.status === 'FAILED') {
        throw new Error(`fal.ai generation failed: ${statusData.error || 'unknown'}`);
      }
      console.log(`[fal.ai] Polling request ${requestId}... status: ${statusData.status}`);
    }
  }
}
