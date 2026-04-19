export class LumaDreamMachineAdapter {
    name = 'luma';
    generatePrompt(manifest, shot) {
        // Luma Dream Machine generates highly realistic motion when given visceral, descriptive language 
        // that blends character action with camera physics.
        const cameraAction = shot.camera.movement.toLowerCase().includes('static')
            ? `The camera holds a steady, ${shot.camera.angle.toLowerCase()} angle`
            : `The camera executes a fluid ${shot.camera.movement.toLowerCase()} from a ${shot.camera.angle.toLowerCase()} angle`;
        return `Cinematic sequence: ${shot.description} ` +
            `Focus on ${shot.subject || 'the main subject'} situated in ${shot.environment || 'the scene'}. ` +
            `${cameraAction}, utilizing a ${shot.camera.lens || 'standard cinematic lens'}. ` +
            `The scene is illuminated by ${shot.lighting.style.toLowerCase()}, casting ${shot.lighting.contrast || 'natural'} contrast. ` +
            `The visual tone is deeply ${manifest.mood.toLowerCase()}, dominated by ${manifest.colorPalette.join(', ')} color grading. ` +
            `High fidelity, photorealistic textures, 4k resolution.`;
    }
}
