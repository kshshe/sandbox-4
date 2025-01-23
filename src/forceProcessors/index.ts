import { TPoint } from "../classes/points";
import { EPointType } from "../types";

import { gravity } from "./gravity";
import { sandLike } from "./sandLike";
import { airFriction } from "./airFriction";

export type TForceProcessor = (point: TPoint) => void

const BASIC_FORCES: TForceProcessor[] = [
    gravity,
    airFriction,
]

export const forcesByType: Record<EPointType, TForceProcessor[]> = {
    [EPointType.Water]: [
        ...BASIC_FORCES,
    ],
    [EPointType.Sand]: [
        ...BASIC_FORCES,
        sandLike,
    ],
    [EPointType.Border]: [],
}