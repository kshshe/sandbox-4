import { TForceProcessor } from ".";

export const chaos: TForceProcessor = (point) => {
    const speedLength = Math.sqrt(point.speed.x ** 2 + point.speed.y ** 2);
    if (speedLength < 0.001) {
        point.speed.x += (Math.random() * 2 - 1) * 0.02;
        point.speed.y += (Math.random() * 2 - 1) * 0.02;
    }
}