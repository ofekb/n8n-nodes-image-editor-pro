import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
    NodeConnectionType
} from 'n8n-workflow';
import { imageEditor } from './ImageEditorPro.utils';
import {
	AddTextOptions,
	AddWatermarkOptions,
	CollageOptions,
	EditorMode,
	ImageEditorInput,
	ImageEditorOptions,
} from './ImageEditorPro.types';

export class ImageEditorPro implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ImageEditorPro',
		name: 'imageEditorPro',
		group: ['transform'],
		version: 1,
		description: 'Advanced image editing: collage, text overlay, watermark',
		defaults: {
			name: 'ImageEditorPro',
		},
        inputs: ['main' as NodeConnectionType],
		outputs: ['main' as NodeConnectionType],       
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const mode = this.getNodeParameter('mode', 0) as EditorMode;
		const imageUrlsStr = this.getNodeParameter('imageUrls', 0) as string;
		const urls = imageUrlsStr
			.split(',')
			.map((u) => u.trim())
			.filter(Boolean);

		const binary = this.getInputData().find((item) => item.binary?.imageInput)?.binary?.imageInput;

		if (!urls.length && !binary) {
			throw new NodeOperationError(this.getNode(), 'Must provide either imageUrls or binary imageInput.');
		}

		const input: ImageEditorInput = { urls, binary };

		let options: ImageEditorOptions;
		if (mode === 'collage') {
			options = {
				rows: this.getNodeParameter('rows', 0) as number,
				columns: this.getNodeParameter('columns', 0) as number,
				spacing: this.getNodeParameter('spacing', 0) as number,
				backgroundColor: this.getNodeParameter('backgroundColor', 0) as string,
			};
		} else if (mode === 'addText') {
			const positionParam = this.getNodeParameter('position', 0) as string;
			const position =
				positionParam === 'custom'
					? { x: this.getNodeParameter('customX', 0) as number, y: this.getNodeParameter('customY', 0) as number }
					: (positionParam as AddTextOptions['position']);

			options = {
				text: this.getNodeParameter('text', 0) as string,
				fontSize: this.getNodeParameter('fontSize', 0) as number,
				color: this.getNodeParameter('color', 0) as string,
				position,
				opacity: this.getNodeParameter('opacity', 0) as number,
			};
		} else {
			const positionParam = this.getNodeParameter('position', 0) as string;
			const position =
				positionParam === 'custom'
					? { x: this.getNodeParameter('customX', 0) as number, y: this.getNodeParameter('customY', 0) as number }
					: (positionParam as AddWatermarkOptions['position']);
			options = {
				content: this.getNodeParameter('watermarkText', 0) as string,
				position,
				opacity: this.getNodeParameter('opacity', 0) as number,
			};
		}

		const buffer = await imageEditor({ mode, input, options });

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
