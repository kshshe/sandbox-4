import { EPointType } from "../types"

export const POINTS_CAN_ACCEPT_ELECTRICITY: {
    [key in EPointType]?: boolean
} = {
    [EPointType.Metal]: true,
    [EPointType.Electricity_Ground]: true,
} 