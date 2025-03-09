import { Points } from "../classes/points"
import { Speed, TRoundedSpeed } from "../classes/speed"
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

const SLOTS_LENGTH = SLOTS.length

setInterval(() => {
    SLOTS = shake(SLOTS)
}, 100)

const MOVEMENT_POWER = 0.02

export const liquid: TForceProcessor = (point) => {
    const roundedSpeed = Speed.getRoundedSpeed(point, true, SLOTS)
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed)

    if (point.speed.x > 0 && point.speed.y > 0) {
        const direction = {
            x: point.coordinates.x + roundedSpeed.x,
            y: point.coordinates.y + roundedSpeed.y,
        }

        const pointThere = Points.getPointByCoordinates(direction)
        if (!pointThere) {
            return
        }
    }

    if (pointBySpeed) {
        let availableSlotCount = 0
        const availableSlots: TRoundedSpeed[] = []
        
        for (let i = 0; i < SLOTS_LENGTH; i++) {
            const slot = SLOTS[i]
            const pointBySlot = Points.getPointBySpeed(point, slot)
            
            if (!pointBySlot) {
                availableSlots[availableSlotCount++] = slot
            }
        }
        
        if (availableSlotCount > 0) {
            const slot = availableSlots[Math.floor(random() * availableSlotCount)]
            point.speed.x += slot.x * MOVEMENT_POWER
            point.speed.y += slot.y * MOVEMENT_POWER
        }
    }
}