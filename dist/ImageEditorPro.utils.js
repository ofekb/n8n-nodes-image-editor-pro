"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadImages = downloadImages;
exports.createCollage = createCollage;
exports.addTextToImage = addTextToImage;
exports.addWatermark = addWatermark;
const sharp_1 = __importDefault(require("sharp"));
const axios_1 = __importDefault(require("axios"));
const canvas_1 = require("canvas");
async function downloadImages(urls) {
    const images = [];
    for (const url of urls) {
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        images.push(Buffer.from(response.data));
    }
    return images;
}
async function createCollage(images, options) {
    const { rows, columns, spacing = 0, backgroundColor = '#ffffff' } = options;
    const total = rows * columns;
    const resizedImages = await Promise.all(images.slice(0, total).map(img => (0, sharp_1.default)(img).resize(300, 300).toBuffer()));
    const composite = [];
    let index = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            if (index >= resizedImages.length)
                break;
            composite.push({
                input: resizedImages[index],
                top: row * (300 + spacing),
                left: col * (300 + spacing),
            });
            index++;
        }
    }
    const width = columns * 300 + spacing * (columns - 1);
    const height = rows * 300 + spacing * (rows - 1);
    return (0, sharp_1.default)({
        create: {
            width,
            height,
            channels: 4,
            background: backgroundColor,
        }
    }).composite(composite).png().toBuffer();
}
function getCanvasPosition(position, width, height, boxWidth, boxHeight) {
    if (typeof position === 'object' && position.x !== undefined && position.y !== undefined) {
        return position;
    }
    switch (position) {
        case 'top-left':
            return { x: 10, y: 10 };
        case 'center':
            return { x: (width - boxWidth) / 2, y: (height - boxHeight) / 2 };
        case 'bottom-right':
            return { x: width - boxWidth - 10, y: height - boxHeight - 10 };
        default:
            return { x: 0, y: 0 };
    }
}
async function addTextToImage(image, options) {
    const img = await (0, canvas_1.loadImage)(image);
    const canvas = (0, canvas_1.createCanvas)(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    ctx.font = `${options.fontSize}px sans-serif`;
    const text = options.text;
    const textWidth = ctx.measureText(text).width;
    const textHeight = options.fontSize;
    const padding = options.padding ?? 10;
    const shape = options.shape ?? 'rectangle';
    const bgColor = options.backgroundColor ?? 'rgba(0,0,0,0.5)';
    const boxWidth = textWidth + padding * 2;
    const boxHeight = textHeight + padding * 2;
    const pos = getCanvasPosition(options.position, img.width, img.height, boxWidth, boxHeight);
    if (options.backgroundColor) {
        ctx.save();
        ctx.globalAlpha = options.opacity;
        ctx.fillStyle = bgColor;
        if (shape === 'circle') {
            const radius = Math.max(boxWidth, boxHeight) / 2;
            ctx.beginPath();
            ctx.arc(pos.x + boxWidth / 2, pos.y + boxHeight / 2, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        else {
            ctx.fillRect(pos.x, pos.y, boxWidth, boxHeight);
        }
        ctx.restore();
    }
    ctx.globalAlpha = options.opacity;
    ctx.fillStyle = options.color;
    ctx.fillText(text, pos.x + padding, pos.y + padding + textHeight / 1.5);
    return canvas.toBuffer('image/png');
}
async function addWatermark(image, options) {
    const img = await (0, canvas_1.loadImage)(image);
    const canvas = (0, canvas_1.createCanvas)(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    ctx.globalAlpha = options.opacity;
    if (options.type === 'text') {
        ctx.font = `24px sans-serif`;
        ctx.fillStyle = 'white';
        const textWidth = ctx.measureText(options.content).width;
        const pos = getCanvasPosition(options.position, img.width, img.height, textWidth, 24);
        ctx.fillText(options.content, pos.x, pos.y + 24);
    }
    else if (options.type === 'image') {
        const watermark = await (0, canvas_1.loadImage)(options.content);
        const pos = getCanvasPosition(options.position, img.width, img.height, watermark.width, watermark.height);
        ctx.drawImage(watermark, pos.x, pos.y, watermark.width, watermark.height);
    }
    return canvas.toBuffer('image/png');
}
