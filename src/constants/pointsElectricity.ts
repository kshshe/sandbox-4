import { EPointType } from "../types"

export const POINTS_CAN_ACCEPT_ELECTRICITY: {
    [key in EPointType]?: true
} = {
    [EPointType.Metal]: true,
    [EPointType.Electricity_Ground]: true,
    [EPointType.Heater]: true,
    [EPointType.Cooler]: true,
    [EPointType.ColdDetector]: true,
    [EPointType.HotDetector]: true,
    [EPointType.LiquidDetector]: true,
    [EPointType.LightDetector]: true,
    [EPointType.LightBulb]: true,
    [EPointType.Electricity_Amplifier]: true,
} 