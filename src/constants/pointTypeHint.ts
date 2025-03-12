import { EPointType } from "../types"
import { POINT_TYPE_ICON } from "./pointTypeIcon"

export const POINT_TYPE_HINT: {
    [key in keyof typeof POINT_TYPE_ICON]?: string
} = {
    [EPointType.Water]: 'Water - Liquid that freezes below -2°C and boils above 99°C',
    [EPointType.Sand]: 'Sand - Basic particle affected by gravity',
    [EPointType.Stone]: 'Stone - Solid that melts into lava above 550°C',
    [EPointType.Lava]: 'Lava - Hot liquid that solidifies below 500°C',
    [EPointType.Metal]: 'Metal - Conducts electricity and melts above 550°C',
    [EPointType.Electricity_Ground]: 'Electricity Ground - Absorbs electrical charge',
    [EPointType.Electricity_Spark]: 'Electricity Spark - Moves chaotically and conducts electricity',
    [EPointType.Electricity_Source]: 'Electricity Source - Generates electrical charge',
    [EPointType.Wood]: 'Wood - Burns at high temperatures (above 400°C)',
    [EPointType.Border]: 'Border - Immovable boundary element',
    [EPointType.Fire]: 'Fire - Short-lived hot element that burns nearby materials',
    [EPointType.IceFire]: 'Ice Fire - Cold fire that freezes nearby materials',
    [EPointType.Bomb]: 'Bomb - Explodes on contact',
    [EPointType.Dynamite]: 'Dynamite - Stationary explosive',
    [EPointType.Ice]: 'Ice - Solid water that melts above 0°C',
    [EPointType.Clone]: 'Clone - Copies adjacent elements',
    [EPointType.Gas]: 'Gas - Light particle that moves chaotically and ignites above 250°C',
    [EPointType.Void]: 'Void - Removes any element it touches',
    [EPointType.ConstantCold]: 'Constant Cold - Permanently emits extreme cold',
    [EPointType.ConstantHot]: 'Constant Hot - Permanently emits extreme heat',
    [EPointType.LiquidGas]: 'Liquid Gas - Liquid that turns to gas at very low temperatures',
    [EPointType.Virus]: 'Virus - Infects and converts other elements',
    [EPointType.Heal]: 'Heal - Restores infected elements to their original state',
    [EPointType.Acid]: 'Acid - Liquid that dissolves other materials',
    [EPointType.PlantSeed]: 'Seed - Grows into plants and burns at high temperatures',
    eraser: 'Eraser - Removes elements from the simulation',
    heatTool: 'Heat Tool - Increases temperature of elements',
    coolTool: 'Cool Tool - Decreases temperature of elements',
} 