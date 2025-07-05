import { IBinaryData } from 'n8n-workflow';

/**
 * Supported editor modes.
 */
export type EditorMode = 'collage' | 'addText' | 'addWatermark';

/**
 * Input to the image editor – either URLs or binary image data.
 */
export interface ImageEditorInput {
	urls: string[];             // Optional image URLs
	binary?: IBinaryData;       // Optional binary image input
}

/**
 * Coordinates or preset positions for overlay placement.
 */
export type Position =
	| 'top-left'
	| 'center'
	| 'bottom-right'
	| {
			x: number;
			y: number;
	  };

/**
 * Options for collage mode.
 */
export interface CollageOptions {
	rows: number;
	columns: number;
	spacing: number;
	backgroundColor: string;
}

/**
 * Options for add text mode.
 */
export interface AddTextOptions {
	text: string;
	fontSize: number;
	color: string;
	position: Position;
	opacity: number;
	backgroundShape?: 'circle' | 'rectangle' | 'square' | 'none' | null;
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
	shapeWidth?: number;
	shapeHeight?: number;
	shapePadding?: number;
}

/**
 * Options for watermark mode.
 */
export interface AddWatermarkOptions {
	content: string;
	position: Position;
	opacity: number;
	// Optional fields for future expansion (if needed)
	fontSize?: number;
	color?: string;
	backgroundShape?: 'circle' | 'rectangle' | 'square' | 'none' | null;
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
}

/**
 * Unified type for all supported image editor options.
 */
export type ImageEditorOptions = CollageOptions | AddTextOptions | AddWatermarkOptions;
