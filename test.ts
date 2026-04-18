import { Martin } from './src/index';

async function main() {
  console.log('🎬 Initializing Martin Media Director...');
  
  const director = new Martin({
    llmProvider: 'mock-llm',
    promptCompactness: 'compact'
  });

  console.log('\n📝 Planning production...');
  const production = await director.plan(`
    A lonely robot in a rainy neo-Tokyo alley, looking up at a neon billboard.
  `, {
    style: 'noir-cinematic',
    aspectRatio: '21:9'
  });

  console.log('\n✅ Production Manifest Generated:');
  console.log(`Title: ${production.title}`);
  console.log(`Mood: ${production.mood}`);
  console.log(`Shots: ${production.shots.length}`);

  console.log('\n🎥 Exporting for Runway Gen-3:\n');
  production.export('runway-gen3').forEach((p, i) => console.log(`Shot ${i + 1}:\n${p}\n`));

  console.log('🎥 Exporting for Luma Dream Machine:\n');
  production.export('luma').forEach((p, i) => console.log(`Shot ${i + 1}:\n${p}\n`));

  console.log('🎥 Exporting for OpenAI Sora:\n');
  production.export('sora').forEach((p, i) => console.log(`Shot ${i + 1}:\n${p}\n`));
}

main();