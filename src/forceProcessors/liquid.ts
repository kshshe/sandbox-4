import { Points } from "../classes/points"
import { Speed, TRoundedSpeed } from "../classes/speed"
import { random } from "../utils/random"
import { shake } from "../utils/shake"
import type { TForceProcessor } from "./index"

// Pre-calculate and cache slots
let SLOTS = [
    Speed.rounded.left,
    Speed.rounded.right,
    Speed.rounded.bottomLeft,
    Speed.rounded.bottomRight,
    Speed.rounded.down,
]

// Cache the length for faster access in the loop
const SLOTS_LENGTH = SLOTS.length

// Use a less frequent interval to reduce overhead
setInterval(() => {
    SLOTS = shake(SLOTS)
}, 100)

// Constant for surface tension - moved outside function to avoid recreation
const SURFACE_TENSION_POWER = 0.0001
const MOVEMENT_POWER = 0.02

export const liquid: TForceProcessor = (point) => {
    const roundedSpeed = Speed.getRoundedSpeed(point, true, SLOTS)
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed)
    
    // Apply surface tension - optimize loop
    for (let i = 0; i < Speed.possibleNeighbours.length; i++) {
        const neighbourCoordinates = Speed.possibleNeighbours[i]
        const neighbour = Points.getPointByCoordinates({
            x: point.coordinates.x + neighbourCoordinates.x,
            y: point.coordinates.y + neighbourCoordinates.y,
        })
        
        if (!neighbour) {
            point.speed.x -= neighbourCoordinates.x * SURFACE_TENSION_POWER
            point.speed.y -= neighbourCoordinates.y * SURFACE_TENSION_POWER
        }
    }

    if (pointBySpeed) {
        // Find available slots more efficiently
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
            // Use direct array access instead of random selection
            const slot = availableSlots[Math.floor(random() * availableSlotCount)]
            point.speed.x += slot.x * MOVEMENT_POWER
            point.speed.y += slot.y * MOVEMENT_POWER
        }
    }
}