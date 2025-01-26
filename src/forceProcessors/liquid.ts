import { Points } from "../classes/points"
import { Speed, TRoundedSpeed } from "../classes/speed"
import { EPointType, TCoordinate } from "../types"
import type { TForceProcessor } from "./index"

const isEqualSpeed = (speed1: TRoundedSpeed, speed2: TRoundedSpeed) => {
    return speed1.x === speed2.x && speed1.y === speed2.y
}

const getRelativeSlots = (roundedSpeed: TRoundedSpeed): TRoundedSpeed[] => {
    // down
    if (isEqualSpeed(roundedSpeed, { x: 0, y: 1 })) {
        return [
            Speed.rounded.left,
            Speed.rounded.right,
            Speed.rounded.bottomLeft,
            Speed.rounded.bottomRight,
            Speed.rounded.down,
        ]
    }

    // down left
    if (isEqualSpeed(roundedSpeed, { x: -1, y: 1 })) {
        return [
            Speed.rounded.topLeft,
            Speed.rounded.left,
            Speed.rounded.bottomLeft,
            Speed.rounded.down,
            Speed.rounded.bottomRight,
        ]
    }

    // down right
    if (isEqualSpeed(roundedSpeed, { x: 1, y: 1 })) {
        return [
            Speed.rounded.topRight,
            Speed.rounded.right,
            Speed.rounded.bottomRight,
            Speed.rounded.down,
            Speed.rounded.bottomLeft
        ]
    }

    // left
    if (isEqualSpeed(roundedSpeed, { x: -1, y: 0 })) {
        return [
            Speed.rounded.up,
            Speed.rounded.topLeft,
            Speed.rounded.left,
            Speed.rounded.bottomLeft,
            Speed.rounded.down,
        ]
    }

    // right
    if (isEqualSpeed(roundedSpeed, { x: 1, y: 0 })) {
        return [
            Speed.rounded.up,
            Speed.rounded.topRight,
            Speed.rounded.right,
            Speed.rounded.bottomRight,
            Speed.rounded.down,
        ]
    }

    // up
    if (isEqualSpeed(roundedSpeed, { x: 0, y: -1 })) {
        return [
            Speed.rounded.left,
            Speed.rounded.right,
            Speed.rounded.topLeft,
            Speed.rounded.topRight,
            Speed.rounded.up,
        ]
    }

    // up left
    if (isEqualSpeed(roundedSpeed, { x: -1, y: -1 })) {
        return [
            Speed.rounded.topRight,
            Speed.rounded.up,
            Speed.rounded.topLeft,
            Speed.rounded.left,
            Speed.rounded.bottomLeft,
        ]
    }

    // up right
    if (isEqualSpeed(roundedSpeed, { x: 1, y: -1 })) {
        return [
            Speed.rounded.topLeft,
            Speed.rounded.up,
            Speed.rounded.topRight,
            Speed.rounded.right,
            Speed.rounded.bottomRight,
        ]
    }

    return [roundedSpeed]
}

export const liquid: TForceProcessor = (point) => {
    const neighbours = Points.getNeighbours(point)
    const { speed } = point
    const roundedSpeed = Speed.getRoundedSpeed(point)
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed, neighbours)

    // apply pressure to every point in neighbours
    for (const neighbourCoordinates of Speed.possibleNeighbours) {
        const neighbour = Points.getPointByCoordinates({
            x: point.coordinates.x + neighbourCoordinates.x,
            y: point.coordinates.y + neighbourCoordinates.y,
        })
        const xDirection = neighbourCoordinates.x
        const yDirection = neighbourCoordinates.y

        if (!neighbour) {
            point.speed.x -= xDirection * 0.002
            point.speed.y -= yDirection * 0.002
        } else if (neighbour.type !== EPointType.Border) {
            neighbour.speed.x += xDirection * 0.01
            neighbour.speed.y += yDirection * 0.01
        }
    }

    if (pointBySpeed) {
        const availableSlots = getRelativeSlots(roundedSpeed)
        const slotsToMove = availableSlots.filter((slot) => {
            const pointBySlot = Points.getPointBySpeed(point, slot, neighbours)
            return !pointBySlot
        })
        if (slotsToMove.length) {
            const slot = slotsToMove[Math.floor(Math.random() * slotsToMove.length)]
            const speedLength = Math.sqrt(speed.x ** 2 + speed.y ** 2)
            const newSpeed: TCoordinate = {
                x: slot.x * speedLength * 0.5,
                y: slot.y * speedLength * 0.5,
            }
            point.speed = newSpeed
        }
    }
}