import { CONFIG, POINS_COLORS } from "./config";
import { Points } from "./classes/points";
import { Bounds } from "./classes/bounds";

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

const previouslyUsedPixels: Set<string> = new Set();
const drawPoints = () => {
    const points = Points.getPoints();
    previouslyUsedPixels.clear()
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    points.forEach(point => {
        const key = `${point.coordinates.x}:${point.coordinates.y}`;
        const thereIsPointAlready = previouslyUsedPixels.has(key);
        if (thereIsPointAlready) {
            ctx.fillStyle = 'red';
        }
        previouslyUsedPixels.add(key);
        ctx.fillStyle = POINS_COLORS[point.type];
        ctx.fillRect(point.coordinates.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(point.coordinates.x * CONFIG.pixelSize + CONFIG.pixelSize / 2, point.coordinates.y * CONFIG.pixelSize + CONFIG.pixelSize / 2);
        ctx.lineTo(point.coordinates.x * CONFIG.pixelSize + CONFIG.pixelSize / 2 + point.speed.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize + CONFIG.pixelSize / 2 + point.speed.y * CONFIG.pixelSize);
        ctx.stroke();
    })

    requestAnimationFrame(drawPoints);
}

drawPoints();