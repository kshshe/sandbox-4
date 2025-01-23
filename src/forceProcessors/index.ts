import { TPoint } from "../classes/points";
import { EPointType } from "../types";

import { gravity } from "./gravity";
import { airFriction } from "./airFriction";
import { liquid } from "./liquid";
import { drowning } from "./drowning";
import { lifetime } from "./lifetime";
import { bomb } from "./bomb";
import { staticForce } from "./static";
import { staticTemperature, convertOnTemperature } from "./temperature";
import { INITIAL_TEMPERATURE } from "../config";

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
        convertOnTemperature('less', -2, EPointType.Ice),
        convertOnTemperature('more', 99, EPointType.Steam),
    ],
    [EPointType.Sand]: [
        ...BASIC_FORCES,
    ],
    [EPointType.Stone]: [
        ...BASIC_FORCES,
    ],
    [EPointType.Fire]: [
        ...BASIC_FORCES,
        lifetime(30, 120),
        staticTemperature(INITIAL_TEMPERATURE[EPointType.Fire] ?? 2000),
    ],
    [EPointType.IceFire]: [
        ...BASIC_FORCES,
        lifetime(30, 120),
        staticTemperature(INITIAL_TEMPERATURE[EPointType.IceFire] ?? -700),
    ],
    [EPointType.Bomb]: [
        ...BASIC_FORCES,
        bomb,
    ],
    [EPointType.Ice]: [
        staticForce,
        convertOnTemperature('more', 3, EPointType.Water),
    ],
    [EPointType.Steam]: [
        ...BASIC_FORCES,
        liquid,
        convertOnTemperature('less', 60, EPointType.Water),
    ],
    [EPointType.Border]: [],
}