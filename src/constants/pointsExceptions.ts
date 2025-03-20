import { EPointType } from "../types"

type TConfig = {
    [key in EPointType]?: true
}

export const MAGNET_POINTS_TO_MAGNETIZE: TConfig = {
    [EPointType.Metal]: true,
    [EPointType.MoltenMetal]: true,
}

// Acid processor exceptions
export const ACID_POINTS_TO_IGNORE: TConfig = {
    [EPointType.Acid]: true,
    [EPointType.Void]: true,
    [EPointType.Clone]: true,
    [EPointType.Border]: true,
    [EPointType.Glass]: true,
    [EPointType.LiquidGlass]: true,
}

// Virus processor exceptions
export const VIRUS_POINTS_TO_IGNORE: TConfig = {
    [EPointType.Void]: true,
    [EPointType.Clone]: true,
    [EPointType.Virus]: true,
    [EPointType.Border]: true,
    [EPointType.Heal]: true,
    [EPointType.Glass]: true,
    [EPointType.LiquidGlass]: true,
}

// Plant processor exceptions
export const PLANT_CAN_GROW_ON: TConfig = {
    [EPointType.Sand]: true,
    [EPointType.Plant]: true,
    [EPointType.PlantSeed]: true,
}

// Plant energy configuration
export const PLANT_ENERGY_INITIAL = {
    from: 5,
    to: 15,
}
