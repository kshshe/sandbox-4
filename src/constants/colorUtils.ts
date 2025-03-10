import { EPointType } from "../types"
import { POINTS_COLORS } from "./pointsColors"

export const getVariedColor = (type: EPointType, variation: number): string => {
    const baseColor = POINTS_COLORS[type]
    const factor = 1 + variation * 0.2 // Scale the variation to be subtle (±20%)
    
    // Apply the variation and clamp values between 0-255
    const r = Math.min(255, Math.max(0, Math.round(baseColor.r * factor)))
    const g = Math.min(255, Math.max(0, Math.round(baseColor.g * factor)))
    const b = Math.min(255, Math.max(0, Math.round(baseColor.b * factor)))
    
    return `rgb(${r}, ${g}, ${b})`
} 