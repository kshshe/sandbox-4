import type { TForceProcessor } from "./index"
import { POINTS_WEIGHTS } from "../config"
import { Speed } from "../classes/speed"

export const gravity: TForceProcessor = (point) => {
    const gravityState = Speed.rounded.down
    const x = gravityState.x * POINTS_WEIGHTS[point.type] * 0.01
    const y = gravityState.y * POINTS_WEIGHTS[point.type] * 0.01

    point.speed.x += x
    point.speed.y += y
}