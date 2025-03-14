import { EPointType } from "../types"

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