import { NewTexture } from '@fwk/texture/NewTexture';
import { NewTextureResource } from '@fwk/texture/NewTextureResource';
import { PkRectangle } from '@fwk/types/PkRectangle';
import * as PIXI from 'pixi.js';

export class NewTextureView<T extends NewTextureResource> {
    private readonly _base: NewTexture<T>;
    private readonly _frame: PkRectangle;
    private readonly _pixi: PIXI.Texture;
}