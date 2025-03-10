import { Storage } from "../classes/storage";

const TARGET_PIXELS = 10_000
let savedPixelSize = Storage.get('pixelSize', null as number | null)

if (savedPixelSize === null) {
    const screenArea = window.innerWidth * window.innerHeight
    const pixelSize = Math.sqrt(screenArea / TARGET_PIXELS)
    savedPixelSize = Math.max(1, Math.min(20, Math.round(pixelSize)))
}

export const CONFIG = {
    pixelSize: savedPixelSize,
    movementSmoothness: 1 / 60,
    colorVariation: 0.4
} as const 