import type { ImageEngine, VideoEngine, VideoEngineResult, VideoGenerationOptions } from '../types.ts';

const FALLBACK_URL = 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';
const FALLBACK_VIDEO_URL = FALLBACK_URL;
const FALLBACK_IMAGE_URL = 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/earth.jpg';

export class WeryAIEngine implements ImageEngine, VideoEngine {
  name = 'weryai';
  maxDuration = 5;
  supportedAspectRatios = ['16:9', '9:16', '1:1', '21:9'];
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.WERYAI_API_KEY || '';
  }

  private get isMock(): boolean {
    return !this.apiKey || this.apiKey === 'your_weryai_api_key';
  }

  private async pollTask(taskId: string, mediaType: 'images' | 'videos'): Promise<string> {
    while (true) {
      await new Promise(r => setTimeout(r, 5000));
      const statusResponse = await fetch(`https://api.weryai.com/v1/generation/${taskId}/status`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      const statusData = await statusResponse.json();
      const status = statusData.data?.task_status;

      if (status === 'succeed') {
        return statusData.data[mediaType][0];
      } else if (status === 'failed' || status === 'error') {
        console.error(`WeryAI ${mediaType} generation failed`);
        return mediaType === 'images' ? FALLBACK_IMAGE_URL : FALLBACK_VIDEO_URL;
      }
      console.log(`[WeryAI] Polling ${mediaType} task ${taskId}... status: ${status}`);
    }
  }

  async generateImage(prompt: string, aspectRatio: string = '16:9'): Promise<string> {
    if (this.isMock) {
      console.log(`[WeryAI Mock] Would generate image for: "${prompt.substring(0, 80)}..."`);
      return 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/images/earth.jpg';
    }

    console.log(`[WeryAI] Generating image...`);
    const startResponse = await fetch('https://api.weryai.com/v1/generation/text-to-image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'WERYAI_IMAGE_2_0',
        prompt: prompt.substring(0, 2000),
        aspect_ratio: aspectRatio,
        image_number: 1
      })
    });

    const startData = await startResponse.json();
    if (!startData.success || !startData.data?.task_id) {
      console.error('[WeryAI] Image task failed:', JSON.stringify(startData).substring(0, 300));
      return FALLBACK_IMAGE_URL;
    }

    const url = await this.pollTask(startData.data.task_id, 'images');
    console.log(`[WeryAI] Image generated: ${url}`);
    return url;
  }

  async generateVideo(prompt: string, options: VideoGenerationOptions): Promise<VideoEngineResult>;
  async generateVideo(prompt: string, aspectRatio: string, imageUrl?: string): Promise<string>;
  async generateVideo(prompt: string, optionsOrAspect: VideoGenerationOptions | string, imageUrl?: string): Promise<VideoEngineResult | string> {
    if (typeof optionsOrAspect === 'string') {
      const url = await this._generateVideo(prompt, optionsOrAspect, this.maxDuration, imageUrl);
      return url;
    }
    const opts = optionsOrAspect;
    const duration = Math.min(opts.duration, this.maxDuration);
    const url = await this._generateVideo(prompt, opts.aspectRatio, duration, opts.imageUrl);
    return { url, duration };
  }

  private async _generateVideo(prompt: string, aspectRatio: string, duration: number, imageUrl?: string): Promise<string> {
    if (this.isMock) {
      console.log(`[WeryAI Mock] Would generate video for: "${prompt.substring(0, 80)}..."`);
      return FALLBACK_URL;
    }

    console.log(`[WeryAI] Generating video...`);
    try {
      const endpoint = imageUrl
        ? 'https://api.weryai.com/v1/generation/image-to-video'
        : 'https://api.weryai.com/v1/generation/text-to-video';

      // WeryAI only accepts 5 or 10 second durations
      const clampedDuration = duration <= 7 ? 5 : 10;

      const body: Record<string, unknown> = {
        model: 'WERYAI_VIDEO_1_0',
        prompt: prompt.substring(0, 2000),
        aspect_ratio: aspectRatio,
        duration: clampedDuration
      };
      if (imageUrl) body.image = imageUrl;

      const startResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const startData = await startResponse.json();
      if (!startData.success || !startData.data?.task_id) {
        console.error('[WeryAI] Failed to start video task:', startData);
        return FALLBACK_VIDEO_URL;
      }

      const url = await this.pollTask(startData.data.task_id, 'videos');
      console.log(`[WeryAI] Video generated: ${url}`);
      return url;
    } catch (error) {
      console.error('[WeryAI] Error generating video:', error);
      return FALLBACK_VIDEO_URL;
    }
  }
}
