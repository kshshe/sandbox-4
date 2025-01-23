import { TCoordinate } from "../types"

export type TRoundedSpeed = {
    x: -1 | 0 | 1
    y: -1 | 0 | 1
}

export class Speed {
    static getRoundedSpeed(speed: TCoordinate) {
        const roundedSpeed: TRoundedSpeed = {
            x: 0,
            y: 0
        }

        if (speed.x > 0) {
            roundedSpeed.x = 1
        } else if (speed.x < 0) {
            roundedSpeed.x = -1
        }

        if (speed.y > 0) {
            roundedSpeed.y = 1
        } else if (speed.y < 0) {
            roundedSpeed.y = -1
        }

        return roundedSpeed
    }
}