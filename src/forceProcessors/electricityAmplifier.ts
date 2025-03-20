import { TForceProcessor } from ".";

export const electricityAmplifier: TForceProcessor = (point) => {
    if (!point.data.charge) {
        return
    }

    point.data.charge = Math.min(point.data.charge * 1.2, 100)
}