import { EPointType } from "../types"

export const POINTS_COLORS: Record<EPointType, { r: number, g: number, b: number }> & {
    eraser: { r: number, g: number, b: number },
    heatTool: { r: number, g: number, b: number },
    coolTool: { r: number, g: number, b: number },
} = {
    [EPointType.Water]: { r: 0, g: 0, b: 255 },             // blue
    [EPointType.Sand]: { r: 255, g: 204, b: 0 },            // #ffcc00
    [EPointType.Border]: { r: 211, g: 211, b: 211 },        // #d3d3d3
    [EPointType.Stone]: { r: 128, g: 128, b: 128 },         // gray
    [EPointType.StaticStone]: { r: 128, g: 128, b: 128 },   // gray
    [EPointType.Fire]: { r: 255, g: 0, b: 0 },              // red
    [EPointType.FireEmitter]: { r: 255, g: 0, b: 0 },       // red
    [EPointType.IceFire]: { r: 173, g: 216, b: 230 },       // lightblue
    [EPointType.Bomb]: { r: 0, g: 0, b: 0 },                // black
    [EPointType.Ice]: { r: 173, g: 216, b: 230 },           // lightblue
    [EPointType.Steam]: { r: 211, g: 211, b: 211 },         // lightgray
    [EPointType.Clone]: { r: 0, g: 128, b: 0 },             // green
    [EPointType.Gas]: { r: 211, g: 211, b: 211 },           // lightgray
    [EPointType.Lava]: { r: 255, g: 0, b: 0 },              // red
    [EPointType.Wood]: { r: 139, g: 69, b: 19 },            // #8b4513
    [EPointType.BurningWood]: { r: 255, g: 0, b: 0 },       // red
    [EPointType.Dynamite]: { r: 255, g: 68, b: 68 },        // #ff4444
    [EPointType.LiquidGas]: { r: 0, g: 204, b: 255 },       // #00ccff
    [EPointType.Metal]: { r: 192, g: 192, b: 192 },         // #c0c0c0
    [EPointType.MoltenMetal]: { r: 255, g: 51, b: 51 },     // #ff3333
    [EPointType.Glass]: { r: 230, g: 230, b: 250 },         // translucent white
    [EPointType.LiquidGlass]: { r: 255, g: 50, b: 0 },     // much more red
    [EPointType.Electricity_Ground]: { r: 160, g: 160, b: 160 }, // #a0a0a0
    [EPointType.Electricity_Spark]: { r: 255, g: 255, b: 0 },    // #ffff00
    [EPointType.Electricity_Source]: { r: 255, g: 255, b: 0 },   // #ffff00
    [EPointType.Heater]: { r: 255, g: 100, b: 0 },          // orange-red
    [EPointType.Cooler]: { r: 100, g: 180, b: 255 },        // light blue
    [EPointType.ConstantCold]: { r: 0, g: 0, b: 255 },      // blue
    [EPointType.ConstantHot]: { r: 255, g: 0, b: 0 },       // red
    [EPointType.Void]: { r: 0, g: 0, b: 0 },                // black
    [EPointType.Virus]: { r: 128, g: 0, b: 128 },             // purple
    [EPointType.Heal]: { r: 0, g: 255, b: 255 },            // cyan
    [EPointType.Acid]: { r: 0, g: 255, b: 0 },               // green
    [EPointType.Plant]: { r: 0, g: 255, b: 0 },               // green
    [EPointType.PlantSeed]: { r: 0, g: 255, b: 0 },               // green
    eraser: { r: 200, g: 200, b: 200 },                     // gray
    heatTool: { r: 255, g: 69, b: 0 },                      // orangered
    coolTool: { r: 135, g: 206, b: 250 },                   // lightskyblue
} 