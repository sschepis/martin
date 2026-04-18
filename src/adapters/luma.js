export class LumaDreamMachineAdapter {
    name = 'luma';
    generatePrompt(manifest, shot) {
        // Luma tends to prefer natural language storytelling with technical details woven in.
        return `A cinematic shot featuring ${shot.subject || 'the main subject'} in ${shot.environment || 'the scene'}. ` +
            `${shot.description} ` +
            `The camera features a ${shot.camera.movement} from a ${shot.camera.angle} angle, shot on a ${shot.camera.lens || 'standard lens'}. ` +
            `The lighting is ${shot.lighting.style} with ${shot.lighting.contrast || 'natural'} contrast. ` +
            `Overall mood is ${manifest.mood} with a color palette of ${manifest.colorPalette.join(', ')}.`;
    }
}
//# sourceMappingURL=luma.js.map