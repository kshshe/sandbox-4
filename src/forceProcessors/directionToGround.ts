import { TForceProcessor } from "."
import { Connections } from "../classes/connections"
import { Points, TPoint } from "../classes/points"
import { Speed } from "../classes/speed"

export const directionToGround: TForceProcessor = (point) => {
    if (Connections.getWireFromPoint(point.coordinates).length > 0) {
        point.data.distanceToGround = 0
        point.data.directionToGround = Speed.self
        point.data.charge = 0
        return
    }

    const neighbours = Points.getNeighbours(point, false)
    let closestToGroundPoint: TPoint | null = null
    let closestToGroundDistance: number | null = null
    for (const neighbour of neighbours) {
        if (neighbour.data.directionToGround) {
            if (closestToGroundDistance === null || neighbour.data.distanceToGround < closestToGroundDistance) {
                closestToGroundPoint = neighbour
                closestToGroundDistance = neighbour.data.distanceToGround
            }
        }
    }
    if (closestToGroundPoint !== null) {
        point.data.distanceToGround = closestToGroundDistance! + 1
        point.data.directionToGround = {
            x: closestToGroundPoint.coordinates.x - point.coordinates.x,
            y: closestToGroundPoint.coordinates.y - point.coordinates.y,
        }
        Points.markNeighboursAsUsed(point)
    }
}