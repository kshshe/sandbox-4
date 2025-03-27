import type { TForceProcessor } from "./index"
import { POINTS_WEIGHTS } from "../config"
import { Speed } from "../classes/speed"

export const gravity: TForceProcessor = (point) => {
    const gravityState = Speed.rounded.down
    const weight = Math.min(3, POINTS_WEIGHTS[point.type])
    const x = gravityState.x * weight * 0.01
    const y = gravityState.y * weight * 0.01

    point.speed.x += x
    point.speed.y += y
}