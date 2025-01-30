import { TCoordinate } from "../types"
import { Speed } from "./speed"
import { Storage } from "./storage"

export class Controls {
    private static state: {
        debugMode: boolean
    } = {
        debugMode: Storage.get('debugMode', false)
    }

    public static getDebugMode() {
        return this.state.debugMode
    }

    public static setDebugMode(value: boolean) {
        this.state.debugMode = value
        Storage.set('debugMode', value)
    }
}