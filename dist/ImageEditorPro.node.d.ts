import { IExecuteSingleFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class ImageEditorPro implements INodeType {
    description: INodeTypeDescription;
    execute(this: IExecuteSingleFunctions): Promise<INodeExecutionData[][]>;
}
