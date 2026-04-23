export declare const SPM_JSON_SCHEMA: {
    type: string;
    properties: {
        title: {
            type: string;
            description: string;
        };
        mood: {
            type: string;
            description: string;
        };
        colorPalette: {
            type: string;
            items: {
                type: string;
            };
            description: string;
        };
        aspectRatio: {
            type: string;
            enum: string[];
        };
        negativePrompt: {
            type: string;
            description: string;
        };
        styleGuards: {
            type: string;
            items: {
                type: string;
            };
            description: string;
        };
        characters: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    name: {
                        type: string;
                    };
                    faceDescription: {
                        type: string;
                        description: string;
                    };
                    bodyType: {
                        type: string;
                    };
                    hair: {
                        type: string;
                    };
                    wardrobe: {
                        type: string;
                        description: string;
                    };
                    distinguishingFeatures: {
                        type: string;
                    };
                };
                required: string[];
            };
            description: string;
        };
        environments: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    name: {
                        type: string;
                    };
                    spatialDescription: {
                        type: string;
                        description: string;
                    };
                    props: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    atmosphere: {
                        type: string;
                    };
                    timeOfDay: {
                        type: string;
                    };
                };
                required: string[];
            };
            description: string;
        };
        visualStyle: {
            type: string;
            properties: {
                contrastStyle: {
                    type: string;
                };
                grainLevel: {
                    type: string;
                };
                colorGradingNotes: {
                    type: string;
                };
                blackLevel: {
                    type: string;
                };
            };
            description: string;
        };
        tempo: {
            type: string;
            enum: string[];
            description: string;
        };
        shots: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    description: {
                        type: string;
                    };
                    subject: {
                        type: string;
                    };
                    environment: {
                        type: string;
                    };
                    camera: {
                        type: string;
                        properties: {
                            movement: {
                                type: string;
                            };
                            angle: {
                                type: string;
                            };
                            lens: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                    lighting: {
                        type: string;
                        properties: {
                            style: {
                                type: string;
                            };
                            colorTemp: {
                                type: string;
                            };
                            contrast: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                    duration: {
                        type: string;
                    };
                    narration: {
                        type: string;
                        description: string;
                    };
                    characterIds: {
                        type: string;
                        items: {
                            type: string;
                        };
                        description: string;
                    };
                    environmentId: {
                        type: string;
                        description: string;
                    };
                    transition: {
                        type: string;
                        properties: {
                            type: {
                                type: string;
                                description: string;
                            };
                            duration: {
                                type: string;
                                description: string;
                            };
                        };
                        description: string;
                    };
                };
                required: string[];
            };
        };
    };
    required: string[];
};
declare const SHOTSTACK_EFFECTS: string[];
declare const SHOTSTACK_FILTERS: string[];
declare const SHOTSTACK_TRANSITIONS: string[];
declare const SHOTSTACK_RESOLUTIONS: string[];
export { SHOTSTACK_EFFECTS, SHOTSTACK_FILTERS, SHOTSTACK_TRANSITIONS, SHOTSTACK_RESOLUTIONS };
export declare const SHOTSTACK_JSON_SCHEMA: {
    type: string;
    properties: {
        timeline: {
            type: string;
            properties: {
                tracks: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            clips: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        asset: {
                                            type: string;
                                            properties: {
                                                type: {
                                                    type: string;
                                                    enum: string[];
                                                };
                                                src: {
                                                    type: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                        start: {
                                            type: string;
                                        };
                                        length: {
                                            type: string;
                                        };
                                        effect: {
                                            type: string;
                                            enum: string[];
                                        };
                                        filter: {
                                            type: string;
                                            enum: string[];
                                        };
                                        transition: {
                                            type: string;
                                            properties: {
                                                in: {
                                                    type: string;
                                                    enum: string[];
                                                };
                                                out: {
                                                    type: string;
                                                    enum: string[];
                                                };
                                            };
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        output: {
            type: string;
            properties: {
                format: {
                    type: string;
                    enum: string[];
                };
                resolution: {
                    type: string;
                    enum: string[];
                };
            };
            required: string[];
        };
    };
    required: string[];
};
