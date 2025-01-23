import { TPoint } from "../classes/points";

import { gravity } from "./gravity";

export type TForceProcessor = (point: TPoint) => void

export const forces: TForceProcessor[] = [
    gravity,
]