import { Binary } from '@fwk/shared/bx-binary';
import { Bitmap3Palette } from '@fwk/types/bitmap/Bitmap3Palette';
import { defaultVertex } from 'pixi.js';

export class PaletteFilter extends PIXI.Filter {
    // language=GLSL
    private static readonly sFragShader = `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;

        uniform sampler2D palette;
        //        uniform float _mix;
        //        uniform float _size;
        //        uniform float _sliceSize;
        //        uniform float _slicePixelSize;
        //        uniform float _sliceInnerSize;
        void main() {
            float index = texture2D(uSampler, vTextureCoord).r;
            vec4 color = texture2D(palette, vec2(index, 0));

            //            vec4 adjusted;
            //            if (color.a > 0.0) {
            //                color.rgb /= color.a;
            //                float innerWidth = _size - 1.0;
            //                float zSlice0 = min(floor(color.b * innerWidth), innerWidth);
            //                float zSlice1 = min(zSlice0 + 1.0, innerWidth);
            //                float xOffset = _slicePixelSize * 0.5 + color.r * _sliceInnerSize;
            //                float s0 = xOffset + (zSlice0 * _sliceSize);
            //                float s1 = xOffset + (zSlice1 * _sliceSize);
            //                float yOffset = _sliceSize * 0.5 + color.g * (1.0 - _sliceSize);
            //                vec4 slice0Color = texture2D(colorMap, vec2(s0, yOffset));
            //                vec4 slice1Color = texture2D(colorMap, vec2(s1, yOffset));
            //                float zOffset = fract(color.b * innerWidth);
            //                adjusted = mix(slice0Color, slice1Color, zOffset);
            //
            //                color.rgb *= color.a;
            //            }

            //gl_FragColor = vec4(mix(color, adjusted, _mix).rgb, color.a);
            //if (color.a > 0.0) {
            gl_FragColor = vec4(color.r, color.g, color.b, 255);
            //} else {
            //    gl_FragColor = color;
            //}
        }
    `;
    
    private _palette: Bitmap3Palette;
    
    public constructor(palette, fallbackPalette) {
        super(defaultVertex, PaletteFilter.sFragShader);
        
        this.uniforms.palette = PIXI.Texture.fromBuffer(new Binary(256 * 4).getUint8Array(), 256, 1);
    }
    
    public apply(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, output: PIXI.RenderTexture, clearMode: PIXI.CLEAR_MODES, currentState?: any): void {
        super.apply(filterManager, input, output, clearMode, currentState);
    }
    
    public setx(palette: Binary) {
        const tx = PIXI.Texture.fromBuffer(palette.getUint8Array(), 256, 1);
        
        tx.baseTexture.scaleMode = null;
        tx.baseTexture.mipmap = PIXI.MIPMAP_MODES.OFF;
        
        this.uniforms.palette = tx;
    }
}