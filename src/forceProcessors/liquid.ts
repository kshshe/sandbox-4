import { Points } from "../classes/points"
import { Speed, TRoundedSpeed } from "../classes/speed"
import { random } from "../utils/random"
import { shake } from "../utils/shake"
import type { TForceProcessor } from "./index"

type TSlot = {
    slot: TRoundedSpeed
    coefficient: number
}

let SLOTS: TSlot[] = [
    {
        slot: Speed.rounded.left,
        coefficient: 2.4,
    },
    {
        slot: Speed.rounded.right,
        coefficient: 2.4,
    },
    {
        slot: Speed.rounded.bottomLeft,
        coefficient: 2,
    },
    {
        slot: Speed.rounded.bottomRight,
        coefficient: 2,
    },
    {
        slot: Speed.rounded.down,
        coefficient: 1,
    },
]

const SLOTS_LENGTH = SLOTS.length

setInterval(() => {
    SLOTS = shake(SLOTS)
}, 100)

const MOVEMENT_POWER = 0.04

export const liquid: TForceProcessor = (point) => {
    const roundedSpeed = Speed.getRoundedSpeed(point, true, SLOTS.map(slot => slot.slot))
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
        const availableSlots: TSlot[] = []
        
        for (let i = 0; i < SLOTS_LENGTH; i++) {
            const slot = SLOTS[i]
            const pointBySlot = Points.getPointBySpeed(point, slot.slot)
            
            if (!pointBySlot) {
                availableSlots[availableSlotCount++] = slot
            }
        }
        
        if (availableSlotCount > 0) {
            const slot = availableSlots[Math.floor(random() * availableSlotCount)]
            point.speed.x += slot.slot.x * MOVEMENT_POWER * slot.coefficient
            point.speed.y += slot.slot.y * MOVEMENT_POWER * slot.coefficient
        }
    }
}