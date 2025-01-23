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
            const speedLength = Math.sqrt(speed.x ** 2 + speed.y ** 2)
            const newSpeed: TCoordinate = {
                x: slot.x * speedLength * 0.5,
                y: slot.y * speedLength * 0.5,
            }
            point.speed = newSpeed
        }
    }
}