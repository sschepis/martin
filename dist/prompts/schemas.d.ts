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
                };
                required: string[];
            };
        };
    };
    required: string[];
};
