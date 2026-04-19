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
const shotstack_1 = require("./shotstack");
(0, node_test_1.describe)('ShotstackAdapter', () => {
    const adapter = new shotstack_1.ShotstackAdapter();
    (0, node_test_1.test)('has correct name', () => {
        assert.strictEqual(adapter.name, 'shotstack');
    });
    (0, node_test_1.test)('generates expected prompt', () => {
        const manifest = {
            title: 'Test',
            mood: 'dark',
            colorPalette: ['black'],
            aspectRatio: '16:9',
            shots: []
        };
        const shot = {
            id: '1',
            description: 'A test shot',
            subject: 'A person',
            environment: 'A room',
            camera: { movement: 'static', angle: 'eye-level' },
            lighting: { style: 'natural' },
            duration: '3.5s'
        };
        const prompt = adapter.generatePrompt(manifest, shot);
        const parsed = JSON.parse(prompt);
        assert.strictEqual(parsed.asset.type, 'video');
        assert.strictEqual(parsed.asset.description, 'A test shot');
        assert.strictEqual(parsed.asset.subject, 'A person');
        assert.strictEqual(parsed.asset.environment, 'A room');
        assert.strictEqual(parsed.length, 3.5);
        assert.strictEqual(parsed.transition.in, 'fade');
    });
});
