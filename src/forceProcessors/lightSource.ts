import { TForceProcessor } from ".";

export const LIGHT_MAX_DISTANCE = 40;
export const LIGHT_DECAY_FACTOR = 0.95;

export const lightSource = (intensity: number = 1.0): TForceProcessor => (point) => {
    // Mark the point for the renderer to know it's a light source
    point.data.isLightSource = true;
    
    // Light intensity at source (can be modified based on point properties)
    point.data.lightIntensity = intensity;
} 