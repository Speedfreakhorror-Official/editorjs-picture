import type { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';
import { type ImageConfig, type ToolImage } from './image';
export type { ImageConfig, ToolImage } from './image';
export interface PictureData {
    image: ToolImage | null;
}
/** Fills defaults and drops unknown top-level keys (image extras are kept). */
export declare function normalize(data: unknown): PictureData;
/** True when there is a picture with a description. */
export declare const isValid: (d: PictureData) => boolean;
/** True when there is no picture (the only block `validate` refuses). */
export declare const isEmpty: (d: PictureData) => boolean;
export default class PictureTool implements BlockTool {
    private opts;
    private data;
    constructor(opts: BlockToolConstructorOptions<PictureData, ImageConfig>);
    static get toolbox(): {
        title: string;
        icon: string;
    };
    static get isReadOnlySupported(): boolean;
    render(): HTMLElement;
    save(): PictureData;
    validate(data: PictureData): boolean;
}
