import { Points, TPoint } from "../classes/points"
import { Speed, TRoundedSpeed } from "../classes/speed"
import { EPointType } from "../types"
import { random } from "../utils/random"
import { shake } from "../utils/shake"
import type { TForceProcessor } from "./index"

type TSlot = {
    slot: TRoundedSpeed
    coefficient: number
}

// Viscosity coefficients for different liquid types
const VISCOSITY = {
    [EPointType.Water]: 1.0,
    [EPointType.Lava]: 5.0,
    [EPointType.LiquidGas]: 0.3,
    [EPointType.Acid]: 1.2,
    [EPointType.MoltenMetal]: 8.0,
    default: 1.0
}

// Density coefficients for different liquid types
const DENSITY = {
    [EPointType.Water]: 1.0,
    [EPointType.Lava]: 3.0,
    [EPointType.LiquidGas]: 0.5,
    [EPointType.Acid]: 1.1,
    [EPointType.MoltenMetal]: 7.0,
    default: 1.0
}

// Surface tension coefficients
const SURFACE_TENSION = {
    [EPointType.Water]: 0.8,
    [EPointType.Lava]: 1.2,
    [EPointType.LiquidGas]: 0.2,
    [EPointType.Acid]: 0.7,
    [EPointType.MoltenMetal]: 1.5,
    default: 0.8
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

// Shuffle slots periodically to add some randomness to the flow
setInterval(() => {
    SLOTS = shake(SLOTS)
}, 100)

const BASE_MOVEMENT_POWER = 0.04
const TURBULENCE_FACTOR = 0.015
const TEMPERATURE_INFLUENCE = 0.0008
const PRESSURE_FACTOR = 0.02
const MAX_PRESSURE_DEPTH = 10

// Calculate pressure based on depth (number of liquid particles above)
const calculatePressure = (point: TPoint): number => {
    let pressure = 0
    let depth = 0
    
    // Check up to MAX_PRESSURE_DEPTH cells above
    for (let y = 1; y <= MAX_PRESSURE_DEPTH; y++) {
        const checkPoint = Points.getPointByCoordinates({
            x: point.coordinates.x,
            y: point.coordinates.y - y
        })
        
        if (!checkPoint) {
            break
        }
        
        // Only count liquid-type points for pressure
        if (VISCOSITY[checkPoint.type as keyof typeof VISCOSITY] !== undefined) {
            depth++
            pressure += DENSITY[checkPoint.type as keyof typeof DENSITY] || DENSITY.default
        }
    }
    
    return pressure
}

// Check if a point is at a liquid surface (has air above it)
const isAtSurface = (point: TPoint): boolean => {
    const abovePoint = Points.getPointByCoordinates({
        x: point.coordinates.x,
        y: point.coordinates.y - 1
    })
    
    return !abovePoint
}

export const liquid: TForceProcessor = (point) => {
    // Get viscosity for this liquid type
    const viscosity = VISCOSITY[point.type as keyof typeof VISCOSITY] || VISCOSITY.default
    const density = DENSITY[point.type as keyof typeof DENSITY] || DENSITY.default
    const surfaceTension = SURFACE_TENSION[point.type as keyof typeof SURFACE_TENSION] || SURFACE_TENSION.default
    
    // Calculate temperature effect on viscosity (hotter = less viscous)
    const temperature = point.data.temperature || 20
    const temperatureEffect = 1 - (temperature > 20 ? TEMPERATURE_INFLUENCE * (temperature - 20) : 0)
    const effectiveViscosity = Math.max(0.1, viscosity * temperatureEffect)
    
    // Calculate pressure effect
    const pressure = calculatePressure(point)
    const pressureEffect = 1 + (pressure * PRESSURE_FACTOR)
    
    // Adjust movement power based on viscosity, density and pressure
    const movementPower = BASE_MOVEMENT_POWER / effectiveViscosity * pressureEffect
    
    // Add turbulence based on temperature and pressure
    const turbulence = TURBULENCE_FACTOR * (temperature / 100) * pressure
    
    // Apply surface tension effect if at liquid surface
    const isAtLiquidSurface = isAtSurface(point)
    const surfaceEffect = isAtLiquidSurface ? surfaceTension : 1
    
    const roundedSpeed = Speed.getRoundedSpeed(point, true, SLOTS.map(slot => slot.slot))
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed)

    // Check if the point is moving diagonally into a solid
    if (point.speed.x !== 0 && point.speed.y !== 0) {
        const direction = {
            x: point.coordinates.x + roundedSpeed.x,
            y: point.coordinates.y + roundedSpeed.y,
        }

        const pointThere = Points.getPointByCoordinates(direction)
        if (!pointThere) {
            // Apply surface tension effect for diagonal movement
            if (isAtLiquidSurface) {
                point.speed.x *= 0.95
                point.speed.y *= 0.95
            }
            return
        }
    }

    if (pointBySpeed) {
        let availableSlotCount = 0
        const availableSlots: TSlot[] = []
        
        // Find available slots for movement
        for (let i = 0; i < SLOTS_LENGTH; i++) {
            const slot = SLOTS[i]
            const pointBySlot = Points.getPointBySpeed(point, slot.slot)
            
            if (!pointBySlot) {
                // Apply surface tension for horizontal movement at surface
                if (isAtLiquidSurface && (slot.slot.x !== 0 && slot.slot.y === 0)) {
                    const adjustedSlot = { ...slot, coefficient: slot.coefficient * surfaceEffect }
                    availableSlots[availableSlotCount++] = adjustedSlot
                } else {
                    availableSlots[availableSlotCount++] = slot
                }
            }
        }
        
        if (availableSlotCount > 0) {
            // Add some randomness to the slot selection based on turbulence
            const slotIndex = Math.floor(random() * availableSlotCount)
            const slot = availableSlots[slotIndex]
            
            // Apply turbulence effect
            const turbulenceX = (random() - 0.5) * turbulence
            const turbulenceY = (random() - 0.5) * turbulence
            
            // Apply movement with all effects combined
            point.speed.x += slot.slot.x * movementPower * slot.coefficient + turbulenceX
            point.speed.y += slot.slot.y * movementPower * slot.coefficient * density + turbulenceY
            
            // Apply damping based on viscosity
            point.speed.x *= (1 - 0.01 * effectiveViscosity)
            point.speed.y *= (1 - 0.01 * effectiveViscosity)
        }
    }
}