import { TForceProcessor } from ".";
import { Points, TPoint } from "../classes/points";
import { random } from "../utils/random";
import { explode } from "./utils/explode";

export const bomb: TForceProcessor = (point) => {
    if (!point.data) {
        point.data = { lifetime: 0 }
    }

    if (!point.data.lifetime) {
        point.data.lifetime = 0
    }

    point.data.lifetime++

    if (
        (
            point.data.lifetime > 100 && random() < 0.1
        ) ||
        point.data.temperature > 900
    ) {
        explode(point, new Set([point]))
        Points.deletePoint(point)
    }
}