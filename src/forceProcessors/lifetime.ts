import { TForceProcessor } from ".";
import { Points } from "../classes/points";

export const lifetime = (from: number, to: number): TForceProcessor => (point) => {
    if (!point.data) {
        point.data = { lifetime: 0 }
    }

    if (!point.data.lifetime) {
        point.data.lifetime = 0
    }

    point.data.lifetime++

    if (point.data.lifetime > from) {
        const rest = point.data.lifetime - from
        const probability = 1 - rest / (to - from)
        if (Math.random() < probability) {
            Points.deletePointOnNextTick(point)
        }
    }
}