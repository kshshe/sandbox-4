import { Bounds } from "../classes/bounds"
import { Points } from "../classes/points"
import { Speed } from "../classes/speed"

declare global {
    interface Window {
        api: {
            Points: typeof Points
            Speed: typeof Speed
            Bounds: typeof Bounds
        }
    }
}

export const addConsoleApi = () => {
    window.api = {
        Points,
        Speed,
        Bounds
    }
}