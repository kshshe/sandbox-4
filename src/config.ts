import { EPointType } from "./types"
import { Storage } from "./classes/storage";

const TARGET_PIXELS = 10_000
let savedPixelSize = Storage.get('pixelSize', null as number | null)

if (savedPixelSize === null) {
    const screenArea = window.innerWidth * window.innerHeight
    const pixelSize = Math.sqrt(screenArea / TARGET_PIXELS)
    savedPixelSize = Math.max(1, Math.min(20, Math.round(pixelSize)))
}

export const CONFIG = {
    pixelSize: savedPixelSize,
} as const

export const POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS: {
    [key in EPointType]?: number
} = {
    [EPointType.Stone]: 0,
    [EPointType.StaticStone]: 0,
    [EPointType.Void]: 0,
    [EPointType.Clone]: 0,
    [EPointType.Wood]: 0,
    [EPointType.BurningWood]: 0,
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
    [EPointType.StaticStone]: 'gray',
    [EPointType.Fire]: 'red',
    [EPointType.FireEmitter]: 'red',
    [EPointType.IceFire]: 'lightblue',
    [EPointType.Bomb]: 'black',
    [EPointType.Ice]: 'lightblue',
    [EPointType.Steam]: 'lightgray',
    [EPointType.Clone]: 'green',
    [EPointType.Gas]: 'lightgray',
    [EPointType.Lava]: 'red',
    [EPointType.Wood]: '#8b4513',
    [EPointType.BurningWood]: 'red',

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
    [EPointType.BurningWood]: true,
}

export const POINTS_WEIGHTS: Record<EPointType, number> = {
    [EPointType.Stone]: 1,
    [EPointType.Sand]: 1,
    [EPointType.Water]: 0.9,
    [EPointType.Lava]: 2,
    [EPointType.Fire]: -0.8,
    [EPointType.IceFire]: -0.8,
    [EPointType.Steam]: -0.1,
    [EPointType.Bomb]: 1,
    [EPointType.Gas]: 0,

    [EPointType.Wood]: Infinity,
    [EPointType.BurningWood]: Infinity,
    [EPointType.StaticStone]: Infinity,
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
    [EPointType.Lava]: 1000,
    [EPointType.Steam]: 60,
    [EPointType.Fire]: 2000,
    [EPointType.IceFire]: -700,

    [EPointType.ConstantCold]: -500,
    [EPointType.ConstantHot]: 500,
    [EPointType.BurningWood]: 800,
}

export const POINT_TYPE_ICON: {
    [key in EPointType]?: string
} & {
    eraser?: string
} = {
    [EPointType.Water]: '💧',
    [EPointType.Sand]: '🏖️',
    [EPointType.Stone]: '🪨',
    [EPointType.Lava]: '🌋',
    [EPointType.Wood]: '🌳',
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

if (Object.values(POINT_TYPE_ICON).length !== new Set(Object.values(POINT_TYPE_ICON)).size) {
    console.warn('Duplicate icons')
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