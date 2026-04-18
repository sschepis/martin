const { Martin } = require('./dist/index.js');

async function main() {
  const director = new Martin({ llmProvider: 'mock-llm' });
  const production = await director.plan('A cinematic test shot', { aspectRatio: '16:9' });
  
  console.log(`Planned: ${production.title}`);
  console.log(`Sora Prompt: ${production.export('sora')[0]}`);
}

main();
