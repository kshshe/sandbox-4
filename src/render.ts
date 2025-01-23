import { CONFIG, POINS_COLORS } from "./config";
import { Points } from "./classes/points";
import { Bounds } from "./classes/bounds";
import { Stats } from "./classes/stats";
import { isDev } from "./utils/isDev";
import { EPointType } from "./types";

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

let isDrawing = false;
let drawingInterval: NodeJS.Timeout | null = null;
let drawindX = 0;
let drawindY = 0;
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    drawingInterval = setInterval(() => {
        const x = Math.floor(e.offsetX / CONFIG.pixelSize);
        const y = Math.floor(e.offsetY / CONFIG.pixelSize);
        Points.addPoint({
            coordinates: { x, y },
            type: EPointType.Water,
            speed: { x: 0, y: 0 }
        })
    }, 1000 / 20)
})
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    if (drawingInterval) {
        clearInterval(drawingInterval);
    }
})
canvas.addEventListener('mouseout', () => {
    isDrawing = false;
    if (drawingInterval) {
        clearInterval(drawingInterval);
    }
})
canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const x = Math.floor(e.offsetX / CONFIG.pixelSize);
        const y = Math.floor(e.offsetY / CONFIG.pixelSize);
        drawindX = x;
        drawindY = y;
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
            const speedX = point.speed.x;
            const speedY = point.speed.y;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + speedX * 10, centerY + speedY * 10);
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
    })

    stats.innerHTML = [
        `Points: ${points.length}`,
        `FPS: ${Stats.data.fps.toFixed(2)}`,
        `Average speed: ${Stats.data.averageSpeed.toFixed(2)}`,
    ].join('<br>');

    requestAnimationFrame(drawPoints);
}

drawPoints();