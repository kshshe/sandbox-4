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
let drawingStartPoint: { x: number, y: number } | null = null;
let isShiftPressed = false;
let isHorizontalMode: boolean | null = null;

const hoveredPointDescriptionElement = document.createElement('div');
hoveredPointDescriptionElement.classList.add('hovered-point-description');
hoveredPointDescriptionElement.classList.add('hidden');
document.body.appendChild(hoveredPointDescriptionElement);

const IGNORED_KEYS = ['temperature', 'speed', 'visualCoordinates', 'wasDeleted', 'coordinates'];

const getVectorDiv = (vector: { x: number, y: number }) => {
    const normalizedVector = {
        x: vector.x / Math.sqrt(vector.x ** 2 + vector.y ** 2),
        y: vector.y / Math.sqrt(vector.x ** 2 + vector.y ** 2),
    }
    if (!normalizedVector.x && !normalizedVector.y) {
        return `<div class="vector-container">
            <div class="vector-dot"></div>
        </div>`;
    }
    return `<div class="vector-container">
        <div class="vector-arrow" style="transform: rotate(${Math.atan2(normalizedVector.y, normalizedVector.x) * 180 / Math.PI}deg);"></div>
    </div>`
}

const renderDataPair = (key: string, value: unknown) => {
    if (IGNORED_KEYS.includes(key)) {
        return null;
    }
    if (value === null) {
        return `${key}: empty`;
    }
    if (typeof value === 'number') {
        return `${key}: ${Math.round(value * 100) / 100}`;
    }
    if (typeof value === 'boolean') {
        return `${key}: ${value ? 'Yes' : 'No'}`;
    }
    if (typeof value === 'object') {
        const vectorValue = value as { x: number, y: number };
        if (typeof vectorValue.x === 'number' && typeof vectorValue.y === 'number') {
            return `${key}: ${getVectorDiv(vectorValue)}`;
        }
        const keyValuePairs = Object.entries(value).map(([key, value]) => renderDataPair(key, value)).filter(Boolean).map(pair => `&nbsp;&nbsp;&nbsp;&nbsp;${pair}`).join('<br>');
        if (!keyValuePairs.trim()) {
            return null;
        }
        return `${key}:<br>${keyValuePairs}`
    }
    if (typeof value === 'string') {
        return `${key}: ${value}`;
    }
    if (Array.isArray(value)) {
        return value.map(item => renderDataPair(key, item)).filter(Boolean).join('<br>');
    }
    return `${key}: ${value}`;
}

const getDescription = (point: TPoint) => {
    return [
        `${point.coordinates.x}:${point.coordinates.y} ${POINT_NAMES[point.type] ?? point.type} #${point.id}`,
        `${Math.round(point.data.temperature)} °C`,
        `speed: ${Math.round(Math.sqrt(point.speed.x ** 2 + point.speed.y ** 2) * 100) / 100} ${getVectorDiv(point.speed)}`,
        ...Object.entries(point.data).map(([key, value]) => renderDataPair(key, value)).filter(Boolean),
    ].join('<br>')
}

const updateHoveredPointDescription = () => {
    const brushSize = Controls.getBrushSize();
    const pointX = hoveredPoint?.coordinates.x
    const pointY = hoveredPoint?.coordinates.y
    const hoveredX = hoveredCoordinates?.x
    const hoveredY = hoveredCoordinates?.y
    if (hoveredPoint && pointX === hoveredX && pointY === hoveredY && typeof pointX === 'number' && typeof pointY === 'number') {
        hoveredPointDescriptionElement.classList.remove('hidden');
        hoveredPointDescriptionElement.innerHTML = getDescription(hoveredPoint);
        hoveredPointDescriptionElement.style.transform = `translate(${pointX * CONFIG.pixelSize + 15 * brushSize}px, ${pointY * CONFIG.pixelSize - 10 * brushSize}px)`;
    } else {
        hoveredPointDescriptionElement.classList.add('hidden');
        return;
    }

}

setInterval(updateHoveredPointDescription, 1000 / 20);
Controls.subscribe('brushSize', updateHoveredPointDescription);

// Temperature change amount per application
const HEAT_AMOUNT = 8;
const COOL_AMOUNT = -8;

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

        drawingStartPoint = { x, y };
        drawingX = x;
        drawingY = y;

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
                Points.addPoint({
                    coordinates: {
                        x: drawingX + x,
                        y: drawingY + y
                    },
                    type: drawingType as EPointType,
                    speed: { x: 0, y: 0 },
                    data: {...Controls.getDrawingData()},
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
        if (e.key === "Shift") {
            isShiftPressed = true;
        }
    });

    window.addEventListener("keyup", (e) => {
        if (e.key === "Shift") {
            isShiftPressed = false;
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
        drawingStartPoint = null;
        isHorizontalMode = null;
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

        if (isDrawing && isShiftPressed && drawingStartPoint) {
            if (isHorizontalMode === null) {
                const dx = Math.abs(x - drawingStartPoint.x);
                const dy = Math.abs(y - drawingStartPoint.y);
                if (dx > 2 || dy > 2) {
                    isHorizontalMode = dx > dy;
                }
            }
            
            if (isHorizontalMode) {
                drawingX = x;
                drawingY = drawingStartPoint.y;
            } else {
                drawingX = drawingStartPoint.x;
                drawingY = y;
            }
        } else {
            drawingX = x;
            drawingY = y;
            isHorizontalMode = null;
        }

        hoveredCoordinates = { x: drawingX, y: drawingY };
        hoveredPoint = Points.getPointByCoordinates({ x: drawingX, y: drawingY }) || null;
        updateHoveredPointDescription();
    });
}; 