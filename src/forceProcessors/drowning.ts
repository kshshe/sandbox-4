import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { POINTS_WEIGHTS } from "../config"
import type { TForceProcessor } from "./index"

export const drowning: TForceProcessor = (point) => {
    const { coordinates } = point
    const roundedSpeed = Speed.getRoundedSpeed(point)
    if (roundedSpeed.x === 0 && roundedSpeed.y === 0) {
        return
    }
    const pointBySpeed = Points.getPointByCoordinates({
        x: coordinates.x + roundedSpeed.x,
        y: coordinates.y + roundedSpeed.y,
    })

    if (!pointBySpeed) {
        return
    }

    const myWeight = POINTS_WEIGHTS[point.type]
    const neighbourWeight = POINTS_WEIGHTS[pointBySpeed.type]
    if (myWeight > neighbourWeight) {
        point.coordinates = pointBySpeed.coordinates
        pointBySpeed.coordinates = coordinates
        Points.deletePointInIndex(pointBySpeed.coordinates)
        Points.deletePointInIndex(point.coordinates)
        Points.setPointInIndex(pointBySpeed.coordinates, pointBySpeed)
        Points.setPointInIndex(point.coordinates, point)
        return
    }
}