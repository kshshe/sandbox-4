import { EPointType } from "../types";

export const POINT_NAMES: {
    [key in EPointType]?: string
} = {
    [EPointType.Smoke]: 'Smoke',
    [EPointType.Water]: 'Water',
    [EPointType.Border]: 'Border',
    [EPointType.Sand]: 'Sand',
    [EPointType.Stone]: 'Stone',
    [EPointType.StaticStone]: 'Static Stone',
    [EPointType.Lava]: 'Lava',
    [EPointType.Fire]: 'Fire',
    [EPointType.Oil]: 'Oil',
    [EPointType.BurningOil]: 'Burning Oil',
    [EPointType.IceFire]: 'Ice Fire',
    [EPointType.Bomb]: 'Bomb',
    [EPointType.Ice]: 'Ice',
    [EPointType.Steam]: 'Steam',
    [EPointType.Void]: 'Void',
    [EPointType.Clone]: 'Clone',
    [EPointType.Gas]: 'Gas',
    [EPointType.FireEmitter]: 'Fire Emitter',
    [EPointType.Wood]: 'Wood',
    [EPointType.BurningWood]: 'Burning Wood',
    [EPointType.Dynamite]: 'Dynamite',
    [EPointType.LiquidGas]: 'Liquid Gas',
    [EPointType.Metal]: 'Metal',
    [EPointType.MoltenMetal]: 'Molten Metal',
    [EPointType.Electricity_Ground]: 'Electricity Ground',
    [EPointType.Electricity_Spark]: 'Electricity Spark',
    [EPointType.Electricity_Source]: 'Electricity Source',
    [EPointType.Electricity_Amplifier]: 'Electricity Amplifier',
    [EPointType.Heater]: 'Heater',
    [EPointType.Cooler]: 'Cooler',
    [EPointType.Virus]: 'Virus',
    [EPointType.Heal]: 'Heal',
    [EPointType.Acid]: 'Acid',
    [EPointType.Plant]: 'Plant',
    [EPointType.PlantSeed]: 'Plant Seed',
    [EPointType.Glass]: 'Glass',
    [EPointType.LiquidGlass]: 'Liquid Glass',
    [EPointType.ConstantCold]: 'Constant Cold',
    [EPointType.ConstantHot]: 'Constant Hot',
    [EPointType.ColdDetector]: 'Cold Detector',
    [EPointType.HotDetector]: 'Hot Detector',
    [EPointType.LiquidDetector]: 'Liquid Detector',
    [EPointType.Wire]: 'Wire',
    [EPointType.Pipe]: 'Pipe',
    [EPointType.Snow]: 'Snow',
    [EPointType.Magnet]: 'Magnet',
}