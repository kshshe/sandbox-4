import { CONFIG } from "./config";
import { Points, TPoint } from "./classes/points";
import { Controls } from "./classes/controls";
import { EPointType } from "./types";
import { isDev } from "./utils/isDev";
import { canvas } from "./canvas";

export let hoveredPoint: TPoint | null = null;
export let hoveredCoordinates: { x: number, y: number } | null = null;
export let isDrawing = false;
export let drawingX = 0;
export let drawingY = 0;
let drawingInterval: NodeJS.Timeout | null = null;

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

export const initInteractions = () => {
    addListeners(canvas, ['mousedown', 'touchstart'], (e) => {
        const drawingType = Controls.getDrawingType();
        e.preventDefault();
        const offsetX = (e as MouseEvent).offsetX ?? (e as TouchEvent).touches[0].clientX ?? 0;
        const offsetY = (e as MouseEvent).offsetY ?? (e as TouchEvent).touches[0].clientY ?? 0;
        isDrawing = true;
        const x = Math.floor(offsetX / CONFIG.pixelSize);
        const y = Math.floor(offsetY / CONFIG.pixelSize);
        drawingX = x;
        drawingY = y;
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

    addListeners(canvas, [
        'mouseup',
        'touchend',
        'touchcancel',
        'mouseout',
    ], (e) => {
        isDrawing = false;
        if (drawingInterval) {
            clearInterval(drawingInterval);
        }
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
    });
}; 