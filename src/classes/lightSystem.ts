import { Points, TPoint } from "./points";
import { LIGHT_MAX_DISTANCE, LIGHT_DECAY_FACTOR } from "../forceProcessors/lightSource";
import { EPointType } from "../types";

// 1 - totally transparent
// 0 - totally opaque
const OPACITY = {
    default: 0.2,
    [EPointType.Glass]: 0.9,
} as const

export class LightSystem {
    private static lightMap: Map<string, number> = new Map();
    private static isDirty = true;

    static markDirty() {
        this.isDirty = true;
    }

    static getKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    static getLightIntensity(x: number, y: number): number {
        const key = this.getKey(x, y);
        return this.lightMap.get(key) || 0;
    }

    static calculateLighting() {
        if (!this.isDirty) return;
        
        this.lightMap.clear();
        const lightSources = Points.getPoints().filter(point => point.data.isLightSource);
        
        for (const source of lightSources) {
            this.processLightSource(source);
        }
        
        this.isDirty = false;
    }

    private static getDirection(amount: number) {
        return Array.from({ length: amount }, (_, i) => {
            const angle = (i / amount) * 2 * Math.PI;
            return [Math.cos(angle), Math.sin(angle)];
        });
    }

    private static processLightSource(source: TPoint) {
        const sourceX = source.coordinates.x;
        const sourceY = source.coordinates.y;
        const intensity = source.data.lightIntensity || 1;
        
        // Cast rays in 8 directions (can be expanded for more precision)
        const directions = this.getDirection(40);
        
        for (const [dx, dy] of directions) {
            this.castRay(sourceX, sourceY, dx, dy, intensity);
        }
    }

    private static castRay(x: number, y: number, dx: number, dy: number, intensity: number) {
        let currentX = x;
        let currentY = y;
        let currentIntensity = intensity;
        let distance = 0;
        
        // Set light at source position
        this.setLight(Math.round(currentX), Math.round(currentY), currentIntensity);
        
        while (currentIntensity > 0.05 && distance < LIGHT_MAX_DISTANCE) {
            // Move along the ray
            currentX += dx;
            currentY += dy;
            distance += 1;
            
            // Decay light intensity with distance
            currentIntensity *= LIGHT_DECAY_FACTOR;
            
            // Round to nearest grid position
            const gridX = Math.round(currentX);
            const gridY = Math.round(currentY);
            
            // Check if there's a point at this position that blocks light
            const pointAtPosition = Points.getPointByCoordinates({ x: gridX, y: gridY });
            
            // Set light intensity at this position
            this.setLight(gridX, gridY, currentIntensity);

            if (pointAtPosition) {
                const opacity = OPACITY[pointAtPosition.type] ?? OPACITY.default;
                currentIntensity *= opacity;
            }
        }
    }

    private static setLight(x: number, y: number, intensity: number) {
        const key = this.getKey(x, y);
        const currentIntensity = this.lightMap.get(key) || 0;
        
        // Use the highest intensity if multiple light sources affect this point
        this.lightMap.set(key, Math.max(currentIntensity, intensity));
    }
} 