import { EPointType } from "../types"

export const POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS: {
    [key in EPointType]?: number
} = {
    [EPointType.Stone]: 0,
    [EPointType.StaticStone]: 0,
    [EPointType.Void]: 0,
    [EPointType.Clone]: 0,
    [EPointType.Wood]: 0,
    [EPointType.BurningWood]: 0,
    [EPointType.Glass]: 0,
    [EPointType.Fire]: 4,
    [EPointType.IceFire]: 4,
    [EPointType.Steam]: 10,
    [EPointType.Gas]: 10,
    [EPointType.Electricity_Spark]: 10,
    [EPointType.Smoke]: 5,
    [EPointType.Ant]: 0,
} 