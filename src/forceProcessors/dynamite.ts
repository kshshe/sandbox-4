import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { explode } from "./utils/explode";

export const dynamite: TForceProcessor = (point) => {
    if (point.data.temperature > 500) {
        if (point.data.explodeTimeout == null) {
            point.data.explodeTimeout = 200
        }
        point.data.explodeTimeout--
        point.data.temperature = 900
        if (point.data.explodeTimeout <= 0) {
            explode(point, new Set([point]))
            Points.deletePoint(point)
        }
    }
}