import { Points, TPoint } from "./points";
import { LIGHT_MAX_DISTANCE, LIGHT_DECAY_FACTOR } from "../forceProcessors/lightSource";
import { EPointType } from "../types";

// 1 - totally transparent
// 0 - totally opaque
const OPACITY = {
    default: 0.2,
    [EPointType.LightSource]: 1,
    [EPointType.Glass]: 0.9,
    [EPointType.Border]: 0,
    [EPointType.Water]: 0.7,
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
    [EPointType.Metal]: 0.3,
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

    static getKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    static getLightIntensity(x: number, y: number): number {
        const key = this.getKey(x, y);
        return this.lightMap.get(key) || 0
    }

    static calculateLighting() {
        if (!this.isDirty) return;

        this.lightMap.clear();
        this.processedPoints.clear();
        this.lastRays = [];
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

    private static processLightSource(source: TPoint, forceIntensity = 1, directionsCount = 40) {
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

            // Set light intensity at this position
            this.setLight(gridX, gridY, currentIntensity);

            if (pointAtPosition) {
                if (distance > 1) {
                    const reflectionFactor = REFLECTION_FACTOR[pointAtPosition.type] ?? REFLECTION_FACTOR.default;
                    const reflection = reflectionFactor * currentIntensity;
                    this.processLightSource(pointAtPosition, reflection, 12);
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