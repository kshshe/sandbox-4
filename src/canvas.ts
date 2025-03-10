import { CONFIG } from "./config";
import { Bounds } from "./classes/bounds";

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

export const initCanvas = () => {
    const boardWidth = Math.floor(window.innerWidth / CONFIG.pixelSize);
    const boardHeight = Math.floor(window.innerHeight / CONFIG.pixelSize);

    canvas.width = boardWidth * CONFIG.pixelSize;
    canvas.height = boardHeight * CONFIG.pixelSize;

    Bounds.setBounds({
        top: 0,
        right: boardWidth,
        bottom: boardHeight,
        left: 0
    });

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}; 