import 'dotenv/config';
import { Martin } from '../src/index';

async function generateWeryAiVideo(prompt: string, model: string, adapter: string, duration: number) {
  const apiKey = process.env.WERYAI_API_KEY;
  console.log(`[WeryAI] Submitting to model ${model}...`);
  try {
    const startResponse = await fetch('https://api.weryai.com/v1/generation/text-to-video', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: model,
        prompt: prompt.substring(0, 2000),
        aspect_ratio: '16:9',
        duration: duration
      })
    });
    
    const startData = await startResponse.json();
    if (startData.status !== 200) {
       console.error(`[WeryAI] [${model}] Failed to start:`, startData);
       return { adapter, model, url: null, error: startData };
    }
    
    const taskId = startData.data.task_id;
    console.log(`[WeryAI] [${model}] Task started: ${taskId}. Polling...`);
    
    while (true) {
      await new Promise(r => setTimeout(r, 10000));
      const statusResponse = await fetch(`https://api.weryai.com/v1/generation/${taskId}/status`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      
      const statusData = await statusResponse.json();
      const status = statusData.data.task_status;
      
      if (status === 'succeed') {
        console.log(`[WeryAI] [${model}] SUCCESS!`);
        return { adapter, model, url: statusData.data.videos[0] };
      } else if (status === 'failed' || status === 'error') {
        console.error(`[WeryAI] [${model}] Task ${taskId} failed:`, statusData);
        return { adapter, model, url: null, error: statusData };
      }
      console.log(`[WeryAI] [${model}] task ${taskId} status: ${status}`);
    }
  } catch (err) {
    console.error(`[WeryAI] [${model}] Error:`, err);
    return { adapter, model, url: null, error: err };
  }
}

async function main() {
  const director = new Martin({ llmProvider: 'mock-llm' });
  const manifest = await director.plan("A futuristic car racing through a neon-lit cyberpunk city in the rain.", { 
    style: "cyberpunk", 
    aspectRatio: "16:9" 
  });
   
  console.log("\n🎬 Testing Adapter Prompts on WeryAI Models 🎬");

  const tests = [
    { adapter: 'weryai', model: 'WERYAI_VIDEO_1_0', duration: 5 },
    { adapter: 'sora', model: 'SORA_2', duration: 4 },
    { adapter: 'runway-gen3', model: 'KLING_V3_0_PRO', duration: 5 },
    { adapter: 'luma', model: 'VEO_3_1', duration: 8 }
  ];

  const results = [];
  for (const test of tests) {
    const prompt = manifest.export(test.adapter)[0];
    console.log(`\n🚀 Submitting Adapter: ${test.adapter.toUpperCase()} to Model: ${test.model}`);
    console.log(`📝 Prompt: ${prompt}`);
    const res = await generateWeryAiVideo(prompt, test.model, test.adapter, test.duration);
    results.push(res);
    // Wait a bit to avoid rate limits
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log(`\n==================================================`);
  console.log(`🎉 ALL TESTS COMPLETED 🎉`);
  console.log(`==================================================\n`);
  
  for (const res of results) {
    console.log(`✅ Adapter: ${res.adapter.toUpperCase()} (${res.model})`);
    console.log(`🔗 URL: ${res.url || 'FAILED'}\n`);
  }
}

main().catch(console.error);
