import { CONFIG, POINS_COLORS } from "./config";
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

const drawingTypes = {
    1: EPointType.Water,
    2: EPointType.Sand,
    3: EPointType.Stone,
    4: EPointType.Border,
    5: EPointType.Fire,
    6: EPointType.IceFire,
    7: EPointType.Bomb,
    8: EPointType.Ice,
    9: EPointType.ConstantCold,
    0: EPointType.ConstantHot,
    v: EPointType.Void,
    c: EPointType.Clone,
    '-': 'eraser'
}

let drawingType: EPointType | 'eraser' = Storage.get('drawingType', EPointType.Water);
let hoveredPoint: TPoint | null = null;

document.querySelector('#reset')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.reload();
})

document.querySelector('#debug')?.addEventListener('click', () => {
    Controls.setDebugMode(!Controls.getDebugMode());
})

setTimeout(() => {
    if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
        document.querySelector('#gravity')?.remove();
    }
}, 100)

document.querySelector('#gravity')?.addEventListener('click', () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission?.()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', (e) => {
                        const acceleration = e.accelerationIncludingGravity;
                        if (acceleration) {
                            const x = acceleration.x ?? 0;
                            const y = acceleration.y ?? 1;
                            const max = Math.max(Math.abs(x), Math.abs(y));
                            const normalizedX = x / max;
                            const normalizedY = y / max;
                            Controls.setGravityDirection({ x: normalizedX, y: -normalizedY });
                        } else {
                            Controls.setGravityDirection(Speed.rounded.down)
                        }
                    })
                }
            })
            .catch(console.error);
    }
})

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

    if (key === 'ArrowLeft') {
        Controls.setGravityDirection(Speed.rounded.left)
    }

    if (key === 'ArrowRight') {
        Controls.setGravityDirection(Speed.rounded.right)
    }

    if (key === 'ArrowUp') {
        Controls.setGravityDirection(Speed.rounded.up)
    }

    if (key === 'ArrowDown') {
        Controls.setGravityDirection(Speed.rounded.down)
    }

    if (key === ' ') {
        Controls.setGravityDirection({ x: 0, y: 0 })
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
    const offsetX = (e as MouseEvent).offsetX ?? (e as TouchEvent).touches[0].clientX ?? 0;
    const offsetY = (e as MouseEvent).offsetY ?? (e as TouchEvent).touches[0].clientY ?? 0;
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
                if (!isDev) {
                    return
                } else {
                    Points.deletePoint(pointThere);
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

        if (debugMode) {
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
        }
    })

    if (frame++ % 20 === 0) {
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
            hoveredPoint?.wasDeleted && 'Deleted',
            hoveredPoint && hoveredPoint.data?.lifetime && `Lifetime: ${hoveredPoint.data.lifetime}`,
            hoveredPoint ? Math.abs(hoveredPoint?.data.temperature) > 1 && `${Math.round(hoveredPoint.data.temperature)} °C` : '0 °C',
        ]
            .filter(Boolean)
            .join('<br>');
    }

    requestAnimationFrame(drawPoints);
}

drawPoints();