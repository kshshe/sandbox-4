import { TPoint } from "../classes/points"
import { CONFIG } from "./config"
import { getColor } from "./pointsColors"

export const getVariedColor = (point: TPoint): string => {
    const baseColor = getColor(point)
    
    // Calculate brightness (0-1) using perceived brightness formula
    const brightness = (0.299 * baseColor.r + 0.587 * baseColor.g + 0.114 * baseColor.b) / 255
    
    // Adjust variation based on brightness:
    // - For bright colors (brightness close to 1): smaller variation
    // - For dark colors (brightness close to 0): larger variation
    const variationScale = 0.1 + (1 - brightness) * 0.3 // Scale from 0.1 (bright) to 0.4 (dark)
    const factor = 1 + (point.colorVariation || 0) * variationScale * CONFIG.colorVariation
    
    // Apply the variation and clamp values between 0-255
    const r = Math.min(255, Math.max(0, Math.round(baseColor.r * factor)))
    const g = Math.min(255, Math.max(0, Math.round(baseColor.g * factor)))
    const b = Math.min(255, Math.max(0, Math.round(baseColor.b * factor)))
    
    return `rgb(${r}, ${g}, ${b})`
} 