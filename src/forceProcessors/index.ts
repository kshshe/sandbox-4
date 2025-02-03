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
import { emitter } from "./emitter";
import { dynamite } from "./dynamite";

export type TForceProcessor = (point: TPoint) => void

const BASIC_FORCES: TForceProcessor[] = [
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
    [EPointType.LiquidGas]: [
        ...BASIC_FORCES,
        liquid,
        convertOnTemperature('more', 0, EPointType.Gas),
    ],
    [EPointType.Lava]: [
        ...BASIC_FORCES,
        liquid,
        convertOnTemperature('less', 500, EPointType.StaticStone),
    ],
    [EPointType.Sand]: [
        ...BASIC_FORCES,
    ],
    [EPointType.StaticStone]: [
        staticForce,
        convertOnTemperature('more', 750, EPointType.Lava),
    ],
    [EPointType.Stone]: [
        ...BASIC_FORCES,
        convertOnTemperature('more', 750, EPointType.Lava),
    ],
    [EPointType.Fire]: [
        ...BASIC_FORCES,
        lifetime(8, 50),
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
    [EPointType.Dynamite]: [
        staticForce,
        dynamite,
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
    [EPointType.Gas]: [
        ...BASIC_FORCES,
        chaos(1000),
        convertOnTemperature('more', 250, EPointType.FireEmitter),
    ],
    [EPointType.Wood]: [
        staticForce,
        convertOnTemperature('more', 400, EPointType.BurningWood),
    ],
    [EPointType.BurningWood]: [
        staticForce,
        lifetime(500, 1000),
        staticTemperature(800),
        emitter(EPointType.Fire, 0.2),
    ],
    [EPointType.FireEmitter]: [
        ...BASIC_FORCES,
        lifetime(30, 120),
        emitter(EPointType.Fire),
    ],
    [EPointType.Clone]: [
        staticForce,
        clone,
    ],
    [EPointType.Steam]: [
        ...BASIC_FORCES,
        chaos(100),
        convertOnTemperature('less', 60, EPointType.Water),
    ],
    [EPointType.Border]: [],
    [EPointType.Void]: [
        voidProcessor,
        staticForce,
    ],
}