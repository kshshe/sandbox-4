import { Points, TPoint, TCoordinates } from "./points";
import { LIGHT_MAX_DISTANCE as DEFAULT_LIGHT_MAX_DISTANCE, LIGHT_DECAY_FACTOR as DEFAULT_LIGHT_DECAY_FACTOR } from "../forceProcessors/lightSource"; // Use as defaults
import { EPointType } from "../types";
import { random } from "../utils/random";
import { Controls } from "./controls"; // Keep for global toggles? Or inject config

// --- Configuration ---

export interface LightSystemConfig {
    gridWidth: number;
    gridHeight: number;
    enableFade: boolean;
    fadeFactor: number;
    defaultDecayFactor: number;
    maxDistance: number;
    raysPerSource: number;
    enableColor: boolean;
    enableRefraction: boolean;
    enableReflection: boolean;
    maxBounces: number; // Max depth for reflection/refraction
    ambientLight: TColor; // NEW: Base light level
    shadowIntensity: number; // NEW: How dark shadows are (0=black, 1=no shadow)
    useBresenham: boolean; // NEW: Toggle ray algorithm
    debugDrawRays: boolean; // NEW: Control debug visualization
}

const DEFAULT_CONFIG: LightSystemConfig = {
    gridWidth: 100, // Needs to be set correctly!
    gridHeight: 100, // Needs to be set correctly!
    enableFade: true,
    fadeFactor: 0.9,
    defaultDecayFactor: DEFAULT_LIGHT_DECAY_FACTOR,
    maxDistance: DEFAULT_LIGHT_MAX_DISTANCE,
    raysPerSource: 16, // Increased default
    enableColor: true,
    enableRefraction: true,
    enableReflection: true,
    maxBounces: 3, // Limit recursion
    ambientLight: { r: 0.05, g: 0.05, b: 0.05 },
    shadowIntensity: 0.85, // Shadows are not pitch black
    useBresenham: true,
    debugDrawRays: false,
};

// --- Types ---

export type TColor = { r: number; g: number; b: number };

export interface MaterialProperties {
    opacity: TColor | number; // Can be per-channel or uniform (0=opaque, 1=transparent)
    reflectivity: TColor | number; // How much light is reflected (0-1)
    emissivity: TColor | number; // Light emitted by the material itself (0-1+)
    refractiveIndex: number; // Index Of Refraction (IOR), 1.0 for vacuum/air
    scattering: TColor | number; // How much light scatters within the medium
    roughness: number; // Affects reflection sharpness (0=perfect mirror, 1=diffuse)
    absorbance: TColor | number; // Color absorbed by the material
}

// Define default properties and specific material overrides
const DEFAULT_MATERIAL: MaterialProperties = {
    opacity: 0.4, // Default opacity if not specified
    reflectivity: 0.05,
    emissivity: { r: 0, g: 0, b: 0 },
    refractiveIndex: 1.0, // Like air
    scattering: 0,
    roughness: 0.5,
    absorbance: 0,
};

const MATERIALS: { [key in EPointType]?: Partial<MaterialProperties> } = {
    [EPointType.LightSource]: { opacity: 1, reflectivity: 0, emissivity: 1 }, // Emissivity might be handled by source itself
    [EPointType.LightBulb]: { opacity: 1, reflectivity: 0.1, emissivity: 0.9, refractiveIndex: 1.5 }, // Glass bulb
    [EPointType.Glass]: { opacity: { r: 0.9, g: 0.9, b: 0.9 }, reflectivity: 0.1, refractiveIndex: 1.5, roughness: 0.05 },
    [EPointType.Border]: { opacity: 0, reflectivity: 0.3, roughness: 0.8 },
    [EPointType.Water]: { opacity: { r: 0.85, g: 0.9, b: 0.9 }, reflectivity: 0.08, refractiveIndex: 1.33, scattering: { r: 0.01, g: 0.02, b: 0.03 }, roughness: 0.1 },
    [EPointType.Ice]: { opacity: 0.8, reflectivity: 0.1, refractiveIndex: 1.31, roughness: 0.2 },
    [EPointType.Void]: { opacity: 0, reflectivity: 0 },
    [EPointType.Gas]: { opacity: 0.95, reflectivity: 0, refractiveIndex: 1.001, scattering: 0.05 }, // Slight scattering
    [EPointType.Metal]: { opacity: 0.01, reflectivity: 0.9, roughness: 0.3 },
    [EPointType.Smoke]: { opacity: 0.2, reflectivity: 0.01, scattering: 0.8, absorbance: { r: 0.1, g: 0.1, b: 0.1 } },
    [EPointType.Mirror]: { opacity: 0, reflectivity: 0.99, roughness: 0.01 },
    [EPointType.Fire]: { opacity: 1, reflectivity: 0, emissivity: { r: 1, g: 0.5, b: 0.1 } }, // Fire emits light
    [EPointType.IceFire]: { opacity: 1, reflectivity: 0, emissivity: { r: 0.1, g: 0.5, b: 1 } }, // IceFire emits light
    // Add more... e.g., Wood, Stone, etc.
};

// Helper to get material properties for a point type
function getMaterialProperties(type: EPointType): MaterialProperties {
    const override = MATERIALS[type];
    // Shallow merge - consider deep merge if properties become complex objects
    return { ...DEFAULT_MATERIAL, ...override };
}

// Ray info for debugging or more complex interactions
type TRaySegment = {
    from: TCoordinates;
    to: TCoordinates;
    color: TColor;
    intensity: number; // Combined intensity might be useful
    type: 'emit' | 'reflect' | 'refract' | 'transmit';
    depth: number;
};

// --- Utility Functions ---

function addColors(c1: TColor, c2: TColor): TColor {
    return { r: c1.r + c2.r, g: c1.g + c2.g, b: c1.b + c2.b };
}

function multiplyColor(c: TColor, factor: number | TColor): TColor {
    if (typeof factor === 'number') {
        return { r: c.r * factor, g: c.g * factor, b: c.b * factor };
    }
    return { r: c.r * factor.r, g: c.g * factor.g, b: c.b * factor.b };
}

function clampColor(c: TColor, min = 0, max = Infinity): TColor {
    return {
        r: Math.max(min, Math.min(max, c.r)),
        g: Math.max(min, Math.min(max, c.g)),
        b: Math.max(min, Math.min(max, c.b)),
    };
}

function colorIntensity(c: TColor): number {
    // Simple average, or could use luminance weights (0.21 R + 0.72 G + 0.07 B)
    return (c.r + c.g + c.b) / 3.0;
}

// Vector normalization helper
function normalize(x: number, y: number): { x: number, y: number } {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

// Snell's Law for Refraction
// dir: incoming direction vector {x, y}
// normal: surface normal vector {x, y}
// n1: refractive index of current medium
// n2: refractive index of next medium
function refract(dir: { x: number, y: number }, normal: { x: number, y: number }, n1: number, n2: number): { x: number, y: number } | null {
    const ratio = n1 / n2;
    const cosI = - (dir.x * normal.x + dir.y * normal.y); // Dot product (ensure normal points outwards)
    const sinT2 = ratio * ratio * (1.0 - cosI * cosI);

    if (sinT2 > 1.0) {
        // Total Internal Reflection
        return null;
    }

    const cosT = Math.sqrt(1.0 - sinT2);
    const refractedX = ratio * dir.x + (ratio * cosI - cosT) * normal.x;
    const refractedY = ratio * dir.y + (ratio * cosI - cosT) * normal.y;

    return normalize(refractedX, refractedY); // Return normalized direction
}

// Reflection (simple mirror reflection)
function reflect(dir: { x: number, y: number }, normal: { x: number, y: number }): { x: number, y: number } {
    const dot = dir.x * normal.x + dir.y * normal.y;
    const reflectedX = dir.x - 2 * dot * normal.x;
    const reflectedY = dir.y - 2 * dot * normal.y;
    return normalize(reflectedX, reflectedY); // Normalize just in case
}


// --- Light System Class ---

export class LightSystem {
    private config: LightSystemConfig;
    private pointsRef: typeof Points; // Reference to the Points manager
    private controlsRef: typeof Controls; // Reference to Controls

    // Use TypedArrays for performance. Size based on grid dimensions.
    // Store R, G, B channels separately or interleaved (RGBA). Separate is often easier.
    private lightMapR: Float32Array;
    private lightMapG: Float32Array;
    private lightMapB: Float32Array;

    // Optional: Store intensity/alpha if needed separately
    // private lightMapIntensity: Float32Array;

    private tempLightMapR: Float32Array; // For accumulation during calculation
    private tempLightMapG: Float32Array;
    private tempLightMapB: Float32Array;

    private lightSourcePoints: Set<TPoint> = new Set();
    private activePointSources: TPoint[] = []; // Cache active sources per frame

    // Debugging
    public debugRays: TRaySegment[] = [];

    constructor(config: Partial<LightSystemConfig>, points: typeof Points, controls: typeof Controls) {
        // Merge partial config with defaults
        this.config = { ...DEFAULT_CONFIG, ...config };
        if (!this.config.gridWidth || !this.config.gridHeight) {
            throw new Error("LightSystem requires gridWidth and gridHeight in config.");
        }
        this.pointsRef = points;
        this.controlsRef = controls;

        const mapSize = this.config.gridWidth * this.config.gridHeight;
        this.lightMapR = new Float32Array(mapSize);
        this.lightMapG = new Float32Array(mapSize);
        this.lightMapB = new Float32Array(mapSize);

        this.tempLightMapR = new Float32Array(mapSize);
        this.tempLightMapG = new Float32Array(mapSize);
        this.tempLightMapB = new Float32Array(mapSize);

        this.clearLightMap(); // Initialize with ambient light
    }

    updateConfig(newConfig: Partial<LightSystemConfig>) {
        // TODO: Handle resizing arrays if grid dimensions change (complex)
        if (newConfig.gridWidth !== this.config.gridWidth || newConfig.gridHeight !== this.config.gridHeight) {
             console.warn("Resizing light map is not fully implemented. Recreate LightSystem instance for grid size changes.");
             // Basic resize attempt (will lose existing light data)
             const mapSize = newConfig.gridWidth * newConfig.gridHeight;
             this.lightMapR = new Float32Array(mapSize);
             this.lightMapG = new Float32Array(mapSize);
             this.lightMapB = new Float32Array(mapSize);
             this.tempLightMapR = new Float32Array(mapSize);
             this.tempLightMapG = new Float32Array(mapSize);
             this.tempLightMapB = new Float32Array(mapSize);
        }
        this.config = { ...this.config, ...newConfig };
        this.clearLightMap(); // Re-apply ambient light on config change
        console.log("LightSystem config updated.");
    }

    // --- Light Source Management ---

    addLightSourcePoint(point: TPoint) {
        this.lightSourcePoints.add(point);
    }

    removeLightSourcePoint(point: TPoint) {
        this.lightSourcePoints.delete(point);
    }

    getLightSourcePoints(): Set<TPoint> {
        // Consider returning a copy if external modification is unwanted
        return this.lightSourcePoints;
    }

    // --- Light Map Access ---

    private getIndex(x: number, y: number): number | null {
        const gx = Math.round(x);
        const gy = Math.round(y);
        if (gx < 0 || gx >= this.config.gridWidth || gy < 0 || gy >= this.config.gridHeight) {
            return null; // Out of bounds
        }
        return gy * this.config.gridWidth + gx;
    }

    /** Gets the calculated light color at the given grid coordinates. */
    getLightColor(x: number, y: number): TColor {
        const index = this.getIndex(x, y);
        if (index === null) {
            return { r: 0, g: 0, b: 0 }; // Out of bounds is dark
        }
        // Return color from the *final* light map
        return {
            r: this.lightMapR[index],
            g: this.lightMapG[index],
            b: this.lightMapB[index],
        };
    }

     /** Gets the raw light map data (read-only). Useful for rendering. */
     getLightMapData(): { r: Float32Array, g: Float32Array, b: Float32Array } {
        return { r: this.lightMapR, g: this.lightMapG, b: this.lightMapB };
     }

    /** Sets the light color in the *temporary* map during calculation. Accumulates additively. */
    private setTempLight(x: number, y: number, color: TColor) {
        const index = this.getIndex(x, y);
        if (index === null) return; // Out of bounds

        // Additive blending onto the temporary map
        this.tempLightMapR[index] += color.r;
        this.tempLightMapG[index] += color.g;
        this.tempLightMapB[index] += color.b;
        // Clamp later in finalizeLightMap if needed, accumulation can exceed 1.0
    }

    // --- Core Lighting Calculation ---

    private clearLightMap() {
        // Initialize with ambient light
        const ambient = this.config.ambientLight;
        this.lightMapR.fill(ambient.r);
        this.lightMapG.fill(ambient.g);
        this.lightMapB.fill(ambient.b);
    }

    private clearTempLightMap() {
         // Reset temp map to black (or ambient if accumulating over multiple frames?)
         this.tempLightMapR.fill(0);
         this.tempLightMapG.fill(0);
         this.tempLightMapB.fill(0);
         // Apply ambient light directly to temp map? Or add it at the end? Add at end.
    }


    private fadeLightMap() {
        if (!this.config.enableFade) return;
        const factor = this.config.fadeFactor;
        const ambientR = this.config.ambientLight.r;
        const ambientG = this.config.ambientLight.g;
        const ambientB = this.config.ambientLight.b;

        // Fade existing light *towards* ambient level
        for (let i = 0; i < this.lightMapR.length; i++) {
            this.lightMapR[i] = ambientR + (this.lightMapR[i] - ambientR) * factor;
            this.lightMapG[i] = ambientG + (this.lightMapG[i] - ambientG) * factor;
            this.lightMapB[i] = ambientB + (this.lightMapB[i] - ambientB) * factor;
        }
    }

     private finalizeLightMap() {
         // Combine Temp map (new light) with Faded map (previous frame's light)
         // Also add ambient light and apply clamping/shadow intensity.
         const ambient = this.config.ambientLight;
         const shadowFactor = 1.0 - this.config.shadowIntensity;

         for (let i = 0; i < this.lightMapR.length; i++) {
             // Option 1: Additive Blending (New light adds to faded old light)
             let r = this.lightMapR[i] + this.tempLightMapR[i];
             let g = this.lightMapG[i] + this.tempLightMapG[i];
             let b = this.lightMapB[i] + this.tempLightMapB[i];

             // Option 2: Max Blending (Take the brighter of old vs new - simpler, less realistic)
             // let r = Math.max(this.lightMapR[i], this.tempLightMapR[i]);
             // let g = Math.max(this.lightMapG[i], this.tempLightMapG[i]);
             // let b = Math.max(this.lightMapB[i], this.tempLightMapB[i]);

             // Ensure final light is at least ambient
             r = Math.max(ambient.r, r);
             g = Math.max(ambient.g, g);
             b = Math.max(ambient.b, b);

             // Apply shadow intensity - darken areas that only received ambient light?
             // This is complex. A simple approach is just clamping. Let's skip shadow intensity here.

             // Clamp final color (e.g., 0 to some max brightness if needed)
             this.lightMapR[i] = Math.max(0, r); // Clamp at 0 lower bound
             this.lightMapG[i] = Math.max(0, g);
             this.lightMapB[i] = Math.max(0, b);
         }
     }

    /** Main calculation entry point */
    calculateLighting() {
        // Use injected controls or config
        if (!this.controlsRef.getIsLightSourcesEnabled()) { // TODO: Replace with config check?
            this.clearLightMap(); // Reset to ambient if disabled
            return;
        }

        const startTime = performance.now();

        // 1. Fade the *previous* frame's light map
        this.fadeLightMap();

        // 2. Clear the temporary map where *new* light will be accumulated
        this.clearTempLightMap();

        // 3. Clear debug info
        if (this.config.debugDrawRays) {
            this.debugRays = [];
        }

        // 4. Process light sources
        this.activePointSources = Array.from(this.lightSourcePoints); // Cache sources for this frame
        for (const source of this.activePointSources) {
            if (source.isDead) { // Handle points being removed
                this.removeLightSourcePoint(source);
                continue;
            }
            this.processLightSource(source);
        }

        // 5. Finalize: Combine temp map (new light) with faded map, apply ambient, clamp.
        this.finalizeLightMap();

        const endTime = performance.now();
        // console.log(`Lighting calculated in ${endTime - startTime} ms`);
    }

    // --- Ray Casting Logic ---

    private getSourceProperties(source: TPoint): { color: TColor, intensity: number } {
        let baseIntensity = 1.0;
        let baseColor: TColor = { r: 1, g: 1, b: 1 }; // Default white

        if (typeof source.data.lightIntensity === 'number') {
            baseIntensity = source.data.lightIntensity;
        }
        // Allow color override on source point data
        if (source.data.lightColor && typeof source.data.lightColor === 'object') {
             // Basic validation
             if(typeof source.data.lightColor.r === 'number' &&
                typeof source.data.lightColor.g === 'number' &&
                typeof source.data.lightColor.b === 'number') {
                 baseColor = source.data.lightColor as TColor;
             }
        } else if (source.type === EPointType.Fire) {
             baseColor = {r: 1.0, g: 0.5, b: 0.1}; // Default fire color
        } else if (source.type === EPointType.IceFire) {
             baseColor = {r: 0.1, g: 0.5, b: 1.0}; // Default ice fire color
        }
        // Apply flickering, etc. here if needed
        // baseIntensity *= (1 + Math.sin(Date.now() * 0.01) * 0.1); // Example flicker

        return { color: multiplyColor(baseColor, baseIntensity), intensity: baseIntensity };
    }

    // Generate directions (can be cached or made more sophisticated)
    private getDirections(amount: number): { x: number, y: number }[] {
        const directions: { x: number, y: number }[] = [];
        const initialAngle = random() * 2 * Math.PI; // Random start angle
        for (let i = 0; i < amount; i++) {
            const angle = ((i / amount) * 2 * Math.PI) + initialAngle;
            directions.push({ x: Math.cos(angle), y: Math.sin(angle) });
        }
        return directions;
    }

    private processLightSource(source: TPoint) {
        const { color, intensity } = this.getSourceProperties(source);
        const sourceX = source.coordinates.x;
        const sourceY = source.coordinates.y;

        // Add source's own light/emissivity directly to temp map
        const material = getMaterialProperties(source.type);
        let sourceLight = color;
        if (typeof material.emissivity === 'object') {
             sourceLight = addColors(sourceLight, material.emissivity);
        } else if (typeof material.emissivity === 'number' && material.emissivity > 0) {
             sourceLight = addColors(sourceLight, {r: material.emissivity, g: material.emissivity, b: material.emissivity });
        }
        this.setTempLight(sourceX, sourceY, sourceLight);

        // Cast initial rays
        const directions = this.getDirections(this.config.raysPerSource);
        for (const dir of directions) {
            this.castRay(
                sourceX, sourceY, // Start position
                dir.x, dir.y,     // Initial direction
                color,            // Initial color/intensity
                0,                // Initial distance
                0,                // Initial bounce depth
                getMaterialProperties(EPointType.Void).refractiveIndex // Starting medium IOR (assume air/void)
            );
        }
    }

    // --- The Core Ray Casting Method (Recursive) ---
    private castRay(
        startX: number, startY: number,
        dx: number, dy: number,
        currentColor: TColor,
        distanceTravelled: number,
        bounceDepth: number,
        currentIOR: number // Index of Refraction of the medium the ray is currently in
    ) {
        const startIntensity = colorIntensity(currentColor);
        if (bounceDepth > this.config.maxBounces || startIntensity < 0.01 || distanceTravelled >= this.config.maxDistance) {
            return; // Stop recursion/casting
        }

        const rayStartCoords = { x: startX, y: startY };
        let rayEndCoords = rayStartCoords; // Track endpoint for debug

        if (this.config.useBresenham) {
             // --- Bresenham Line Algorithm Implementation ---
             // (More accurate grid cell traversal)
             let x0 = Math.round(startX);
             let y0 = Math.round(startY);
             // Calculate endpoint based on max distance for the algorithm setup
             const farX = startX + dx * this.config.maxDistance;
             const farY = startY + dy * this.config.maxDistance;
             let x1 = Math.round(farX);
             let y1 = Math.round(farY);

             const deltaX = Math.abs(x1 - x0);
             const deltaY = -Math.abs(y1 - y0);
             const sx = x0 < x1 ? 1 : -1;
             const sy = y0 < y1 ? 1 : -1;
             let err = deltaX + deltaY;

             let currentDistanceInRay = distanceTravelled;
             let currentRayColor = { ...currentColor };

             while (true) {
                 // Process current cell (x0, y0)
                 const cellIntensity = colorIntensity(currentRayColor);
                 if (cellIntensity < 0.01 || currentDistanceInRay >= this.config.maxDistance) {
                     rayEndCoords = { x: x0, y: y0 }; // Approximate end
                     break;
                 }

                 // Set light in the current cell (only if not the very start of a non-emitted ray)
                 if (x0 !== Math.round(startX) || y0 !== Math.round(startY) || bounceDepth === 0) {
                    this.setTempLight(x0, y0, currentRayColor);
                 }


                 // Check for interaction with a point in this cell
                 const point = this.pointsRef.getPointByCoordinates({ x: x0, y: y0 });
                 if (point && (x0 !== Math.round(startX) || y0 !== Math.round(startY))) // Don't interact with starting point immediately
                 {
                     const material = getMaterialProperties(point.type);
                     const hitResult = this.handleIntersection(
                         { x: x0, y: y0 }, // Hit position (center of cell approx)
                         point, material,
                         { x: dx, y: dy }, // Ray direction
                         currentRayColor,
                         currentDistanceInRay, bounceDepth, currentIOR
                     );

                     // Update color based on transmission through the point
                     currentRayColor = hitResult.transmittedColor;

                     if (!hitResult.didTransmit) {
                         rayEndCoords = { x: x0, y: y0 };
                         break; // Ray fully absorbed or reflected/refracted
                     }
                     // Update IOR if needed based on hitResult (if ray continues through)
                     // currentIOR = material.refractiveIndex; // Ray is now inside this material
                 }

                  // --- Bresenham Step ---
                  if (x0 === x1 && y0 === y1) {
                      rayEndCoords = { x: x0, y: y0 };
                      break; // Reached target (max distance)
                  }
                  const e2 = 2 * err;
                  let moved = false;
                  if (e2 >= deltaY) { // Step X
                      if (x0 === x1) break; // Prevent infinite loop if error accumulates weirdly
                      err += deltaY;
                      x0 += sx;
                      moved = true;
                  }
                  if (e2 <= deltaX) { // Step Y
                      if (y0 === y1) break;
                      err += deltaX;
                      y0 += sy;
                      moved = true;
                  }

                  // Distance increases roughly by 1 for cardinal, 1.4 for diagonal - use actual segment length for better accuracy?
                  // For simplicity, approximate distance:
                   currentDistanceInRay += 1; // Adjust if diagonal step was taken? sqrt(dx^2 + dy^2) is more accurate but slower.
                   // Apply decay based on distance
                   currentRayColor = multiplyColor(currentRayColor, this.config.defaultDecayFactor); // Apply decay *after* interaction? Before? Affects result. Let's do after.

                   // Apply scattering loss
                   // currentRayColor = multiplyColor(currentRayColor, (1.0 - mat_at_x0_y0.scattering));
             }

        } else {
             // --- Simple Linear Stepping (Original Fallback) ---
             let currentX = startX;
             let currentY = startY;
             let currentRayColor = { ...currentColor };
             let currentDistanceInRay = distanceTravelled;

             while (colorIntensity(currentRayColor) > 0.01 && currentDistanceInRay < this.config.maxDistance) {
                 currentX += dx;
                 currentY += dy;
                 currentDistanceInRay += 1; // Simple distance increment

                 const gridX = Math.round(currentX);
                 const gridY = Math.round(currentY);

                 this.setTempLight(gridX, gridY, currentRayColor);

                 const point = this.pointsRef.getPointByCoordinates({ x: gridX, y: gridY });
                 if (point) {
                     const material = getMaterialProperties(point.type);
                     const hitResult = this.handleIntersection(
                         { x: gridX, y: gridY }, point, material,
                         { x: dx, y: dy }, currentRayColor,
                         currentDistanceInRay, bounceDepth, currentIOR
                     );
                     currentRayColor = hitResult.transmittedColor;
                     if (!hitResult.didTransmit) {
                          rayEndCoords = { x: currentX, y: currentY };
                          break;
                     }
                      // currentIOR = material.refractiveIndex;
                 }

                 // Decay
                 currentRayColor = multiplyColor(currentRayColor, this.config.defaultDecayFactor);
                 // Scattering loss etc.
             }
              rayEndCoords = { x: currentX, y: currentY }; // Approx end
        }

        // --- Store Debug Ray ---
        if (this.config.debugDrawRays) {
            this.debugRays.push({
                from: rayStartCoords,
                to: rayEndCoords, // Store where the ray actually stopped
                color: currentColor, // Initial color for this segment
                intensity: startIntensity,
                type: bounceDepth === 0 ? 'emit' : ( /* determine reflect/refract based on how it was called */ 'transmit'),
                depth: bounceDepth,
            });
        }
    }


    // Handles interaction at a point, returns remaining light, and spawns new rays
    private handleIntersection(
        hitCoords: TCoordinates,
        hitPoint: TPoint,
        material: MaterialProperties,
        rayDir: { x: number, y: number },
        incomingColor: TColor,
        distanceTravelled: number,
        bounceDepth: number,
        mediumIOR: number // IOR of medium ray arrived from
    ): { transmittedColor: TColor, didTransmit: boolean } {

        const intensity = colorIntensity(incomingColor);
        if (intensity < 0.01) return { transmittedColor: { r: 0, g: 0, b: 0 }, didTransmit: false };

        let totalOpacity = 1.0;
        let opacityColor: TColor = {r: 1, g: 1, b: 1};
        if(typeof material.opacity === 'number') {
            totalOpacity = material.opacity;
            opacityColor = { r: totalOpacity, g: totalOpacity, b: totalOpacity };
        } else {
            opacityColor = material.opacity;
            totalOpacity = colorIntensity(opacityColor); // Average opacity
        }

        const transmittedLight = multiplyColor(incomingColor, opacityColor); // Light passing through
        const absorbedLight = multiplyColor(incomingColor, { r: 1-opacityColor.r, g: 1-opacityColor.g, b: 1-opacityColor.b }); // Light absorbed/reflected/refracted

        // Calculate Normal (approximate based on entry point relative to center - needs improvement)
        // A better approach requires knowing the exact intersection point on the cell boundary.
        // Simple approx: if ray came from left, normal is right (+1, 0), etc.
        const approxNormal = normalize(hitCoords.x - (hitCoords.x - rayDir.x), hitCoords.y - (hitCoords.y - rayDir.y)); // Vector from previous step to current

        // --- Reflection ---
        if (this.config.enableReflection && bounceDepth < this.config.maxBounces) {
            let reflectionColor = { r: 0, g: 0, b: 0 };
            if (typeof material.reflectivity === 'number' && material.reflectivity > 0) {
                reflectionColor = multiplyColor(absorbedLight, material.reflectivity); // Reflect a portion of non-transmitted light
            } else if (typeof material.reflectivity === 'object') {
                 reflectionColor = multiplyColor(absorbedLight, material.reflectivity);
            }

            if (colorIntensity(reflectionColor) > 0.01) {
                // Calculate reflection direction (use roughness later for blurry reflections)
                const reflectDir = reflect(rayDir, approxNormal);
                this.castRay(
                    hitCoords.x, hitCoords.y, // Start new ray from hit point
                    reflectDir.x, reflectDir.y,
                    reflectionColor,
                    distanceTravelled, // Reset distance? Or continue? Continue seems more correct for path length.
                    bounceDepth + 1,
                    mediumIOR // Reflection stays in the same medium
                );
            }
        }

        // --- Refraction ---
        if (this.config.enableRefraction && totalOpacity > 0.01 && material.refractiveIndex !== mediumIOR && bounceDepth < this.config.maxBounces) {
            const nextIOR = material.refractiveIndex;
            const refractDir = refract(rayDir, approxNormal, mediumIOR, nextIOR);

            if (refractDir) { // Refraction occurred (no TIR)
                // Refracted ray starts inside the new medium
                 // Reduce transmitted light further by absorbance maybe?
                this.castRay(
                    hitCoords.x, hitCoords.y, // Start slightly inside? Or from boundary? Start from hit point for now.
                    refractDir.x, refractDir.y,
                    transmittedLight, // The light that *would* have gone straight continues, but bent
                    distanceTravelled,
                    bounceDepth + 1,
                    nextIOR // Ray is now in the new medium
                );
                // If refraction happens, the original ray effectively stops here,
                // replaced by the refracted ray (and potentially a reflected one).
                 return { transmittedColor: { r: 0, g: 0, b: 0 }, didTransmit: false };

            } else { // Total Internal Reflection occurred
                // Convert all transmitted light to reflected light
                 if (this.config.enableReflection && bounceDepth < this.config.maxBounces) {
                     const reflectDir = reflect(rayDir, approxNormal);
                     this.castRay(
                         hitCoords.x, hitCoords.y,
                         reflectDir.x, reflectDir.y,
                         transmittedLight, // All transmitted light is now reflected
                         distanceTravelled,
                         bounceDepth + 1,
                         mediumIOR
                     );
                 }
                 return { transmittedColor: { r: 0, g: 0, b: 0 }, didTransmit: false };
            }
        }


        // If neither reflection nor refraction stopped the ray, return the remaining transmitted light
        const didTransmit = totalOpacity > 0.01; // Did *any* light get through?
        return { transmittedColor: didTransmit ? transmittedLight : { r: 0, g: 0, b: 0 }, didTransmit: didTransmit };
    }
}

// --- Example Usage (needs correct setup) ---
/*
const width = 200;
const height = 150;

// Mock Points and Controls for standalone testing
const MockPoints = {
    getPointByCoordinates: (coords: TCoordinates) => {
        // Implement simple lookup for testing if needed
        if (coords.x === 55 && coords.y === 75) return { type: EPointType.Glass, coordinates: coords, data: {} } as TPoint;
        if (coords.x > 100 && coords.x < 110 && coords.y > 70 && coords.y < 80) return { type: EPointType.Mirror, coordinates: coords, data: {} } as TPoint;
        return null;
    }
};
const MockControls = { getIsLightSourcesEnabled: () => true };

const lightSystem = new LightSystem({ gridWidth: width, gridHeight: height }, MockPoints, MockControls);

// Add a light source (replace with actual TPoint)
const source1: TPoint = {
    id: 'ls1',
    type: EPointType.LightSource,
    coordinates: { x: 50, y: 75 },
    prevCoordinates: { x: 50, y: 75 },
    isDead: false,
    data: {
        lightIntensity: 1.5,
        lightColor: { r: 1, g: 0.8, b: 0.5 } // Warm white
    }
};
lightSystem.addLightSourcePoint(source1);

const source2: TPoint = {
     id: 'ls2',
     type: EPointType.Fire, // Use built-in color
     coordinates: { x: 150, y: 75 },
     prevCoordinates: { x: 150, y: 75 },
     isDead: false,
     data: {
         lightIntensity: 1.0,
     }
 };
 lightSystem.addLightSourcePoint(source2);


// In your game loop:
function gameLoop() {
    // Update point positions, handle input etc.
    // ...

    // Calculate lighting
    lightSystem.calculateLighting();

    // Render the scene using the light map
    // const lightMap = lightSystem.getLightMapData();
    // for (let y = 0; y < height; y++) {
    //     for (let x = 0; x < width; x++) {
    //         const index = y * width + x;
    //         const color = { r: lightMap.r[index], g: lightMap.g[index], b: lightMap.b[index] };
    //         // Use this color to draw the cell at (x, y)
    //     }
    // }
    // Optionally draw debug rays: lightSystem.debugRays

    requestAnimationFrame(gameLoop);
}
// gameLoop();

*/
