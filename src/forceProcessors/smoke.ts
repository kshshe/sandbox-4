import { TForceProcessor } from ".";
import { Points } from "../classes/points";

export const smoke: TForceProcessor = (point) => {
    const neighbors = Points.getNeighbours(point);
    neighbors.forEach(neighbor => {
        neighbor.colorVariation = (neighbor.colorVariation ?? 0) - 0.01;
    });
}