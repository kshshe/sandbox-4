import { EPointType } from "../types"

export const POINTS_SHORTCUTS: {
    [key: string]: EPointType | 'eraser'
} = {
    w: EPointType.Water,
    s: EPointType.Sand,
    r: EPointType.Stone,
    f: EPointType.Fire,
    i: EPointType.IceFire,
    b: EPointType.Bomb,
    c: EPointType.Clone,
    g: EPointType.Gas,
    v: EPointType.Void,
    e: 'eraser',
    a: EPointType.Acid,
}

export const REVERSED_POINTS_SHORTCUTS: {
    [key in EPointType | 'eraser']?: string
} = Object.fromEntries(Object.entries(POINTS_SHORTCUTS).map(([key, value]) => [value, key])) 