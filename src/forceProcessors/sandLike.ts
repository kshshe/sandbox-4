import { TRoundedSpeed } from "../classes/speed"
import type { TForceProcessor } from "./index"
import { canMoveIfFree } from "./templates/canMoveIfFree"

const SLOTS_TO_MOVE: TRoundedSpeed[] = [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
]

export const sandLike: TForceProcessor = canMoveIfFree(SLOTS_TO_MOVE)