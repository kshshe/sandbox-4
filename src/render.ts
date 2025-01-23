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
    ctx.fillStyle = 'white';
    [...previouslyUsedPixels.values()].forEach(pixel => {
        const [x, y] = pixel.split(':').map(Number);
        ctx.fillRect(x * CONFIG.pixelSize, y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
    })
    previouslyUsedPixels.clear()
    points.forEach(point => {
        const pixel = point.coordinates.y * boardWidth + point.coordinates.x;
        ctx.fillStyle = POINS_COLORS[point.type];
        const key = `${point.coordinates.x}:${point.coordinates.y}`;
        const thereIsPointAlready = previouslyUsedPixels.has(key);
        if (thereIsPointAlready) {
            ctx.fillStyle = 'red';
        }
        previouslyUsedPixels.add(key);
        ctx.fillRect(point.coordinates.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
    })

    requestAnimationFrame(drawPoints);
}

drawPoints();