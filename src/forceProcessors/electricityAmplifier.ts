import { TForceProcessor } from ".";

export const electricityAmplifier: TForceProcessor = (point) => {
    if (!point.data.charge) {
        point.data.charge = 0
    }

    point.data.charge = Math.min(point.data.charge * 1.2, 100)
}