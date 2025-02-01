import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { EPointType } from "../types";
import { random } from "../utils/random";
import { emit } from "./utils/emit";
import { explode } from "./utils/explode";

export const dynamite: TForceProcessor = (point) => {
    if (point.data.temperature > 500) {
        if (point.data.explodeTimeout == null) {
            point.data.explodeTimeout = 200
        }
        point.data.explodeTimeout--
        point.data.temperature = 900
        if (random() < 0.1) {
            emit(point, EPointType.Fire)
        }
        if (point.data.explodeTimeout <= 0) {
            explode(point, new Set([point]))
            Points.deletePoint(point)
        }
    }
}