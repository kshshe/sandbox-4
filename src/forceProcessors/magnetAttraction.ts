import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { TConfig } from "../constants/pointsExceptions";

const MAGNET_FORCE = 0.01;

export const magnetAttraction = (attractTo: TConfig): TForceProcessor => (point) => {
    const neighbors = Points.getNeighbours(point, true, 4);
    
    // Find any metal neighbors
    const metalNeighbors = neighbors.filter(neighbor => 
        attractTo[neighbor.type]
    );
    
    // If no metal neighbors, nothing to do
    if (metalNeighbors.length === 0) {
        return;
    }
    
    // Mark point as used since we're applying a force to it
    Points.markPointAsUsed(point);
    
    // For each metal neighbor, apply an attraction force
    for (const metalPoint of metalNeighbors) {
        // Calculate direction vector toward the metal
        const dirX = metalPoint.coordinates.x - point.coordinates.x;
        const dirY = metalPoint.coordinates.y - point.coordinates.y;
        // the more distance, the less force
        const distanceCoefficient = 1 / Math.sqrt(dirX ** 2 + dirY ** 2)
        
        // Apply a slight attraction force in that direction
        // The force decreases with distance (naturally gets stronger as particles get closer)
        point.speed.x += dirX * MAGNET_FORCE * distanceCoefficient;
        point.speed.y += dirY * MAGNET_FORCE * distanceCoefficient;
        point.speed.x *= 0.95
        point.speed.y *= 0.95
    }
}; 