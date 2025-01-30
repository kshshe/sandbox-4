import { Points } from "../classes/points"
import { Speed } from "../classes/speed"
import { random } from "../utils/random"
import { shake } from "../utils/shake"
import type { TForceProcessor } from "./index"

let SLOTS = [
    Speed.rounded.left,
    Speed.rounded.right,
    Speed.rounded.bottomLeft,
    Speed.rounded.bottomRight,
    Speed.rounded.down,
]

setInterval(() => {
    SLOTS = shake(SLOTS)
}, 100)

export const liquid: TForceProcessor = (point) => {
    const surfaceTensionPower = 0.0001

    const roundedSpeed = Speed.getRoundedSpeed(point, true, SLOTS)
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
    }

    if (pointBySpeed) {
        const availableSlots = SLOTS
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