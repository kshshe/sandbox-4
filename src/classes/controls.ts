import { EPointType } from "../types"
import { Storage } from "./storage"

export class Controls {
    private static state: {
        debugMode: boolean
        drawingType: EPointType | 'eraser'
    } = {
        debugMode: Storage.get('debugMode', false),
        drawingType: Storage.get('drawingType', EPointType.Water)
    }

    public static getDrawingType() {
        return this.state.drawingType
    }

    public static setDrawingType(value: EPointType | 'eraser') {
        this.state.drawingType = value
        Storage.set('drawingType', value)
    }

    public static getDebugMode() {
        return this.state.debugMode
    }

    public static setDebugMode(value: boolean) {
        this.state.debugMode = value
        Storage.set('debugMode', value)
    }
}