import { TForceProcessor } from "."
import { Points, TPoint } from "../classes/points"

export const directionToGround: TForceProcessor = (point) => {
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