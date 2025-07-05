"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageEditorPro = void 0;
const ImageEditorPro_utils_1 = require("./ImageEditorPro.utils");
class ImageEditorPro {
    constructor() {
        this.description = {
            displayName: 'ImageEditorPro',
            name: 'imageEditorPro',
            group: ['transform'],
            version: 1,
            description: 'Advanced image processing node using Sharp and Canvas',
            defaults: {
                name: 'ImageEditorPro',
            },
            inputs: ['main'],
            outputs: ['main'],
            icon: 'fa:image',
            category: 'Image Processing',
            properties: [
                {
                    displayName: 'Mode',
                    name: 'mode',
                    type: 'options',
                    options: [
                        { name: 'Collage', value: 'collage' },
                        { name: 'Add Text', value: 'addText' },
                        { name: 'Add Watermark', value: 'addWatermark' },
                    ],
                    default: 'collage',
                },
                {
                    displayName: 'Image URLs',
                    name: 'imageUrls',
                    type: 'string',
                    default: '',
                    placeholder: 'Comma-separated URLs',
                },
                // Collage options
                {
                    displayName: 'Rows',
                    name: 'rows',
                    type: 'number',
                    default: 2,
                    displayOptions: {
                        show: {
                            mode: ['collage'],
                        },
                    },
                },
                {
                    displayName: 'Columns',
                    name: 'columns',
                    type: 'number',
                    default: 2,
                    displayOptions: {
                        show: {
                            mode: ['collage'],
                        },
                    },
                },
                {
                    displayName: 'Spacing',
                    name: 'spacing',
                    type: 'number',
                    default: 0,
                    displayOptions: {
                        show: {
                            mode: ['collage'],
                        },
                    },
                },
                {
                    displayName: 'Background Color',
                    name: 'backgroundColor',
                    type: 'string',
                    default: '#ffffff',
                    displayOptions: {
                        show: {
                            mode: ['collage'],
                        },
                    },
                },
                // Add Text
                {
                    displayName: 'Text',
                    name: 'text',
                    type: 'string',
                    default: '',
                    displayOptions: {
                        show: {
                            mode: ['addText'],
                        },
                    },
                },
                {
                    displayName: 'Font Size',
                    name: 'fontSize',
                    type: 'number',
                    default: 32,
                    displayOptions: {
                        show: {
                            mode: ['addText'],
                        },
                    },
                },
                {
                    displayName: 'Text Color',
                    name: 'color',
                    type: 'string',
                    default: '#ffffff',
                    displayOptions: {
                        show: {
                            mode: ['addText'],
                        },
                    },
                },
                {
                    displayName: 'Text Opacity',
                    name: 'opacity',
                    type: 'number',
                    default: 1,
                    displayOptions: {
                        show: {
                            mode: ['addText', 'addWatermark'],
                        },
                    },
                },
                {
                    displayName: 'Text Position',
                    name: 'position',
                    type: 'options',
                    options: [
                        { name: 'Top Left', value: 'top-left' },
                        { name: 'Center', value: 'center' },
                        { name: 'Bottom Right', value: 'bottom-right' }
                    ],
                    default: 'top-left',
                    displayOptions: {
                        show: {
                            mode: ['addText', 'addWatermark'],
                        },
                    },
                },
                {
                    displayName: 'Background Color',
                    name: 'backgroundColor',
                    type: 'string',
                    default: '#000000',
                    displayOptions: {
                        show: {
                            mode: ['addText'],
                        },
                    },
                },
                {
                    displayName: 'Shape',
                    name: 'shape',
                    type: 'options',
                    options: [
                        { name: 'Rectangle', value: 'rectangle' },
                        { name: 'Circle', value: 'circle' },
                    ],
                    default: 'circle',
                    displayOptions: {
                        show: {
                            mode: ['addText'],
                        },
                    },
                },
                {
                    displayName: 'Padding',
                    name: 'padding',
                    type: 'number',
                    default: 10,
                    displayOptions: {
                        show: {
                            mode: ['addText'],
                        },
                    },
                },
                // Watermark
                {
                    displayName: 'Watermark Type',
                    name: 'watermarkType',
                    type: 'options',
                    options: [
                        { name: 'Text', value: 'text' },
                        { name: 'Image', value: 'image' },
                    ],
                    default: 'text',
                    displayOptions: {
                        show: {
                            mode: ['addWatermark'],
                        },
                    },
                },
                {
                    displayName: 'Content',
                    name: 'content',
                    type: 'string',
                    default: '',
                    displayOptions: {
                        show: {
                            mode: ['addWatermark'],
                        },
                    },
                },
            ],
        };
    }
    async execute() {
        const mode = this.getNodeParameter('mode', 0);
        const imageUrlsRaw = this.getNodeParameter('imageUrls', 0, '');
        const imageUrls = imageUrlsRaw.split(',').map(url => url.trim()).filter(Boolean);
        const inputBinary = this.getInputData().map(item => item.binary?.imageInput?.data).filter(Boolean);
        const inputImages = await Promise.all(inputBinary.map(data => this.helpers.binaryToBuffer({ data: data })));
        let urlsBuffers = [];
        if (imageUrls.length > 0) {
            urlsBuffers = await (0, ImageEditorPro_utils_1.downloadImages)(imageUrls);
        }
        const allImages = [...inputImages, ...urlsBuffers];
        if (allImages.length === 0) {
            throw new Error('No image input provided (binary or URLs).');
        }
        let output;
        if (mode === 'collage') {
            const options = {
                rows: this.getNodeParameter('rows', 0, 2),
                columns: this.getNodeParameter('columns', 0, 2),
                spacing: this.getNodeParameter('spacing', 0, 0),
                backgroundColor: this.getNodeParameter('backgroundColor', 0, '#ffffff'),
            };
            output = await (0, ImageEditorPro_utils_1.createCollage)(allImages, options);
        }
        else if (mode === 'addText') {
            const image = allImages[0];
            const options = {
                text: this.getNodeParameter('text', 0),
                fontSize: this.getNodeParameter('fontSize', 0),
                color: this.getNodeParameter('color', 0),
                position: this.getNodeParameter('position', 0),
                opacity: this.getNodeParameter('opacity', 0),
                backgroundColor: this.getNodeParameter('backgroundColor', 0),
                shape: this.getNodeParameter('shape', 0),
                padding: this.getNodeParameter('padding', 0),
            };
            output = await (0, ImageEditorPro_utils_1.addTextToImage)(image, options);
        }
        else if (mode === 'addWatermark') {
            const image = allImages[0];
            const options = {
                type: this.getNodeParameter('watermarkType', 0),
                content: this.getNodeParameter('content', 0),
                position: this.getNodeParameter('position', 0),
                opacity: this.getNodeParameter('opacity', 0),
            };
            output = await (0, ImageEditorPro_utils_1.addWatermark)(image, options);
        }
        else {
            throw new Error(`Unsupported mode: ${mode}`);
        }
        return [
            [
                {
                    json: {},
                    binary: {
                        data: await this.helpers.prepareBinaryData(output, 'image.png', 'image/png'),
                    },
                },
            ],
        ];
    }
}
exports.ImageEditorPro = ImageEditorPro;
