import { EPointType } from "../types"
import { Points, TPoint } from "./points"

export class Bounds {
    private static _bounds = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }

    private static witdh = 0

    private static set bounds(bounds: typeof Bounds._bounds) {
        Bounds._bounds = bounds
        Bounds.witdh = bounds.right - bounds.left
    }

    private static get bounds() {
        return Bounds._bounds
    }

    static getBounds() {
        return Bounds.bounds
    }

    static getWidth() {
        return Bounds.witdh
    }

    static setBounds(bounds: typeof Bounds.bounds) {
        Bounds.bounds = bounds
        const points = Points.getPoints()
        for (const point of points) {
            if (point.type === EPointType.Border && point.data?.isFromBounds) {
                Points.deletePoint(point)
            }
        }

        // top
        for (let x = bounds.left - 1; x < bounds.right + 2; x++) {
            Points.addPoint({
                type: EPointType.Border,
                coordinates: { x, y: bounds.top - 1 },
                speed: { x: 0, y: 0 },
                data: { isFromBounds: true }
            })
        }

        // right
        for (let y = bounds.top - 1; y < bounds.bottom + 1; y++) {
            Points.addPoint({
                type: EPointType.Border,
                coordinates: { x: bounds.right, y },
                speed: { x: 0, y: 0 },
                data: { isFromBounds: true }
            })
        }

        // bottom
        for (let x = bounds.left - 1; x < bounds.right + 1; x++) {
            Points.addPoint({
                type: EPointType.Border,
                coordinates: { x, y: bounds.bottom },
                speed: { x: 0, y: 0 },
                data: { isFromBounds: true }
            })
        }

        // left
        for (let y = bounds.top - 1; y < bounds.bottom + 1; y++) {
            Points.addPoint({
                type: EPointType.Border,
                coordinates: { x: bounds.left - 1, y },
                speed: { x: 0, y: 0 },
                data: { isFromBounds: true }
            })
        }

        Points.save()
    }
}