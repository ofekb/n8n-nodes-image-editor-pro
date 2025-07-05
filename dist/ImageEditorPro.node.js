"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageEditorPro = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const ImageEditorPro_utils_1 = require("./ImageEditorPro.utils");
class ImageEditorPro {
    constructor() {
        this.description = {
            displayName: 'ImageEditorPro',
            name: 'imageEditorPro',
            group: ['transform'],
            version: 1,
            description: 'Advanced image editing: collage, text overlay, watermark',
            defaults: {
                name: 'ImageEditorPro',
            },
            inputs: ['main'],
            outputs: ['main'],
            codex: {
                categories: ['Image Processing'],
            },
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
                    placeholder: 'https://example.com/image1.png,https://example.com/image2.jpg',
                },
                // Collage options
                {
                    displayName: 'Rows',
                    name: 'rows',
                    type: 'number',
                    default: 2,
                    displayOptions: { show: { mode: ['collage'] } },
                },
                {
                    displayName: 'Columns',
                    name: 'columns',
                    type: 'number',
                    default: 2,
                    displayOptions: { show: { mode: ['collage'] } },
                },
                {
                    displayName: 'Spacing',
                    name: 'spacing',
                    type: 'number',
                    default: 10,
                    displayOptions: { show: { mode: ['collage'] } },
                },
                {
                    displayName: 'Background Color',
                    name: 'backgroundColor',
                    type: 'color',
                    default: '#ffffff',
                    displayOptions: { show: { mode: ['collage'] } },
                },
                // Add text options
                {
                    displayName: 'Text',
                    name: 'text',
                    type: 'string',
                    default: 'Sample',
                    displayOptions: { show: { mode: ['addText'] } },
                },
                {
                    displayName: 'Font Size',
                    name: 'fontSize',
                    type: 'number',
                    default: 48,
                    displayOptions: { show: { mode: ['addText'] } },
                },
                {
                    displayName: 'Text Color',
                    name: 'color',
                    type: 'color',
                    default: '#000000',
                    displayOptions: { show: { mode: ['addText'] } },
                },
                {
                    displayName: 'Position',
                    name: 'position',
                    type: 'options',
                    options: [
                        { name: 'Top Left', value: 'top-left' },
                        { name: 'Center', value: 'center' },
                        { name: 'Bottom Right', value: 'bottom-right' },
                        { name: 'Custom', value: 'custom' },
                    ],
                    default: 'center',
                    displayOptions: { show: { mode: ['addText', 'addWatermark'] } },
                },
                {
                    displayName: 'Custom X',
                    name: 'customX',
                    type: 'number',
                    default: 50,
                    displayOptions: { show: { position: ['custom'] } },
                },
                {
                    displayName: 'Custom Y',
                    name: 'customY',
                    type: 'number',
                    default: 50,
                    displayOptions: { show: { position: ['custom'] } },
                },
                {
                    displayName: 'Opacity',
                    name: 'opacity',
                    type: 'number',
                    default: 1,
                    typeOptions: {
                        minValue: 0,
                        maxValue: 1,
                    },
                    displayOptions: { show: { mode: ['addText', 'addWatermark'] } },
                },
                // Watermark
                {
                    displayName: 'Watermark Text',
                    name: 'watermarkText',
                    type: 'string',
                    default: '© n8n',
                    displayOptions: { show: { mode: ['addWatermark'] } },
                },
            ],
        };
    }
    async execute() {
        const mode = this.getNodeParameter('mode', 0);
        const imageUrlsStr = this.getNodeParameter('imageUrls', 0);
        const urls = imageUrlsStr
            .split(',')
            .map((u) => u.trim())
            .filter(Boolean);
        const binary = this.getInputData().find((item) => item.binary?.imageInput)?.binary?.imageInput;
        if (!urls.length && !binary) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Must provide either imageUrls or binary imageInput.');
        }
        const input = { urls, binary };
        let options;
        if (mode === 'collage') {
            options = {
                rows: this.getNodeParameter('rows', 0),
                columns: this.getNodeParameter('columns', 0),
                spacing: this.getNodeParameter('spacing', 0),
                backgroundColor: this.getNodeParameter('backgroundColor', 0),
            };
        }
        else if (mode === 'addText') {
            const positionParam = this.getNodeParameter('position', 0);
            const position = positionParam === 'custom'
                ? { x: this.getNodeParameter('customX', 0), y: this.getNodeParameter('customY', 0) }
                : positionParam;
            options = {
                text: this.getNodeParameter('text', 0),
                fontSize: this.getNodeParameter('fontSize', 0),
                color: this.getNodeParameter('color', 0),
                position,
                opacity: this.getNodeParameter('opacity', 0),
            };
        }
        else {
            const positionParam = this.getNodeParameter('position', 0);
            const position = positionParam === 'custom'
                ? { x: this.getNodeParameter('customX', 0), y: this.getNodeParameter('customY', 0) }
                : positionParam;
            options = {
                content: this.getNodeParameter('watermarkText', 0),
                position,
                opacity: this.getNodeParameter('opacity', 0),
            };
        }
        const buffer = await (0, ImageEditorPro_utils_1.imageEditor)({ mode, input, options });
        return [
            [
                {
                    json: {},
                    binary: {
                        data: await this.helpers.prepareBinaryData(buffer, 'output.png', 'image/png'),
                    },
                },
            ],
        ];
    }
}
exports.ImageEditorPro = ImageEditorPro;
