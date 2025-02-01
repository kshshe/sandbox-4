import { TForceProcessor } from ".";
import { EPointType } from "../types";
import { random } from "../utils/random";
import { emit } from "./utils/emit";

export const emitter = (pointType: EPointType, intencity = 1): TForceProcessor => (point) => {
    if (random() < 0.9) {
        return
    }
    if (random() > intencity) {
        return
    }
    emit(point, pointType)
}