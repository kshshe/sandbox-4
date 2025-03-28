import { Points, TPoint } from "./points";
import { LIGHT_MAX_DISTANCE, LIGHT_DECAY_FACTOR } from "../forceProcessors/lightSource";
import { EPointType } from "../types";
import { random } from "../utils/random";

const LIGHT_FADE_FACTOR = 0.8;

// 1 - totally transparent
// 0 - totally opaque
const OPACITY = {
    default: 0.2,
    [EPointType.LightSource]: 1,
    [EPointType.Glass]: 0.9,
    [EPointType.Border]: 0,
    [EPointType.Water]: 0.9,
    [EPointType.Ice]: 0.8,
    [EPointType.Lava]: 0.4,
    [EPointType.Fire]: 0.7,
    [EPointType.Oil]: 0.5,
    [EPointType.BurningOil]: 0.6,
    [EPointType.IceFire]: 0.7,
    [EPointType.Steam]: 0.8,
    [EPointType.Void]: 0,
    [EPointType.Gas]: 0.9,
    [EPointType.LiquidGas]: 0.8,
    [EPointType.Metal]: 0.05,
    [EPointType.MoltenMetal]: 0.3,
    [EPointType.Electricity_Spark]: 0.8,
    [EPointType.Acid]: 0.6,
    [EPointType.LiquidGlass]: 0.8,
    [EPointType.Snow]: 0.7,
    [EPointType.Stone]: 0.1,
    [EPointType.StaticStone]: 0.1,
    [EPointType.Sand]: 0.3,
    [EPointType.StaticSand]: 0.3,
    [EPointType.Smoke]: 0.8,
    [EPointType.Wood]: 0.3,
    [EPointType.BurningWood]: 0.5,
    [EPointType.Mirror]: 0,
} as const

const REFLECTION_FACTOR = {
    default: 0.5,
    [EPointType.Metal]: 0.9,
    [EPointType.Mirror]: 0.9999,
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
    private static isDirty = true;
    static lastRays: TRay[] = [];

    static markDirty() {
        this.isDirty = true;
    }

    private static lightSourcePoints: Set<TPoint> = new Set();

    static getLightSourcePoints() {
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
        if (!this.isDirty) return;

        this.fadeLightMap();
        this.processedPoints.clear();
        this.lastRays = [];
        const lightSources = Array.from(this.lightSourcePoints);

        for (const source of lightSources) {
            this.processLightSource(source);
        }

        this.isDirty = false;
    }

    private static getDirection(amount: number) {
        const initialAngle = random() * 2 * Math.PI;
        return Array.from({ length: amount }, (_, i) => {
            const angle = ((i / amount) * 2 * Math.PI) + initialAngle;
            return [Math.cos(angle), Math.sin(angle)];
        });
    }

    private static processLightSource(source: TPoint, forceIntensity = 1, directionsCount = 11) {
        if (this.processedPoints.has(source)) {
            return;
        }
        const sourceX = source.coordinates.x;
        const sourceY = source.coordinates.y;
        const intensity = source.data.lightIntensity || forceIntensity;
        this.processedPoints.add(source);

        // Cast rays in 8 directions (can be expanded for more precision)
        const directions = this.getDirection(directionsCount);

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
            const previousLightAtPosition = this.getLightIntensity(gridX, gridY);

            // Set light intensity at this position
            this.setLight(gridX, gridY, currentIntensity + previousLightAtPosition);

            if (pointAtPosition) {
                if (distance > 1) {
                    const reflectionFactor = REFLECTION_FACTOR[pointAtPosition.type] ?? REFLECTION_FACTOR.default;
                    const reflection = reflectionFactor * currentIntensity;
                    this.processLightSource(pointAtPosition, reflection, 11);
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