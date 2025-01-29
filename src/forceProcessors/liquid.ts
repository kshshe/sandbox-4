import { Controls } from "../classes/controls"
import { Points } from "../classes/points"
import { Speed, TRoundedSpeed } from "../classes/speed"
import { TCoordinate } from "../types"
import { random } from "../utils/random"
import { shake } from "../utils/shake"
import type { TForceProcessor } from "./index"

const isEqualSpeed = (speed1: TRoundedSpeed, speed2: TRoundedSpeed) => {
    return speed1.x === speed2.x && speed1.y === speed2.y
}

const SLOTS = {
    down: [
        Speed.rounded.left,
        Speed.rounded.right,
        Speed.rounded.bottomLeft,
        Speed.rounded.bottomRight,
        Speed.rounded.down,
    ],
    downLeft: [
        Speed.rounded.topLeft,
        Speed.rounded.left,
        Speed.rounded.bottomLeft,
        Speed.rounded.down,
        Speed.rounded.bottomRight,
    ],
    downRight: [
        Speed.rounded.topRight,
        Speed.rounded.right,
        Speed.rounded.bottomRight,
        Speed.rounded.down,
        Speed.rounded.bottomLeft
    ],
    left: [
        Speed.rounded.up,
        Speed.rounded.topLeft,
        Speed.rounded.left,
        Speed.rounded.bottomLeft,
        Speed.rounded.down,
    ],
    right: [
        Speed.rounded.up,
        Speed.rounded.topRight,
        Speed.rounded.right,
        Speed.rounded.bottomRight,
        Speed.rounded.down,
    ],
    up: [
        Speed.rounded.left,
        Speed.rounded.right,
        Speed.rounded.topLeft,
        Speed.rounded.topRight,
        Speed.rounded.up,
    ],
    upLeft: [
        Speed.rounded.topRight,
        Speed.rounded.up,
        Speed.rounded.topLeft,
        Speed.rounded.left,
        Speed.rounded.bottomLeft,
    ],
    upRight: [
        Speed.rounded.topLeft,
        Speed.rounded.up,
        Speed.rounded.topRight,
        Speed.rounded.right,
        Speed.rounded.bottomRight,
    ]
}

setInterval(() => {
    for (const slot in SLOTS) {
        SLOTS[slot] = shake(SLOTS[slot])
    }
}, 100)

const getRelativeSlots = (roundedSpeed: TRoundedSpeed): TRoundedSpeed[] => {
    // down
    if (isEqualSpeed(roundedSpeed, { x: 0, y: 1 })) {
        return SLOTS.down
    }

    // down left
    if (isEqualSpeed(roundedSpeed, { x: -1, y: 1 })) {
        return SLOTS.downLeft
    }

    // down right
    if (isEqualSpeed(roundedSpeed, { x: 1, y: 1 })) {
        return SLOTS.downRight
    }

    // left
    if (isEqualSpeed(roundedSpeed, { x: -1, y: 0 })) {
        return SLOTS.left
    }

    // right
    if (isEqualSpeed(roundedSpeed, { x: 1, y: 0 })) {
        return SLOTS.right
    }

    // up
    if (isEqualSpeed(roundedSpeed, { x: 0, y: -1 })) {
        return SLOTS.up
    }

    // up left
    if (isEqualSpeed(roundedSpeed, { x: -1, y: -1 })) {
        return SLOTS.upLeft
    }

    // up right
    if (isEqualSpeed(roundedSpeed, { x: 1, y: -1 })) {
        return SLOTS.upRight
    }

    return []
}

export const liquid: TForceProcessor = (point) => {
    const isLowGravity = Controls.isLowGravity()
    const surfaceTensionPower = isLowGravity ? 0.01 : 0.002
    
    const roundedSpeed = Speed.getRoundedSpeed(point)
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed)

    for (const neighbourCoordinates of Speed.possibleNeighbours) {
        const neighbour = Points.getPointByCoordinates({
            x: point.coordinates.x + neighbourCoordinates.x,
            y: point.coordinates.y + neighbourCoordinates.y,
        })
        const xDirection = neighbourCoordinates.x
        const yDirection = neighbourCoordinates.y
        if (!neighbour) {
            point.speed.x -= xDirection * surfaceTensionPower
            point.speed.y -= yDirection * surfaceTensionPower
        }
        if (neighbour?.type === point.type) {
            point.speed.x += xDirection * (surfaceTensionPower / 2)
            point.speed.y += yDirection * (surfaceTensionPower / 2)
        }
    }

    if (pointBySpeed) {
        const availableSlots = getRelativeSlots(roundedSpeed)
        const slotsToMove = availableSlots.filter((slot) => {
            const pointBySlot = Points.getPointBySpeed(point, slot)
            return !pointBySlot
        })
        if (slotsToMove.length) {
            const slot = slotsToMove[Math.floor(random() * slotsToMove.length)]
            point.speed.x += slot.x * 0.02
            point.speed.y += slot.y * 0.02
        }
    }
}