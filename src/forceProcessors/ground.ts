import { TForceProcessor } from ".";
import { Speed } from "../classes/speed";

export const ground: TForceProcessor = (point) => {
    point.data.distanceToGround = 0
    point.data.directionToGround = Speed.self
    point.data.charge = 0
}