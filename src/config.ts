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
    [EPointType.Gas]: 10,
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
    [EPointType.Gas]: 'lightgray',

    [EPointType.ConstantCold]: 'blue',
    [EPointType.ConstantHot]: 'red',

    [EPointType.Void]: 'black',
}

export const CANT_BE_UNSED: {
    [key in EPointType]?: boolean
} = {
    [EPointType.Bomb]: true,
    [EPointType.Border]: true,
    [EPointType.Void]: true,
    [EPointType.Clone]: true,
    [EPointType.ConstantCold]: true,
    [EPointType.ConstantHot]: true,
    [EPointType.FireEmitter]: true,
    [EPointType.Fire]: true,
    [EPointType.IceFire]: true,
}

export const POINTS_WEIGHTS: Record<EPointType, number> = {
    [EPointType.Stone]: 1,
    [EPointType.Sand]: 1,
    [EPointType.Water]: 0.9,
    [EPointType.Fire]: -0.8,
    [EPointType.IceFire]: -0.8,
    [EPointType.Steam]: -0.1,
    [EPointType.Bomb]: 1,
    [EPointType.Gas]: 0,

    [EPointType.Border]: Infinity,
    [EPointType.Ice]: Infinity,
    [EPointType.ConstantCold]: Infinity,
    [EPointType.ConstantHot]: Infinity,
    [EPointType.Void]: Infinity,
    [EPointType.Clone]: Infinity,
    [EPointType.FireEmitter]: Infinity,
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

export const drawingTypes = {
    1: EPointType.Water,
    2: EPointType.Sand,
    3: EPointType.Stone,
    4: EPointType.Border,
    5: EPointType.Fire,
    6: EPointType.IceFire,
    7: EPointType.Bomb,
    8: EPointType.Ice,
    9: EPointType.ConstantCold,
    0: EPointType.ConstantHot,
    v: EPointType.Void,
    c: EPointType.Clone,
    g: EPointType.Gas,
    '-': 'eraser'
}

export const POINT_TYPE_ICON: {
    [key in EPointType]?: string
} & {
    eraser?: string
} = {
    [EPointType.Water]: '💧',
    [EPointType.Sand]: '🏖️',
    [EPointType.Stone]: '🪨',
    [EPointType.Border]: '🚧',
    [EPointType.Fire]: '🔥',
    [EPointType.IceFire]: '🧊🔥',
    [EPointType.Bomb]: '💣',
    [EPointType.Ice]: '🧊',
    [EPointType.Clone]: '🧬',
    [EPointType.Gas]: '💨',
    [EPointType.Void]: '⚫',
    [EPointType.ConstantCold]: '❄️♾️',
    [EPointType.ConstantHot]: '🔥♾️',
    eraser: '🧽',
}

export const POINTS_SHORTCUTS: {
    [key: string]: EPointType | 'eraser'
} = {
    w: EPointType.Water,
    s: EPointType.Sand,
    r: EPointType.Stone,
    f: EPointType.Fire,
    i: EPointType.IceFire,
    b: EPointType.Bomb,
    c: EPointType.Clone,
    g: EPointType.Gas,
    v: EPointType.Void,
    e: 'eraser',
}

export const REVERSED_POINTS_SHORTCUTS: {
    [key in EPointType | 'eraser']?: string
} = Object.fromEntries(Object.entries(POINTS_SHORTCUTS).map(([key, value]) => [value, key]))