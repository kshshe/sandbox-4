import { TForceProcessor } from ".";
import { Points, TPoint } from "../classes/points";
import { Connections } from "../classes/connections";
import { POINTS_CAN_ACCEPT_ELECTRICITY } from "../config";
import { EPointType } from "../types";
import { emit } from "./utils/emit";

const sendChargeFromTo = (from: TPoint, to: TPoint) => {
    const amoutToSend = from.data.charge ?? 0
    to.data.charge = (to.data.charge ?? 0) + amoutToSend
    from.data.charge = 0
    to.data.temperature += amoutToSend * 0.002
    Points.markNeighboursAsUsed(from)
    Points.markNeighboursAsUsed(to)
}

export const sendCharge: TForceProcessor = (point, iteration) => {
    // Check for wires first
    const wires = Connections.getWireFromPoint(point.coordinates)
    for (const wire of wires) {
        const endPoint = Points.getPointByCoordinates(wire.to)
        if (endPoint && POINTS_CAN_ACCEPT_ELECTRICITY[endPoint.type]) {
            wire.lastUsed = iteration;
            sendChargeFromTo(point, endPoint)
            return
        }
    }

    // Original logic continues
    const groundDirection = point.data.directionToGround
    if (groundDirection) {
        const pointThere = Points.getPointByCoordinates({
            x: point.coordinates.x + groundDirection.x,
            y: point.coordinates.y + groundDirection.y,
        })
        if (pointThere) {
            sendChargeFromTo(point, pointThere)
            return
        }
    } else {
        const neighbours = Points.getNeighbours(point, false)
        const neighboursCanReceiveCharge = neighbours.filter(neighbour => POINTS_CAN_ACCEPT_ELECTRICITY[neighbour.type])
        const randomNeighbour = neighboursCanReceiveCharge[Math.floor(Math.random() * neighboursCanReceiveCharge.length)]
        if (randomNeighbour) {
            sendChargeFromTo(point, randomNeighbour)
            return
        }
    }

    if (point.data.charge >= 20) {
        while (emit(point, EPointType.Electricity_Spark, 0.5) && point.data.charge) {
            point.data.charge -= 20
        }
    }

    point.data.charge *= 0.9
}