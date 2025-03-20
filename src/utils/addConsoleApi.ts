import { Bounds } from "../classes/bounds"
import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { TemperatureGrid } from "../classes/temperatureGrid"
import { Controls } from "../classes/controls"
import { __fromRandomCount, __fromBufferCount, __bufferSize } from "./random"
import { Connections } from "../classes/connections"

const api = {
    Points,
    Controls,
    Speed,
    Bounds,
    TemperatureGrid,
    Connections,
    random: {
        __fromRandomCount,
        __fromBufferCount,
        __bufferSize
    }
} as const

declare global {
    interface Window {
        api: typeof api
    }
}

export const addConsoleApi = () => {
    window.api = api
}