import { TForceProcessor } from ".";

export const staticForce: TForceProcessor = (point) => {
    point.speed = { x: 0, y: 0 }
}