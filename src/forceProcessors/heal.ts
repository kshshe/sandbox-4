import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { EPointType } from "../types";
import { random } from "../utils/random";

export const heal: TForceProcessor = (point) => {
    const neighbors = Points.getNeighbours(point);
    let hasVirusNearby = false;
    
    for (const neighbor of neighbors) {
        if (neighbor.type === EPointType.Virus && random() < 0.25) {
            hasVirusNearby = true;
            neighbor.type = EPointType.Heal;
            Points.onPointUpdated(neighbor);
            point.data.lastHealType = point.data.lastHealType ?? neighbor.data.originalType;
            Points.markNeighboursAsUsed(neighbor);
            Points.markPointAsUsed(point);
            point.data.stepsSinceLastHeal = 0;
        }
    }
    
    if (!hasVirusNearby) {
        Points.markPointAsUsed(point);
        point.data.stepsSinceLastHeal = (point.data.stepsSinceLastHeal ?? 0) + 1;
        if (point.data.stepsSinceLastHeal > 400) {
            if (point.data.lastHealType) {
                point.type = point.data.lastHealType;
                point.data.lastHealType = undefined;
                Points.onPointUpdated(point);
            } else {
                Points.deletePoint(point);
            }
        }
    }
} 