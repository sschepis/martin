import 'dotenv/config';
import { Martin } from '../src/index';

async function main() {
  console.log('💄 Starting TikTok Ad Production for "Lumière Éternelle"...\n');
  
  const director = new Martin({
    llmProvider: 'lmstudio',
    promptCompactness: 'compact'
  });

  const script = `
    NARRATOR: Tired of dull, lifeless skin?
    (Close up of a glowing, elegant bottle of "Lumière Éternelle" serum resting on a marble pedestal, catching the light.)
    NARRATOR: Introducing Lumière Éternelle. The secret to a timeless glow.
    (A beautiful model gently applies the glowing serum to her cheek, her skin looking radiant and flawless.)
    NARRATOR: Get yours today and shine forever.
    (The bottle spins slowly in macro focus, with gold particles floating around it.)
  `;

  console.log('📝 Planning ad production...');
  const manifest = await director.plan(script, {
    style: 'Enchanted luxury, radiant allure',
    aspectRatio: '9:16'
  });

  console.log('\n✅ Ad Manifest Generated:');
  console.log(`Title: ${manifest.title}`);
  console.log(`Mood: ${manifest.mood}`);
  console.log(`Shots: ${manifest.shots.length}\n`);

  // Use the new produce method with image-to-video enabled!
  const finalVideoPath = await director.produce(manifest, {
    videoEngine: 'weryai',
    audioEngine: 'elevenlabs',
    imageEngine: 'weryai',
    useImageToVideo: false, // WeryAI's image endpoint is currently down
    resolution: { width: 1080, height: 1920 }
  });

  console.log('\n🎉 TikTok Ad Complete!');
  console.log(`Final Video: ${finalVideoPath}`);
}

main().catch(console.error);
