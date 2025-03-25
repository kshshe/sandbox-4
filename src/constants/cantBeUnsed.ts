import { EPointType } from "../types"

export const CANT_BE_UNSED: {
    [key in EPointType]?: boolean
} = {
    [EPointType.Bomb]: true,
    [EPointType.Border]: true,
    [EPointType.Void]: true,
    [EPointType.Clone]: true,
    [EPointType.ConstantCold]: true,
    [EPointType.ConstantHot]: true,
    [EPointType.FireEmitter]: true,
    [EPointType.Fire]: true,
    [EPointType.IceFire]: true,
    [EPointType.BurningWood]: true,
    [EPointType.Dynamite]: true,
    [EPointType.Electricity_Ground]: true,
    [EPointType.Electricity_Spark]: true,
    [EPointType.Electricity_Source]: true,
    [EPointType.Heal]: true,
    [EPointType.Ant]: true,
} 