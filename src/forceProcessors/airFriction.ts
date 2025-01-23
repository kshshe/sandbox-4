import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import type { TForceProcessor } from "./index"

export const airFriction: TForceProcessor = (point) => {
    const neighbours = Points.getNeighbours(point)
    const { speed } = point

    const roundedSpeed = Speed.getRoundedSpeed(speed)
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed, neighbours)

    if (!pointBySpeed) {
        point.speed.x *= 0.9
    }
}