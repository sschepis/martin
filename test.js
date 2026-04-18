import { Martin } from './src/index';
async function main() {
    console.log('🎬 Initializing Martin Media Director...');
    const director = new Martin({
        llmProvider: 'mock-llm'
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
    console.log('\n🎥 Exporting for Runway Gen-3:');
    const runwayPrompts = production.export('runway-gen3');
    runwayPrompts.forEach((prompt, i) => {
        console.log(`\nShot ${i + 1}:`);
        console.log(prompt);
    });
    console.log('\n🎥 Exporting for Luma Dream Machine:');
    const lumaPrompts = production.export('luma');
    lumaPrompts.forEach((prompt, i) => {
        console.log(`\nShot ${i + 1}:`);
        console.log(prompt);
    });
    console.log('\n🎥 Exporting for OpenAI Sora:');
    const soraPrompts = production.export('sora');
    soraPrompts.forEach((prompt, i) => {
        console.log(`\nShot ${i + 1}:`);
        console.log(prompt);
    });
}
main().catch(console.error);
//# sourceMappingURL=test.js.map