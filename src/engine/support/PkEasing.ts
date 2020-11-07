/**
 * @see https://easings.net/.
 */
export const PkEasing = {
    linear: (x: number): number => {
        return x;
    },
    inCubic: function(x: number): number {
        return x * x * x;
    },
    outCubic: function(x: number): number {
        return Math.sqrt(1 - Math.pow(x - 1, 2));
    },
    outQuart: function(x: number): number {
        return 1 - Math.pow(1 - x, 4);
        
    }
};

export type TEasingFunction
    = (x: number) => number