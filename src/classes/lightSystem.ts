import { Points, TPoint } from "./points";
import { LIGHT_MAX_DISTANCE, LIGHT_DECAY_FACTOR } from "../forceProcessors/lightSource";
import { EPointType } from "../types";
import { random } from "../utils/random";
import { Controls } from "./controls";

const LIGHT_FADE_FACTOR = 0.9;

// 1 - totally transparent
// 0 - totally opaque
const OPACITY = {
    default: 0.4,
    [EPointType.LightSource]: 1,
    [EPointType.LightBulb]: 1,
    [EPointType.Glass]: 0.9,
    [EPointType.Border]: 0,
    [EPointType.Water]: 0.9,
    [EPointType.Ice]: 0.8,
    [EPointType.Void]: 0,
    [EPointType.Gas]: 0.9,
    [EPointType.Metal]: 0.05,
    [EPointType.Smoke]: 0.2,
    [EPointType.Mirror]: 0,
    [EPointType.Fire]: 1,
    [EPointType.IceFire]: 1,
} as const

const REFLECTION_FACTOR = {
    default: 0.1,
    [EPointType.Metal]: 0.9,
    [EPointType.Mirror]: 0.9999,
    [EPointType.Border]: 0.5,
} as const

type TRay = {
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
}

export class LightSystem {
    private static lightMap: Map<string, number> = new Map();
    private static processedPoints: Set<TPoint> = new Set();
    static lastRays: TRay[] = [];

    private static lightSourcePoints: Set<TPoint> = new Set();

    static getLightSourcePoints() {
        if (!Controls.getIsLightSourcesEnabled()) {
            return new Set();
        }
        return this.lightSourcePoints;
    }

    static addLightSourcePoint(point: TPoint) {
        this.lightSourcePoints.add(point);
    }

    static removeLightSourcePoint(point: TPoint) {
        this.lightSourcePoints.delete(point);
    }

    static getKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    static getLightIntensity(x: number, y: number): number {
        const key = this.getKey(x, y);
        const lightIntensity = this.lightMap.get(key) || 0
        return lightIntensity;
    }

    private static fadeLightMap() {
        for (const [key, intensity] of this.lightMap.entries()) {
            this.lightMap.set(key, intensity * LIGHT_FADE_FACTOR);
        }
    } 
    
    static calculateLighting() {
        if (!Controls.getIsLightSourcesEnabled()) {
            return;
        }
        this.fadeLightMap();
        this.processedPoints.clear();
        this.lastRays = [];
        const lightSources = Array.from(this.lightSourcePoints);

        for (const source of lightSources) {
            this.processLightSource(source);
        }
    }

    private static getDirection(amount: number) {
        const initialAngle = random() * 2 * Math.PI;
        return Array.from({ length: amount }, (_, i) => {
            const angle = ((i / amount) * 2 * Math.PI) + initialAngle;
            return [Math.cos(angle), Math.sin(angle)];
        });
    }

    private static processLightSource(source: TPoint, forceIntensity = 1, directionsCount = 11, initialDistance = 0) {
        if (this.processedPoints.has(source)) {
            return;
        }
        const sourceX = source.coordinates.x;
        const sourceY = source.coordinates.y;
        const intensity = typeof source.data.lightIntensity === 'number' ? source.data.lightIntensity : forceIntensity;
        this.processedPoints.add(source);
        this.setLight(sourceX, sourceY, intensity);

        // Cast rays in 8 directions (can be expanded for more precision)
        const directions = this.getDirection(directionsCount);

        for (const [dx, dy] of directions) {
            this.castRay(sourceX, sourceY, dx, dy, intensity, initialDistance);
        }
    }

    private static castRay(x: number, y: number, dx: number, dy: number, intensity: number, initialDistance = 0) {
        let currentX = x;
        let currentY = y;
        let currentIntensity = intensity;
        let distance = initialDistance;
        let distanceFromSource = 0;

        // Set light at source position
        this.setLight(Math.round(currentX), Math.round(currentY), currentIntensity);

        while (currentIntensity > 0.01 && distance < LIGHT_MAX_DISTANCE) {
            // Move along the ray
            currentX += dx;
            currentY += dy;
            distance += 1;
            distanceFromSource += 1;
            // Decay light intensity with distance
            currentIntensity *= LIGHT_DECAY_FACTOR;

            // Round to nearest grid position
            const gridX = Math.round(currentX);
            const gridY = Math.round(currentY);

            // Check if there's a point at this position that blocks light
            const pointAtPosition = Points.getPointByCoordinates({ x: gridX, y: gridY });
            const previousLightAtPosition = this.getLightIntensity(gridX, gridY);

            // Set light intensity at this position
            this.setLight(gridX, gridY, currentIntensity + previousLightAtPosition);

            if (pointAtPosition) {
                if (distanceFromSource > 1) {
                    const reflectionFactor = REFLECTION_FACTOR[pointAtPosition.type] ?? REFLECTION_FACTOR.default;
                    const reflection = reflectionFactor * currentIntensity;
                    this.processLightSource(pointAtPosition, reflection, 11, distance);
                }

                const opacity = OPACITY[pointAtPosition.type] ?? OPACITY.default;
                currentIntensity *= opacity;
            }
        }

        this.lastRays.push({
            fromX: x,
            fromY: y,
            toX: currentX,
            toY: currentY,
        })
    }

    private static setLight(x: number, y: number, intensity: number) {
        const key = this.getKey(x, y);
        const currentIntensity = this.lightMap.get(key) || 0;

        // Use the highest intensity if multiple light sources affect this point
        this.lightMap.set(key, Math.max(currentIntensity, intensity));
    }
} 