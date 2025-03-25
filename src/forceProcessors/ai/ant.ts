import { TForceProcessor } from "..";
import { EPointType, TCoordinate } from "../../types";
import { Points } from "../../classes/points";
import { TPoint } from "../../types";
import { Speed } from "../../classes/speed";
import { randomOf } from "../../utils/randomOf";
import { gravity } from "../gravity";
import { random } from "../../utils/random";
import { cloneDeep } from "../../utils/cloneDeep";

const CONVERT_ON_TOUCH: {
    [key in EPointType]?: EPointType
} = {
    [EPointType.Sand]: EPointType.StaticSand,
    [EPointType.Stone]: EPointType.StaticStone,
}

const CHANCE_TO_EAT_POINT = {
    [EPointType.StaticSand]: 0.001,
    [EPointType.Sand]: 0.07,
    [EPointType.Wood]: 0.001,
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
const CHANCE_TO_REPRODUCE = 0.002
const AGE_TO_REPRODUCE = 1500

const DIE_IF_TOUCHED_POINT = {
    [EPointType.Water]: true,
} as const

const moveTo = (point: TPoint, target: TCoordinate) => {
    if (!Points.getPointByCoordinates(target)) {
        Points.deletePointInIndex(point.coordinates)
        point.coordinates = target
        point.speed.x = 0
        point.speed.y = 0
        Points.setPointInIndex(point.coordinates, point)
        Points.markPointAsUsed(point)
    }
}

const STEP_TO_MOVE = 3

export const ant: TForceProcessor = (point, step) => {
    if (step % STEP_TO_MOVE !== 0) {
        return
    }

    if (point.data.temperature !== undefined && point.data.temperature < 2) {
        return;
    }

    point.data.age = (point.data.age ?? 0) + 1

    if (random() < CHANCE_TO_REPRODUCE && point.data.age > AGE_TO_REPRODUCE) {
        const firstAvailablePosition = Speed.possibleNeighbours.find(position => !Points.getPointByCoordinates({
            x: position.x + point.coordinates.x,
            y: position.y + point.coordinates.y,
        }))
        if (firstAvailablePosition) {
            point.data.age = 0
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
    const neighborsOfOtherType = neighbors.filter(neighbor => neighbor.type !== point.type)

    const carriedPoint = point.data.carriedPoint as TPoint | null
    if (carriedPoint && (random() < CHANCE_TO_PUT_POINT || !neighborsOfOtherType.length)) {
        const possibleDirections = Speed.possibleNeighbours.map(position => ({
            x: position.x + point.coordinates.x,
            y: position.y + point.coordinates.y,
        })).filter(target => {
            const targetPoint = Points.getPointByCoordinates(target)
            return !targetPoint
        })
        if (possibleDirections.length === 0) {
            return
        }
        const possibleDirectionsWithSomeNeighbours = possibleDirections.filter(direction => {
            return Speed.possibleNeighbours.some(neighbour => {
                return Points.getPointByCoordinates({
                    x: direction.x + neighbour.x,
                    y: direction.y + neighbour.y,
                })
            })
        })
        const target = randomOf(possibleDirectionsWithSomeNeighbours.length ? possibleDirectionsWithSomeNeighbours : possibleDirections)
        Points.addPoint({
            coordinates: target,
            type: carriedPoint.type,
            speed: { x: 0, y: 0 },
            data: cloneDeep(carriedPoint.data),
        })
        point.data.carriedPoint = null
    }

    for (const neighbor of neighbors) {
        if (neighbor.type === point.type) {
            continue
        }

        if (DIE_IF_TOUCHED_POINT[neighbor.type]) {
            if (random() < 0.001) {
                Points.deletePoint(point)
                return
            }
            continue
        }

        // Carry point
        const chanceToCarryPointForThisType = CHANCE_TO_CARRY_POINT[neighbor.type] ?? CHANCE_TO_CARRY_POINT.default
        const chanceToCarryPoint = !point.data.carriedPoint && chanceToCarryPointForThisType
        if (chanceToCarryPoint && random() < chanceToCarryPoint) {
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

        moveTo(point, randomTarget)
        return
    }

    for (let i = 0; i < STEP_TO_MOVE; i++) {
        gravity(point, step)
    }
}