import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { POINTS_WEIGHTS } from "../config"
import type { TForceProcessor } from "./index"

export const drowning: TForceProcessor = (point) => {
    const neighbours = Points.getNeighbours(point, false)
    const { speed, coordinates } = point
    const roundedSpeed = Speed.getRoundedSpeed(speed, point.type)
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed, neighbours)

    if (!pointBySpeed) {
        return
    }

    const myWeight = POINTS_WEIGHTS[point.type]
    const neighbourWeight = POINTS_WEIGHTS[pointBySpeed.type]
    if (myWeight > neighbourWeight) {
        point.coordinates = pointBySpeed.coordinates
        pointBySpeed.coordinates = coordinates
        return
    }
}