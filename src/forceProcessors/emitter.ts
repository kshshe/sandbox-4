import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { Speed } from "../classes/speed";
import { EPointType } from "../types";
import { random } from "../utils/random";

export const emitter = (pointType: EPointType): TForceProcessor => (point) => {
    if (random() < 0.9) {
        return
    }
    for (const direction of Speed.possibleNeighbours) {
        if (random() < 0.8) {
            continue
        }
        const neighbour = Points.getPointByCoordinates({
            x: point.coordinates.x + direction.x,
            y: point.coordinates.y + direction.y,
        })
        if (!neighbour) {
            Points.addPoint({
                coordinates: {
                    x: point.coordinates.x + direction.x,
                    y: point.coordinates.y + direction.y,
                },
                speed: {
                    x: direction.x,
                    y: direction.y,
                },
                type: pointType,
            })
        }
    }
}