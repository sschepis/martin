import type { VideoEngine, VideoEngineResult, VideoGenerationOptions, MotionControl } from '../types.ts';

const FALLBACK_URL = 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';

export class KlingEngine implements VideoEngine {
  name = 'kling';
  maxDuration = 10;
  supportedAspectRatios = ['16:9', '9:16', '1:1'];
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.KLING_API_KEY || '';
  }

  private get isMock(): boolean {
    return !this.apiKey || this.apiKey === 'your_kling_api_key';
  }

  async generateVideo(prompt: string, options: VideoGenerationOptions): Promise<VideoEngineResult> {
    const duration = Math.min(options.duration, this.maxDuration);

    if (this.isMock) {
      console.log(`[Kling Mock] Would generate video for: "${prompt.substring(0, 80)}..."`);
      return { url: FALLBACK_URL, duration };
    }

    console.log(`[Kling] Generating video...`);
    try {
      const endpoint = options.imageUrl
        ? 'https://api.klingai.com/v1/videos/image2video'
        : 'https://api.klingai.com/v1/videos/text2video';

      const body: Record<string, unknown> = {
        prompt: prompt.substring(0, 2000),
        aspect_ratio: options.aspectRatio,
        duration,
      };
      if (options.imageUrl) body.image_url = options.imageUrl;
      if (options.negativePrompt) body.negative_prompt = options.negativePrompt;

      const cameraControl = this.mapMotionToKling(options.motionControl);
      if (cameraControl) body.camera_control = cameraControl;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const taskId = data.data?.task_id || data.task_id;
      if (!taskId) {
        console.error('[Kling] Failed to start generation:', data);
        return { url: FALLBACK_URL, duration };
      }

      const url = await this.pollTask(taskId);
      console.log(`[Kling] Video generated: ${url}`);
      return { url, duration };
    } catch (error) {
      console.error('[Kling] Error generating video:', error);
      return { url: FALLBACK_URL, duration };
    }
  }

  private async pollTask(taskId: string): Promise<string> {
    while (true) {
      await new Promise(r => setTimeout(r, 5000));
      const response = await fetch(`https://api.klingai.com/v1/videos/${taskId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      const data = await response.json();
      const status = data.data?.task_status || data.status;

      if (status === 'succeed' || status === 'completed') {
        return data.data?.works?.[0]?.resource?.resource || data.data?.video_url || FALLBACK_URL;
      } else if (status === 'failed') {
        throw new Error(`Kling generation failed`);
      }
      console.log(`[Kling] Polling task ${taskId}... status: ${status}`);
    }
  }

  private mapMotionToKling(motion?: MotionControl): Record<string, unknown> | undefined {
    if (!motion?.trajectory) return undefined;

    const t = motion.trajectory;
    const type = t.type.toLowerCase();
    const dir = t.direction?.toLowerCase();

    const config: Record<string, number> = { horizontal: 0, vertical: 0, zoom: 0, roll: 0 };

    if (type === 'pan') {
      config.horizontal = dir === 'left' ? -5 : 5;
    } else if (type === 'tilt') {
      config.vertical = dir === 'up' ? 5 : -5;
    } else if (type === 'dolly' || type === 'zoom') {
      config.zoom = (dir === 'forward' || dir === 'in') ? 5 : -5;
    } else if (type === 'crane') {
      config.vertical = dir === 'up' ? 5 : -5;
    } else if (type === 'truck') {
      config.horizontal = dir === 'left' ? -5 : 5;
    } else {
      return undefined;
    }

    return { type: 'custom', config };
  }
}
