import { Points } from "../classes/points"
import { Speed, TRoundedSpeed } from "../classes/speed"
import { TCoordinate } from "../types"
import type { TForceProcessor } from "./index"

const SLOTS_TO_MOVE: TRoundedSpeed[] = [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
]

export const liquid: TForceProcessor = (point) => {
    const neighbours = Points.getNeighbours(point)
    const { speed } = point
    const roundedSpeed = Speed.getRoundedSpeed(speed, point.type)
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed, neighbours)

    if (pointBySpeed) {
        // SLOTS_TO_MOVE are relevant is speed is directed down ({ x: 0, y: 1 })
        // if the speed is different, we need to "rotate" all the slots accordingly
        const speedAngle = Math.atan2(speed.y, speed.x)
        const speedAngleDeg = (speedAngle * 180) / Math.PI
        const angleDiff = speedAngleDeg - 90
        const angleDiffRoundedTo90 = Math.round(angleDiff / 90) * 90
        const angleDiffRoundedTo90Rad = (angleDiffRoundedTo90 * Math.PI) / 180
        const rotatedSlots = SLOTS_TO_MOVE.map((slot) => {
            const slotAngle = Math.atan2(slot.y, slot.x)
            const slotAngleDeg = (slotAngle * 180) / Math.PI
            const newAngle = slotAngleDeg + angleDiffRoundedTo90
            const newAngleRad = (newAngle * Math.PI) / 180
            return {
                x: Math.round(Math.cos(newAngleRad)),
                y: Math.round(Math.sin(newAngleRad)),
            }
        })

        
        const slotsToMove = rotatedSlots.filter((slot) => {
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