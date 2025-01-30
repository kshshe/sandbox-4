import { TForceProcessor } from ".";
import { random } from "../utils/random";

export const chaos = (power: number = 1): TForceProcessor => (point) => {
    point.speed.x += (random() * 2 - 1) * 0.0002 * power
    point.speed.y += (random() * 2 - 1) * 0.0002 * power
}