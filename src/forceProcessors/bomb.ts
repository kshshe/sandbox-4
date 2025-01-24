import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { EPointType } from "../types";

const EXPLOSION_POWER = 50

export const bomb: TForceProcessor = (point) => {
    if (!point.data) {
        point.data = { lifetime: 0 }
    }

    if (!point.data.lifetime) {
        point.data.lifetime = 0
    }

    point.data.lifetime++

    if (
        (
            point.data.lifetime > 100 && Math.random() < 0.1
        ) ||
        point.data.temperature > 900
    ) {
        const neighbors = Points.getNeighbours(point)
        neighbors.forEach((neighbor) => {
            if (neighbor.type !== EPointType.Border) {
                const directionToNeighborX = neighbor.coordinates.x - point.coordinates.x
                const directionToNeighborY = neighbor.coordinates.y - point.coordinates.y
                neighbor.speed.x = directionToNeighborX * EXPLOSION_POWER
                neighbor.speed.y = directionToNeighborY * EXPLOSION_POWER
                neighbor.data.temperature = 1000
            }
        })
        point.type = EPointType.Fire
        point.data.lifetime = 0
    }
}