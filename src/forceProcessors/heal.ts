import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { EPointType } from "../types";
import { random } from "../utils/random";

export const heal: TForceProcessor = (point) => {
    const neighbors = Points.getNeighbours(point);
    let hasVirusNearby = false;
    
    for (const neighbor of neighbors) {
        if (neighbor.type === EPointType.Virus && random() < 0.1) {
            hasVirusNearby = true;
            neighbor.type = EPointType.Heal;
            point.data.lastHealType = point.data.lastHealType ?? neighbor.data.originalType;
            Points.markNeighboursAsUsed(neighbor);
        }
    }
    
    if (!hasVirusNearby) {
        point.data.stepsSinceLastHeal = (point.data.stepsSinceLastHeal ?? 0) + 1;
        if (point.data.stepsSinceLastHeal > 100) {
            if (point.data.lastHealType) {
                point.type = point.data.lastHealType;
                point.data.lastHealType = undefined;
            } else {
                Points.deletePoint(point);
            }
        }
    }
} 