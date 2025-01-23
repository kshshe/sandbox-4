import type { TForceProcessor } from "./index"

export const airFriction: TForceProcessor = (point) => {
    point.speed.x *= 0.99
    point.speed.y *= 0.99
}