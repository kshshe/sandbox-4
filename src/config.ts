import { EPointType } from "./types"

export const CONFIG = {
    pixelSize: 10,
} as const

export const POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS: {
    [key in EPointType]?: number
} = {
    [EPointType.Stone]: 0,
    [EPointType.Void]: 0,
    [EPointType.Clone]: 0,
    [EPointType.Fire]: 4,
    [EPointType.IceFire]: 4,
    [EPointType.Steam]: 10,
}

export const POINS_COLORS: Record<EPointType, string> = {
    [EPointType.Water]: 'blue',
    [EPointType.Sand]: '#ffcc00',
    [EPointType.Border]: '#d3d3d3',
    [EPointType.Stone]: 'gray',
    [EPointType.Fire]: 'red',
    [EPointType.IceFire]: 'lightblue',
    [EPointType.Bomb]: 'black',
    [EPointType.Ice]: 'lightblue',
    [EPointType.Steam]: 'lightgray',
    [EPointType.Clone]: 'green',

    [EPointType.ConstantCold]: 'blue',
    [EPointType.ConstantHot]: 'red',

    [EPointType.Void]: 'black',
}

export const POINTS_WEIGHTS: Record<EPointType, number> = {
    [EPointType.Stone]: 1,
    [EPointType.Sand]: 1,
    [EPointType.Water]: 0.9,
    [EPointType.Border]: Infinity,
    [EPointType.Fire]: -0.8,
    [EPointType.IceFire]: -0.8,
    [EPointType.Steam]: -0.8,
    [EPointType.Bomb]: 1,
    [EPointType.Ice]: Infinity,
    [EPointType.ConstantCold]: Infinity,
    [EPointType.ConstantHot]: Infinity,
    [EPointType.Void]: Infinity,
    [EPointType.Clone]: Infinity,
}

export const INITIAL_TEMPERATURE: {
    [key in EPointType]?: number
} = {
    [EPointType.Ice]: -60,
    [EPointType.Steam]: 60,
    [EPointType.Fire]: 2000,
    [EPointType.IceFire]: -700,

    [EPointType.ConstantCold]: -500,
    [EPointType.ConstantHot]: 500,
}