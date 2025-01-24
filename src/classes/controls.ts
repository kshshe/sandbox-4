import { Speed, TRoundedSpeed } from "./speed"
import { Storage } from "./storage"

export class Controls {
    private static state: {
        gravityDirection: TRoundedSpeed
    } = {
        gravityDirection: Storage.get('gravityDirection', Speed.rounded.down)
    }

    public static getGravityDirection() {
        return this.state.gravityDirection
    }

    public static setGravityDirection(value: TRoundedSpeed) {
        this.state.gravityDirection = value
        Storage.set('gravityDirection', value)
    }
}