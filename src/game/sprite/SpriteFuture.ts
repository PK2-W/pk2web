import { CBYTE, int } from '../../support/types';

export interface SpriteFuture {
    /** X coordinate. */
    x: number;
    /** Y coordinate. */
    y: number;
    /** Horizontal speed. */
    a: number;
    /** Vertical speed. */
    b: number;
    
    /** X coordinate of the teft side of the collision box. */
    left: number;
    /** X coordinate of the right side of the collision box. */
    right: number;
    /** Y coordinate of the top side of the collision box. */
    top: number;
    /** Y coordinate of the bottom side of the collision box. */
    bottom: number;
    
    /** Sprite width. */
    width: int;
    /** Sprite height. */
    height: int;
    
    /** It indicates that sprite can go to the right without colliding with another sprite. */
    canGoRight: boolean;
    /** It indicates that sprite can go to the left without colliding with another sprite. */
    canGoLeft: boolean;
    /** It indicates that sprite can go up without colliding with another sprite. */
    canGoUp: boolean;
    /** It indicates that sprite can go down without colliding with another sprite. */
    canGoDown: boolean;
    
    inWater: boolean;
    
    maxSpeed: CBYTE;
}
