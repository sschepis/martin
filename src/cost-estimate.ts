import type { ProductionManifest, ProduceOptions, CostEstimate, CostBreakdownItem, EngineRates } from './types.ts';

export const DEFAULT_ENGINE_RATES: EngineRates = {
  video: {
    weryai: 0.05,
    luma: 0.10,
    runway: 0.15,
    kling: 0.08,
    fal: 0.03,
    mock: 0.00,
  },
  image: {
    weryai: 0.02,
    mock: 0.00,
  },
  audio: {
    elevenlabs: 0.01,
    mock: 0.00,
  },
};

export function estimateCost(
  manifest: ProductionManifest,
  options: ProduceOptions = {},
  rates: EngineRates = DEFAULT_ENGINE_RATES
): CostEstimate {
  const breakdown: CostBreakdownItem[] = [];
  const summary: Record<string, number> = {};

  const videoEngineName = options.videoEngine || 'weryai';
  const imageEngineName = options.imageEngine || 'weryai';
  const audioEngineName = options.audioEngine || 'mock';

  for (const shot of manifest.shots) {
    const engineName = shot.videoEngine || videoEngineName;
    const unitCost = rates.video[engineName] ?? rates.video['weryai'] ?? 0;
    breakdown.push({
      shotId: shot.id,
      category: 'video',
      engine: engineName,
      unitCost,
      quantity: 1,
      subtotal: unitCost,
    });
    summary['video'] = (summary['video'] || 0) + unitCost;

    if (shot.narration && shot.narration.trim().length > 0 && audioEngineName !== 'mock') {
      const audioUnit = rates.audio[audioEngineName] ?? 0;
      breakdown.push({
        shotId: shot.id,
        category: 'audio',
        engine: audioEngineName,
        unitCost: audioUnit,
        quantity: 1,
        subtotal: audioUnit,
      });
      summary['audio'] = (summary['audio'] || 0) + audioUnit;
    }
  }

  if (options.useImageToVideo) {
    for (const shot of manifest.shots) {
      const unitCost = rates.image[imageEngineName] ?? 0;
      breakdown.push({
        shotId: shot.id,
        category: 'image',
        engine: imageEngineName,
        unitCost,
        quantity: 1,
        subtotal: unitCost,
      });
      summary['image'] = (summary['image'] || 0) + unitCost;
    }
  }

  if (options.useReferenceImages) {
    const charCount = manifest.characters?.length || 0;
    const envCount = manifest.environments?.length || 0;
    const total = charCount + envCount;
    if (total > 0) {
      const unitCost = rates.image[imageEngineName] ?? 0;
      breakdown.push({
        shotId: 'reference-images',
        category: 'reference-image',
        engine: imageEngineName,
        unitCost,
        quantity: total,
        subtotal: unitCost * total,
      });
      summary['reference-image'] = (summary['reference-image'] || 0) + unitCost * total;
    }
  }

  const totalCost = breakdown.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    totalCost,
    currency: 'USD',
    breakdown,
    summary,
  };
}
