import { resolveStyleGuards, appendNegative, appendStyleGuards, resolveSubject, resolveEnvironmentDesc, resolveColorGrading, buildContextPrefix, resolveCameraMovement } from "./prompt-utils.js";
export class SoraAdapter {
    name = 'sora';
    generatePrompt(manifest, shot, context) {
        const subject = resolveSubject(manifest, shot);
        const environment = resolveEnvironmentDesc(manifest, shot);
        const colorGrading = resolveColorGrading(manifest);
        const movement = resolveCameraMovement(shot, context);
        const contextPrefix = buildContextPrefix(manifest, shot, context);
        let prompt = `${contextPrefix}A highly detailed, photorealistic video of ${shot.description}. ` +
            `The subject is ${subject}, situated in ${environment}. ` +
            `The camera executes a ${movement.toLowerCase()} from a ${shot.camera.angle.toLowerCase()} angle, ` +
            `simulating a ${shot.camera.lens || 'standard cinematic lens'}. ` +
            `The lighting is ${shot.lighting.style.toLowerCase()}${shot.lighting.contrast ? ` with ${shot.lighting.contrast.toLowerCase()}` : ''}, ` +
            `creating a ${manifest.mood.toLowerCase()} atmosphere. ` +
            `The dominant colors are ${colorGrading}.`;
        prompt = appendStyleGuards(prompt, resolveStyleGuards(manifest));
        prompt = appendNegative(prompt, manifest, 'suffix');
        return prompt;
    }
}
