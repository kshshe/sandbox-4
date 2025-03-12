import { EPointType } from "../types"

export const POINT_TYPE_ICON: {
    [key in EPointType]?: string
} & {
    eraser?: string
    heatTool?: string
    coolTool?: string
} = {
    [EPointType.Water]: '💧',
    [EPointType.Sand]: '🏝️',
    [EPointType.Stone]: '🪨',
    [EPointType.Lava]: '🌋',
    [EPointType.Metal]: '⚙️',
    [EPointType.Electricity_Ground]: '⚡🔌',
    [EPointType.Electricity_Spark]: '⚡',
    [EPointType.Electricity_Source]: '🔋',
    [EPointType.Wood]: '🪵',
    [EPointType.Border]: '🧱',
    [EPointType.Fire]: '🔥',
    [EPointType.IceFire]: '❄️🔥',
    [EPointType.Bomb]: '💣',
    [EPointType.Dynamite]: '🧨',
    [EPointType.Ice]: '❄️',
    [EPointType.Clone]: '🧬',
    [EPointType.Gas]: '☁️',
    [EPointType.Void]: '⚫',
    [EPointType.ConstantCold]: '❄️♾️',
    [EPointType.ConstantHot]: '🔥♾️',
    [EPointType.LiquidGas]: '💧☁️',
    [EPointType.Virus]: '🦠',
    [EPointType.Heal]: '💊',
    [EPointType.Acid]: '⚗️',
    [EPointType.PlantSeed]: '🌱',
    eraser: '🧽',
    heatTool: '🔥🔧',
    coolTool: '❄️🔧',
} 

export const POINT_ORDER: Array<keyof typeof POINT_TYPE_ICON | 'divider'> = [
    // Basic elements
    EPointType.Sand,
    EPointType.Stone,
    EPointType.Border,
    EPointType.Wood,
    'divider',
    
    // Tools
    'eraser',
    'heatTool',
    'coolTool',
    
    // Liquids
    EPointType.Water,
    EPointType.Lava,
    EPointType.LiquidGas,
    EPointType.Acid,
    'divider',
    
    // Gases
    EPointType.Gas,
    'divider',
    
    // Temperature elements
    EPointType.Fire,
    EPointType.Ice,
    EPointType.IceFire,
    EPointType.ConstantHot,
    EPointType.ConstantCold,
    'divider',
    
    // Electricity
    EPointType.Metal,
    EPointType.Electricity_Source,
    EPointType.Electricity_Ground,
    EPointType.Electricity_Spark,
    'divider',
    
    // Explosives
    EPointType.Bomb,
    EPointType.Dynamite,
    'divider',
    
    // Special elements
    EPointType.Clone,
    EPointType.Void,
    EPointType.Virus,
    EPointType.Heal,
    EPointType.PlantSeed,
]

if (POINT_ORDER.filter(key => key !== 'divider').length !== Object.keys(POINT_TYPE_ICON).length) {
    console.warn('POINT_ORDER and POINT_TYPE_ICON have different lengths')
} else {
    console.log('POINT_TYPE_ICON is valid')
}