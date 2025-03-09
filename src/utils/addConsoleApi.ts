import { Bounds } from "../classes/bounds"
import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { TemperatureGrid } from "../classes/temperatureGrid"
import { Controls } from "../classes/controls"
import { __fromRandomCount, __fromBufferCount, __bufferSize } from "./random"

declare global {
    interface Window {
        api: {
            Points: typeof Points
            Speed: typeof Speed
            Bounds: typeof Bounds
            TemperatureGrid: typeof TemperatureGrid
            Controls: typeof Controls
            random: {
                __fromRandomCount: typeof __fromRandomCount
                __fromBufferCount: typeof __fromBufferCount
                __bufferSize: typeof __bufferSize
            }
        }
    }
}

export const addConsoleApi = () => {
    window.api = {
        Points,
        Controls,
        Speed,
        Bounds,
        TemperatureGrid,
        random: {
            __fromRandomCount,
            __fromBufferCount,
            __bufferSize
        }
    }
}