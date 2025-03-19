import { EPointType } from "../types"

export const POINTS_SHORTCUTS: {
    [key: string]: EPointType | 'eraser' | 'heatTool' | 'coolTool'
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
    h: 'heatTool',
    l: 'coolTool',
    d: EPointType.ColdDetector,
    t: EPointType.HotDetector,
}

export const REVERSED_POINTS_SHORTCUTS: {
    [key in EPointType | 'eraser' | 'heatTool' | 'coolTool']?: string
} = Object.entries(POINTS_SHORTCUTS).reduce((acc, [key, value]) => {
    acc[value] = key
    return acc
}, {} as {
    [key in EPointType | 'eraser' | 'heatTool' | 'coolTool']?: string
}) 