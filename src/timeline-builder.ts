import type { SceneClip } from './compiler.ts';
import type { TempoDefaults, LayoutMode } from './types.ts';

export interface TimelineClip {
  asset: { type: string; src: string; text?: string; style?: string; volume?: number };
  start: number;
  length: number;
  effect?: string;
  filter?: string;
  transition?: { in?: string; out?: string };
  position?: string;
  scale?: number;
  opacity?: number;
}

export interface TimelineTrack {
  clips: TimelineClip[];
}

export interface TimelineOutput {
  format: 'mp4' | 'gif' | 'mp3';
  resolution: string;
}

export interface AudioMixOptions {
  musicUrl?: string;
  musicVolume?: number;
  sfxVolume?: number;
  narrationVolume?: number;
  musicFadeDuration?: number;
}

export interface BuildOptions {
  defaultTransition?: string;
  defaultEffect?: string;
  defaultFilter?: string;
  tempo?: TempoDefaults;
  audioMix?: AudioMixOptions;
}

export class TimelineBuilder {
  private tracks: TimelineTrack[] = [];
  private output: TimelineOutput = { format: 'mp4', resolution: 'hd' };
  private layoutMode: LayoutMode = 'sequential';

  setLayout(mode: LayoutMode): this {
    this.layoutMode = mode;
    return this;
  }

  setOutput(format: 'mp4' | 'gif' | 'mp3', resolution: string): this {
    this.output = { format, resolution };
    return this;
  }

  addTrack(clips: TimelineClip[]): this {
    this.tracks.push({ clips });
    return this;
  }

  buildFromClips(clips: SceneClip[], options?: BuildOptions): this {
    switch (this.layoutMode) {
      case 'sequential':
        return this.buildSequential(clips, options);
      case 'split-screen':
        return this.buildSplitScreen(clips, options);
      case 'picture-in-picture':
        return this.buildPictureInPicture(clips, options);
      case 'overlay':
        return this.buildOverlay(clips, options);
      default:
        return this.buildSequential(clips, options);
    }
  }

  build(): { timeline: { tracks: TimelineTrack[] }; output: TimelineOutput } {
    return {
      timeline: { tracks: this.tracks },
      output: this.output
    };
  }

  private resolveTransition(baseTransition: string | undefined, tempo?: TempoDefaults): string | undefined {
    if (!baseTransition) return undefined;
    if (!tempo?.transitionTiming) return baseTransition;
    return `${baseTransition}${tempo.transitionTiming}`;
  }

  private buildSequential(clips: SceneClip[], options?: BuildOptions): this {
    let currentTime = 0;
    const videoClips: TimelineClip[] = [];
    const audioClips: TimelineClip[] = [];
    const sfxClips: TimelineClip[] = [];

    const transition = this.resolveTransition(options?.defaultTransition, options?.tempo);
    const mix = options?.audioMix;

    for (const clip of clips) {
      const duration = clip.duration ?? 5;

      const videoClip: TimelineClip = {
        asset: { type: 'video', src: clip.videoUrlOrPath },
        start: currentTime,
        length: duration,
      };

      if (transition) {
        videoClip.transition = { in: transition, out: transition };
      }
      if (options?.defaultEffect) {
        videoClip.effect = options.defaultEffect;
      }
      if (options?.defaultFilter) {
        videoClip.filter = options.defaultFilter;
      }

      videoClips.push(videoClip);

      if (clip.audioUrlOrPath) {
        const narrationAsset: TimelineClip['asset'] = { type: 'audio', src: clip.audioUrlOrPath };
        if (mix?.narrationVolume != null) narrationAsset.volume = mix.narrationVolume;
        audioClips.push({ asset: narrationAsset, start: currentTime, length: duration });
      }

      if (clip.sfxUrlOrPath) {
        const sfxAsset: TimelineClip['asset'] = { type: 'audio', src: clip.sfxUrlOrPath };
        if (mix?.sfxVolume != null) sfxAsset.volume = mix.sfxVolume;
        sfxClips.push({ asset: sfxAsset, start: currentTime, length: duration });
      }

      currentTime += duration;
    }

    this.tracks.push({ clips: videoClips });
    if (audioClips.length > 0) {
      this.tracks.push({ clips: audioClips });
    }
    if (sfxClips.length > 0) {
      this.tracks.push({ clips: sfxClips });
    }

    if (mix?.musicUrl && currentTime > 0) {
      const fadeDuration = mix.musicFadeDuration ?? 2;
      const fadeTransition = fadeDuration <= 1 ? 'fadeFast' : 'fade';
      const musicClip: TimelineClip = {
        asset: { type: 'audio', src: mix.musicUrl, volume: mix.musicVolume ?? 0.25 },
        start: 0,
        length: currentTime,
        transition: { in: fadeTransition, out: fadeTransition },
      };
      this.tracks.push({ clips: [musicClip] });
    }

    return this;
  }

  private buildSplitScreen(clips: SceneClip[], options?: BuildOptions): this {
    const videoClipsLeft: TimelineClip[] = [];
    const videoClipsRight: TimelineClip[] = [];
    let currentTime = 0;

    for (let i = 0; i < clips.length; i += 2) {
      const leftClip = clips[i];
      const rightClip = clips[i + 1];
      const duration = Math.max(leftClip.duration ?? 5, rightClip?.duration ?? 5);

      videoClipsLeft.push({
        asset: { type: 'video', src: leftClip.videoUrlOrPath },
        start: currentTime,
        length: duration,
        position: 'left',
        scale: 0.5,
      });

      if (rightClip) {
        videoClipsRight.push({
          asset: { type: 'video', src: rightClip.videoUrlOrPath },
          start: currentTime,
          length: duration,
          position: 'right',
          scale: 0.5,
        });
      }

      currentTime += duration;
    }

    this.tracks.push({ clips: videoClipsLeft });
    if (videoClipsRight.length > 0) {
      this.tracks.push({ clips: videoClipsRight });
    }

    return this;
  }

  private buildPictureInPicture(clips: SceneClip[], _options?: BuildOptions): this {
    if (clips.length < 2) return this.buildSequential(clips, _options);

    const mainClips: TimelineClip[] = [];
    const pipClips: TimelineClip[] = [];
    let currentTime = 0;

    const mainClip = clips[0];
    const totalDuration = clips.reduce((sum, c) => sum + (c.duration ?? 5), 0);

    mainClips.push({
      asset: { type: 'video', src: mainClip.videoUrlOrPath },
      start: 0,
      length: totalDuration,
    });

    for (let i = 1; i < clips.length; i++) {
      const clip = clips[i];
      const duration = clip.duration ?? 5;
      pipClips.push({
        asset: { type: 'video', src: clip.videoUrlOrPath },
        start: currentTime,
        length: duration,
        position: 'topRight',
        scale: 0.25,
      });
      currentTime += duration;
    }

    this.tracks.push({ clips: mainClips });
    this.tracks.push({ clips: pipClips });

    return this;
  }

  private buildOverlay(clips: SceneClip[], _options?: BuildOptions): this {
    if (clips.length === 0) return this;

    const baseDuration = clips[0].duration ?? 5;

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const opacity = i === 0 ? 1.0 : 0.5;
      this.tracks.push({
        clips: [{
          asset: { type: 'video', src: clip.videoUrlOrPath },
          start: 0,
          length: clip.duration ?? baseDuration,
          opacity,
        }]
      });
    }

    return this;
  }
}
