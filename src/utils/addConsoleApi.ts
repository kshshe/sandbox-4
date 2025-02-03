import { Bounds } from "../classes/bounds"
import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { TemperatureGrid } from "../classes/temperatureGrid"

declare global {
    interface Window {
        api: {
            Points: typeof Points
            Speed: typeof Speed
            Bounds: typeof Bounds
            TemperatureGrid: typeof TemperatureGrid
        }
    }
}

export const addConsoleApi = () => {
    window.api = {
        Points,
        Speed,
        Bounds,
        TemperatureGrid
    }
}