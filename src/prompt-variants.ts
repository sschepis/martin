import type {
  ProductionManifest, Shot, ShotContext, Adapter,
  PromptVariant, VariationStrategy
} from './types.ts';

export function generatePromptVariants(
  manifest: ProductionManifest,
  shot: Shot,
  adapter: Adapter,
  context: ShotContext,
  count: number
): PromptVariant[] {
  const original = adapter.generatePrompt(manifest, shot, context);

  const variants: PromptVariant[] = [{
    id: `${shot.id}-v0`,
    prompt: original,
    strategy: 'original',
  }];

  if (count <= 1) return variants;

  const strategies: VariationStrategy[] = ['rephrase', 'emphasize-subject', 'emphasize-environment', 'vary-style'];

  for (let i = 1; i < count; i++) {
    const strategy = strategies[(i - 1) % strategies.length];
    const variantPrompt = applyVariationStrategy(original, manifest, shot, strategy);
    variants.push({
      id: `${shot.id}-v${i}`,
      prompt: variantPrompt,
      strategy,
    });
  }

  return variants;
}

function applyVariationStrategy(
  basePrompt: string,
  manifest: ProductionManifest,
  shot: Shot,
  strategy: VariationStrategy
): string {
  switch (strategy) {
    case 'rephrase':
      return rephrasePrompt(basePrompt);
    case 'emphasize-subject':
      return emphasizeSubject(basePrompt, shot);
    case 'emphasize-environment':
      return emphasizeEnvironment(basePrompt, shot);
    case 'vary-style':
      return varyStyleTokens(basePrompt);
    default:
      return basePrompt;
  }
}

function rephrasePrompt(prompt: string): string {
  return `[VARIANT: Alternative composition] ${prompt} Emphasize visual dynamism and cinematic depth.`;
}

function emphasizeSubject(prompt: string, shot: Shot): string {
  const emphasis = shot.subject
    ? `Focus prominently on ${shot.subject}, making them the clear visual anchor of the frame.`
    : 'Ensure the primary subject dominates the composition.';
  return `${prompt} ${emphasis}`;
}

function emphasizeEnvironment(prompt: string, shot: Shot): string {
  const emphasis = shot.environment
    ? `Emphasize the rich details of ${shot.environment}, letting the environment tell its own story.`
    : 'Give strong visual weight to the surrounding environment and atmosphere.';
  return `${prompt} ${emphasis}`;
}

function varyStyleTokens(prompt: string): string {
  const swaps: [string, string][] = [
    ['Masterpiece', 'Award-winning cinematography'],
    ['8k resolution', 'ultra-high definition'],
    ['highly detailed', 'rich in visual detail'],
    ['professional cinematography', 'cinematic excellence'],
    ['professional photography', 'fine art photography'],
    ['4k resolution', 'ultra-high definition'],
  ];

  let modified = prompt;
  for (const [original, replacement] of swaps) {
    if (modified.includes(original)) {
      modified = modified.replace(original, replacement);
      break;
    }
  }
  return modified;
}
