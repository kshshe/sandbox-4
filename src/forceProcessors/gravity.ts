import type { TForceProcessor } from "./index"

export const gravity: TForceProcessor = (point) => {
    point.speed.y += 0.01
}