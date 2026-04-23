import type {
  PromptVariant, VariantComparisonResult, VideoEngine,
  VideoGenerationOptions, PromptResultRecord, VariationStrategy
} from './types.ts';
import { validateVideoResult } from './validation.ts';

export async function generateAndSelectVariant(
  shotId: string,
  variants: PromptVariant[],
  engine: VideoEngine,
  genOptions: VideoGenerationOptions,
  selectionMethod: 'auto' | 'best-score' | 'llm' = 'auto'
): Promise<VariantComparisonResult> {
  for (const variant of variants) {
    console.log(`[VariantSelector] Generating variant ${variant.id} (${variant.strategy})...`);
    try {
      variant.result = await engine.generateVideo(variant.prompt, genOptions);
      const validation = validateVideoResult(variant.result, genOptions);
      variant.validationScore = validation.score;
    } catch (error) {
      console.error(`[VariantSelector] Variant ${variant.id} failed:`, error);
      variant.validationScore = 0;
    }
  }

  const selected = selectBestVariant(variants);

  return {
    shotId,
    variants,
    selectedVariant: selected,
    selectionMethod: selectionMethod === 'llm' ? 'llm-vision' : 'validation-score',
  };
}

function selectBestVariant(variants: PromptVariant[]): PromptVariant {
  const validVariants = variants.filter(v => v.result && v.validationScore != null);

  if (validVariants.length === 0) {
    return variants[0];
  }

  validVariants.sort((a, b) => (b.validationScore ?? 0) - (a.validationScore ?? 0));

  const best = validVariants[0];
  console.log(`[VariantSelector] Selected variant ${best.id} (${best.strategy}) with score ${best.validationScore?.toFixed(2)}`);

  return best;
}

export function toPromptRecord(
  variant: PromptVariant,
  engineName: string,
  adapterName: string
): PromptResultRecord {
  return {
    engine: engineName,
    adapter: adapterName,
    prompt: variant.prompt,
    strategy: variant.strategy,
    score: variant.validationScore ?? 0,
    timestamp: Date.now(),
  };
}

export class PromptHistory {
  private records: PromptResultRecord[] = [];

  add(record: PromptResultRecord): void {
    this.records.push(record);
  }

  getRecords(): ReadonlyArray<PromptResultRecord> {
    return this.records;
  }

  getBestStrategyForEngine(engineName: string): VariationStrategy | undefined {
    const engineRecords = this.records.filter(r => r.engine === engineName && r.score > 0);
    if (engineRecords.length === 0) return undefined;

    const strategyScores = new Map<string, { total: number; count: number }>();
    for (const record of engineRecords) {
      const entry = strategyScores.get(record.strategy) || { total: 0, count: 0 };
      entry.total += record.score;
      entry.count += 1;
      strategyScores.set(record.strategy, entry);
    }

    let bestStrategy: string | undefined;
    let bestAvg = -1;
    for (const [strategy, { total, count }] of strategyScores) {
      const avg = total / count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestStrategy = strategy;
      }
    }

    return bestStrategy as VariationStrategy | undefined;
  }

  toJSON(): string {
    return JSON.stringify(this.records);
  }

  static fromJSON(json: string): PromptHistory {
    const history = new PromptHistory();
    const records = JSON.parse(json) as PromptResultRecord[];
    for (const r of records) history.add(r);
    return history;
  }
}
