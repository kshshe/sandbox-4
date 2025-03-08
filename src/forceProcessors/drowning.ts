import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { Storage } from "../classes/storage"
import { POINTS_WEIGHTS } from "../config"
import type { TForceProcessor } from "./index"

export const drowning: TForceProcessor = (point) => {
    const roundedSpeed = Speed.getRoundedSpeed(point)
    
    // Early return if no movement
    if (roundedSpeed.x === 0 && roundedSpeed.y === 0) {
        return
    }
    
    const { coordinates } = point
    const targetCoordinates = {
        x: coordinates.x + roundedSpeed.x,
        y: coordinates.y + roundedSpeed.y,
    }
    
    const pointBySpeed = Points.getPointByCoordinates(targetCoordinates)
    
    if (!pointBySpeed) {
        return
    }

    const myWeight = POINTS_WEIGHTS[point.type]
    const neighbourWeight = POINTS_WEIGHTS[pointBySpeed.type]
    
    if (myWeight > neighbourWeight) {
        // Swap coordinates
        const tempCoordinates = { ...point.coordinates }
        point.coordinates = pointBySpeed.coordinates
        pointBySpeed.coordinates = tempCoordinates
        
        // Update the points index
        Points.deletePointInIndex(point.coordinates)
        Points.deletePointInIndex(pointBySpeed.coordinates)
        Points.setPointInIndex(point.coordinates, point)
        Points.setPointInIndex(pointBySpeed.coordinates, pointBySpeed)
        
        // Update iteration tracking
        const currentIteration = Storage.get('iteration', 0)
        point.lastMoveOnIteration = currentIteration
        pointBySpeed.lastMoveOnIteration = currentIteration
        
        // Mark neighbors as used
        Points.markNeighboursAsUsed(point)
        Points.markNeighboursAsUsed(pointBySpeed)
    }
}