import { TForceProcessor } from "..";
import { random } from "../../utils/random";

export const randomProcessor = (chance: number, processor: TForceProcessor): TForceProcessor => (point, step) => {
    if (random() < chance) {
        processor(point, step)
    }
}
