import type { Shot, CameraTrajectory, MotionControl, TempoDefaults } from './types.ts';

export const MOTION_PRESETS: Map<string, CameraTrajectory> = new Map([
  ['dolly-in',    { type: 'dolly', direction: 'forward', speed: 'medium' }],
  ['dolly-out',   { type: 'dolly', direction: 'backward', speed: 'medium' }],
  ['push-in',     { type: 'dolly', direction: 'forward', speed: 'slow' }],
  ['pull-back',   { type: 'dolly', direction: 'backward', speed: 'slow' }],
  ['pan-left',    { type: 'pan', direction: 'left', speed: 'medium' }],
  ['pan-right',   { type: 'pan', direction: 'right', speed: 'medium' }],
  ['tilt-up',     { type: 'tilt', direction: 'up', speed: 'medium' }],
  ['tilt-down',   { type: 'tilt', direction: 'down', speed: 'medium' }],
  ['crane-up',    { type: 'crane', direction: 'up', speed: 'slow' }],
  ['crane-down',  { type: 'crane', direction: 'down', speed: 'slow' }],
  ['orbit',       { type: 'orbit', direction: 'right', speed: 'slow' }],
  ['orbit-left',  { type: 'orbit', direction: 'left', speed: 'slow' }],
  ['truck-left',  { type: 'truck', direction: 'left', speed: 'medium' }],
  ['truck-right', { type: 'truck', direction: 'right', speed: 'medium' }],
  ['tracking',    { type: 'tracking', direction: 'forward', speed: 'medium' }],
  ['handheld',    { type: 'handheld', speed: 'medium' }],
  ['steadicam',   { type: 'steadicam', direction: 'forward', speed: 'slow' }],
  ['static',      { type: 'static', speed: 'slow' }],
  ['zoom-in',     { type: 'zoom', direction: 'in', speed: 'medium' }],
  ['zoom-out',    { type: 'zoom', direction: 'out', speed: 'medium' }],
  ['whip-pan',    { type: 'pan', direction: 'right', speed: 'fast' }],
]);

const SPEED_WORDS = ['slow', 'fast', 'rapid', 'quick', 'gentle', 'subtle'];

function normalizeMovement(movement: string): string {
  return movement.toLowerCase().trim().replace(/\s+/g, '-');
}

function stripSpeedPrefix(normalized: string): { stripped: string; speed?: 'slow' | 'medium' | 'fast' } {
  const parts = normalized.split('-');
  if (parts.length < 2) return { stripped: normalized };

  const first = parts[0];
  if (first === 'slow' || first === 'gentle' || first === 'subtle') {
    return { stripped: parts.slice(1).join('-'), speed: 'slow' };
  }
  if (first === 'fast' || first === 'rapid' || first === 'quick') {
    return { stripped: parts.slice(1).join('-'), speed: 'fast' };
  }
  return { stripped: normalized };
}

export function resolveMotionControl(shot: Shot): MotionControl {
  const normalized = normalizeMovement(shot.camera.movement);

  const exact = MOTION_PRESETS.get(normalized);
  if (exact) {
    return { trajectory: { ...exact } };
  }

  const { stripped, speed } = stripSpeedPrefix(normalized);
  const preset = MOTION_PRESETS.get(stripped);
  if (preset) {
    const trajectory = { ...preset };
    if (speed) trajectory.speed = speed;
    return { trajectory };
  }

  for (const [key, value] of MOTION_PRESETS) {
    if (stripped.includes(key) || key.includes(stripped)) {
      const trajectory = { ...value };
      if (speed) trajectory.speed = speed;
      return { trajectory };
    }
  }

  return {
    trajectory: { type: stripped.replace(/-/g, ' '), speed: speed || 'medium' }
  };
}

export function buildMotionDescription(motion: MotionControl): string {
  if (!motion.trajectory) return '';

  const t = motion.trajectory;
  const parts: string[] = [];

  if (t.speed && t.speed !== 'medium') {
    parts.push(t.speed.charAt(0).toUpperCase() + t.speed.slice(1));
  }

  parts.push(t.type);

  if (t.direction) {
    if (t.direction === 'forward' || t.direction === 'backward') {
      parts.push(t.direction);
    } else if (t.direction === 'in' || t.direction === 'out') {
      parts.push(t.direction);
    } else {
      parts.push(`to the ${t.direction}`);
    }
  }

  if (t.startPosition && t.endPosition) {
    parts.push(`from (${t.startPosition.x},${t.startPosition.y}) to (${t.endPosition.x},${t.endPosition.y})`);
  }

  let desc = parts.join(' ');

  if (motion.motionStrength != null) {
    const label = motion.motionStrength > 0.7 ? 'strong' : motion.motionStrength > 0.3 ? 'moderate' : 'subtle';
    desc += ` with ${label} motion intensity`;
  }

  return desc;
}

export function applyTempoToMotion(motion: MotionControl, tempo?: TempoDefaults): MotionControl {
  if (!tempo?.cameraSpeedModifier || !motion.trajectory) return motion;

  const mod = tempo.cameraSpeedModifier.toLowerCase();
  let speed: 'slow' | 'medium' | 'fast' | undefined;

  if (mod.includes('rapid') || mod.includes('fast')) {
    speed = 'fast';
  } else if (mod.includes('slow') || mod.includes('deliberate')) {
    speed = 'slow';
  }

  if (!speed) return motion;

  return {
    ...motion,
    trajectory: { ...motion.trajectory, speed },
  };
}
