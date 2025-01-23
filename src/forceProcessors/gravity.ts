import type { TForceProcessor } from "./index"
import { POINTS_WEIGHTS } from "../config"

export const gravity: TForceProcessor = (point) => {
    point.speed.y += 0.01 * POINTS_WEIGHTS[point.type]
}