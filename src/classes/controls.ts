import { EPointType } from "../types"
import { Storage } from "./storage"

type TSubscriber = {
    key: keyof typeof Controls.state
    callback: (value: typeof Controls.state) => void
}

export class Controls {
    static state: {
        debugMode: boolean
        maxSpeedMode: boolean
        drawingType: EPointType | 'eraser'
        baseTemperature: number
        brushSize: number
    } = {
        maxSpeedMode: Storage.get('Controls.maxSpeedMode', false),
        debugMode: Storage.get('Controls.debugMode', false),
        drawingType: Storage.get('Controls.drawingType', EPointType.Water),
        baseTemperature: Storage.get('Controls.baseTemperature', 20),
        brushSize: Storage.get('Controls.brushSize', 2)
    }

    private static subscribers: TSubscriber[] = []

    public static subscribe(key: TSubscriber['key'], callback: TSubscriber['callback']) {
        this.subscribers.push({ key, callback })

        return () => {
            this.subscribers = this.subscribers.filter(subscriber => subscriber.callback !== callback)
        }
    }

    public static callSubscribers(key: TSubscriber['key']) {
        this.subscribers.forEach(subscriber => {
            if (subscriber.key === key) {
                subscriber.callback(Controls.state)
            }
        })
    }

    public static setState<TKey extends keyof typeof Controls.state>(key: TKey, value: typeof Controls.state[TKey]) {
        const isSame = this.state[key] === value
        if (isSame) {
            return
        }
        Storage.set(`Controls.${key}`, value)
        this.state[key] = value
        this.callSubscribers(key)
    }

    public static getBrushSize() {
        return this.state.brushSize
    }

    public static setBrushSize(value: number) {
        this.setState('brushSize', value)
    }

    public static getDrawingType() {
        return this.state.drawingType
    }

    public static setDrawingType(value: EPointType | 'eraser') {
        this.setState('drawingType', value)
    }

    public static getDebugMode() {
        return this.state.debugMode
    }

    public static setDebugMode(value: boolean) {
        this.setState('debugMode', value)
    }

    public static getMaxSpeedMode() {
        return this.state.maxSpeedMode
    }

    public static setMaxSpeedMode(value: boolean) {
        this.setState('maxSpeedMode', value)
    }

    public static getBaseTemperature() {
        return this.state.baseTemperature
    }

    public static setBaseTemperature(value: number) {
        this.setState('baseTemperature', value)
    }
}