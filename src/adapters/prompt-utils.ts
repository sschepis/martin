import type { ProductionManifest, Shot, CharacterDefinition, EnvironmentDefinition, VisualStyle, ShotContext } from '../types.ts';

export function resolveNegativePrompt(manifest: ProductionManifest): string | undefined {
  return manifest.negativePrompt;
}

export function resolveStyleGuards(manifest: ProductionManifest): string[] {
  return manifest.styleGuards || [];
}

export function appendNegative(prompt: string, manifest: ProductionManifest, style: 'narrative' | 'flag' | 'suffix'): string {
  const neg = resolveNegativePrompt(manifest);
  if (!neg) return prompt;
  switch (style) {
    case 'narrative': return `${prompt} Avoid: ${neg}.`;
    case 'flag': return `${prompt} | Negative: ${neg}`;
    case 'suffix': return `${prompt} This video must not contain: ${neg}.`;
  }
}

export function appendStyleGuards(prompt: string, guards: string[]): string {
  if (guards.length === 0) return prompt;
  return `${prompt} ${guards.join(', ')}.`;
}

// --- Feature 1: Visual Consistency Registry Resolution ---

export function resolveCharacters(manifest: ProductionManifest, shot: Shot): CharacterDefinition[] {
  if (!shot.characterIds || !manifest.characters) return [];
  return shot.characterIds
    .map(id => manifest.characters!.find(c => c.id === id))
    .filter((c): c is CharacterDefinition => c !== undefined);
}

export function resolveEnvironment(manifest: ProductionManifest, shot: Shot): EnvironmentDefinition | undefined {
  if (!shot.environmentId || !manifest.environments) return undefined;
  return manifest.environments.find(e => e.id === shot.environmentId);
}

export function buildCharacterDescription(
  chars: CharacterDefinition[],
  established: EstablishedFeature[] = []
): string {
  if (chars.length === 0) return '';
  return chars.map(c => {
    const charEstablished = established.filter(e => e.characterId === c.id);

    let desc = c.name ? `${c.name}: ` : '';
    desc += c.faceDescription;
    if (c.hair) desc += `, ${c.hair}`;
    if (c.bodyType) desc += `, ${c.bodyType}`;
    desc += `, wearing ${c.wardrobe}`;
    if (c.distinguishingFeatures) desc += `, ${c.distinguishingFeatures}`;

    if (charEstablished.length > 0) {
      const reinforced = charEstablished.map(e => e.feature).join(' and ');
      desc += `. IMPORTANT — the character's ${reinforced} must be clearly visible and consistent with how it appeared in the previous shot`;
    }

    return desc;
  }).join('. ');
}

export function buildEnvironmentDescription(env: EnvironmentDefinition): string {
  let desc = env.name ? `${env.name}: ` : '';
  desc += env.spatialDescription;
  if (env.atmosphere) desc += `, ${env.atmosphere}`;
  if (env.timeOfDay) desc += ` at ${env.timeOfDay}`;
  if (env.props?.length) desc += `. Props: ${env.props.join(', ')}`;
  return desc;
}

export function buildVisualStyleDescription(style: VisualStyle | undefined): string {
  if (!style) return '';
  const parts: string[] = [];
  if (style.contrastStyle) parts.push(style.contrastStyle);
  if (style.grainLevel) parts.push(style.grainLevel);
  if (style.colorGradingNotes) parts.push(style.colorGradingNotes);
  if (style.blackLevel) parts.push(`${style.blackLevel} blacks`);
  return parts.join(', ');
}

export function resolveSubject(manifest: ProductionManifest, shot: Shot, context?: ShotContext): string {
  const chars = resolveCharacters(manifest, shot);
  if (chars.length > 0) {
    const established = context ? collectEstablishedFeatures(manifest, context) : [];
    return buildCharacterDescription(chars, established);
  }
  return shot.subject || 'the main subject';
}

function featureMatchesShot(feature: string, shot: Shot): boolean {
  const text = `${shot.description} ${shot.subject || ''}`.toLowerCase();
  const featureWords = feature.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);
  return featureWords.filter(w => text.includes(w)).length >= 2;
}

function isDetailShot(shot: Shot): boolean {
  const text = `${shot.description} ${shot.camera.angle} ${shot.camera.movement}`.toLowerCase();
  return /\b(close-?up|detail|insert|macro|extreme close|tight on)\b/.test(text);
}

export interface EstablishedFeature {
  characterId: string;
  feature: string;
  shotId: string;
}

export function collectEstablishedFeatures(
  manifest: ProductionManifest,
  context: ShotContext
): EstablishedFeature[] {
  if (!manifest.characters || context.shotIndex === 0) return [];

  const established: EstablishedFeature[] = [];
  const precedingShots = manifest.shots.slice(0, context.shotIndex);

  for (const prevShot of precedingShots) {
    if (!isDetailShot(prevShot) || !prevShot.characterIds?.length) continue;

    for (const charId of prevShot.characterIds) {
      const char = manifest.characters.find(c => c.id === charId);
      if (!char?.distinguishingFeatures) continue;

      const features = char.distinguishingFeatures.split(/,\s*/);
      for (const feature of features) {
        if (feature.trim() && featureMatchesShot(feature.trim(), prevShot)) {
          established.push({ characterId: charId, feature: feature.trim(), shotId: prevShot.id });
        }
      }
    }
  }

  return established;
}

export function resolveEnvironmentDesc(manifest: ProductionManifest, shot: Shot): string {
  const env = resolveEnvironment(manifest, shot);
  if (env) return buildEnvironmentDescription(env);
  return shot.environment || 'a detailed environment';
}

export function resolveColorGrading(manifest: ProductionManifest): string {
  const palette = manifest.colorPalette.join(', ');
  const vs = buildVisualStyleDescription(manifest.visualStyle);
  if (vs) return `${palette}. ${vs}`;
  return palette;
}

// --- Feature 3: Temporal Continuity ---

export function buildPreviousShotContext(prevShot: Shot, manifest: ProductionManifest): string {
  const env = resolveEnvironment(manifest, prevShot);
  const envDesc = env ? env.spatialDescription : (prevShot.environment || 'the previous scene');
  return `Continuing from the previous shot which ended on: ${prevShot.description} ` +
    `Camera was at ${prevShot.camera.angle} with ${prevShot.camera.movement} in ${envDesc}.`;
}

export function buildTransitionContext(currentShot: Shot): string {
  if (!currentShot.transition) return '';
  const t = currentShot.transition.type.toLowerCase();
  if (t.includes('wipeleft') || t.includes('slideleft')) {
    return 'This shot should enter from the right side of frame to match the leftward wipe transition.';
  }
  if (t.includes('wiperight') || t.includes('slideright')) {
    return 'This shot should enter from the left side of frame to match the rightward wipe transition.';
  }
  if (t.includes('fade') || t.includes('dissolve')) {
    return 'This shot should have similar overall brightness and composition to the previous shot for a smooth dissolve.';
  }
  return '';
}

export function buildContextPrefix(manifest: ProductionManifest, shot: Shot, context?: ShotContext): string {
  if (!context) return '';
  const parts: string[] = [];
  if (context.previousShot) {
    parts.push(buildPreviousShotContext(context.previousShot, manifest));
  }
  const transCtx = buildTransitionContext(shot);
  if (transCtx) parts.push(transCtx);
  if (parts.length === 0) return '';
  return parts.join(' ') + ' ';
}

export function resolveCameraMovement(shot: Shot, context?: ShotContext): string {
  const speedMod = context?.tempo?.cameraSpeedModifier;
  if (speedMod) return `${speedMod} ${shot.camera.movement}`;
  return shot.camera.movement;
}
