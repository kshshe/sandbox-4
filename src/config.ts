import { EPointType } from "./types"

export const CONFIG = {
    pixelSize: 10,
} as const

export const POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS: {
    [key in EPointType]?: number
} = {
    [EPointType.Stone]: 0,
}

export const POINS_COLORS: Record<EPointType, string> = {
    [EPointType.Water]: 'blue',
    [EPointType.Sand]: '#ffcc00',
    [EPointType.Border]: '#d3d3d3',
    [EPointType.Stone]: 'gray',
}