import { EPointType } from "../types"

export const LIQUID_POINT_TYPES: {
    [key in EPointType]?: true
} = {
    [EPointType.Water]: true,
    [EPointType.Lava]: true,
    [EPointType.LiquidGas]: true,
    [EPointType.MoltenMetal]: true,
    [EPointType.LiquidGlass]: true,
    [EPointType.Acid]: true
} 