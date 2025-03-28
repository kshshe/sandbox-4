import { conversionTemperatureStats } from "../forceProcessors/temperature"
import { EPointType } from "../types"

export const INITIAL_TEMPERATURE: {
    [key in EPointType]?: number
} = {
    [EPointType.Ice]: -20,
    [EPointType.Lava]: 1500,
    [EPointType.Steam]: 120,
    [EPointType.Fire]: conversionTemperatureStats.max + 100,
    [EPointType.IceFire]: conversionTemperatureStats.min - 100,
    [EPointType.LiquidGas]: -180,
    [EPointType.Virus]: 20,
    [EPointType.Acid]: 20,
    [EPointType.Glass]: 25,
    [EPointType.LiquidGlass]: 1500,
    [EPointType.Smoke]: 200,
    [EPointType.Snow]: -20,
    [EPointType.Electricity_Amplifier]: 20,
    [EPointType.ConstantCold]: conversionTemperatureStats.min - 100,
    [EPointType.ConstantHot]: conversionTemperatureStats.max + 100,
    [EPointType.BurningWood]: 800,
    [EPointType.Water]: 20,
    [EPointType.Metal]: 25,
    [EPointType.MoltenMetal]: 1600,
    [EPointType.StaticStone]: 25,
    [EPointType.Stone]: 25,
    [EPointType.Sand]: 25,
    [EPointType.StaticSand]: 25,
    [EPointType.Gas]: 25,
    [EPointType.Wood]: 25,
    [EPointType.Oil]: 20,
    [EPointType.BurningOil]: 350,
    [EPointType.FireAnt]: 800,
    [EPointType.IceAnt]: -400,
    [EPointType.Mirror]: 25,

    [EPointType.Electricity_Spark]: 100,
    [EPointType.Heater]: 20,
    [EPointType.Cooler]: 20,
    [EPointType.ColdDetector]: 20,
    [EPointType.HotDetector]: 20,
    [EPointType.LightBulb]: 20,
} 

setInterval(() => {
    INITIAL_TEMPERATURE[EPointType.Fire] = conversionTemperatureStats.max + 100
    INITIAL_TEMPERATURE[EPointType.IceFire] = conversionTemperatureStats.min - 100
    INITIAL_TEMPERATURE[EPointType.ConstantCold] = conversionTemperatureStats.min - 100
    INITIAL_TEMPERATURE[EPointType.ConstantHot] = conversionTemperatureStats.max + 100
}, 5000)