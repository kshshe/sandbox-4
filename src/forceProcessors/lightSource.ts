import { TForceProcessor } from ".";

export const LIGHT_MAX_DISTANCE = 15;
export const LIGHT_DECAY_FACTOR = 0.85;

export const lightSource: TForceProcessor = (point) => {
    // Mark the point for the renderer to know it's a light source
    point.data.isLightSource = true;
    
    // Light intensity at source (can be modified based on point properties)
    point.data.lightIntensity = 1.0;
} 