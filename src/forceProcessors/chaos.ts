import { TForceProcessor } from ".";

export const chaos: TForceProcessor = (point) => {
    point.speed.x += (Math.random() * 2 - 1) * 0.007;
    point.speed.y += (Math.random() * 2 - 1) * 0.007;
}