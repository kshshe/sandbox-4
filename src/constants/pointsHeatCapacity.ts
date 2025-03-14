import { EPointType } from "../types"

export const POINTS_HEAT_CAPACITY: {
    [key in EPointType]?: number
} = {
    water: 1,
    sand: 1,
    virus: 1,
    acid: 1,
    
    liquidGas: 2,
    stone: 2,
    staticStone: 2,
    lava: 2,
    wood: 2,

    steam: 0.1,
    gas: 0.1,

    [EPointType.Electricity_Ground]: 1,
    [EPointType.Electricity_Source]: 1,
    [EPointType.Metal]: 0.5,
    [EPointType.MoltenMetal]: 0.5,
    [EPointType.Dynamite]: 4,

    constantCold: 100,
    constantHot: 100,
    fire: 100,
    iceFire: 100,
} 