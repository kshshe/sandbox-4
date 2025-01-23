import { TCoordinate, EPointType } from '../types'
import { TRoundedSpeed } from './speed'
import { Storage } from './storage'

export type TPoint = {
    coordinates: TCoordinate
    type: EPointType,
    speed: TCoordinate,
    data?: Record<string, any>
}

export class Points {
    private static points: TPoint[] = Storage.get('points', [])
    private static borderPoints: TPoint[] = Storage.get('borderPoints', [])

    static addPoint(point: TPoint) {
        if (point.type === EPointType.Border) {
            this.borderPoints.push(point)
        } else {
            this.points.push(point)
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
    }

    static getPoints() {
        return [...this.points, ...this.borderPoints]
    }

    static getActivePoints() {
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