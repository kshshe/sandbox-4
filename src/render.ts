import { CONFIG, POINS_COLORS } from "./config";
import { Points, TPoint } from "./classes/points";
import { Bounds } from "./classes/bounds";
import { Stats } from "./classes/stats";
import { isDev } from "./utils/isDev";
import { EPointType } from "./types";
import { Storage } from "./classes/storage";

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

const drawingTypes = {
    1: EPointType.Water,
    2: EPointType.Sand,
    3: EPointType.Stone,
    4: EPointType.Border,
    5: EPointType.Fire,
    6: EPointType.Bomb,
    7: EPointType.Ice,
    0: 'eraser'
}

let drawingType: EPointType | 'eraser' = Storage.get('drawingType', EPointType.Water);
let hoveredPoint: TPoint | null = null;

window.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key in drawingTypes) {
        drawingType = drawingTypes[key];
        Storage.set('drawingType', drawingType);
    }
    if (key === 'r' && !e.ctrlKey && !e.metaKey) {
        localStorage.clear();
        window.location.reload();
    }
})

stats.addEventListener('click', () => {
    const keys = Object.keys(drawingTypes);
    const index = keys.findIndex(key => drawingTypes[key] === drawingType);
    drawingType = drawingTypes[keys[(index + 1) % keys.length]];
    Storage.set('drawingType', drawingType);
})

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
    e.preventDefault();
    const offsetX = (e as MouseEvent).offsetX || (e as TouchEvent).touches[0].clientX;
    const offsetY = (e as MouseEvent).offsetY || (e as TouchEvent).touches[0].clientY;
    isDrawing = true;
    const x = Math.floor(offsetX / CONFIG.pixelSize);
    const y = Math.floor(offsetY / CONFIG.pixelSize);
    drawingX = x;
    drawingY = y;
    drawingInterval = setInterval(() => {
        const points = Points.getPoints();
        if (drawingType === 'eraser') {
            const pointOnThisPlace = points.find(point => point.coordinates.x === drawingX && point.coordinates.y === drawingY);
            if (pointOnThisPlace) {
                Points.deletePoint(pointOnThisPlace);
            }
            return;
        }
        if (!points.some(point => point.coordinates.x === drawingX && point.coordinates.y === drawingY)) {
            const area = [
                { x: 0, y: -1 },
                { x: -1, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: 0 },
            ]
            area.forEach(({ x, y }) => {
                const pointThere = points.find(point => point.coordinates.x === drawingX + x && point.coordinates.y === drawingY + y);
                if (pointThere) {
                    return
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

        }
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
    const offsetX = (e as MouseEvent).offsetX || (e as TouchEvent).touches[0].clientX;
    const offsetY = (e as MouseEvent).offsetY || (e as TouchEvent).touches[0].clientY;
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
const drawPoints = () => {
    const points = Points.getPoints();
    ctx.fillStyle = 'white';
    [...previouslyUsedPixels.values()].forEach(pixel => {
        const [x, y] = pixel.split(':').map(Number);
        ctx.fillRect(x * CONFIG.pixelSize, y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
    })

    if (isDev) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    previouslyUsedPixels.clear()
    points.forEach(point => {
        const key = `${point.coordinates.x}:${point.coordinates.y}`;
        const thereIsPointAlready = previouslyUsedPixels.has(key);
        ctx.fillStyle = POINS_COLORS[point.type];
        if (thereIsPointAlready) {
            ctx.fillStyle = 'red';
        }
        previouslyUsedPixels.add(key);
        ctx.fillRect(point.coordinates.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);

        if (isDev) {
            // draw a line in speed direction from center of the point
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

        // draw temperature
        // dot from blue for -100 to red for 100
        // in the center of the point
        // 2px
        const temperature = point.data.temperature ?? 0;
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
    })

    stats.innerHTML = [
        `Points: ${points.length}`,
        `FPS: ${Stats.data.fps.toFixed(2)}`,
        `Average speed: ${Stats.data.averageSpeed.toFixed(2)}`,
        '---',
        ...Object.entries(drawingTypes).map(([key, value]) => {
            return `- ${key}: ${value} ${drawingType === value ? '(selected)' : ''}`
        }),
        '- r: clear',
        hoveredPoint && '---',
        hoveredPoint && `${hoveredPoint.type}`,
        hoveredPoint ? Math.abs(hoveredPoint?.data.temperature) > 1 && `${Math.round(hoveredPoint.data.temperature)} °C` : '0 °C',
    ]
        .filter(Boolean)
        .join('<br>');

    requestAnimationFrame(drawPoints);
}

drawPoints();