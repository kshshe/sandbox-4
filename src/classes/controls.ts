import { TCoordinate } from "../types"
import { Speed } from "./speed"
import { Storage } from "./storage"

export class Controls {
    private static state: {
        gravityDirection: TCoordinate
    } = {
        gravityDirection: Storage.get('gravityDirection', Speed.rounded.down)
    }

    public static getGravityDirection() {
        return this.state.gravityDirection
    }

    public static setGravityDirection(value: TCoordinate) {
        this.state.gravityDirection = value
        Storage.set('gravityDirection', value)
    }
}