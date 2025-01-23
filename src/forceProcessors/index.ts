import { TPoint } from "../classes/points";
import { EPointType } from "../types";

import { gravity } from "./gravity";
import { sandLike } from "./sandLike";
import { airFriction } from "./airFriction";
import { liquid } from "./liquid";
import { drowning } from "./drowning";

export type TForceProcessor = (point: TPoint) => void

const BASIC_FORCES: TForceProcessor[] = [
    gravity,
    airFriction,
    drowning,
]

export const forcesByType: Record<EPointType, TForceProcessor[]> = {
    [EPointType.Water]: [
        ...BASIC_FORCES,
        liquid,
    ],
    [EPointType.Sand]: [
        ...BASIC_FORCES,
        sandLike,
    ],
    [EPointType.Stone]: [
        ...BASIC_FORCES,
    ],
    [EPointType.Border]: [],
}