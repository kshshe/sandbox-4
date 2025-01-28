import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { EPointType } from "../types";

export const voidProcessor: TForceProcessor = (point) => {
    const neighbors = Points.getNeighbours(point, false)
    for (const neighbor of neighbors) {
        if (neighbor.type !== EPointType.Void) {
            Points.deletePoint(neighbor)
        }
    }
}