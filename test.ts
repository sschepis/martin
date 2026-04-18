import { Martin } from './src/index';

async function main() {
  console.log('🎬 Initializing Martin Media Director...');
  
  // Test different compactness levels
  const levels: ('full' | 'compact' | 'minimal')[] = ['full', 'compact', 'minimal'];
  
  for (const level of levels) {
    const director = new Martin({
      llmProvider: 'mock-llm',
      promptCompactness: level
    });

    console.log(`\n📝 Planning production with promptCompactness: '${level}'...`);
    const production = await director.plan(`
      A lonely robot in a rainy neo-Tokyo alley, looking up at a neon billboard.
    `, {
      style: 'noir-cinematic',
      aspectRatio: '21:9'
    });
  }
}

main();