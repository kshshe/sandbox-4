import { Points, TPoint } from "../../classes/points"
import { EPointType } from "../../types"
import { random } from "../../utils/random"

const STARTING_EXPLOSION_POWER = 10

const CONVERTION_MAP: {
    [key in EPointType]?: EPointType
} = {
    [EPointType.StaticStone]: EPointType.Stone,
}

export const explode = (point: TPoint, processedPoints: Set<TPoint>, rest = 3) => {
    Points.markNeighboursAsUsed(point)
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
            if (CONVERTION_MAP[neighbor.type]) {
                neighbor.type = CONVERTION_MAP[neighbor.type]!
            }
            processedPoints.add(neighbor)
        }
    })
    neighbors.forEach((neighbor) => {
        explode(neighbor, processedPoints, rest - 1)
    })
}