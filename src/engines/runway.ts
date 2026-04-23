import type { VideoEngine, VideoEngineResult, VideoGenerationOptions, MotionControl } from '../types.ts';

const FALLBACK_URL = 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4';

export class RunwayEngine implements VideoEngine {
  name = 'runway';
  maxDuration = 10;
  supportedAspectRatios = ['16:9', '9:16', '1:1'];
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RUNWAY_API_KEY || '';
  }

  private get isMock(): boolean {
    return !this.apiKey || this.apiKey === 'your_runway_api_key';
  }

  async generateVideo(prompt: string, options: VideoGenerationOptions): Promise<VideoEngineResult> {
    const duration = Math.min(options.duration, this.maxDuration);

    if (this.isMock) {
      console.log(`[Runway Mock] Would generate video for: "${prompt.substring(0, 80)}..."`);
      return { url: FALLBACK_URL, duration };
    }

    console.log(`[Runway] Generating video...`);
    try {
      const endpoint = options.imageUrl
        ? 'https://api.runwayml.com/v1/image_to_video'
        : 'https://api.runwayml.com/v1/text_to_video';

      const body: Record<string, unknown> = {
        prompt: prompt.substring(0, 2000),
        duration,
        aspect_ratio: options.aspectRatio,
      };
      if (options.imageUrl) body.image_url = options.imageUrl;

      const cameraMotion = this.mapMotionToRunway(options.motionControl);
      if (cameraMotion) body.camera_motion = cameraMotion;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!data.id) {
        console.error('[Runway] Failed to start generation:', data);
        return { url: FALLBACK_URL, duration };
      }

      const url = await this.pollTask(data.id);
      console.log(`[Runway] Video generated: ${url}`);
      return { url, duration };
    } catch (error) {
      console.error('[Runway] Error generating video:', error);
      return { url: FALLBACK_URL, duration };
    }
  }

  private async pollTask(taskId: string): Promise<string> {
    while (true) {
      await new Promise(r => setTimeout(r, 5000));
      const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
        headers: { 'X-Api-Key': this.apiKey },
      });
      const data = await response.json();

      if (data.status === 'succeeded' || data.status === 'completed') {
        return data.output?.video_url || data.output?.[0] || FALLBACK_URL;
      } else if (data.status === 'failed') {
        throw new Error(`Runway generation failed: ${data.error || 'unknown'}`);
      }
      console.log(`[Runway] Polling task ${taskId}... status: ${data.status}`);
    }
  }

  private mapMotionToRunway(motion?: MotionControl): string | undefined {
    if (!motion?.trajectory) return undefined;

    const t = motion.trajectory;
    const type = t.type.toLowerCase();
    const dir = t.direction?.toLowerCase();

    if (type === 'pan' && dir === 'left') return 'pan_left';
    if (type === 'pan' && dir === 'right') return 'pan_right';
    if (type === 'tilt' && dir === 'up') return 'tilt_up';
    if (type === 'tilt' && dir === 'down') return 'tilt_down';
    if (type === 'dolly' && dir === 'forward') return 'dolly_in';
    if (type === 'dolly' && dir === 'backward') return 'dolly_out';
    if (type === 'zoom' && dir === 'in') return 'zoom_in';
    if (type === 'zoom' && dir === 'out') return 'zoom_out';
    if (type === 'crane' && dir === 'up') return 'crane_up';
    if (type === 'crane' && dir === 'down') return 'crane_down';
    if (type === 'truck' && dir === 'left') return 'truck_left';
    if (type === 'truck' && dir === 'right') return 'truck_right';
    if (type === 'static') return 'static';
    if (type === 'orbit') return 'orbit';

    return undefined;
  }
}
