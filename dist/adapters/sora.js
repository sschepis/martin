export class SoraAdapter {
    name = 'sora';
    generatePrompt(manifest, shot) {
        // Sora excels at highly descriptive, natural language prompts that read like a story or detailed visual description.
        const prompt = `A highly detailed, photorealistic video of ${shot.description}. ` +
            `The subject is ${shot.subject || 'not explicitly defined'}, situated in ${shot.environment || 'an undefined environment'}. ` +
            `The camera executes a ${shot.camera.movement.toLowerCase()} from a ${shot.camera.angle.toLowerCase()} angle, ` +
            `simulating a ${shot.camera.lens || 'standard cinematic lens'}. ` +
            `The lighting is ${shot.lighting.style.toLowerCase()}${shot.lighting.contrast ? ` with ${shot.lighting.contrast.toLowerCase()}` : ''}, ` +
            `creating a ${manifest.mood.toLowerCase()} atmosphere. ` +
            `The dominant colors are ${manifest.colorPalette.join(', ')}.`;
        return prompt;
    }
}
