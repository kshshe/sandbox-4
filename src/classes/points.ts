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

    static getActivePoints() {
        if (this.nextTickDelete.length) {
            this.nextTickDelete.forEach(point => this.deletePoint(point))
            this.nextTickDelete = []
        }
        return this.points
    }

    static getNeighbours(point: TPoint, withBorder = true): TPoint[] {
        const { coordinates } = point
        const points = withBorder ? this.getPoints() : this.getActivePoints()
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