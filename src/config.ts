import { EPointType } from "./types"

export const CONFIG = {
    pixelSize: 10,
} as const

export const POINS_COLORS: Record<EPointType, string> = {
    [EPointType.Water]: 'blue',
    [EPointType.Border]: '#f0f0f0',
}