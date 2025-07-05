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

export type Position =
	| 'top-left'
	| 'center'
	| 'bottom-right'
	| {
			x: number;
			y: number;
	  };

	  export interface AddTextOptions {
		text: string;
		fontSize: number;
		color: string;
		position: 'top-left' | 'center' | 'bottom-right' | { x: number; y: number };
		opacity: number;
		backgroundShape?: 'circle' | 'rectangle' | 'square' | 'none';
		backgroundColor?: string;
		borderColor?: string;
		borderWidth?: number;
	}
	

export interface AddWatermarkOptions {
	content: string;
	position: Position;
	opacity: number;
}

export type ImageEditorOptions = CollageOptions | AddTextOptions | AddWatermarkOptions;
