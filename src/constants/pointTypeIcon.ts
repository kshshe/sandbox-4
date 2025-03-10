import { EPointType } from "../types"

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