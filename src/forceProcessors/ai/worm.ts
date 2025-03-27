import { Points, TPoint } from "../../classes/points";
import { Speed } from "../../classes/speed";
import { EPointType, TCoordinate } from "../../types";
import { random } from "../../utils/random";
import { gravity } from "../gravity";

const CANT_MOVE_THROUGH_POINTS = {
    [EPointType.Border]: true,
    [EPointType.Worm]: true,
} as const

const MOVE_EACH_ITERATION = 6
const DIRECTION_CHANGE_CHANCE = 0.1

const moveTo = (point: TPoint, target: TCoordinate, iteration: number) => {
    const pointThere = Points.getPointByCoordinates(target)
    const oldX = point.coordinates.x
    const oldY = point.coordinates.y
    Points.deletePointInIndex(point.coordinates)
    if (pointThere) {
        Points.deletePointInIndex(pointThere.coordinates)
        pointThere.coordinates = { x: oldX, y: oldY }
    }
    point.coordinates = {
        x: target.x,
        y: target.y,
    }
    if (pointThere) {
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
    return !pointThere || !CANT_MOVE_THROUGH_POINTS[pointThere.type]
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
    if (
        step % MOVE_EACH_ITERATION !== 0 ||
        !Points.getNeighbours(point)
            .filter(neighbour => !CANT_MOVE_THROUGH_POINTS[neighbour.type])
            .length
    ) {
        gravity(point, step)
        return;
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