export type EditorMode = 'collage' | 'addText' | 'addWatermark';

export interface ImageEditorInput {
	urls?: string[];
	binary?: {
		data: string;
	};
}

export interface CollageOptions {
	rows: number;
	columns: number;
	spacing: number;
	backgroundColor: string;
}

export interface AddTextOptions {
	text: string;
	fontSize: number;
	color: string;
	position: 'top-left' | 'center' | 'bottom-right' | { x: number; y: number };
	opacity?: number;
}

export interface AddWatermarkOptions {
	content: string;
	position: AddTextOptions['position'];
	opacity?: number;
}

export type ImageEditorOptions = CollageOptions | AddTextOptions | AddWatermarkOptions;
