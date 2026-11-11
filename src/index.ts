// editorjs-picture: a picture block for Editor.js with required alt text.
import type { API, BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';
import { el, imageField, normalizeImage, type ImageConfig, type ToolImage } from './image';

export type { ImageConfig, ToolImage } from './image';
export interface PictureData { image: ToolImage | null }

/** Fills defaults and drops unknown top-level keys (image extras are kept). */
export function normalize(data: unknown): PictureData {
  const o = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  return { image: normalizeImage(o.image) };
}

/** True when there is a picture with a description. */
export const isValid = (d: PictureData) => !!d.image && d.image.alt.trim() !== '';
/** True when there is no picture (the only block `validate` refuses). */
export const isEmpty = (d: PictureData) => !d.image;

export default class PictureTool implements BlockTool {
  private data: PictureData;
  constructor(private opts: BlockToolConstructorOptions<PictureData, ImageConfig>) {
    this.data = normalize(opts.data);
  }
  static get toolbox() {
    return { title: 'Picture', icon: '<svg width="17" height="15" viewBox="0 0 17 15"><rect x="1" y="1" width="15" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/><path d="M2 12l4-4 3 3 2-2 4 4z" fill="currentColor"/></svg>' };
  }
  static get isReadOnlySupported() { return true; }
  render(): HTMLElement {
    const root = el('div', 'ejs-picture');
    // typing in an input changes no DOM node, so Editor.js is told
    root.addEventListener('input', () => this.opts.block.dispatchChange());
    root.append(imageField({ value: this.data.image, config: this.opts.config ?? {}, api: this.opts.api as API, onChange: (v) => { this.data = { image: v }; } }));
    return root;
  }
  save(): PictureData { return this.data; }
  // Editor.js drops a block that fails validate from the save: only an empty one, so a half-made one reaches the host
  validate(data: PictureData) { return !isEmpty(normalize(data)); }
}
