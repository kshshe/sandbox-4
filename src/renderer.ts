import { CONFIG, POINTS_COLORS, getVariedColor } from "./config";
import { Points } from "./classes/points";
import { Controls } from "./classes/controls";
import { Bounds } from "./classes/bounds";
import { TemperatureGrid } from "./classes/temperatureGrid";
import { Stats } from "./classes/stats";
import { ctx } from "./canvas";
import { drawingX, drawingY, hoveredCoordinates, isDrawing } from "./interactions";
import { EPointType } from "./types";
import { Storage } from "./classes/storage";
import { Connections } from "./classes/connections";
import { WindVectors } from "./classes/windVectors";
import { POINT_NAMES } from "./constants/pointNames";
import { LightSystem } from "./classes/lightSystem";
import { __fromBufferCount, __fromRandomCount } from "./utils/random";

const previouslyUsedPixels: Set<string> = new Set();
let frame = 0;
let lastFrameTime = 0;
let wasFaviconUpdated = false;

export const drawPoints = () => {
    const debugMode = Controls.getDebugMode();
    const points = Points.getPoints();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Calculate time since last frame for smooth interpolation
    const currentTime = performance.now();
    const timeElapsed = (currentTime - lastFrameTime) * Controls.getSimulationSpeed();
    lastFrameTime = currentTime;

    // Update visual coordinates with interpolation factor if smooth movement is enabled
    const isSmoothMovementEnabled = Controls.getIsSmoothMovementEnabled();
    if (isSmoothMovementEnabled) {
        Points.updateVisualCoordinates(CONFIG.movementSmoothness * timeElapsed);
    }

    const iteration = Storage.get('iteration', 0)

    previouslyUsedPixels.clear();
    points.forEach(point => {
        if (!point.visualCoordinates) {
            point.visualCoordinates = { ...point.coordinates };
        }

        // If smooth movement is disabled, set visual coordinates to match actual coordinates
        if (!isSmoothMovementEnabled) {
            point.visualCoordinates.x = point.coordinates.x;
            point.visualCoordinates.y = point.coordinates.y;
        }

        const key = `${Math.round(point.visualCoordinates.x)}:${Math.round(point.visualCoordinates.y)}`;
        const thereIsPointAlready = previouslyUsedPixels.has(key);

        // Get base color
        let baseColor;
        if (point.colorVariation !== undefined) {
            baseColor = getVariedColor(point.type, point.colorVariation * CONFIG.colorVariation);
            // Convert to RGB object
            const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(baseColor);
            if (result) {
                baseColor = { 
                    r: parseInt(result[1]), 
                    g: parseInt(result[2]), 
                    b: parseInt(result[3]) 
                };
            } else {
                baseColor = POINTS_COLORS[point.type];
            }
        } else {
            baseColor = POINTS_COLORS[point.type];
        }

        if (debugMode && thereIsPointAlready) {
            baseColor = { r: 255, g: 0, b: 0 }; // Red for overlapping points in debug mode
            previouslyUsedPixels.add(key);
        }

        // Apply lighting effect to color
        let finalColor = { ...baseColor };
        
        // Get light intensity at this position
        const lightIntensity = LightSystem.getLightIntensity(
            point.coordinates.x,
            point.coordinates.y,
            true
        );

        // Only apply lighting if the point isn't a light source itself
        if (lightIntensity > 0 && !point.data.isLightSource) {
            // Adjust RGB values based on light intensity
            finalColor = {
                r: Math.min(255, baseColor.r + (255 - baseColor.r) * lightIntensity * 0.8),
                g: Math.min(255, baseColor.g + (255 - baseColor.g) * lightIntensity * 0.8),
                b: Math.min(255, baseColor.b + (255 - baseColor.b) * lightIntensity * 0.8)
            };
        }
        
        ctx.fillStyle = `rgb(${Math.round(finalColor.r)}, ${Math.round(finalColor.g)}, ${Math.round(finalColor.b)})`;

        // Use visual coordinates for rendering
        ctx.fillRect(
            point.visualCoordinates.x * CONFIG.pixelSize,
            point.visualCoordinates.y * CONFIG.pixelSize,
            CONFIG.pixelSize,
            CONFIG.pixelSize
        );

        if (debugMode) {
            const speedLength = Math.sqrt(point.speed.x ** 2 + point.speed.y ** 2);
            if (speedLength > 0.1) {
                const centerX = point.visualCoordinates.x * CONFIG.pixelSize + CONFIG.pixelSize / 2;
                const centerY = point.visualCoordinates.y * CONFIG.pixelSize + CONFIG.pixelSize / 2;
                const speedX = point.speed.x * 50;
                const speedY = point.speed.y * 50;
                ctx.strokeStyle = 'red';
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + speedX, centerY + speedY);
                ctx.stroke();
            }
        }

        if (debugMode && point.data.directionToGround) {
            const centerX = point.visualCoordinates.x * CONFIG.pixelSize + CONFIG.pixelSize / 2;
            const centerY = point.visualCoordinates.y * CONFIG.pixelSize + CONFIG.pixelSize / 2;
            const arrowSize = 5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + point.data.directionToGround.x * arrowSize, centerY + point.data.directionToGround.y * arrowSize);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.stroke();
        }

        if (point.data.lastCloneStep) {
            const stepsSinceClone = iteration - point.data.lastCloneStep;
            if (stepsSinceClone < 10) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, stepsSinceClone / 10)})`;
                ctx.fillRect(point.visualCoordinates.x * CONFIG.pixelSize, point.visualCoordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
            }
        }

        if (point.data.charge) {
            // yellowish color depending on charge value
            const chargeColor = `rgba(255, 255, 0, ${Math.min(1, Math.max(0, point.data.charge / 10))})`;
            ctx.fillStyle = chargeColor;
            ctx.fillRect(point.visualCoordinates.x * CONFIG.pixelSize, point.visualCoordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
        }

        if (point.data.carriedPoint) {
            // round dot in the center of the point
            const color = `rgba(${POINTS_COLORS[point.data.carriedPoint.type].r}, ${POINTS_COLORS[point.data.carriedPoint.type].g}, ${POINTS_COLORS[point.data.carriedPoint.type].b}, 1)`;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(point.visualCoordinates.x * CONFIG.pixelSize + CONFIG.pixelSize / 2, point.visualCoordinates.y * CONFIG.pixelSize + CONFIG.pixelSize / 2, CONFIG.pixelSize / 3, 0, 2 * Math.PI);
            ctx.fill();
        }

        if (point.type === EPointType.Metal && point.data.temperature > 0) {
            // add a red overlay depending on temperature
            const temperatureColor = `rgba(255, 0, 0, ${Math.min(1, Math.max(0, (point.data.temperature - 20) / 300))})`;
            ctx.fillStyle = temperatureColor;
            ctx.fillRect(point.visualCoordinates.x * CONFIG.pixelSize, point.visualCoordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
        }

        if (debugMode) {
            if (Points.isUnused(point)) {
                // draw a cross on unused points
                ctx.beginPath();
                ctx.moveTo(point.visualCoordinates.x * CONFIG.pixelSize, point.visualCoordinates.y * CONFIG.pixelSize);
                ctx.lineTo((point.visualCoordinates.x + 1) * CONFIG.pixelSize, (point.visualCoordinates.y + 1) * CONFIG.pixelSize);
                ctx.moveTo((point.visualCoordinates.x + 1) * CONFIG.pixelSize, point.visualCoordinates.y * CONFIG.pixelSize);
                ctx.lineTo(point.visualCoordinates.x * CONFIG.pixelSize, (point.visualCoordinates.y + 1) * CONFIG.pixelSize);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.stroke();
            }
        }
    });

    if (debugMode) {
        const bounds = Bounds.getBounds();
        const minTemperature = TemperatureGrid.getMinTemperature()
        const maxTemperature = TemperatureGrid.getMaxTemperature()
        for (let x = bounds.left; x <= bounds.right; x++) {
            for (let y = bounds.top; y <= bounds.bottom; y++) {
                const temperature = TemperatureGrid.getTemperatureOnPoint(x, y);
                const temperatureColor = temperature > 0
                    ? `rgba(${Math.round(255 * temperature / maxTemperature)}, 0, 0, 0.3)`
                    : `rgba(0, 0, ${Math.round(255 * -temperature / minTemperature)}, 0.3)`;
                ctx.fillStyle = temperatureColor;
                ctx.fillRect(x * CONFIG.pixelSize, y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
            }
        }
    }

    // draw a rectangle around the drawing area (drawingX and drawingY variables)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    const brushSize = Controls.getBrushSize();
    ctx.strokeRect(
        (drawingX + 1) * CONFIG.pixelSize - brushSize * CONFIG.pixelSize,
        (drawingY + 1) * CONFIG.pixelSize - brushSize * CONFIG.pixelSize,
        (brushSize * 2 - 1) * CONFIG.pixelSize,
        (brushSize * 2 - 1) * CONFIG.pixelSize
    );

    updateStats();
    drawConnections();
    drawWindVectors();
    drawRays();
    if (points.length && (frame % 200 === 0 || !wasFaviconUpdated)) {
        updateFavicon();
        wasFaviconUpdated = true;
    }

    requestAnimationFrame(drawPoints);
};

const limitLineLength = (line: string, maxLength: number) => {
    return line.length > maxLength ? line.substring(0, maxLength) + '...' : line;
}

const drawRays = () => {
    if (!Controls.getDebugMode()) {
        // draw gradients
        Points.getPoints().forEach(point => {
            if (point.data.isLightSource) {
                const lightIntensity = point.data.lightIntensity;
                if (lightIntensity > 0) {
                    // lightIntensity is radius of the gradient
                    // circular gradient, POINTS_COLORS[EPointType.LightSource] in the center to transparent 
                    const x = point.coordinates.x * CONFIG.pixelSize;
                    const y = point.coordinates.y * CONFIG.pixelSize;
                    const radius = lightIntensity * 10 * CONFIG.pixelSize;
                    
                    // Create a radial gradient
                    const gradient = ctx.createRadialGradient(
                        x, y, 0,
                        x, y, radius
                    );
                    
                    // Add color stops
                    const lightColor = POINTS_COLORS[point.type];
                    gradient.addColorStop(0, `rgba(${lightColor.r}, ${lightColor.g}, ${lightColor.b}, 0.03)`);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    // Fill with gradient
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        })
        return;
    }
    LightSystem.lastRays.forEach(({
        fromX,
        fromY,
        toX,
        toY,
    }) => {
        ctx.beginPath();
        ctx.moveTo(fromX * CONFIG.pixelSize, fromY * CONFIG.pixelSize);
        ctx.lineTo(toX * CONFIG.pixelSize, toY * CONFIG.pixelSize);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
    })
}

const updateStats = () => {
    const debugMode = Controls.getDebugMode();
    const iteration = Storage.get('iteration', 0)
    const stats = document.querySelector('.stats') as HTMLDivElement;
    if (frame++ % 20 === 0) {
        const pointsGroupedByType = Points.getPoints().reduce((acc, point) => {
            acc[point.type] = (acc[point.type] || 0) + 1;
            return acc;
        }, {} as Record<EPointType, number>)
        stats.innerHTML = [
            debugMode && `Cache: ${WindVectors.getCacheStats().hits} hits, ${WindVectors.getCacheStats().misses} misses`,
            debugMode && `Random: ${__fromRandomCount()} from random, ${__fromBufferCount()} from buffer`,
            process.env.VERCEL_GIT_COMMIT_MESSAGE && `Commit: ${limitLineLength(process.env.VERCEL_GIT_COMMIT_MESSAGE, 20)}`,
            `Frame: ${(Math.round(Stats.data.elapsedTime * 10) / 10).toFixed(1)} ms`,
            `Iteration: ${iteration}`,
            Object.entries(pointsGroupedByType)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => `${POINT_NAMES[type] || type}: ${count}`)
                .join('<br>'),
        ]
            .filter(Boolean)
            .join('<br>');
    }
};

export const drawConnections = () => {
    const connections = Connections.getAllConnections();

    const iteration = Storage.get('iteration', 0)
    connections.forEach(connection => {
        let opacity = 0.2;
        if (connection.lastUsed && iteration - connection.lastUsed < 30) {
            // more visible if used recently
            opacity = 1 - (iteration - connection.lastUsed) / 30;
        }

        const startX = connection.from.x * CONFIG.pixelSize + CONFIG.pixelSize / 2;
        const startY = connection.from.y * CONFIG.pixelSize + CONFIG.pixelSize / 2;
        const endX = connection.to.x * CONFIG.pixelSize + CONFIG.pixelSize / 2;
        const endY = connection.to.y * CONFIG.pixelSize + CONFIG.pixelSize / 2;

        if (connection.type === 'wire') {
            // Draw a steppy line for wires (horizontal then vertical)
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        } else { // pipe
            // Draw pipe with thickness and rounded caps
            const midX = (startX + endX) / 2;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(midX, startY);
            ctx.lineTo(midX, endY);
            ctx.lineTo(endX, endY);

            ctx.strokeStyle = `rgba(0, 0, 255, ${opacity})`;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Add a lighter color in the middle to give a 3D pipe effect
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(midX, startY);
            ctx.lineTo(midX, endY);
            ctx.lineTo(endX, endY);

            ctx.strokeStyle = `rgba(100, 180, 255, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Reset line cap and join
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'miter';
        }
    });

    // Draw the connection in progress if in connection mode
    if (Controls.getIsConnectionMode() && Controls.getConnectionStartPoint()) {
        const startPoint = Controls.getConnectionStartPoint()!;
        const hoverPoint = hoveredCoordinates || { x: 0, y: 0 };

        const startX = startPoint.x * CONFIG.pixelSize + CONFIG.pixelSize / 2;
        const startY = startPoint.y * CONFIG.pixelSize + CONFIG.pixelSize / 2;
        const endX = hoverPoint.x * CONFIG.pixelSize + CONFIG.pixelSize / 2;
        const endY = hoverPoint.y * CONFIG.pixelSize + CONFIG.pixelSize / 2;

        const drawingType = Controls.getDrawingType();
        ctx.setLineDash([5, 5]); // Dashed line for in-progress connections

        if (drawingType === EPointType.Wire) {
            // Steppy preview for wire
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Steppy preview for pipe
            const midX = (startX + endX) / 2;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(midX, startY);
            ctx.lineTo(midX, endY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Reset line cap and join
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'miter';
        }

        ctx.setLineDash([]); // Reset line style
    }
};

let faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
if (!faviconElement) {
    faviconElement = document.createElement('link');
    faviconElement.rel = 'icon';
    document.head.appendChild(faviconElement);
}

const updateFavicon = () => {
    // Create a temporary canvas for the favicon
    const faviconCanvas = document.createElement('canvas');
    const faviconSize = 32; // Standard favicon size
    faviconCanvas.width = faviconSize;
    faviconCanvas.height = faviconSize;
    
    // Get the context for drawing on the favicon canvas
    const faviconCtx = faviconCanvas.getContext('2d');
    
    if (!faviconCtx) {
        return;
    }
    
    // Sample the main canvas and draw it to the favicon canvas
    faviconCtx.drawImage(
        ctx.canvas, 
        0, 
        0, 
        ctx.canvas.width, 
        ctx.canvas.height, 
        0, 
        0, 
        faviconSize, 
        faviconSize
    );
    
    // Convert the favicon canvas to a data URL (PNG format)
    const dataUrl = faviconCanvas.toDataURL('image/png');
    
    faviconElement.href = dataUrl;
}

const drawWindVectors = () => {
    if (isDrawing) {
        return;
    }
    if (!Controls.getDebugMode()) {
        return;
    }
    const bounds = Bounds.getBounds();
    const vectorsCount = WindVectors.getVectorsCount();
    if (vectorsCount > 500 || !vectorsCount) {
        return;
    }
    for (let x = bounds.left; x <= bounds.right; x++) {
        for (let y = bounds.top; y <= bounds.bottom; y++) {
            const vectors = WindVectors.getVectorsAffectingPoint({ x, y });
            vectors.forEach(vector => {
                const startX = x * CONFIG.pixelSize + CONFIG.pixelSize / 2;
                const startY = y * CONFIG.pixelSize + CONFIG.pixelSize / 2;
                const endX = startX + vector.x * vector.strength * 5;
                const endY = startY + vector.y * vector.strength * 5;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
        }
    }
}