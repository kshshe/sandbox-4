import { Points, TPoint } from "../../classes/points";
import { Speed } from "../../classes/speed";
import { LIQUID_POINT_TYPES } from "../../constants/pointsLiquids";
import { EPointType, TCoordinate } from "../../types";
import { random } from "../../utils/random";
import { gravity } from "../gravity";
import { CONVERT_ON_TOUCH } from "./ant";

const CANT_MOVE_THROUGH_POINTS = {
    [EPointType.Border]: true,
    [EPointType.Worm]: true,
    ...LIQUID_POINT_TYPES
} as const

const CHANCE_TO_EAT = {
    [EPointType.Worm]: 0.01,
    [EPointType.Wood]: 0.01,
    [EPointType.Sand]: 0.01,
    default: 0.003,
} as const

const MOVE_EACH_ITERATION = 6
const DIRECTION_CHANGE_CHANCE = 0.1
const REPRODUCTION_CHANCE = 0.005

const moveTo = (point: TPoint, target: TCoordinate, iteration: number) => {
    const pointThere = Points.getPointByCoordinates(target)
    const oldX = point.coordinates.x
    const oldY = point.coordinates.y
    Points.deletePointInIndex(point.coordinates)
    const chanceToEat = pointThere ? CHANCE_TO_EAT[pointThere.type] || CHANCE_TO_EAT.default : CHANCE_TO_EAT.default
    const shouldEat = random() < chanceToEat
    if (pointThere) {
        Points.deletePointInIndex(pointThere.coordinates)
        if (shouldEat) {
            Points.deletePoint(pointThere)
        } else {
            pointThere.coordinates = { x: oldX, y: oldY }
        }
    }
    point.coordinates = {
        x: target.x,
        y: target.y,
    }
    if (pointThere && !shouldEat) {
        Points.setPointInIndex(pointThere.coordinates, pointThere)
        Points.markNeighboursAsUsed(pointThere)
    }
    Points.setPointInIndex(point.coordinates, point)
    point.speed.x = 0
    point.speed.y = 0
    point.data.lastMoveOnIteration = iteration

    Points.markNeighboursAsUsed(point)
}

const isDirectionAvailable = (direction: TCoordinate, point: TPoint) => {
    const pointThere = Points.getPointByCoordinates({
        x: point.coordinates.x + direction.x,
        y: point.coordinates.y + direction.y,
    })
    return pointThere && !CANT_MOVE_THROUGH_POINTS[pointThere.type]
}

const getNewDirection = (point: TPoint): TCoordinate | undefined => {
    const possibleDirections: TCoordinate[] = []
    for (const direction of Speed.possibleNeighbours) {
        if (isDirectionAvailable(direction, point)) {
            possibleDirections.push(direction)
        }
    }
    if (possibleDirections.length === 0) {
        return undefined
    }
    return possibleDirections[Math.floor(random() * possibleDirections.length)]
}

const getNextDirection = (point: TPoint, previousDirection?: TCoordinate) => {
    if (!previousDirection) {
        return getNewDirection(point)
    }

    if (!isDirectionAvailable(previousDirection, point) || random() < DIRECTION_CHANGE_CHANCE) {
        return getNewDirection(point)
    }

    return previousDirection
}

export const worm = (point: TPoint, step: number) => {
    const possibleNeighbours = Points.getNeighbours(point)
        .filter(neighbour => !CANT_MOVE_THROUGH_POINTS[neighbour.type])
    if (
        step % MOVE_EACH_ITERATION !== 0 ||
        possibleNeighbours.length === 0
    ) {
        gravity(point, step)
        return;
    }

    for (const neighbour of possibleNeighbours) {
        const convertedType = CONVERT_ON_TOUCH[neighbour.type]
        if (convertedType) {
            neighbour.type = convertedType
            Points.onPointUpdated(neighbour)
        }
    }

    if (random() < REPRODUCTION_CHANCE) {
        const slot = Speed.possibleNeighbours.find(direction => {
            const pointThere = Points.getPointByCoordinates({
                x: point.coordinates.x + direction.x,
                y: point.coordinates.y + direction.y,
            })
            return !pointThere
        })
        if (slot) {
            Points.addPoint({
                coordinates: {
                    x: point.coordinates.x + slot.x,
                    y: point.coordinates.y + slot.y,
                },
                type: EPointType.Worm,
                speed: { x: 0, y: 0 },
                data: {},
            })
        }
    }
    const previousDirection = point.data.previousDirection
    const newDirection = getNextDirection(point, previousDirection)
    if (newDirection) {
        point.data.previousDirection = newDirection
        moveTo(point, {
            x: point.coordinates.x + newDirection.x,
            y: point.coordinates.y + newDirection.y,
        }, step)
    }
} 