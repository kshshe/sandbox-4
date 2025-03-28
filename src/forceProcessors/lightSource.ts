import { TForceProcessor } from ".";

export const LIGHT_MAX_DISTANCE = 100;
export const LIGHT_DECAY_FACTOR = 0.99;

export const LIGHT_SOURCE_NAME = 'lightSource';

export const lightSource = (intensity: number = 1.0): TForceProcessor => {
    const lightSourceProcessor = (point) => {
        // Mark the point for the renderer to know it's a light source
        point.data.isLightSource = true;
        
        // Light intensity at source (can be modified based on point properties)
        point.data.lightIntensity = intensity * 0.5;
    } 

    lightSourceProcessor.processorName = LIGHT_SOURCE_NAME;
    return lightSourceProcessor;
}