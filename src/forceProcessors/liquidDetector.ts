import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { LIQUID_POINT_TYPES } from "../constants/pointsLiquids";

export const liquidDetector: TForceProcessor = (point) => {
    const neighbors = Points.getNeighbours(point);
    
    if (neighbors.some(neighbor => neighbor && LIQUID_POINT_TYPES[neighbor.type])) {
        Points.markPointAsUsed(point);
        point.data.charge = 1;
    }
}; 