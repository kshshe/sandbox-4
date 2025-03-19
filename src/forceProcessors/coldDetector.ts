import { TForceProcessor } from ".";
import { Controls } from "../classes/controls";
import { Points } from "../classes/points";

export const coldDetector: TForceProcessor = (point) => {
    const temperature = point.data.temperature ?? 20;
    
    if (temperature < -10) {
        Points.markPointAsUsed(point);
        point.data.charge = 1;
        // move temperature closer to base
        const baseTemperature = Controls.getBaseTemperature()
        point.data.temperature = baseTemperature + (temperature - baseTemperature) * 0.9
    }
}; 