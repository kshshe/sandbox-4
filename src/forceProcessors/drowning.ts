import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { Storage } from "../classes/storage"
import { POINTS_WEIGHTS } from "../config"
import { TCoordinate } from "../types"
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
        // Check for empty spaces around the lighter point first
        const emptySpaces: TCoordinate[] = []
        
        // Check all 8 directions around the lighter point
        for (const direction of Speed.possibleNeighbours) {
            const checkCoordinates = {
                x: pointBySpeed.coordinates.x + direction.x,
                y: pointBySpeed.coordinates.y + direction.y
            }
            
            // Skip the original point's position
            if (checkCoordinates.x === coordinates.x && checkCoordinates.y === coordinates.y) {
                continue
            }
            
            // If there's an empty space, add it to the list
            if (!Points.getPointByCoordinates(checkCoordinates)) {
                emptySpaces.push(checkCoordinates)
            }
        }
        
        // If there are empty spaces, move the lighter point to one of them instead of swapping
        if (emptySpaces.length > 0) {
            // Choose a random empty space
            const randomIndex = Math.floor(Math.random() * emptySpaces.length)
            const emptySpace = emptySpaces[randomIndex]
            
            // Move the lighter point to the empty space
            const tempCoordinates = { ...pointBySpeed.coordinates }
            pointBySpeed.coordinates = emptySpace
            
            // Update the points index
            Points.deletePointInIndex(tempCoordinates)
            Points.setPointInIndex(pointBySpeed.coordinates, pointBySpeed)
            
            // Update iteration tracking
            const currentIteration = Storage.get('iteration', 0)
            pointBySpeed.lastMoveOnIteration = currentIteration

            pointBySpeed.speed.x -= roundedSpeed.x * 0.1
            pointBySpeed.speed.y -= roundedSpeed.y * 0.1
            
            // Mark neighbors as used
            Points.markNeighboursAsUsed(pointBySpeed)
        } else {
            // No empty spaces, do the original swap
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
}