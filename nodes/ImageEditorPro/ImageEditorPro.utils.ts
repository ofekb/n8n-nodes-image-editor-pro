import axios from 'axios';
import sharp from 'sharp';
import {
	AddTextOptions,
	AddWatermarkOptions,
	CollageOptions,
	EditorMode,
	ImageEditorInput,
	ImageEditorOptions,
} from './ImageEditorPro.types';
import { createCanvas, loadImage } from '@napi-rs/canvas';

export async function imageEditor({
	mode,
	input,
	options,
}: {
	mode: EditorMode;
	input: ImageEditorInput;
	options: ImageEditorOptions;
}): Promise<Buffer> {
	const images: Buffer[] = [];

	// Handle image input from binary
	if (input.binary) {
		images.push(Buffer.from(input.binary.data, 'base64'));
	}

	// Handle image input from URLs
	for (const url of input.urls ?? []) {
		const res = await axios.get(url, { responseType: 'arraybuffer' });
		images.push(Buffer.from(res.data));
	}

	if (!images.length) throw new Error('No valid images provided');

	switch (mode) {
		case 'collage':
			return createCollage(images, options as CollageOptions);
		case 'addText':
			return addText(images[0], options as AddTextOptions);
		case 'addWatermark':
			return addWatermark(images[0], options as AddWatermarkOptions);
		default:
			throw new Error('Invalid mode');
	}
}

async function createCollage(images: Buffer[], opts: CollageOptions): Promise<Buffer> {
	const { rows, columns, spacing, backgroundColor } = opts;
	const thumbWidth = 300;
	const thumbHeight = 300;

	const canvasWidth = columns * thumbWidth + spacing * (columns - 1);
	const canvasHeight = rows * thumbHeight + spacing * (rows - 1);

	const canvas = createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	let index = 0;
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < columns; col++) {
			if (index >= images.length) break;

			const img = await loadImage(await sharp(images[index])
				.resize(thumbWidth, thumbHeight)
				.png()
				.toBuffer());

			ctx.drawImage(img, col * (thumbWidth + spacing), row * (thumbHeight + spacing));
			index++;
		}
	}

	return canvas.toBuffer('image/png');
}

async function addText(image: Buffer, opts: AddTextOptions): Promise<Buffer> {
	const img = await sharp(image).ensureAlpha().png().toBuffer();
	const loadedImg = await loadImage(img);
	const { width, height } = loadedImg;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	ctx.drawImage(loadedImg, 0, 0);

	ctx.globalAlpha = opts.opacity ?? 1;
	ctx.fillStyle = opts.color;
	ctx.font = `${opts.fontSize}px sans-serif`;

	let x = 0;
	let y = 0;

	if (typeof opts.position === 'string') {
		switch (opts.position) {
			case 'top-left':
				x = 20;
				y = opts.fontSize + 20;
				break;
			case 'center':
				x = width / 2;
				y = height / 2;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				break;
			case 'bottom-right':
				x = width - 20;
				y = height - 20;
				ctx.textAlign = 'right';
				ctx.textBaseline = 'bottom';
				break;
		}
	} else {
		x = opts.position.x;
		y = opts.position.y;
	}

	// Draw background circle
	const padding = 20;
	const radius = opts.fontSize + padding;
	ctx.beginPath();
	ctx.arc(x, y - opts.fontSize / 2, radius, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(255,255,255,0.5)';
	ctx.fill();

	// Draw text
	ctx.fillStyle = opts.color;
	ctx.globalAlpha = opts.opacity ?? 1;
	ctx.fillText(opts.text, x, y);

	return canvas.toBuffer('image/png');
}

async function addWatermark(image: Buffer, opts: AddWatermarkOptions): Promise<Buffer> {
	// For now, only text watermark
	return addText(image, {
		text: opts.content,
		color: '#000000',
		fontSize: 32,
		position: opts.position,
		opacity: opts.opacity,
	});
}
