import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { POINTS_CAN_ACCEPT_ELECTRICITY } from "../config";
import { EPointType } from "../types";

export const spark: TForceProcessor = (point) => {
    const neighbours = Points.getNeighbours(point)
    if (neighbours.length === 0) {
        return
    }
    const neighboursCanReceiveCharge = neighbours.filter(neighbour => POINTS_CAN_ACCEPT_ELECTRICITY[neighbour.type])
    if (neighboursCanReceiveCharge.length !== 0) {
        const randomNeighbour = neighboursCanReceiveCharge[Math.floor(Math.random() * neighboursCanReceiveCharge.length)]
        randomNeighbour.data.charge = (randomNeighbour.data.charge ?? 0) + 1
        Points.deletePoint(point)
        return
    }

    const hasNeighboursOfOtherTypeExceptClone = neighbours.some(neighbour => neighbour.type !== EPointType.Clone && neighbour.type !== point.type)
    if (hasNeighboursOfOtherTypeExceptClone) {
        Points.deletePoint(point)
    }
}