import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { WindVectors } from "../classes/windVectors";

export const windSource: TForceProcessor = (point) => {
  // Make the point static
  point.speed.x = 0;
  point.speed.y = 0;
  
  // Set default wind properties if they don't exist
  if (!point.data.windDirection) {
    point.data.windDirection = { x: 0, y: -1 }; // Default: upward wind
  }
  
  if (!point.data.windStrength) {
    point.data.windStrength = 1; // Default strength
  }
  
  if (!point.data.windRadius) {
    point.data.windRadius = 20; // Default radius
  }
  
  // Create or update the wind vector
  WindVectors.addVector(point.coordinates, {
    x: point.data.windDirection.x,
    y: point.data.windDirection.y,
    strength: point.data.windStrength,
    radius: point.data.windRadius
  });
  
  // Mark the point as used to ensure it stays in the simulation
  Points.markPointAsUsed(point);
}; 