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

	if (input.binary) {
		images.push(Buffer.from(input.binary.data, 'base64'));
	}

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

			const img = await loadImage(
				await sharp(images[index]).resize(thumbWidth, thumbHeight).png().toBuffer()
			);
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


	const padding = opts.shapePadding ?? 20;
    const shapeWidth = opts.shapeWidth ?? ctx.measureText(opts.text).width + padding;
    const shapeHeight = opts.shapeHeight ?? opts.fontSize + padding;
    const radius = Math.max(shapeWidth, shapeHeight) / 2;    
	const bgColor = opts.backgroundColor || 'rgba(255,255,255,0.5)';
	const borderWidth = opts.borderWidth ?? 0;
	const borderColor = opts.borderColor || 'transparent';

    let textX = x;
    let textY = y;

    switch (opts.textAlignInShape) {
        case 'top':
            textY = y - shapeHeight / 2 + opts.fontSize;
            break;
        case 'bottom':
            textY = y + shapeHeight / 2 - opts.fontSize / 2;
            break;
        case 'center':
            textY = y;
            ctx.textBaseline = 'middle';
            break;
        case 'custom':
            textX += opts.textOffsetX ?? 0;
            textY += opts.textOffsetY ?? 0;
            break;
    }

	if (opts.backgroundShape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y - opts.fontSize / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = bgColor;
        ctx.fill();
        if (borderWidth > 0) {
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.stroke();
        }        
	} else if (opts.backgroundShape === 'square') {
        const boxX = x - shapeWidth / 2;
        const boxY = y - shapeHeight / 2;
        ctx.fillRect(boxX, boxY, shapeWidth, shapeHeight);

        
        ctx.fillStyle = bgColor;
        ctx.fillRect(boxX, boxY, shapeWidth, shapeHeight);
        if (borderWidth > 0) {
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.strokeRect(boxX, boxY, shapeWidth, shapeHeight);
        }        
	} else if (opts.backgroundShape === 'rectangle') {
        const boxX = x - shapeWidth / 2;
        const boxY = y - shapeHeight / 2;
        ctx.fillRect(boxX, boxY, shapeWidth, shapeHeight);

    
        ctx.fillStyle = bgColor;
        ctx.fillRect(boxX, boxY, shapeWidth, shapeHeight);
        if (borderWidth > 0) {
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.strokeRect(boxX, boxY, shapeWidth, shapeHeight);
        }
    }
    
	ctx.fillStyle = opts.color;
	ctx.globalAlpha = opts.opacity ?? 1;
	ctx.fillText(opts.text, textX, textY);

	return canvas.toBuffer('image/png');
}

async function addWatermark(image: Buffer, opts: AddWatermarkOptions): Promise<Buffer> {
	return addText(image, {
		text: opts.content,
		color: '#000000',
		fontSize: 32,
		position: opts.position,
		opacity: opts.opacity,
	});
}
