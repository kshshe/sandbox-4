import { TForceProcessor } from ".";
import { LightSystem } from "../classes/lightSystem";
import { Points } from "../classes/points";

export const lightDetector: TForceProcessor = (point) => {
    const lightIntensity = LightSystem.getLightIntensity(point.coordinates.x, point.coordinates.y);
    
    // Emit electricity when light intensity is above 0.3
    if (lightIntensity > 0.001) {
        Points.markPointAsUsed(point);
        point.data.charge = 1;
    }
}; 