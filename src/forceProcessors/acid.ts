import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { EPointType } from "../types";
import { random } from "../utils/random";

const POINTS_TO_IGNORE = {
    [EPointType.Acid]: true,
    [EPointType.Void]: true,
    [EPointType.Clone]: true,
    [EPointType.Border]: true,
}

export const acid: TForceProcessor = (point) => {
    const neighbors = Points.getNeighbours(point);
    point.data.dissolvedCount = point.data.dissolvedCount || 0
    
    for (const neighbor of neighbors) {
        // Skip points that should be ignored
        if (POINTS_TO_IGNORE[neighbor.type]) {
            continue;
        }
        
        // Acid dissolves the neighbor and itself
        if (random() < 0.1) {
            Points.deletePoint(neighbor);
            point.data.dissolvedCount++;
            break;
        }
    }
    
    // If acid dissolved something, it also gets consumed
    if (point.data.dissolvedCount > 4) {
        Points.deletePoint(point);
    }
} 