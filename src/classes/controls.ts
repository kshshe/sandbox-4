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
        isTemperatureEnabled: boolean
        drawingType: EPointType | 'eraser' | 'heatTool' | 'coolTool'
        drawingData: Record<string, any>
        baseTemperature: number
        brushSize: number
        simulationSpeed: number
        isPaused: boolean
        isSmoothMovementEnabled: boolean
        isConnectionMode: boolean
        isLightSourcesEnabled: boolean
    } = {
        maxSpeedMode: Storage.get('Controls.maxSpeedMode', false),
        debugMode: Storage.get('Controls.debugMode', false),
        isTemperatureEnabled: Storage.get('Controls.isTemperatureEnabled', true),
        drawingType: Storage.get('Controls.drawingType', EPointType.Water),
        drawingData: Storage.get('Controls.drawingData', {}),
        baseTemperature: Storage.get('Controls.baseTemperature', 20),
        brushSize: Storage.get('Controls.brushSize', 2),
        simulationSpeed: Storage.get('Controls.simulationSpeed', 1),
        isPaused: Storage.get('Controls.isPaused', false),
        isSmoothMovementEnabled: Storage.get('Controls.isSmoothMovementEnabled', true),
        isConnectionMode: false,
        isLightSourcesEnabled: Storage.get('Controls.isLightSourcesEnabled', true),
        // don't forget to update initial state in controls.test.ts
    }

    private static subscribers: TSubscriber[] = []
    private static connectionStartPoint: { x: number, y: number } | null = null

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

    public static setDrawingType(value: EPointType | 'eraser' | 'heatTool' | 'coolTool') {
        this.setState('drawingType', value)
    }

    public static getDrawingData() {
        return this.state.drawingData
    }

    public static setDrawingData(value: Record<string, any>) {
        this.setState('drawingData', value)
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

    public static getIsTemperatureEnabled() {
        return this.state.isTemperatureEnabled
    }

    public static setIsTemperatureEnabled(value: boolean) {
        this.setState('isTemperatureEnabled', value)
    }

    public static getSimulationSpeed() {
        return this.state.simulationSpeed
    }

    public static setSimulationSpeed(value: number) {
        this.setState('simulationSpeed', value)
    }

    public static getIsPaused() {
        return this.state.isPaused
    }

    public static setIsPaused(value: boolean) {
        this.setState('isPaused', value)
    }

    public static getIsSmoothMovementEnabled() {
        return this.state.isSmoothMovementEnabled
    }

    public static setIsSmoothMovementEnabled(value: boolean) {
        this.setState('isSmoothMovementEnabled', value)
    }

    public static getIsConnectionMode() {
        return this.state.isConnectionMode
    }

    public static setIsConnectionMode(value: boolean) {
        this.setState('isConnectionMode', value)
    }

    public static getConnectionStartPoint() {
        return this.connectionStartPoint
    }

    public static setConnectionStartPoint(value: { x: number, y: number } | null) {
        this.connectionStartPoint = value
    }

    public static getIsLightSourcesEnabled() {
        return this.state.isLightSourcesEnabled
    }

    public static setIsLightSourcesEnabled(value: boolean) {
        this.setState('isLightSourcesEnabled', value)
    }
}