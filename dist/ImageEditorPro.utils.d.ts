import { EditorMode, ImageEditorInput, ImageEditorOptions } from './ImageEditorPro.types';
export declare function imageEditor({ mode, input, options, }: {
    mode: EditorMode;
    input: ImageEditorInput;
    options: ImageEditorOptions;
}): Promise<Buffer>;
