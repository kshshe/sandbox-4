import { Speed, TRoundedSpeed } from "./speed"

export class Controls {
    private static state: {
        gravityDirection: TRoundedSpeed
    } = {
        gravityDirection: Speed.rounded.down
    }

    public static getGravityDirection() {
        return this.state.gravityDirection
    }

    public static setGravityDirection(value: TRoundedSpeed) {
        this.state.gravityDirection = value
    }
}