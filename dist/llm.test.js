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
const llm_1 = require("./llm");
(0, node_test_1.describe)('LLMEngine', () => {
    (0, node_test_1.test)('generateSystemPrompt with full compactness', () => {
        const engine = new llm_1.LLMEngine({ promptCompactness: 'full' });
        const prompt = engine.generateSystemPrompt();
        assert.ok(prompt.includes('Here is the Scene Design System (SDS) you must follow:'));
        assert.ok(prompt.includes('Here is the Film Shot & Technique (FST) Cheat Sheet you must use'));
        assert.ok(prompt.includes('You must output valid JSON strictly adhering to the following JSON Schema:'));
    });
    (0, node_test_1.test)('generateSystemPrompt with compact compactness', () => {
        const engine = new llm_1.LLMEngine({ promptCompactness: 'compact' });
        const prompt = engine.generateSystemPrompt();
        assert.ok(prompt.includes('Here is the condensed Scene Design System (SDS) you must follow:'));
        assert.ok(prompt.includes('Here is the condensed Film Shot & Technique (FST) vocabulary you must use:'));
    });
    (0, node_test_1.test)('generateSystemPrompt with minimal compactness', () => {
        const engine = new llm_1.LLMEngine({ promptCompactness: 'minimal' });
        const prompt = engine.generateSystemPrompt();
        assert.ok(prompt.includes('Apply expert cinematic scene design principles'));
        assert.ok(prompt.includes('Use standard professional filmmaking terminology'));
        assert.ok(!prompt.includes('Here is the Scene Design System'));
    });
    (0, node_test_1.test)('analyzeScript returns mock manifest', async () => {
        const engine = new llm_1.LLMEngine({});
        const manifest = await engine.analyzeScript('A script about something', { aspectRatio: '16:9' });
        assert.strictEqual(manifest.title, 'Generated Production');
        assert.strictEqual(manifest.aspectRatio, '16:9');
        assert.strictEqual(manifest.shots.length, 2);
        assert.strictEqual(manifest.shots[0].id, 'shot-1');
    });
});
