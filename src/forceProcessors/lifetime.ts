import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { Storage } from "../classes/storage";
import { random } from "../utils/random";

export const lifetime = (from: number, to: number): TForceProcessor => (point) => {
    if (!point.data) {
        point.data = { lifetime: 0 }
    }

    if (!point.data.lifetime) {
        point.data.lifetime = 0
    }

    point.data.lifetime++
    point.lastMoveOnIteration = Storage.get('iteration', 0)

    if (point.data.lifetime > from) {
        const rest = point.data.lifetime - from
        const length = to - from
        const probability = rest / length
        if (point.data.lifetime > to) {
            Points.deletePoint(point)
            return;
        }
        if (random() < probability) {
            Points.deletePoint(point)
        }
    }
}