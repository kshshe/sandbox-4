import type { TForceProcessor } from "./index"

export const airFriction: TForceProcessor = (point) => {
    point.speed.x *= 0.9
    point.speed.y *= 0.9
}