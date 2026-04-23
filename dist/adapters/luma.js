import { resolveStyleGuards, appendNegative, resolveSubject, resolveEnvironmentDesc, resolveColorGrading, buildContextPrefix, resolveCameraMovement } from "./prompt-utils.js";
export class LumaDreamMachineAdapter {
    name = 'luma';
    generatePrompt(manifest, shot, context) {
        const movement = resolveCameraMovement(shot, context);
        const cameraAction = movement.toLowerCase().includes('static')
            ? `The camera holds a steady, ${shot.camera.angle.toLowerCase()} angle`
            : `The camera executes a fluid ${movement.toLowerCase()} from a ${shot.camera.angle.toLowerCase()} angle`;
        const subject = resolveSubject(manifest, shot);
        const environment = resolveEnvironmentDesc(manifest, shot);
        const colorGrading = resolveColorGrading(manifest);
        const contextPrefix = buildContextPrefix(manifest, shot, context);
        const guards = resolveStyleGuards(manifest);
        const guardsStr = guards.length > 0 ? `, ${guards.join(', ')}` : '';
        let prompt = `${contextPrefix}Cinematic sequence: ${shot.description} ` +
            `Focus on ${subject} situated in ${environment}. ` +
            `${cameraAction}, utilizing a ${shot.camera.lens || 'standard cinematic lens'}. ` +
            `The scene is illuminated by ${shot.lighting.style.toLowerCase()}, casting ${shot.lighting.contrast || 'natural'} contrast. ` +
            `The visual tone is deeply ${manifest.mood.toLowerCase()}, dominated by ${colorGrading} color grading${guardsStr}. ` +
            `High fidelity, photorealistic textures, 4k resolution.`;
        prompt = appendNegative(prompt, manifest, 'narrative');
        return prompt;
    }
}
