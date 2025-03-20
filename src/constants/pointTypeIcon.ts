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
    [EPointType.Heater]: '🔥⚡',
    [EPointType.Cooler]: '❄️⚡',
    [EPointType.ColdDetector]: '❄️🔋',
    [EPointType.HotDetector]: '🔥🔋',
    [EPointType.LiquidDetector]: '💧🔋',
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
    [EPointType.Glass]: '🔍',
    [EPointType.LiquidGlass]: '🌡️🔍',
    [EPointType.Virus]: '🦠',
    [EPointType.Heal]: '💊',
    [EPointType.Acid]: '⚗️',
    [EPointType.PlantSeed]: '🌱',
    [EPointType.Wire]: '🔌',
    [EPointType.Pipe]: '🧪',
    [EPointType.Oil]: '🛢️',
    [EPointType.BurningOil]: '🔥🛢️',
    [EPointType.Smoke]: '🚬',
    eraser: '🧽',
    heatTool: '🔥🔧',
    coolTool: '❄️🔧',
}

export type ElementGroup = {
    name: string;
    elements: Array<keyof typeof POINT_TYPE_ICON>;
}

export const ELEMENT_GROUPS: ElementGroup[] = [
    {
        name: "Basic Elements",
        elements: [
            EPointType.Sand,
            EPointType.Stone,
            EPointType.Border,
            EPointType.Wood,
            EPointType.Glass,
        ]
    },
    {
        name: "Tools",
        elements: [
            'eraser',
            'heatTool',
            'coolTool',
        ]
    },
    {
        name: "Liquids",
        elements: [
            EPointType.Water,
            EPointType.Lava,
            EPointType.LiquidGas,
            EPointType.LiquidGlass,
            EPointType.Acid,
            EPointType.Oil,
        ]
    },
    {
        name: "Gases",
        elements: [
            EPointType.Gas,
            EPointType.Smoke,
        ]
    },
    {
        name: "Temperature Elements",
        elements: [
            EPointType.Fire,
            EPointType.Ice,
            EPointType.IceFire,
            EPointType.ConstantHot,
            EPointType.ConstantCold,
        ]
    },
    {
        name: "Electricity",
        elements: [
            EPointType.Metal,
            EPointType.Electricity_Source,
            EPointType.Electricity_Ground,
            EPointType.Electricity_Spark,
            EPointType.Heater,
            EPointType.Cooler,
            EPointType.ColdDetector,
            EPointType.HotDetector,
            EPointType.LiquidDetector,
        ]
    },
    {
        name: "Connections",
        elements: [
            EPointType.Wire,
            EPointType.Pipe,
        ]
    },
    {
        name: "Explosives",
        elements: [
            EPointType.Bomb,
            EPointType.Dynamite,
        ]
    },
    {
        name: "Special Elements",
        elements: [
            EPointType.Clone,
            EPointType.Void,
            EPointType.Virus,
            EPointType.Heal,
            EPointType.PlantSeed,
        ]
    }
]

// Check if all elements in POINT_TYPE_ICON are included in at least one group
const allElementsInGroups = ELEMENT_GROUPS.flatMap(group => group.elements);
const allElementsInIcon = Object.keys(POINT_TYPE_ICON);

if (allElementsInGroups.length !== allElementsInIcon.length) {
    console.warn('Not all elements are included in groups');
}
