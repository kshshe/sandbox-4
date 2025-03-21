import { Points, TPoint } from "../classes/points";

export const cooler = (point: TPoint) => {
    if (point.data.charge > 0 && point.data.temperature) {
        Points.markPointAsUsed(point);
        point.data.temperature = (point.data.temperature || 20) - (point.data.charge || 0) * 20;
        point.data.charge = 0;
    }
}