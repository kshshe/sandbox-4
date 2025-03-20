import { CONFIG } from "./config";
import { Points, TPoint } from "./classes/points";
import { Controls } from "./classes/controls";
import { EPointType } from "./types";
import { isDev } from "./utils/isDev";
import { canvas } from "./canvas";
import { Connections } from "./classes/connections";
import { POINT_NAMES } from "./constants/pointNames";

export let hoveredPoint: TPoint | null = null;
export let hoveredCoordinates: { x: number, y: number } | null = null;
export let isDrawing = false;
export let drawingX = 0;
export let drawingY = 0;
let drawingInterval: NodeJS.Timeout | null = null;

const hoveredPointDescriptionElement = document.createElement('div');
hoveredPointDescriptionElement.classList.add('hovered-point-description');
hoveredPointDescriptionElement.classList.add('hidden');
document.body.appendChild(hoveredPointDescriptionElement);

const IGNORED_KEYS = ['temperature', 'speed', 'visualCoordinates', 'colorVariation', 'lastMoveOnIteration', 'wasDeleted'];

const renderDataPair = (key: string, value: unknown) => {
    if (IGNORED_KEYS.includes(key)) {
        return null;
    }
    if (typeof value === 'number') {
        return `${key}: ${value.toFixed(2)}`;
    }
    if (typeof value === 'boolean') {
        return `${key}: ${value ? 'Yes' : 'No'}`;
    }
    if (typeof value === 'object') {
        if (typeof value.x === 'number' && typeof value.y === 'number') {
            return `${key}: ${Math.round(value.x)}:${Math.round(value.y)}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
    }
    return `${key}: ${value}`;
}

const getDescription = (point: TPoint) => {
    return [
        `${point.coordinates.x}:${point.coordinates.y} ${POINT_NAMES[point.type] ?? point.type}`,
        `${Math.round(point.data.temperature)} °C`,
        `speed: ${Math.sqrt(point.speed.x ** 2 + point.speed.y ** 2).toFixed(2)}`,
        ...Object.entries(point.data).map(([key, value]) => renderDataPair(key, value)).filter(Boolean),
    ].join('<br>')
}

const updateHoveredPointDescription = () => {
    const brushSize = Controls.getBrushSize();
    hoveredPointDescriptionElement.classList.remove('hidden');
    const pointX = hoveredPoint?.coordinates.x
    const pointY = hoveredPoint?.coordinates.y
    const hoveredX = hoveredCoordinates?.x
    const hoveredY = hoveredCoordinates?.y
    if (pointX === hoveredX && pointY === hoveredY && typeof pointX === 'number' && typeof pointY === 'number') {
        hoveredPointDescriptionElement.style.transform = `translate(${pointX * CONFIG.pixelSize + 15 * brushSize}px, ${pointY * CONFIG.pixelSize - 10 * brushSize}px)`;
    }

    if (!hoveredPoint) {
        hoveredPointDescriptionElement.classList.add('hidden');
        return;
    }

    hoveredPointDescriptionElement.innerHTML = getDescription(hoveredPoint);
}

setInterval(updateHoveredPointDescription, 1000 / 20);
Controls.subscribe('brushSize', updateHoveredPointDescription);

// Temperature change amount per application
const HEAT_AMOUNT = 20;
const COOL_AMOUNT = -20;

export const addListeners = (element: HTMLElement, events: string[], callback: (e: Event) => void) => {
    events.forEach(event => {
        element.addEventListener(event, callback);
    });
};

export const getArea = (x: number, y: number) => {
    const brushSize = Controls.getBrushSize() - 1;
    const area: { x: number, y: number }[] = [];
    for (let i = -brushSize; i <= brushSize; i++) {
        for (let j = -brushSize; j <= brushSize; j++) {
            area.push({ x: x + i, y: y + j });
        }
    }

    return area;
};

const createConnection = (x: number, y: number, drawingType: EPointType) => {
    const startPoint = Controls.getConnectionStartPoint();
    const endPoint = { x, y };

    if (startPoint &&
        (startPoint.x !== endPoint.x || startPoint.y !== endPoint.y)) {
        // Add connection
        Connections.addConnection({
            from: startPoint,
            to: endPoint,
            type: drawingType === EPointType.Wire ? 'wire' : 'pipe',
            lastUsed: 0,
        });
        const pointOnStart = Points.getPointByCoordinates(startPoint);
        if (pointOnStart) {
            Points.markNeighboursAsUsed(pointOnStart);
        }
        const pointOnEnd = Points.getPointByCoordinates(endPoint);
        if (pointOnEnd) {
            Points.markNeighboursAsUsed(pointOnEnd);
        }
    }

    // Reset connection mode
    Controls.setIsConnectionMode(false);
    Controls.setConnectionStartPoint(null);
}

export const initInteractions = () => {
    addListeners(canvas, ['mousedown', 'touchstart'], (e) => {
        const drawingType = Controls.getDrawingType();
        e.preventDefault();
        const offsetX = (e as MouseEvent).offsetX ?? (e as TouchEvent).touches[0].clientX ?? 0;
        const offsetY = (e as MouseEvent).offsetY ?? (e as TouchEvent).touches[0].clientY ?? 0;
        const x = Math.floor(offsetX / CONFIG.pixelSize);
        const y = Math.floor(offsetY / CONFIG.pixelSize);

        // Handle connection drawing (wire/pipe)
        if (drawingType === EPointType.Wire || drawingType === EPointType.Pipe) {
            if (!Controls.getIsConnectionMode()) {
                Controls.setIsConnectionMode(true);
                Controls.setConnectionStartPoint({ x, y });
            } else {
                createConnection(x, y, drawingType);
            }
            return;
        }

        // Regular drawing
        isDrawing = true;
        drawingX = x;
        drawingY = y;
        hoveredCoordinates = { x, y };
        hoveredPoint = Points.getPointByCoordinates({ x, y }) || null;
        updateHoveredPointDescription();
        drawingInterval = setInterval(() => {
            const points = Points.getPoints();
            const neighboursAndSelf = getArea(0, 0);
            if (drawingType === 'eraser') {
                neighboursAndSelf.forEach(({ x, y }) => {
                    const pointOnThisPlace = Points.getPointByCoordinates({
                        x: drawingX + x,
                        y: drawingY + y
                    });
                    if (pointOnThisPlace) {
                        Points.deletePoint(pointOnThisPlace);
                    }
                    const connections = Connections.getConnectionFromOrTo({ x: drawingX + x, y: drawingY + y });
                    for (const connection of connections) {
                        Connections.removeConnection(connection);
                    }
                });
                return;
            }

            if (drawingType === 'heatTool' || drawingType === 'coolTool') {
                const temperatureChange = drawingType === 'heatTool' ? HEAT_AMOUNT : COOL_AMOUNT;
                neighboursAndSelf.forEach(({ x, y }) => {
                    const pointOnThisPlace = Points.getPointByCoordinates({
                        x: drawingX + x,
                        y: drawingY + y
                    });
                    if (pointOnThisPlace) {
                        // Initialize temperature data if it doesn't exist
                        if (!pointOnThisPlace.data.temperature) {
                            pointOnThisPlace.data.temperature = Controls.getBaseTemperature();
                        }
                        // Apply temperature change
                        pointOnThisPlace.data.temperature += temperatureChange;
                        // Mark the point as used so it gets processed in the simulation
                        Points.markPointAsUsed(pointOnThisPlace);
                    }
                });
                return;
            }

            neighboursAndSelf.forEach(({ x, y }) => {
                const pointThere = points.find(point => point.coordinates.x === drawingX + x && point.coordinates.y === drawingY + y);
                if (pointThere) {
                    if (!isDev) {
                        return;
                    }
                }
                return Points.addPoint({
                    coordinates: {
                        x: drawingX + x,
                        y: drawingY + y
                    },
                    type: drawingType as EPointType,
                    speed: { x: 0, y: 0 },
                });
            });
        }, 1000 / 200);
    });

    // Add ESC key handler to cancel connection mode
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && Controls.getIsConnectionMode()) {
            Controls.setIsConnectionMode(false);
            Controls.setConnectionStartPoint(null);
        }
    });

    addListeners(canvas, [
        'mouseup',
        'touchend',
        'touchcancel',
        'mouseout',
    ], (e) => {
        const drawingType = Controls.getDrawingType();
        if (drawingType === EPointType.Wire || drawingType === EPointType.Pipe) {
            if (Controls.getIsConnectionMode()) {
                createConnection(drawingX, drawingY, drawingType);
            }
        }

        isDrawing = false;
        if (drawingInterval) {
            clearInterval(drawingInterval);
        }
        hoveredCoordinates = null;
        hoveredPoint = null;
        updateHoveredPointDescription();
    });

    addListeners(canvas, ['mousemove', 'touchmove'], (e) => {
        e.preventDefault();
        const offsetX = (e as MouseEvent).offsetX ?? (e as TouchEvent).touches[0].clientX ?? 0;
        const offsetY = (e as MouseEvent).offsetY ?? (e as TouchEvent).touches[0].clientY ?? 0;
        const x = Math.floor(offsetX / CONFIG.pixelSize);
        const y = Math.floor(offsetY / CONFIG.pixelSize);
        drawingX = x;
        drawingY = y;
        hoveredCoordinates = { x, y };
        hoveredPoint = Points.getPointByCoordinates({ x, y }) || null;
        updateHoveredPointDescription();
    });
}; 