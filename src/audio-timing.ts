export function estimateNarrationDuration(text: string, wordsPerSecond: number = 2.5): number {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerSecond);
}

export function resolveClipDuration(baseDuration: number, narrationText?: string): number {
  if (!narrationText || narrationText.trim().length === 0) return baseDuration;
  const estimated = estimateNarrationDuration(narrationText);
  return Math.max(baseDuration, estimated);
}
