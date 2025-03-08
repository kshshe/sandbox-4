import { CONFIG, POINS_COLORS } from "./config";
import { Points, TPoint } from "./classes/points";
import { Bounds } from "./classes/bounds";
import { isDev } from "./utils/isDev";
import { EPointType } from "./types";
import { Controls } from "./classes/controls";
import { Speed } from "./classes/speed";
import { TemperatureGrid } from "./classes/temperatureGrid";
import { Stats } from "./classes/stats";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const boardWidth = Math.floor(window.innerWidth / CONFIG.pixelSize);
const boardHeight = Math.floor(window.innerHeight / CONFIG.pixelSize);

canvas.width = boardWidth * CONFIG.pixelSize;
canvas.height = boardHeight * CONFIG.pixelSize;

Bounds.setBounds({
    top: 0,
    right: boardWidth,
    bottom: boardHeight,
    left: 0
})

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const stats = document.querySelector('.stats') as HTMLDivElement;

let hoveredPoint: TPoint | null = null;
let hoveredCoordinates: { x: number, y: number } | null = null;

const addListeners = (element: HTMLElement, events: string[], callback: (e: Event) => void) => {
    events.forEach(event => {
        element.addEventListener(event, callback);
    })
}

let isDrawing = false;
let drawingInterval: NodeJS.Timeout | null = null;
let drawingX = 0;
let drawingY = 0;

const getArea = (x: number, y: number) => {
    const brushSize = Controls.getBrushSize() - 1;
    const area: { x: number, y: number }[] = [];
    for (let i = -brushSize; i <= brushSize; i++) {
        for (let j = -brushSize; j <= brushSize; j++) {
            area.push({ x: x + i, y: y + j });
        }
    }

    return area;
}

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
            })
            return;
        }
        neighboursAndSelf.forEach(({ x, y }) => {
            const pointThere = points.find(point => point.coordinates.x === drawingX + x && point.coordinates.y === drawingY + y);
            if (pointThere) {
                if (!isDev) {
                    return
                }
            }
            return Points.addPoint({
                coordinates: {
                    x: drawingX + x,
                    y: drawingY + y
                },
                type: drawingType as EPointType,
                speed: { x: 0, y: 0 },
            })
        })
    }, 1000 / 200)
})

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
})

addListeners(canvas, ['mousemove', 'touchmove'], (e) => {
    e.preventDefault();
    const offsetX = (e as MouseEvent).offsetX ?? (e as TouchEvent).touches[0].clientX ?? 0;
    const offsetY = (e as MouseEvent).offsetY ?? (e as TouchEvent).touches[0].clientY ?? 0;
    const x = Math.floor(offsetX / CONFIG.pixelSize);
    const y = Math.floor(offsetY / CONFIG.pixelSize);
    drawingX = x;
    drawingY = y;
    hoveredCoordinates = { x, y };
    hoveredPoint = Points.getPoints().find(point => point.coordinates.x === x && point.coordinates.y === y) || null;
})

const previouslyUsedPixels: Set<string> = new Set();
let frame = 0;
const drawPoints = () => {
    const debugMode = Controls.getDebugMode();
    const points = Points.getPoints();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    previouslyUsedPixels.clear()
    points.forEach(point => {
        const key = `${point.coordinates.x}:${point.coordinates.y}`;
        const thereIsPointAlready = previouslyUsedPixels.has(key);
        ctx.fillStyle = POINS_COLORS[point.type];
        if (debugMode && thereIsPointAlready) {
            ctx.fillStyle = 'red';
            previouslyUsedPixels.add(key);
        }
        ctx.fillRect(point.coordinates.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);

        if (debugMode) {
            const speedLength = Math.sqrt(point.speed.x ** 2 + point.speed.y ** 2);
            if (speedLength > 1) {
                const centerX = point.coordinates.x * CONFIG.pixelSize + CONFIG.pixelSize / 2;
                const centerY = point.coordinates.y * CONFIG.pixelSize + CONFIG.pixelSize / 2;
                const speedX = point.speed.x * 10;
                const speedY = point.speed.y * 10;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + speedX * 10, centerY + speedY * 10);
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
        }

        if (debugMode && point.data.directionToGround) {
            const centerX = point.coordinates.x * CONFIG.pixelSize + CONFIG.pixelSize / 2;
            const centerY = point.coordinates.y * CONFIG.pixelSize + CONFIG.pixelSize / 2;
            const arrowSize = 5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + point.data.directionToGround.x * arrowSize, centerY + point.data.directionToGround.y * arrowSize);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.stroke();
        }

        if (point.data.charge) {
            // yellowish color depending on charge value
            const chargeColor = `rgba(255, 255, 0, ${Math.min(1, Math.max(0, point.data.charge / 10))})`;
            ctx.fillStyle = chargeColor;
            ctx.fillRect(point.coordinates.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
        }

        if (point.type === EPointType.Metal && point.data.temperature > 0) {
            // add a red overlay depending on temperature
            const temperatureColor = `rgba(255, 0, 0, ${Math.min(1, Math.max(0, (point.data.temperature - 20) / 300))})`;
            ctx.fillStyle = temperatureColor;
            ctx.fillRect(point.coordinates.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
        }

        if (debugMode) {
            if (Points.isUnused(point)) {
                // draw a cross on unused points
                ctx.beginPath();
                ctx.moveTo(point.coordinates.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize);
                ctx.lineTo((point.coordinates.x + 1) * CONFIG.pixelSize, (point.coordinates.y + 1) * CONFIG.pixelSize);
                ctx.moveTo((point.coordinates.x + 1) * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize);
                ctx.lineTo(point.coordinates.x * CONFIG.pixelSize, (point.coordinates.y + 1) * CONFIG.pixelSize);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.stroke();
            }
        }
    })

    if (debugMode) {
        const bounds = Bounds.getBounds();
        for (let x = bounds.left; x <= bounds.right; x++) {
            for (let y = bounds.top; y <= bounds.bottom; y++) {
                const temperature = TemperatureGrid.getTemperatureOnPoint(x, y);
                const temperatureWithLimit = Math.min(100, Math.max(-100, temperature));
                const temperatureColor = temperatureWithLimit > 0
                    ? `rgba(${Math.round(255 * temperatureWithLimit / 100)}, 0, 0, 0.3)`
                    : `rgba(0, 0, ${Math.round(255 * -temperatureWithLimit / 100)}, 0.3)`;
                ctx.fillStyle = temperatureColor;
                ctx.fillRect(x * CONFIG.pixelSize, y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
            }
        }
    }

    // draw a rectangle around the drawing area (drawingX and drawingY variables)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    const brushSize = Controls.getBrushSize();
    ctx.strokeRect((drawingX + 1) * CONFIG.pixelSize - brushSize * CONFIG.pixelSize, (drawingY + 1) * CONFIG.pixelSize - brushSize * CONFIG.pixelSize, (brushSize * 2 - 1) * CONFIG.pixelSize, (brushSize * 2 - 1) * CONFIG.pixelSize);

    if (frame++ % 20 === 0) {
        stats.innerHTML = [
            `Frame: ${(Math.round(Stats.data.elapsedTime * 10) / 10).toFixed(1)} ms`,
            hoveredPoint && `${hoveredPoint.type}`,
            hoveredPoint?.wasDeleted && 'Deleted',
            hoveredPoint && hoveredPoint.data?.lifetime && `Lifetime: ${hoveredPoint.data.lifetime}`,
            hoveredPoint && hoveredPoint.data?.charge && `Charge: ${Math.round(hoveredPoint.data.charge * 10) / 10}`,
            hoveredCoordinates && `Coordinates: ${hoveredCoordinates.x}:${hoveredCoordinates.y}`,
            hoveredCoordinates && `Temperature: ${Math.round(TemperatureGrid.getTemperatureOnPoint(hoveredCoordinates.x, hoveredCoordinates.y))} °C`,
        ]
            .filter(Boolean)
            .join('<br>');
    }

    requestAnimationFrame(drawPoints);
}

drawPoints();