import { CANT_BE_UNSED, INITIAL_TEMPERATURE } from '../config'
import { IS_LIGHT_SOURCE } from '../constants/pointsExceptions'
import { TCoordinate, EPointType } from '../types'
import { shake } from '../utils/shake'
import { Bounds } from './bounds'
import { Connections } from './connections'
import { Controls } from './controls'
import { LightSystem } from './lightSystem'
import { Speed, TRoundedSpeed } from './speed'
import { Storage } from './storage'
import { WindVectors } from './windVectors'

export type TPoint = {
    id: number
    coordinates: TCoordinate
    type: EPointType,
    speed: TCoordinate,
    data: Record<string, any>,
    wasDeleted?: boolean
    lastMoveOnIteration?: number
    visualCoordinates?: TCoordinate
    colorVariation?: number
}

export class Points {
    private static _points: TPoint[] = []
    private static coordinatesIndex: Record<number, TPoint> = Storage.get('coordinatesIndex', {})
    private static unusedPoints: WeakSet<TPoint> = new WeakSet()
    private static idCounter = Storage.get('idCounter', 0)

    static init() {
        this.updatePoints()
        for (const point of this._points) {
            this.checkPointIsLightSource(point)
        }
    }

    static onPointUpdated(point: TPoint) {
        this.checkPointIsLightSource(point)
    }

    static checkPointIsLightSource(point: TPoint) {
        if (IS_LIGHT_SOURCE[point.type]) {
            LightSystem.addLightSourcePoint(point)
        } else {
            LightSystem.removeLightSourcePoint(point)
        }
    }

    static deleteAllPoints() {
        this._points = []
        this.coordinatesIndex = {}
        this.unusedPoints = new WeakSet()
        Storage.set('wasInit', false)
        Connections.deleteAllConnections()
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
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                const neighbour = this.getPointByCoordinates({
                    x: point.coordinates.x + x,
                    y: point.coordinates.y + y
                })
                if (neighbour) {
                    this.markPointAsUsed(neighbour)
                }
            }
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
        
        point.coordinates = { ...coordinates }
        this.coordinatesIndex[this.getIndexIndex(coordinates)] = point
    }

    static getPointByCoordinates(coordinates: TCoordinate): TPoint | undefined {
        return this.coordinatesIndex[this.getIndexIndex(coordinates)]
    }

    static addPoint(point: Omit<TPoint, 'data' | 'id'> & {
        data?: TPoint['data']
    }) {
        if (this.getPointByCoordinates(point.coordinates)) {
            return
        }
        const availablePointsCount = Bounds.getWidth() * Bounds.getHeight()
        if (this._points.length >= availablePointsCount * 0.95) {
            console.warn('Too many points, skipping', point)
            return
        }
        const pointWithData: TPoint = {
            data: {},
            ...point,
            id: this.idCounter++,
            visualCoordinates: { ...point.coordinates },
            colorVariation: Math.random() * 2 - 1 // Random value between -1 and 1
        }
        if (!pointWithData.data) {
            pointWithData.data = {}
        }
        if (!pointWithData.data.temperature) {
            pointWithData.data.temperature = INITIAL_TEMPERATURE[point.type] ?? Controls.getBaseTemperature()
        }
        this.checkPointIsLightSource(pointWithData)
        this.setPointInIndex(point.coordinates, pointWithData)
        this._points.push(pointWithData)
        this.markNeighboursAsUsed(pointWithData)
        this.save()
        return pointWithData
    }

    private static get points() {
        return this._points
    }

    static save() {
        Storage.set('coordinatesIndex', this.coordinatesIndex)
        Storage.set('idCounter', this.idCounter)
    }

    static deletePoint(point: TPoint) {
        this.markNeighboursAsUsed(point)
        if (point.type === EPointType.WindSource) {
            WindVectors.clearVectors()
        }
        const pointByCoordinates = this.getPointByCoordinates(point.coordinates)
        if (pointByCoordinates === point) {
            this.deletePointInIndex(point.coordinates)
            point.wasDeleted = true
            this.updatePoints()
        } else if (pointByCoordinates) {
            console.warn('Point not found by coordinates', point)
        }
        if (IS_LIGHT_SOURCE[point.type]) {
            LightSystem.removeLightSourcePoint(point)
        }
    }

    static getPoints() {
        return this.points
    }

    private static getPossibleNeighbours(distance = 1): TCoordinate[] {
        if (distance === 0) {
            return []
        }
        if (distance === 1) {
            return Speed.possibleNeighbours
        }
        const possiblePositions: TCoordinate[] = []
        for (let x = -distance; x <= distance; x++) {
            for (let y = -distance; y <= distance; y++) {
                if (x === 0 && y === 0) {
                    continue
                }
                possiblePositions.push({ x, y })
            }
        }
        return possiblePositions
    }

    static getPointsNear(coordinates: TCoordinate, withBorder = true, distance = 1): TPoint[] {
        const points: TPoint[] = []
        const possiblePositions = this.getPossibleNeighbours(distance)
        for (const neighbourPosition of possiblePositions) {
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

    static getNeighbours(point: TPoint, withBorder = true, distance = 1): TPoint[] {
        return this.getPointsNear(point.coordinates, withBorder, distance)
    }

    static getPointBySpeed(fromPoint: TPoint, roundedSpeed: TRoundedSpeed): TPoint | undefined {
        const { coordinates } = fromPoint
        const targetCoordinates = {
            x: coordinates.x + roundedSpeed.x,
            y: coordinates.y + roundedSpeed.y
        }
        return this.getPointByCoordinates(targetCoordinates)
    }

    static updateVisualCoordinates(interpolationFactor: number) {
        // @ts-ignore
        window.lastUpdateVisualCoordinatesInterpolationFactor = interpolationFactor
        // If smooth movement is disabled, snap all points to their actual positions
        if (!Controls.getIsSmoothMovementEnabled()) {
            for (const point of this._points) {
                if (point.visualCoordinates) {
                    point.visualCoordinates.x = point.coordinates.x
                    point.visualCoordinates.y = point.coordinates.y
                } else {
                    point.visualCoordinates = { ...point.coordinates }
                }
            }
            return
        }
        
        for (const point of this._points) {
            if (!point.visualCoordinates) {
                point.visualCoordinates = { ...point.coordinates }
                continue
            }
            
            // Calculate distance between visual and actual coordinates
            const dx = point.coordinates.x - point.visualCoordinates.x
            const dy = point.coordinates.y - point.visualCoordinates.y

            // If the distance is very small, snap to the actual position
            if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
                point.visualCoordinates.x = point.coordinates.x
                point.visualCoordinates.y = point.coordinates.y
                continue
            }
            
            // Smoothly interpolate between current visual position and actual position
            point.visualCoordinates.x += dx * interpolationFactor
            point.visualCoordinates.y += dy * interpolationFactor
        }
    }
}