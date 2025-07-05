export type Mode = 'collage' | 'addText' | 'addWatermark';
export interface CollageOptions {
    rows: number;
    columns: number;
    spacing?: number;
    backgroundColor?: string;
}
export interface AddTextOptions {
    text: string;
    fontSize: number;
    color: string;
    position: 'top-left' | 'center' | 'bottom-right' | {
        x: number;
        y: number;
    };
    opacity: number;
    backgroundColor?: string;
    shape?: 'rectangle' | 'circle';
    padding?: number;
}
export interface AddWatermarkOptions {
    type: 'text' | 'image';
    content: string;
    position: 'top-left' | 'center' | 'bottom-right' | {
        x: number;
        y: number;
    };
    opacity: number;
}
