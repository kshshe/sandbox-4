import { TPoint } from "../classes/points";
import { EPointType } from "../types";

import { gravity } from "./gravity";
import { liquid } from "./liquid";
import { drowning } from "./drowning";
import { lifetime } from "./lifetime";
import { bomb } from "./bomb";
import { staticForce } from "./static";
import { staticTemperature, convertOnTemperature } from "./temperature";
import { INITIAL_TEMPERATURE } from "../config";
import { chaos } from "./chaos";
import { voidProcessor } from "./void";
import { clone } from "./clone";

export type TForceProcessor = (point: TPoint) => void

const BASIC_FORCES: TForceProcessor[] = [
    chaos,
    gravity,
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
    [EPointType.ConstantCold]: [
        staticTemperature(INITIAL_TEMPERATURE[EPointType.ConstantCold] ?? -500),
        staticForce,
    ],
    [EPointType.ConstantHot]: [
        staticTemperature(INITIAL_TEMPERATURE[EPointType.ConstantHot] ?? 500),
        staticForce,
    ],
    [EPointType.Clone]: [
        staticForce,
        clone,
    ],
    [EPointType.Steam]: [
        ...BASIC_FORCES,
        liquid,
        convertOnTemperature('less', 60, EPointType.Water),
    ],
    [EPointType.Border]: [],
    [EPointType.Void]: [
        voidProcessor,
        staticForce,
    ],
}