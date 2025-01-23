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

let previouslyUsedPixels: number[] = [];
const drawPoints = () => {
    const points = Points.getPoints();
    ctx.fillStyle = 'white';
    previouslyUsedPixels.forEach(pixel => {
        ctx.fillRect(pixel % boardWidth * CONFIG.pixelSize, Math.floor(pixel / boardWidth) * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
    })
    previouslyUsedPixels = [];
    points.forEach(point => {
        const pixel = point.coordinates.y * boardWidth + point.coordinates.x;
        previouslyUsedPixels.push(pixel);
        ctx.fillStyle = POINS_COLORS[point.type];
        ctx.fillRect(point.coordinates.x * CONFIG.pixelSize, point.coordinates.y * CONFIG.pixelSize, CONFIG.pixelSize, CONFIG.pixelSize);
    })

    requestAnimationFrame(drawPoints);
}

drawPoints();