import { TCoordinate, EPointType } from '../types'
import { Bounds } from './bounds'
import { TRoundedSpeed } from './speed'

export type TPoint = {
    coordinates: TCoordinate
    type: EPointType,
    speed: TCoordinate
}

export class Points {
    private static points: TPoint[] = []

    static addPoint(point: TPoint) {
        this.points.push(point)
    }

    static deletePoint(point: TPoint) {
        const index = this.points.findIndex(p => p === point)
        if (index !== -1) {
            this.points.splice(index, 1)
        }
    }

    static getPoints() {
        return this.points
    }

    static getActivePoints() {
        return this.points.filter(p => p.type !== EPointType.Border)
    }

    static getNeighbours(point: TPoint): TPoint[] {
        const { coordinates } = point
        const points = this.getPoints()
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