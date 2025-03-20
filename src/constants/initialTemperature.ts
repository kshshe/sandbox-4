import { EPointType } from "../types"

export const INITIAL_TEMPERATURE: {
    [key in EPointType]?: number
} = {
    [EPointType.Ice]: -60,
    [EPointType.Lava]: 1000,
    [EPointType.Steam]: 60,
    [EPointType.Fire]: 950,
    [EPointType.IceFire]: -700,
    [EPointType.LiquidGas]: -350,
    [EPointType.Virus]: 20,
    [EPointType.Acid]: 20,
    [EPointType.Glass]: 20,
    [EPointType.LiquidGlass]: 900,
    [EPointType.Smoke]: 50,
    [EPointType.Snow]: -100,
    [EPointType.Electricity_Amplifier]: 20,
    [EPointType.ConstantCold]: -500,
    [EPointType.ConstantHot]: 500,
    [EPointType.BurningWood]: 800,

    [EPointType.Electricity_Spark]: 100,
    [EPointType.Heater]: 20,
    [EPointType.Cooler]: 20,
    [EPointType.ColdDetector]: 20,
    [EPointType.HotDetector]: 20,
} 