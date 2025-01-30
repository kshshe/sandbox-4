import { EPointType } from "../types"
import { Storage } from "./storage"

type TSubscriber = {
    key: keyof typeof Controls.state
    callback: (value: typeof Controls.state) => void
}

export class Controls {
    static state: {
        debugMode: boolean
        drawingType: EPointType | 'eraser'
    } = {
        debugMode: Storage.get('Controls.debugMode', false),
        drawingType: Storage.get('Controls.drawingType', EPointType.Water)
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
}