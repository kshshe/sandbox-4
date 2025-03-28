import { Points, TPoint } from "../classes/points";

const MAX_LIGHT_INTENSITY = 15;

export const lightBulb = (point: TPoint) => {
    if (!point.data.lightIntensity) {
        point.data.lightIntensity = 0;
    }
    if (point.data.charge) {
        Points.markPointAsUsed(point);
        point.data.isLightSource = true;
        point.data.lightIntensity = Math.min(point.data.lightIntensity + point.data.charge * 0.01, MAX_LIGHT_INTENSITY)
        point.data.charge = 0;
    } else {
        point.data.lightIntensity = Math.max(0, point.data.lightIntensity - 0.1);
    }
}; 