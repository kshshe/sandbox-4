import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { Speed } from "../classes/speed";
import { EPointType } from "../types";
import { random } from "../utils/random";

export const clone: TForceProcessor = (point, step) => {
    if (!point.data.cloneType) {
        const neighbors = Points.getNeighbours(point).filter(neighbor => neighbor.type !== EPointType.Clone && neighbor.type !== EPointType.Border);
        const randomNeighbor = neighbors[Math.floor(random() * neighbors.length)];
        if (randomNeighbor) {
            point.data.cloneType = randomNeighbor.type;
        }

        return;
    }

    for (const direction of Speed.possibleNeighbours) {
        if (random() > 0.5) {
            continue;
        }
        const neighbor = Points.getPointByCoordinates({
            x: point.coordinates.x + direction.x,
            y: point.coordinates.y + direction.y
        })
        if (!neighbor) {
            point.data.lastCloneStep = step;
            Points.addPoint({
                coordinates: {
                    x: point.coordinates.x + direction.x,
                    y: point.coordinates.y + direction.y
                },
                type: point.data.cloneType as EPointType,
                speed: {
                    x: 0,
                    y: 0
                }
            })
        }
    }
}