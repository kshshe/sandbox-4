import { EPointType } from "../types"
import { Points, TPoint } from "./points"

export class Bounds {
    static setBounds(bounds: {
        top: number
        right: number
        bottom: number
        left: number
    }) {
        const points = Points.getPoints()
        for (const point of points) {
            if (point.type === EPointType.Border) {
                Points.deletePoint(point)
            }
        }

        // top
        for (let x = bounds.left; x < bounds.right; x++) {
            Points.addPoint({
                type: EPointType.Border,
                coordinates: { x, y: bounds.top },
                speed: { x: 0, y: 0 }
            })
        }

        // right
        for (let y = bounds.top; y < bounds.bottom; y++) {
            Points.addPoint({
                type: EPointType.Border,
                coordinates: { x: bounds.right, y },
                speed: { x: 0, y: 0 }
            })
        }

        // bottom
        for (let x = bounds.left; x < bounds.right; x++) {
            Points.addPoint({
                type: EPointType.Border,
                coordinates: { x, y: bounds.bottom },
                speed: { x: 0, y: 0 }
            })
        }

        // left
        for (let y = bounds.top; y < bounds.bottom; y++) {
            Points.addPoint({
                type: EPointType.Border,
                coordinates: { x: bounds.left, y },
                speed: { x: 0, y: 0 }
            })
        }
    }
}