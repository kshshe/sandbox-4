import { TPoint } from "../classes/points";
import { EPointType } from "../types";

import { gravity } from "./gravity";
import { liquid } from "./liquid";
import { drowning } from "./drowning";
import { lifetime } from "./lifetime";
import { bomb } from "./bomb";
import { staticForce } from "./static";
import { staticTemperature, convertOnTemperature, moveToBaseTemperature } from "./temperature";
import { INITIAL_TEMPERATURE } from "../config";
import { chaos } from "./chaos";
import { voidProcessor } from "./void";
import { clone } from "./clone";
import { emitter } from "./emitter";
import { dynamite } from "./dynamite";
import { ground } from "./ground";
import { directionToGround } from "./directionToGround";
import { throttle } from "./utils/throttle";
import { spark } from "./spark";
import { sendCharge } from "./sendCharge";
import { electricitySource } from "./electricitySource";
import { virus } from "./virus";
import { heal } from "./heal";
import { acid } from "./acid";
import { plant } from "./plant";
import { heater } from "./heater";
import { cooler } from "./cooler";
import { coldDetector } from "./coldDetector";
import { hotDetector } from "./hotDetector";
import { liquidDetector } from "./liquidDetector";
import { pipeTeleport } from "./pipeTeleport";
import { LIQUID_POINT_TYPES } from "../constants/pointsLiquids";
import { smoke } from "./smoke";
import { electricityAmplifier } from "./electricityAmplifier";
import { magnetAttraction } from "./magnetAttraction";

export type TForceProcessor = (point: TPoint, step: number) => void

const noopDetector = () => {}

const BASIC_TEMPERATURE_PROCESSORS = [
    noopDetector,
    throttle(moveToBaseTemperature(0.05), 10),
]

const BASIC_FORCES: TForceProcessor[] = [
    ...BASIC_TEMPERATURE_PROCESSORS,
    gravity,
    drowning,
]

export const forcesByType: Record<EPointType, TForceProcessor[]> = {
    [EPointType.Metal]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        throttle(directionToGround, 10),
        sendCharge,
        convertOnTemperature('more', 1200, EPointType.MoltenMetal),
    ],
    [EPointType.MoltenMetal]: [
        ...BASIC_FORCES,
        directionToGround,
        sendCharge,
        convertOnTemperature('less', 450, EPointType.Metal),
    ],
    [EPointType.Electricity_Spark]: [
        ...BASIC_FORCES,
        chaos(1),
        spark,
    ],
    [EPointType.Electricity_Source]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        sendCharge,
        electricitySource,
        throttle(directionToGround, 10),
    ],
    [EPointType.Electricity_Ground]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        throttle(ground, 10),
        throttle(directionToGround, 10),
    ],
    [EPointType.Electricity_Amplifier]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        electricityAmplifier,
        sendCharge,
        throttle(directionToGround, 10),
    ],
    [EPointType.Heater]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        heater,
        staticForce,
        sendCharge,
        ground,
    ],
    [EPointType.Cooler]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        cooler,
        staticForce,
        sendCharge,
        ground,
    ],
    [EPointType.Water]: [
        ...BASIC_FORCES,
        liquid,
        convertOnTemperature('less', -2, EPointType.Ice),
        convertOnTemperature('more', 99, EPointType.Steam),
    ],
    [EPointType.LiquidGas]: [
        ...BASIC_FORCES,
        liquid,
        convertOnTemperature('more', -100, EPointType.Gas),
    ],
    [EPointType.Lava]: [
        ...BASIC_FORCES,
        liquid,
        convertOnTemperature('less', 500, EPointType.StaticStone),
    ],
    [EPointType.Sand]: [
        ...BASIC_FORCES,
        convertOnTemperature('more', 850, EPointType.LiquidGlass),
    ],
    [EPointType.StaticStone]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        convertOnTemperature('more', 550, EPointType.Lava),
    ],
    [EPointType.Stone]: [
        ...BASIC_FORCES,
        convertOnTemperature('more', 550, EPointType.Lava),
    ],
    [EPointType.Smoke]: [
        ...BASIC_FORCES,
        lifetime(100, 200),
        smoke,
    ],
    [EPointType.Fire]: [
        ...BASIC_FORCES,
        lifetime(8, 50),
        staticTemperature(INITIAL_TEMPERATURE[EPointType.Fire] ?? 2000),
        emitter(EPointType.Smoke, 0.02, 0.001),
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
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        dynamite,
    ],
    [EPointType.Ice]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        convertOnTemperature('more', 3, EPointType.Water),
    ],
    [EPointType.Glass]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        convertOnTemperature('more', 850, EPointType.LiquidGlass),
    ],
    [EPointType.LiquidGlass]: [
        ...BASIC_FORCES,
        liquid,
        convertOnTemperature('less', 750, EPointType.Glass),
    ],
    [EPointType.ConstantCold]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticTemperature(INITIAL_TEMPERATURE[EPointType.ConstantCold] ?? -500),
        staticForce,
    ],
    [EPointType.ConstantHot]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticTemperature(INITIAL_TEMPERATURE[EPointType.ConstantHot] ?? 500),
        staticForce,
    ],
    [EPointType.Gas]: [
        ...BASIC_FORCES,
        chaos(1000),
        convertOnTemperature('more', 250, EPointType.FireEmitter),
    ],
    [EPointType.Wood]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        convertOnTemperature('more', 400, EPointType.BurningWood),
    ],
    [EPointType.BurningWood]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        lifetime(500, 1000),
        staticTemperature(800),
        emitter(EPointType.Fire, 0.2),
        emitter(EPointType.Smoke, 0.2, 0.001),
    ],
    [EPointType.FireEmitter]: [
        ...BASIC_FORCES,
        lifetime(30, 120),
        emitter(EPointType.Fire),
        emitter(EPointType.Smoke, 0.05, 0.001),
    ],
    [EPointType.Clone]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        clone,
    ],
    [EPointType.Oil]: [
        ...BASIC_FORCES,
        liquid,
        convertOnTemperature('more', 350, EPointType.BurningOil),
    ],
    [EPointType.BurningOil]: [
        ...BASIC_FORCES,
        liquid,
        emitter(EPointType.Fire, 0.5),
        emitter(EPointType.Smoke, 0.05, 0.001),
        staticTemperature(400),
        lifetime(100, 200),
    ],
    [EPointType.Steam]: [
        ...BASIC_FORCES,
        chaos(100),
        convertOnTemperature('less', 60, EPointType.Water),
        moveToBaseTemperature(0.02),
    ],
    [EPointType.Border]: [
        noopDetector,
    ],
    [EPointType.Void]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        voidProcessor,
        staticForce,
    ],
    [EPointType.Virus]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        virus,
        staticForce,
    ],
    [EPointType.Heal]: [
        ...BASIC_FORCES,
        heal,
    ],
    [EPointType.Acid]: [
        ...BASIC_FORCES,
        liquid,
        acid,
    ],
    [EPointType.Magnet]: [
        ...BASIC_FORCES,
        magnetAttraction,
    ],
    [EPointType.Plant]: [
        ...BASIC_FORCES,
        staticForce,
        plant,
        convertOnTemperature('more', 400, EPointType.BurningWood),
    ],
    [EPointType.PlantSeed]: [
        ...BASIC_FORCES,
        plant,
        convertOnTemperature('more', 400, EPointType.BurningWood),
    ],
    [EPointType.ColdDetector]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        coldDetector,
        sendCharge,
        throttle(directionToGround, 10),
    ],
    [EPointType.HotDetector]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        hotDetector,
        sendCharge,
        throttle(directionToGround, 10),
    ],
    [EPointType.LiquidDetector]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
        liquidDetector,
        sendCharge,
        throttle(directionToGround, 10),
    ],
    [EPointType.Snow]: [
        ...BASIC_FORCES,
        chaos(5),
        convertOnTemperature('more', 0, EPointType.Water),
    ],
    [EPointType.Wire]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
    ],
    [EPointType.Pipe]: [
        ...BASIC_TEMPERATURE_PROCESSORS,
        staticForce,
    ],
}

Object.keys(forcesByType).forEach(type => {
    const hasNoopDetector = forcesByType[type as EPointType].some(force => force === noopDetector)
    if (!hasNoopDetector) {
        console.warn(`Noop detector is missing for ${type}`)
    } else {
        forcesByType[type as EPointType] = forcesByType[type as EPointType].filter(force => force !== noopDetector)
    }
})

Object.keys(LIQUID_POINT_TYPES).forEach(type => {
    forcesByType[type as EPointType] = [
        ...forcesByType[type as EPointType],
        pipeTeleport,
    ]
})