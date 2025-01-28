import { TCoordinate } from "../types"
import { Speed } from "./speed"
import { Storage } from "./storage"

export class Controls {
    private static state: {
        gravityDirection: TCoordinate
        debugMode: boolean
    } = {
        gravityDirection: Storage.get('gravityDirection', Speed.rounded.down),
        debugMode: Storage.get('debugMode', false)
    }

    public static getGravityDirection() {
        return this.state.gravityDirection
    }

    public static isLowGravity() {
        return this.state.gravityDirection.x < 0.2 && this.state.gravityDirection.y < 0.2
    }

    public static setGravityDirection(value: TCoordinate) {
        this.state.gravityDirection = value
        Storage.set('gravityDirection', value)
    }

    public static getDebugMode() {
        return this.state.debugMode
    }

    public static setDebugMode(value: boolean) {
        this.state.debugMode = value
        Storage.set('debugMode', value)
    }
}