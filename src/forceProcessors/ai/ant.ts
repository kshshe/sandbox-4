import { TForceProcessor } from "..";
import { EPointType, TCoordinate } from "../../types";
import { Points } from "../../classes/points";
import { TPoint } from "../../types";
import { Speed } from "../../classes/speed";
import { randomOf } from "../../utils/randomOf";
import { gravity } from "../gravity";
import { random } from "../../utils/random";
import { cloneDeep } from "../../utils/cloneDeep";

export const CONVERT_ON_TOUCH: {
    [key in EPointType]?: EPointType
} = {
    [EPointType.Sand]: EPointType.StaticSand,
    [EPointType.Stone]: EPointType.StaticStone,
    [EPointType.Snow]: EPointType.Ice,
}

const CHANCE_TO_EAT_POINT = {
    [EPointType.StaticSand]: 0.001,
    [EPointType.Sand]: 0.07,
    [EPointType.Wood]: 0.004,
} as const

const CHANCE_TO_CARRY_POINT = {
    [EPointType.StaticSand]: 0.04,
    [EPointType.StaticStone]: 0.04,
    [EPointType.Wood]: 0.08,
    [EPointType.Water]: 0.04,
    [EPointType.Ant]: 0,
    [EPointType.Glass]: 0,
    [EPointType.Border]: 0,
    default: 0.01,
} as const

const CHANCE_TO_PUT_POINT = 0.1
const CHANCE_TO_KEEP_POINT_AFTER_PUT = 0.27
const CHANCE_TO_REPRODUCE = 0.0006
const AGE_TO_REPRODUCE = 1500

const DIE_IF_TOUCHED_POINT = {
    [EPointType.Water]: true,
} as const

const CANT_WALK_ON_POINT = {
    ...DIE_IF_TOUCHED_POINT,
    [EPointType.Border]: true,
} as const

const moveTo = (point: TPoint, target: TCoordinate, iteration: number) => {
    if (!Points.getPointByCoordinates(target)) {
        Points.deletePointInIndex(point.coordinates)
        point.coordinates = target
        point.speed.x = 0
        point.speed.y = 0
        point.data.lastMoveOnIteration = iteration
        Points.setPointInIndex(point.coordinates, point)
        Points.markPointAsUsed(point)
    }
}

const STEP_TO_MOVE = 3
const MAX_STEPS_WITHOUT_MOVE = 600
const MAX_AGE = 10000
const CHANCE_TO_DIE_OF_OLD_AGE = 0.0005
const LOWER_CHANCE_TO_TAKE_POINT_FOR_STEPS = 200

const die = (point: TPoint, reason: string) => {
    console.log(`Ant died: ${reason}`)
    Points.deletePoint(point);
    if (point.data.carriedPoint) {
        Points.addPoint({
            coordinates: point.coordinates,
            type: point.data.carriedPoint.type,
            speed: { x: 0, y: 0 },
            data: cloneDeep(point.data.carriedPoint.data),
        })
    }
}

export const ant: TForceProcessor = (point, step) => {
    if (step % STEP_TO_MOVE !== 0) {
        return
    }

    const lastMoveOnIteration = point.data.lastMoveOnIteration
    if (lastMoveOnIteration && step - lastMoveOnIteration > MAX_STEPS_WITHOUT_MOVE) {
        die(point, 'Max steps without move')
        return
    }

    point.data.reproduceSteps = (point.data.reproduceSteps ?? 0) + 1
    point.data.age = (point.data.age ?? 0) + 1

    if (point.data.age > MAX_AGE) {
        if (random() < CHANCE_TO_DIE_OF_OLD_AGE) {
            die(point, 'Died of old age')
            return
        }
    }

    if (random() < CHANCE_TO_REPRODUCE && point.data.reproduceSteps > AGE_TO_REPRODUCE) {
        const firstAvailablePosition = Speed.possibleNeighbours.find(position => !Points.getPointByCoordinates({
            x: position.x + point.coordinates.x,
            y: position.y + point.coordinates.y,
        }))
        if (firstAvailablePosition) {
            point.data.reproduceSteps = -AGE_TO_REPRODUCE * 10
            console.log('Ant: Reproduce')
            Points.addPoint({
                coordinates: {
                    x: firstAvailablePosition.x + point.coordinates.x,
                    y: firstAvailablePosition.y + point.coordinates.y,
                },
                type: point.type,
                speed: { x: 0, y: 0 },
            })
        }
    }

    const neighbors = Points.getNeighbours(point)
    const possibleTargets: Record<string, TCoordinate> = {}

    for (const neighbor of neighbors) {
        if (neighbor.type === point.type) {
            continue
        }

        if (DIE_IF_TOUCHED_POINT[neighbor.type]) {
            if (random() < 0.001) {
                die(point, 'Died if touched point')
                return
            }
            continue
        }

        if (CANT_WALK_ON_POINT[neighbor.type]) {
            continue
        }

        // Carry point
        const wasPutByAntRecently = point.data.wasPutByAntOnIteration && step - point.data.wasPutByAntOnIteration < LOWER_CHANCE_TO_TAKE_POINT_FOR_STEPS
        const chanceModifier = wasPutByAntRecently ? 0.3 : 1
        const chanceToCarryPointForThisType = CHANCE_TO_CARRY_POINT[neighbor.type] ?? CHANCE_TO_CARRY_POINT.default
        const chanceToCarryPoint = !point.data.carriedPoint && chanceToCarryPointForThisType
        if (chanceToCarryPoint && random() < chanceToCarryPoint * chanceModifier) {
            point.data.carriedPoint = neighbor
            Points.deletePoint(neighbor)
            continue
        }

        // Eat point
        const chanceToEatPoint = CHANCE_TO_EAT_POINT[neighbor.type]
        if (chanceToEatPoint && random() < chanceToEatPoint) {
            point.data.previousTarget = {
                x: neighbor.coordinates.x - point.coordinates.x,
                y: neighbor.coordinates.y - point.coordinates.y,
            }
            Points.deletePoint(neighbor)
            continue
        }

        // Convert on touch
        const convertOnTouch = CONVERT_ON_TOUCH[neighbor.type]
        if (convertOnTouch) {
            neighbor.type = convertOnTouch
            Points.onPointUpdated(neighbor)
        }

        for (const position of Speed.possibleNeighbours) {
            const target = {
                x: neighbor.coordinates.x + position.x,
                y: neighbor.coordinates.y + position.y,
            }

            if (Math.abs(target.x - point.coordinates.x) > 1 || Math.abs(target.y - point.coordinates.y) > 1) {
                continue
            }

            if (!Points.getPointByCoordinates(target)) {
                possibleTargets[target.x + '-' + target.y] = target
            }
        }
    }

    if (Object.keys(possibleTargets).length > 0) {
        const targets = Object.values(possibleTargets)
        const previousTarget = point.data.previousTarget || Speed.self
        const targetsWithSimilarityWithPreviousTarget = targets.map(target => {
            const targetDiffX = target.x - point.coordinates.x
            const targetDiffY = target.y - point.coordinates.y
            const targetVector = {
                x: targetDiffX,
                y: targetDiffY,
            }
            const previousTargetVector = previousTarget
            const diffOfVectors = {
                x: targetVector.x - previousTargetVector.x,
                y: targetVector.y - previousTargetVector.y,
            }
            const distanceBetweenVectors = Math.abs(diffOfVectors.x * diffOfVectors.x + diffOfVectors.y * diffOfVectors.y)
            return {
                target,
                distance: distanceBetweenVectors,
            }
        })
        const minDistance = Math.min(...targetsWithSimilarityWithPreviousTarget.map(target => target.distance))
        const targetsWithMinDistance = targetsWithSimilarityWithPreviousTarget.filter(target => target.distance === minDistance)
        const randomTargetData = targetsWithMinDistance.length ? randomOf(targetsWithMinDistance) : randomOf(targetsWithSimilarityWithPreviousTarget)

        const randomTarget = randomTargetData.target
        const targetDiffX = randomTarget.x - point.coordinates.x
        const targetDiffY = randomTarget.y - point.coordinates.y

        point.data.previousTarget = {
            x: targetDiffX,
            y: targetDiffY,
        }

        const oldCoordinatesX = point.coordinates.x
        const oldCoordinatesY = point.coordinates.y

        moveTo(point, randomTarget, step)

        const carriedPoint = point.data.carriedPoint as TPoint | null
        if (carriedPoint && random() < CHANCE_TO_PUT_POINT) {
            Points.addPoint({
                coordinates: {
                    x: oldCoordinatesX,
                    y: oldCoordinatesY,
                },
                type: carriedPoint.type,
                speed: { x: 0, y: 0 },
                data: {
                    ...cloneDeep(carriedPoint.data),
                    wasPutByAntOnIteration: step,
                },
            })
            if (random() > CHANCE_TO_KEEP_POINT_AFTER_PUT) {
                point.data.carriedPoint = null
            }
        }

        return
    }

    for (let i = 0; i < STEP_TO_MOVE; i++) {
        gravity(point, step)
    }

    point.data.lastMoveOnIteration = step
}