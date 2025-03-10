import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { EPointType } from "../types";
import { random } from "../utils/random";

const POINTS_TO_IGNORE = {
    [EPointType.Void]: true,
    [EPointType.Clone]: true,
    [EPointType.Virus]: true,
    [EPointType.Border]: true,
    [EPointType.Heal]: true,
}

export const virus: TForceProcessor = (point) => {
    const neighbors = Points.getNeighbours(point);
    
    for (const neighbor of neighbors) {
        // Skip Void and Clone points as per requirements
        if (POINTS_TO_IGNORE[neighbor.type]) {
            continue;
        }

        Points.markPointAsUsed(point);
        
        if (random() < 0.01) {
            neighbor.data.originalType = neighbor.type;
            neighbor.type = EPointType.Virus;
            Points.markNeighboursAsUsed(neighbor);
        }
    }
} 