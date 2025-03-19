import { EPointType } from "../types"

export const POINTS_CAN_ACCEPT_ELECTRICITY: {
    [key in EPointType]?: true
} = {
    [EPointType.Metal]: true,
    [EPointType.Electricity_Ground]: true,
    [EPointType.Heater]: true,
    [EPointType.Cooler]: true,
} 