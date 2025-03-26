import { EPointType } from "../types"

export const POINTS_WEIGHTS: Record<EPointType, number> = {
    [EPointType.Stone]: 1,
    [EPointType.Sand]: 1,
    [EPointType.Water]: 0.9,
    [EPointType.Oil]: 0.85,
    [EPointType.BurningOil]: 0.8,
    [EPointType.LiquidGas]: 0.89,
    [EPointType.Lava]: 2,
    [EPointType.Fire]: -0.8,
    [EPointType.IceFire]: -0.8,
    [EPointType.Steam]: -0.1,
    [EPointType.Smoke]: -0.3,
    [EPointType.Bomb]: 1,
    [EPointType.Gas]: 0,
    [EPointType.Electricity_Spark]: 1,
    [EPointType.MoltenMetal]: 2,
    [EPointType.LiquidGlass]: 1.5,
    [EPointType.Virus]: 1,
    [EPointType.Heal]: 1,
    [EPointType.Acid]: 1.2,
    [EPointType.PlantSeed]: 1,
    [EPointType.Plant]: 0,
    [EPointType.Snow]: 0.5,
    [EPointType.Magnet]: 1,
    [EPointType.Ant]: 0.5,
    [EPointType.FireAnt]: 0.5,

    [EPointType.Electricity_Source]: Infinity,
    [EPointType.Electricity_Ground]: Infinity,
    [EPointType.Electricity_Amplifier]: Infinity,
    [EPointType.Metal]: Infinity,
    [EPointType.Dynamite]: Infinity,
    [EPointType.Wood]: Infinity,
    [EPointType.BurningWood]: Infinity,
    [EPointType.StaticStone]: Infinity,
    [EPointType.Border]: Infinity,
    [EPointType.Ice]: Infinity,
    [EPointType.Glass]: Infinity,
    [EPointType.Heater]: Infinity,
    [EPointType.Cooler]: Infinity,
    [EPointType.ColdDetector]: Infinity,
    [EPointType.HotDetector]: Infinity,
    [EPointType.LiquidDetector]: Infinity,
    [EPointType.ConstantCold]: Infinity,
    [EPointType.ConstantHot]: Infinity,
    [EPointType.Void]: Infinity,
    [EPointType.Clone]: Infinity,
    [EPointType.FireEmitter]: Infinity,
    [EPointType.Wire]: Infinity,
    [EPointType.Pipe]: Infinity,
    [EPointType.WindSource]: Infinity,
    [EPointType.StaticSand]: Infinity,
} 