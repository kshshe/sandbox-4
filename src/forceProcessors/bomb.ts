import { TForceProcessor } from ".";
import { Points, TPoint } from "../classes/points";
import { EPointType } from "../types";
import { random } from "../utils/random";

const STARTING_EXPLOSION_POWER = 10

const explode = (point: TPoint, processedPoints: Set<TPoint>, rest = 3) => {
    if (rest === 0) {
        return
    }
    if (point.type === EPointType.Border) {
        return
    }
    const neighbors = Points.getNeighbours(point)
    const force = STARTING_EXPLOSION_POWER * rest
    neighbors.forEach((neighbor) => {
        if (neighbor.type !== EPointType.Border && !processedPoints.has(neighbor)) {
            const directionToNeighborX = neighbor.coordinates.x - point.coordinates.x
            const directionToNeighborY = neighbor.coordinates.y - point.coordinates.y
            neighbor.speed.x = directionToNeighborX * force * (random() + 0.5)
            neighbor.speed.y = directionToNeighborY * force * (random() + 0.5)
            processedPoints.add(neighbor)
        }
    })
    neighbors.forEach((neighbor) => {
        explode(neighbor, processedPoints, rest - 1)
    })
}

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
            point.data.lifetime > 100 && random() < 0.1
        ) ||
        point.data.temperature > 900
    ) {
        explode(point, new Set([point]))
        Points.deletePoint(point)
    }
}