import { TPoint } from "../classes/points";
import { EPointType } from "../types";

import { gravity } from "./gravity";
import { sandLike } from "./sandLike";

export type TForceProcessor = (point: TPoint) => void

export const forcesByType: Record<EPointType, TForceProcessor[]> = {
    [EPointType.Water]: [
        gravity,
    ],
    [EPointType.Sand]: [
        gravity,
        sandLike,
    ],
    [EPointType.Border]: [],
}