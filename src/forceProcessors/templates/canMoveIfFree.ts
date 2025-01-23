import { Points } from "../../classes/points";
import { Speed, TRoundedSpeed } from "../../classes/speed";
import { TCoordinate } from "../../types";

export const canMoveIfFree = (
    directions: TRoundedSpeed[],
) => (point) => {
    const neighbours = Points.getNeighbours(point)
    const { speed } = point
    const roundedSpeed = Speed.getRoundedSpeed(speed)
    const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed, neighbours)

    if (pointBySpeed) {
        const slotsToMove = directions.filter((slot) => {
            const pointBySlot = Points.getPointBySpeed(point, slot, neighbours)
            return !pointBySlot
        })
        if (slotsToMove.length) {
            const slot = slotsToMove[Math.floor(Math.random() * slotsToMove.length)]
            const newSpeed: TCoordinate = {
                x: slot.x / 2,
                y: slot.y / 2
            }
            point.speed = newSpeed
        }
    }
}