import { EPointType } from "./types"

export const CONFIG = {
    pixelSize: 10,
} as const

export const POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS: {
    [key in EPointType]?: number
} = {
    [EPointType.Stone]: 0,
    [EPointType.Fire]: 4,
    [EPointType.Steam]: 10,
}

export const POINS_COLORS: Record<EPointType, string> = {
    [EPointType.Water]: 'blue',
    [EPointType.Sand]: '#ffcc00',
    [EPointType.Border]: '#d3d3d3',
    [EPointType.Stone]: 'gray',
    [EPointType.Fire]: 'red',
    [EPointType.Bomb]: 'black',
    [EPointType.Ice]: 'lightblue',
    [EPointType.Steam]: 'lightgray',
}

export const POINTS_WEIGHTS: Record<EPointType, number> = {
    [EPointType.Stone]: 1,
    [EPointType.Sand]: 1,
    [EPointType.Water]: 0.9,
    [EPointType.Border]: Infinity,
    [EPointType.Fire]: -0.8,
    [EPointType.Steam]: -0.8,
    [EPointType.Bomb]: 1,
    [EPointType.Ice]: Infinity,
}

export const INITIAL_TEMPERATURE: {
    [key in EPointType]?: number
} = {
    [EPointType.Ice]: -60,
    [EPointType.Steam]: 60,
    [EPointType.Fire]: 2000,
}