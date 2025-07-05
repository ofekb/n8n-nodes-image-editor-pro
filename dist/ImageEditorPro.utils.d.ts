import { CollageOptions, AddTextOptions, AddWatermarkOptions } from './ImageEditorPro.types';
export declare function downloadImages(urls: string[]): Promise<Buffer[]>;
export declare function createCollage(images: Buffer[], options: CollageOptions): Promise<Buffer>;
export declare function addTextToImage(image: Buffer, options: AddTextOptions): Promise<Buffer>;
export declare function addWatermark(image: Buffer, options: AddWatermarkOptions): Promise<Buffer>;
