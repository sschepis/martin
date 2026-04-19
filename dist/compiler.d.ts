export interface SceneClip {
    videoUrlOrPath: string;
    audioUrlOrPath?: string;
    duration?: number;
}
export declare class LocalSceneCompiler {
    private downloadFile;
    compile(clips: SceneClip[], outputPath: string, options?: {
        width?: number;
        height?: number;
    }): Promise<string>;
}
