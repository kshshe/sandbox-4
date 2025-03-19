import { Points, TPoint } from "../classes/points";

export const heater = (point: TPoint) => {
    if (point.data.charge) {
        Points.markPointAsUsed(point);
        point.data.temperature = (point.data.temperature || 20) + (point.data.charge || 0) * 5;
        point.data.charge = 0;
    }
}; 