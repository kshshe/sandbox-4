import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { EPointType } from "../types"
import type { TForceProcessor } from "./index"

const WEIGHTS: Record<EPointType, number> = {
    [EPointType.Stone]: 1,
    [EPointType.Sand]: 1,
    [EPointType.Water]: 0.5,
    [EPointType.Border]: Infinity,
}

export const drowning: TForceProcessor = (point) => {
    const neighbours = Points.getNeighbours(point, false)
    const { speed, coordinates } = point
    const roundedSpeed = Speed.getRoundedSpeed(speed, point.type)
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed, neighbours)

    if (!pointBySpeed) {
        return
    }

    const myWeight = WEIGHTS[point.type]
    const neighbourWeight = WEIGHTS[pointBySpeed.type]
    const isNeighbourPlacedLower = pointBySpeed.coordinates.y > point.coordinates.y
    if (isNeighbourPlacedLower && myWeight > neighbourWeight) {
        point.coordinates = pointBySpeed.coordinates
        pointBySpeed.coordinates = coordinates
        return
    }
}