import { EPointType } from "../types"

export type TIcon = string

export const POINT_TYPE_ICON: {
    [key in EPointType]?: TIcon
} & {
    eraser?: TIcon
    heatTool?: TIcon
    coolTool?: TIcon
} = {
    [EPointType.Water]: '💧',
    [EPointType.Sand]: '🏝️',
    [EPointType.Stone]: '🪨',
    [EPointType.Lava]: '🌋',
    [EPointType.Metal]: '⚙️',
    [EPointType.Electricity_Ground]: '⚡🔌',
    [EPointType.Electricity_Spark]: '⚡',
    [EPointType.Electricity_Source]: '🔋',
    [EPointType.Electricity_Amplifier]: '⚡⚙️',
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
    [EPointType.Smoke]: '🚬',
    [EPointType.Snow]: '❄️☃️',
    [EPointType.Magnet]: '🧲',
    [EPointType.WindSource]: '💨',
    eraser: '🧽',
    heatTool: '🔥🔧',
    coolTool: '❄️🔧',
}

export type TElementInGroup = keyof typeof POINT_TYPE_ICON | {
    type: keyof typeof POINT_TYPE_ICON
    data: Record<string, any>
    icon?: string
}

export type ElementGroup = {
    name: string;
    elements: Array<TElementInGroup>;
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
            EPointType.Magnet,
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
            EPointType.Snow,
        ]
    },
    {
        name: "Electricity",
        elements: [
            EPointType.Metal,
            EPointType.Electricity_Source,
            EPointType.Electricity_Ground,
            EPointType.Electricity_Spark,
            EPointType.Electricity_Amplifier,
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
        name: "Environmental",
        elements: [
            {
                type: EPointType.WindSource,
                data: {
                    windDirection: {
                        x: 0,
                        y: -1,
                    },
                },
                icon: '💨⬆️',
            },
            {
                type: EPointType.WindSource,
                data: {
                    windDirection: {
                        x: 0,
                        y: 1,
                    },
                },
                icon: '💨⬇️',
            },
            {
                type: EPointType.WindSource,
                data: {
                    windDirection: {
                        x: 1,
                        y: 0,
                    },
                },
                icon: '💨➡️',
            },
            {
                type: EPointType.WindSource,
                data: {
                    windDirection: {
                        x: -1,
                        y: 0,
                    },
                },
                icon: '💨⬅️',
            },
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
            EPointType.Magnet,
        ]
    }
]

const allElementsInIcon = Object.keys(POINT_TYPE_ICON);

const missingElements = allElementsInIcon.filter(element => !ELEMENT_GROUPS.some(group => {
    return group.elements.some(groupElement => {
        if (typeof groupElement === 'string') {
            return groupElement === element
        }
        return groupElement.type === element
    })
}));
if (missingElements.length > 0) {
    console.warn('Not all elements are included in groups', missingElements);
}
