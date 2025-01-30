import { CONFIG, drawingTypes, POINS_COLORS } from "./config";
import { Points, TPoint } from "./classes/points";
import { Bounds } from "./classes/bounds";
import { Stats } from "./classes/stats";
import { isDev } from "./utils/isDev";
import { EPointType } from "./types";
import { Storage } from "./classes/storage";
import { Controls } from "./classes/controls";
import { Speed } from "./classes/speed";

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

const addListeners = (element: HTMLElement, events: string[], callback: (e: Event) => void) => {
    events.forEach(event => {
        element.addEventListener(event, callback);
    })
}

let isDrawing = false;
let drawingInterval: NodeJS.Timeout | null = null;
let drawingX = 0;
let drawingY = 0;
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
        const neighboursAndSelf = [...Speed.possibleNeighbours, { x: 0, y: 0 }];
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
    if (isDrawing) {
        drawingX = x;
        drawingY = y;
    } else {
        hoveredPoint = Points.getPoints().find(point => point.coordinates.x === x && point.coordinates.y === y) || null;
    }
})

const previouslyUsedPixels: Set<string> = new Set();
let frame = 0;
const drawPoints = () => {
    const debugMode = Controls.getDebugMode();
    const points = Points.getPoints();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (debugMode) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

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

        if (debugMode) {
            const temperature = point.data.temperature ?? 0;
            if (temperature > 16 || temperature < 5) {
                const temperatureWithLimit = Math.min(100, Math.max(-100, temperature));
                const temperatureColor = temperatureWithLimit > 0
                    ? `rgb(${Math.round(255 * temperatureWithLimit / 100)}, 0, 0)`
                    : `rgb(0, 0, ${Math.round(255 * -temperatureWithLimit / 100)})`;
                ctx.fillStyle = temperatureColor;
                ctx.beginPath();
                ctx.arc(
                    point.coordinates.x * CONFIG.pixelSize + CONFIG.pixelSize / 2,
                    point.coordinates.y * CONFIG.pixelSize + CONFIG.pixelSize / 2,
                    2,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            }

            if (Points.isUnused(point)) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(point.coordinates.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
            }
        }
    })

    if (frame++ % 20 === 0) {
        const drawingType = Controls.getDrawingType();
        const activePoints = points.filter(point => !Points.isUnused(point));
        stats.innerHTML = [
            `Iteration: ${Storage.get('iteration', 0)}`,
            `Load: ${(Stats.data.load * 100).toFixed(2)}%`,
            `Points: ${activePoints.length} / ${points.length} (${(activePoints.length / points.length * 100).toFixed(2)}%)`,
            `FPS: ${Stats.data.fps.toFixed(2)}`,
            `Average speed: ${Stats.data.averageSpeed.toFixed(2)}`,
            hoveredPoint && '---',
            hoveredPoint && `${hoveredPoint.type}`,
            hoveredPoint?.wasDeleted && 'Deleted',
            hoveredPoint && hoveredPoint.data?.lifetime && `Lifetime: ${hoveredPoint.data.lifetime}`,
            hoveredPoint ? Math.abs(hoveredPoint?.data.temperature) > 1 && `${Math.round(hoveredPoint.data.temperature)} °C` : null,
        ]
            .filter(Boolean)
            .join('<br>');
    }

    requestAnimationFrame(drawPoints);
}

drawPoints();