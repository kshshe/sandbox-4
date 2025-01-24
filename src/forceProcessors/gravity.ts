import type { TForceProcessor } from "./index"
import { POINTS_WEIGHTS } from "../config"
import { Controls } from "../classes/controls"

export const gravity: TForceProcessor = (point) => {
    const gravityState = Controls.getGravityDirection()
    const x = gravityState.x * POINTS_WEIGHTS[point.type] * 0.01
    const y = gravityState.y * POINTS_WEIGHTS[point.type] * 0.01

    point.speed.x += x
    point.speed.y += y
}