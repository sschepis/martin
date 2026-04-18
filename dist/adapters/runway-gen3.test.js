"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = __importStar(require("node:assert"));
const runway_gen3_1 = require("./runway-gen3");
(0, node_test_1.describe)('RunwayGen3Adapter', () => {
    const adapter = new runway_gen3_1.RunwayGen3Adapter();
    (0, node_test_1.test)('has correct name', () => {
        assert.strictEqual(adapter.name, 'runway-gen3');
    });
    (0, node_test_1.test)('generates expected prompt', () => {
        const manifest = {
            title: 'Test',
            mood: 'dark',
            colorPalette: ['red', 'black'],
            aspectRatio: '16:9',
            shots: []
        };
        const shot = {
            id: '1',
            description: 'A dark alley',
            subject: 'A lonely robot',
            environment: 'Neo-Tokyo',
            camera: { movement: 'pan right', angle: 'low', lens: '50mm' },
            lighting: { style: 'neon', colorTemp: 'cool', contrast: 'high' }
        };
        const prompt = adapter.generatePrompt(manifest, shot);
        assert.ok(prompt.includes('[Cinematic Video]'));
        assert.ok(prompt.includes('A dark alley'));
        assert.ok(prompt.includes('Subject: A lonely robot'));
        assert.ok(prompt.includes('Environment: Neo-Tokyo'));
        assert.ok(prompt.includes('Camera: pan right, low, 50mm'));
        assert.ok(prompt.includes('Lighting: neon, cool, high'));
        assert.ok(prompt.includes('Mood: dark'));
        assert.ok(prompt.includes('Color Palette: red, black'));
        assert.ok(prompt.includes('--ar 169'));
        // Check joiner
        assert.strictEqual(prompt, '[Cinematic Video] | A dark alley | Subject: A lonely robot | Environment: Neo-Tokyo | Camera: pan right, low, 50mm | Lighting: neon, cool, high | Mood: dark | Color Palette: red, black | --ar 169');
    });
    (0, node_test_1.test)('handles missing optional fields gracefully', () => {
        const manifest = {
            title: 'Test',
            mood: 'bright',
            colorPalette: ['yellow'],
            aspectRatio: '1:1',
            shots: []
        };
        const shot = {
            id: '1',
            description: 'A bright room',
            camera: { movement: 'static', angle: 'eye-level' },
            lighting: { style: 'natural' }
        };
        const prompt = adapter.generatePrompt(manifest, shot);
        assert.ok(prompt.includes('Subject: Not specified'));
        assert.ok(prompt.includes('Environment: Not specified'));
        assert.ok(prompt.includes('Camera: static, eye-level, standard lens'));
        // lighting colorTemp and contrast empty will result in ', ' which is handled in the implementation (e.g. `natural, , `).
        // Let's check exact lighting string output based on implementation:
        // `Lighting: ${shot.lighting.style}, ${shot.lighting.colorTemp || ''}, ${shot.lighting.contrast || ''}`
        assert.ok(prompt.includes('Lighting: natural, , '));
    });
});
