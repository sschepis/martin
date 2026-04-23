import { MartinConfig } from './types.ts';
import {
  SHOTSTACK_EFFECTS, SHOTSTACK_FILTERS, SHOTSTACK_TRANSITIONS, SHOTSTACK_RESOLUTIONS
} from './prompts/schemas.ts';

export interface SceneClip {
  videoUrlOrPath: string;
  audioUrlOrPath?: string;
  sfxUrlOrPath?: string;
  duration?: number;
  narrationText?: string;
}

const effectSet = new Set(SHOTSTACK_EFFECTS);
const filterSet = new Set(SHOTSTACK_FILTERS);
const transitionSet = new Set(SHOTSTACK_TRANSITIONS);
const resolutionSet = new Set(SHOTSTACK_RESOLUTIONS);

export class ShotstackCompiler {
  private apiKey: string;
  private apiUrl: string;

  constructor(config: MartinConfig = {}) {
    this.apiKey = config.shotstackApiKey || process.env.SHOTSTACK_API_KEY || '';
    this.apiUrl = process.env.SHOTSTACK_API_URL || 'https://api.shotstack.io/edit/stage/render';
  }

  private sanitize(composition: any): any {
    const sanitized = JSON.parse(JSON.stringify(composition));

    if (sanitized.output?.resolution && !resolutionSet.has(sanitized.output.resolution)) {
      sanitized.output.resolution = 'hd';
    }

    const tracks = sanitized.timeline?.tracks || [];
    for (let t = tracks.length - 1; t >= 0; t--) {
      const clips = tracks[t].clips || [];
      for (let c = clips.length - 1; c >= 0; c--) {
        const clip = clips[c];

        if (clip.asset?.src && !clip.asset.src.startsWith('http')) {
          clips.splice(c, 1);
          continue;
        }

        if (clip.effect && !effectSet.has(clip.effect)) {
          delete clip.effect;
        }
        if (clip.filter && !filterSet.has(clip.filter)) {
          delete clip.filter;
        }
        if (clip.transition) {
          if (clip.transition.in && !transitionSet.has(clip.transition.in)) {
            delete clip.transition.in;
          }
          if (clip.transition.out && !transitionSet.has(clip.transition.out)) {
            delete clip.transition.out;
          }
          if (!clip.transition.in && !clip.transition.out) {
            delete clip.transition;
          }
        }
      }
      if (clips.length === 0) {
        tracks.splice(t, 1);
      }
    }

    return sanitized;
  }

  async compile(composition: any): Promise<string> {
    composition = this.sanitize(composition);
    if (!this.apiKey) {
      throw new Error('Shotstack API key is required. Set it in config.shotstackApiKey or process.env.SHOTSTACK_API_KEY');
    }

    console.log('[ShotstackCompiler] Submitting render request...');
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify(composition)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Shotstack API Error: ${response.status} ${err}`);
    }

    const data = await response.json();
    const renderId = data.response.id;
    console.log(`[ShotstackCompiler] Render ID: ${renderId}. Polling for completion...`);

    return this.pollRenderStatus(renderId);
  }

  private async pollRenderStatus(renderId: string): Promise<string> {
    const pollUrl = `${this.apiUrl}/${renderId}`;
    
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const response = await fetch(pollUrl, {
        headers: {
          'x-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to poll status: ${response.statusText}`);
      }

      const data = await response.json();
      const status = data.response.status;
      
      console.log(`[ShotstackCompiler] Status: ${status}`);
      
      if (status === 'done') {
        return data.response.url;
      } else if (status === 'failed') {
        console.error('Shotstack failed details:', JSON.stringify(data, null, 2));
        throw new Error(`Shotstack render failed: ${typeof data.response.error === 'object' ? JSON.stringify(data.response.error) : data.response.error}`);
      }
    }
  }
}
