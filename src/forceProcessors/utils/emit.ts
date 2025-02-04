import { Points, TPoint } from "../../classes/points";
import { Speed } from "../../classes/speed";
import { EPointType } from "../../types";
import { random } from "../../utils/random";

export const emit = (point: TPoint, targetType: EPointType, repulsiveForce = 0.1): boolean => {
    let wasEmitted = false
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
                    x: direction.x * repulsiveForce,
                    y: direction.y * repulsiveForce,
                },
                type: targetType,
            })
            wasEmitted = true
        }
    }

    return wasEmitted
}