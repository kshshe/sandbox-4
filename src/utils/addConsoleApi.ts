import { Bounds } from "../classes/bounds"
import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { TemperatureGrid } from "../classes/temperatureGrid"
import { Controls } from "../classes/controls"
declare global {
    interface Window {
        api: {
            Points: typeof Points
            Speed: typeof Speed
            Bounds: typeof Bounds
            TemperatureGrid: typeof TemperatureGrid
            Controls: typeof Controls
        }
    }
}

export const addConsoleApi = () => {
    window.api = {
        Points,
        Controls,
        Speed,
        Bounds,
        TemperatureGrid
    }
}