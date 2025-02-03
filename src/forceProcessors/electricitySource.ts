import { TForceProcessor } from ".";

export const electricitySource: TForceProcessor = (point) => {
    point.data.charge = 10;
}