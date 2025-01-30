import { CANT_BE_UNSED, INITIAL_TEMPERATURE } from '../config'
import { TCoordinate, EPointType } from '../types'
import { shake } from '../utils/shake'
import { Bounds } from './bounds'
import { Speed, TRoundedSpeed } from './speed'
import { Storage } from './storage'

export type TPoint = {
    coordinates: TCoordinate
    type: EPointType,
    speed: TCoordinate,
    data: Record<string, any>,
    wasDeleted?: boolean
    lastMoveOnIteration?: number
}

export class Points {
    private static _points: TPoint[] = []
    private static coordinatesIndex: Record<number, TPoint> = Storage.get('coordinatesIndex', {})
    private static unusedPoints: WeakSet<TPoint> = new WeakSet()

    static init() {
        this.updatePoints()
    }

    static isUnused(point: TPoint) {
        return this.unusedPoints.has(point)
    }

    static markPointAsUnused(point: TPoint) {
        if (CANT_BE_UNSED[point.type]) {
            return
        }
        this.unusedPoints.add(point)
    }

    static markPointAsUsed(point: TPoint) {
        this.unusedPoints.delete(point)
        point.lastMoveOnIteration = Storage.get('iteration', 0)
    }

    static markNeighboursAsUsed(point: TPoint) {
        this.markPointAsUsed(point)
        const neighbours = this.getNeighbours(point)
        for (const neighbour of neighbours) {
            this.markPointAsUsed(neighbour)
        }
    }

    static shufflePoints() {
        this._points = shake(this._points)
    }

    static updatePoints() {
        this._points = shake(Object.values(this.coordinatesIndex).filter(Boolean))
    }

    static deletePointInIndex(coordinates: TCoordinate) {
        const point = this.getPointByCoordinates(coordinates)
        if (point) {
            this.markNeighboursAsUsed(point)
        }
        delete this.coordinatesIndex[this.getIndexIndex(coordinates)]
    }

    static getIndexIndex(coordinates: TCoordinate) {
        const width = Bounds.getWidth()
        const i = coordinates.y * width + coordinates.x
        return i
    }

    static setPointInIndex(coordinates: TCoordinate, point: TPoint) {
        if (point.wasDeleted) {
            return
        }
        const pointThere = this.getPointByCoordinates(coordinates)
        if (pointThere && point !== pointThere) {
            throw new Error(`Point already exists at ${coordinates.x}:${coordinates.y}`)
        }
        if (point === pointThere) {
            return
        }
        this.unusedPoints.delete(point)
        point.lastMoveOnIteration = Storage.get('iteration', 0)
        this.coordinatesIndex[this.getIndexIndex(coordinates)] = point
    }

    static getPointByCoordinates(coordinates: TCoordinate): TPoint | undefined {
        return this.coordinatesIndex[this.getIndexIndex(coordinates)]
    }

    static addPoint(point: Omit<TPoint, 'data'>) {
        const pointWithData: TPoint = {
            data: {
                temperature: INITIAL_TEMPERATURE[point.type] ?? 15
            },
            ...point
        }
        if (this.getPointByCoordinates(point.coordinates)) {
            return
        }
        this.setPointInIndex(point.coordinates, pointWithData)
        this._points.push(pointWithData)
        this.markNeighboursAsUsed(pointWithData)
        this.save()
    }

    private static get points() {
        return this._points
    }

    static save() {
        Storage.set('coordinatesIndex', this.coordinatesIndex)
    }

    static deletePoint(point: TPoint) {
        const pointByCoordinates = this.getPointByCoordinates(point.coordinates)
        if (pointByCoordinates === point) {
            this.deletePointInIndex(point.coordinates)
            point.wasDeleted = true
            this.updatePoints()
        } else if (pointByCoordinates) {
            console.warn('Point not found by coordinates', point)
        }
    }

    static getPoints() {
        return this.points
    }

    static getPointsNear(coordinates: TCoordinate, withBorder = true): TPoint[] {
        const points: TPoint[] = []
        for (const neighbourPosition of Speed.possibleNeighbours) {
            const pointByCoordinates = this.getPointByCoordinates({
                x: coordinates.x + neighbourPosition.x,
                y: coordinates.y + neighbourPosition.y
            })
            if (pointByCoordinates) {
                if (!withBorder && pointByCoordinates.type === EPointType.Border) {
                    continue
                }
                points.push(pointByCoordinates)
            }
        }
        return points
    }

    static getActivePoints() {
        return this.points.filter(point => {
            if (point.type === EPointType.Border) {
                return false
            }

            if (point.wasDeleted) {
                return false
            }

            return true
        })
    }

    static getNeighbours(point: TPoint, withBorder = true): TPoint[] {
        return this.getPointsNear(point.coordinates, withBorder)
    }

    static getPointBySpeed(fromPoint: TPoint, roundedSpeed: TRoundedSpeed): TPoint | undefined {
        const { coordinates } = fromPoint
        const targetCoordinates = {
            x: coordinates.x + roundedSpeed.x,
            y: coordinates.y + roundedSpeed.y
        }
        return this.getPointByCoordinates(targetCoordinates)
    }
}