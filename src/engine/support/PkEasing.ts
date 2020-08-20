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
    }
};

export type TEasingFunction
    = (x: number) => number