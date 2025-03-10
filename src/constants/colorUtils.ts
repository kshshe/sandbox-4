import { EPointType } from "../types"
import { POINTS_COLORS } from "./pointsColors"

export const getVariedColor = (type: EPointType, variation: number): string => {
    const baseColor = POINTS_COLORS[type]
    
    // Calculate brightness (0-1) using perceived brightness formula
    const brightness = (0.299 * baseColor.r + 0.587 * baseColor.g + 0.114 * baseColor.b) / 255
    
    // Adjust variation based on brightness:
    // - For bright colors (brightness close to 1): smaller variation
    // - For dark colors (brightness close to 0): larger variation
    const variationScale = 0.1 + (1 - brightness) * 0.3 // Scale from 0.1 (bright) to 0.4 (dark)
    const factor = 1 + variation * variationScale
    
    // Apply the variation and clamp values between 0-255
    const r = Math.min(255, Math.max(0, Math.round(baseColor.r * factor)))
    const g = Math.min(255, Math.max(0, Math.round(baseColor.g * factor)))
    const b = Math.min(255, Math.max(0, Math.round(baseColor.b * factor)))
    
    return `rgb(${r}, ${g}, ${b})`
} 