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
    movementSmoothness: 1 / 60,
    colorVariation: 0.4
} as const

// Only for those that are not sand-like
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
    [EPointType.Electricity_Spark]: 10,
}

export const POINTS_CAN_ACCEPT_ELECTRICITY: {
    [key in EPointType]?: boolean
} = {
    [EPointType.Metal]: true,
    [EPointType.Electricity_Ground]: true,
}

export const POINTS_COLORS: Record<EPointType, { r: number, g: number, b: number }> = {
    [EPointType.Water]: { r: 0, g: 0, b: 255 },             // blue
    [EPointType.Sand]: { r: 255, g: 204, b: 0 },            // #ffcc00
    [EPointType.Border]: { r: 211, g: 211, b: 211 },        // #d3d3d3
    [EPointType.Stone]: { r: 128, g: 128, b: 128 },         // gray
    [EPointType.StaticStone]: { r: 128, g: 128, b: 128 },   // gray
    [EPointType.Fire]: { r: 255, g: 0, b: 0 },              // red
    [EPointType.FireEmitter]: { r: 255, g: 0, b: 0 },       // red
    [EPointType.IceFire]: { r: 173, g: 216, b: 230 },       // lightblue
    [EPointType.Bomb]: { r: 0, g: 0, b: 0 },                // black
    [EPointType.Ice]: { r: 173, g: 216, b: 230 },           // lightblue
    [EPointType.Steam]: { r: 211, g: 211, b: 211 },         // lightgray
    [EPointType.Clone]: { r: 0, g: 128, b: 0 },             // green
    [EPointType.Gas]: { r: 211, g: 211, b: 211 },           // lightgray
    [EPointType.Lava]: { r: 255, g: 0, b: 0 },              // red
    [EPointType.Wood]: { r: 139, g: 69, b: 19 },            // #8b4513
    [EPointType.BurningWood]: { r: 255, g: 0, b: 0 },       // red
    [EPointType.Dynamite]: { r: 255, g: 68, b: 68 },        // #ff4444
    [EPointType.LiquidGas]: { r: 0, g: 204, b: 255 },       // #00ccff
    [EPointType.Foam]: { r: 240, g: 230, b: 140 },          // #f0e68c
    [EPointType.Metal]: { r: 192, g: 192, b: 192 },         // #c0c0c0
    [EPointType.MoltenMetal]: { r: 255, g: 51, b: 51 },     // #ff3333
    [EPointType.Electricity_Ground]: { r: 160, g: 160, b: 160 }, // #a0a0a0
    [EPointType.Electricity_Spark]: { r: 255, g: 255, b: 0 },    // #ffff00
    [EPointType.Electricity_Source]: { r: 255, g: 255, b: 0 },   // #ffff00
    [EPointType.ConstantCold]: { r: 0, g: 0, b: 255 },      // blue
    [EPointType.ConstantHot]: { r: 255, g: 0, b: 0 },       // red
    [EPointType.Void]: { r: 0, g: 0, b: 0 },                // black
    [EPointType.Virus]: { r: 0, g: 255, b: 0 },             // green
    [EPointType.Heal]: { r: 0, g: 255, b: 255 },            // cyan
    [EPointType.Acid]: { r: 0, g: 255, b: 0 }               // green
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
    [EPointType.Dynamite]: true,
    [EPointType.Electricity_Ground]: true,
    [EPointType.Electricity_Spark]: true,
    [EPointType.Electricity_Source]: true,
    [EPointType.Virus]: true,
}

export const POINTS_HEAT_CAPACITY: {
    [key in EPointType]?: number
} = {
    water: 1,
    sand: 1,
    virus: 1,
    acid: 1,
    
    liquidGas: 2,
    stone: 2,
    staticStone: 2,
    lava: 2,
    wood: 2,

    steam: 0.1,
    gas: 0.1,

    [EPointType.Electricity_Ground]: 1,
    [EPointType.Electricity_Source]: 1,
    [EPointType.Metal]: 0.5,
    [EPointType.MoltenMetal]: 0.5,
    [EPointType.Dynamite]: 4,

    constantCold: 100,
    constantHot: 100,
    fire: 100,
    iceFire: 100,

    [EPointType.Foam]: 200,
}

export const POINTS_WEIGHTS: Record<EPointType, number> = {
    [EPointType.Stone]: 1,
    [EPointType.Sand]: 1,
    [EPointType.Water]: 0.9,
    [EPointType.LiquidGas]: 0.89,
    [EPointType.Lava]: 2,
    [EPointType.Fire]: -0.8,
    [EPointType.IceFire]: -0.8,
    [EPointType.Steam]: -0.1,
    [EPointType.Bomb]: 1,
    [EPointType.Gas]: 0,
    [EPointType.Electricity_Spark]: 1,
    [EPointType.MoltenMetal]: 2,
    [EPointType.Virus]: 1,
    [EPointType.Heal]: 1,
    [EPointType.Acid]: 1.2,

    [EPointType.Electricity_Source]: Infinity,
    [EPointType.Electricity_Ground]: Infinity,
    [EPointType.Metal]: Infinity,
    [EPointType.Foam]: Infinity,
    [EPointType.Dynamite]: Infinity,
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
    [EPointType.Fire]: 700,
    [EPointType.IceFire]: -700,
    [EPointType.LiquidGas]: -350,
    [EPointType.Virus]: 20,
    [EPointType.Acid]: 20,

    [EPointType.ConstantCold]: -500,
    [EPointType.ConstantHot]: 500,
    [EPointType.BurningWood]: 800,

    [EPointType.Electricity_Spark]: 100,
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
    [EPointType.Metal]: '🔩',
    [EPointType.Electricity_Ground]: '⚡🪨',
    [EPointType.Electricity_Spark]: '⚡',
    [EPointType.Electricity_Source]: '⚡⚡',
    [EPointType.Wood]: '🌳',
    [EPointType.Border]: '🚧',
    [EPointType.Fire]: '🔥',
    [EPointType.IceFire]: '🧊🔥',
    [EPointType.Bomb]: '💣',
    [EPointType.Dynamite]: '💥',
    [EPointType.Ice]: '🧊',
    [EPointType.Clone]: '🧬',
    [EPointType.Gas]: '💨',
    [EPointType.Void]: '⚫',
    [EPointType.ConstantCold]: '❄️♾️',
    [EPointType.ConstantHot]: '🔥♾️',
    [EPointType.LiquidGas]: '💧💨',
    [EPointType.Foam]: '🛁',
    [EPointType.Virus]: '🦠',
    [EPointType.Heal]: '💊',
    [EPointType.Acid]: '🧪',
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
    a: EPointType.Acid,
}

export const REVERSED_POINTS_SHORTCUTS: {
    [key in EPointType | 'eraser']?: string
} = Object.fromEntries(Object.entries(POINTS_SHORTCUTS).map(([key, value]) => [value, key]))

// Apply color variation to RGB values
export const getVariedColor = (type: EPointType, variation: number): string => {
    const baseColor = POINTS_COLORS[type]
    const factor = 1 + variation * 0.2 // Scale the variation to be subtle (±20%)
    
    // Apply the variation and clamp values between 0-255
    const r = Math.min(255, Math.max(0, Math.round(baseColor.r * factor)))
    const g = Math.min(255, Math.max(0, Math.round(baseColor.g * factor)))
    const b = Math.min(255, Math.max(0, Math.round(baseColor.b * factor)))
    
    return `rgb(${r}, ${g}, ${b})`
} 