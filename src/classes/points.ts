import { INITIAL_TEMPERATURE } from '../config'
import { TCoordinate, EPointType } from '../types'
import { TRoundedSpeed } from './speed'
import { Storage } from './storage'

export type TPoint = {
    coordinates: TCoordinate
    type: EPointType,
    speed: TCoordinate,
    data: Record<string, any>
}

export class Points {
    private static points: TPoint[] = Storage.get('points', [])
    private static borderPoints: TPoint[] = Storage.get('borderPoints', [])
    private static nextTickDelete: TPoint[] = []
    private static coordinatesIndex: Record<string, TPoint> = {}

    static updateCoordinatesIndex() {
        this.coordinatesIndex = {}
        this.getPoints().forEach(point => {
            const { coordinates } = point
            if (
                point.type !== EPointType.Border &&
                this.coordinatesIndex[`${coordinates.x}:${coordinates.y}`] &&
                this.coordinatesIndex[`${coordinates.x}:${coordinates.y}`] !== point
            ) {
                console.warn(`Double point in coordinates: ${coordinates.x}:${coordinates.y}`)
                this.deletePointOnNextTick(point)
                return
            }
            this.setPointInIndex(coordinates, point)
        })
    }

    static movePointInIndex(from: TCoordinate, to: TCoordinate) {
        const point = this.coordinatesIndex[`${from.x}:${from.y}`]
        if (!point) return
        delete this.coordinatesIndex[`${from.x}:${from.y}`]
        this.setPointInIndex(to, point)
    }

    static setPointInIndex(coordinates: TCoordinate, point: TPoint) {
        this.coordinatesIndex[`${coordinates.x}:${coordinates.y}`] = point
    }

    static getPointByCoordinates(coordinates: TCoordinate): TPoint | undefined {
        return this.coordinatesIndex[`${coordinates.x}:${coordinates.y}`]
    }

    static addPoint(point: Omit<TPoint, 'data'>) {
        const pointWithData: TPoint = {
            data: {
                temperature: INITIAL_TEMPERATURE[point.type] ?? 15
            },
            ...point
        }
        if (point.type === EPointType.Border) {
            this.borderPoints.push(pointWithData)
        } else {
            this.points.push(pointWithData)
        }
        this.save()
        this.setPointInIndex(point.coordinates, pointWithData)
    }

    static save() {
        Storage.set('points', this.points)
        Storage.set('borderPoints', this.borderPoints)
    }

    static deletePoint(point: TPoint) {
        const index = this.points.findIndex(p => p === point)
        if (index !== -1) {
            this.points.splice(index, 1)
            this.save()
        }
        const indexInBorder = this.borderPoints.findIndex(p => p === point)
        if (indexInBorder !== -1) {
            this.borderPoints.splice(indexInBorder, 1)
            this.save()
        }
    }

    static deletePointOnNextTick(point: TPoint) {
        this.nextTickDelete.push(point)
    }

    static getPoints() {
        return [...this.getActivePoints(), ...this.borderPoints]
    }

    static getPointsNear(coordinates: TCoordinate, withBorder = true): TPoint[] {
        const nearCoordinates: TCoordinate[] = []
        for (let x = coordinates.x - 2; x <= coordinates.x + 2; x++) {
            for (let y = coordinates.y - 2; y <= coordinates.y + 2; y++) {
                nearCoordinates.push({ x, y })
            }
        }
        const pointsFromIndex = nearCoordinates.map(c => this.getPointByCoordinates(c)).filter(Boolean) as TPoint[]
        if (withBorder) {
            return pointsFromIndex
        }
        return pointsFromIndex.filter(p => p.type !== EPointType.Border)
    }

    static getActivePoints() {
        if (this.nextTickDelete.length) {
            this.nextTickDelete.forEach(point => this.deletePoint(point))
            this.nextTickDelete = []
        }
        return this.points
    }

    static getNeighbours(point: TPoint, withBorder = true): TPoint[] {
        const { coordinates } = point
        const points = this.getPointsNear(coordinates, withBorder)
        const nearestPoints = points
            .filter(p => {
                if (p === point) return false

                const { coordinates: pCoordinates } = p
                const xDiff = Math.abs(coordinates.x - pCoordinates.x)
                const yDiff = Math.abs(coordinates.y - pCoordinates.y)
                return xDiff <= 1 && yDiff <= 1
            })

        return nearestPoints
    }

    static getPointBySpeed(fromPoint: TPoint, roundedSpeed: TRoundedSpeed, pointsList: TPoint[]): TPoint | undefined {
        const { coordinates } = fromPoint
        const targetCoordinates = {
            x: coordinates.x + roundedSpeed.x,
            y: coordinates.y + roundedSpeed.y
        }
        const targetPoint = pointsList.find(p => {
            const { coordinates: pCoordinates } = p
            return pCoordinates.x === targetCoordinates.x && pCoordinates.y === targetCoordinates.y
        })

        return targetPoint
    }
}