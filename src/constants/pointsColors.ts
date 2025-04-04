import { EPointType, TPoint } from "../types"

export type TColor = {
    r: number;
    g: number;
    b: number;
} 

type TColorOrColorGetter = TColor | ((point: TPoint) => TColor)

export const getColor = (point: TPoint): TColor => {
    const colorGetter = POINTS_COLORS[point.type]
    if (typeof colorGetter === 'function') {
        return colorGetter(point)
    }
    return colorGetter
}

const POINTS_COLORS: Record<EPointType, TColorOrColorGetter> & {
    eraser: TColor,
    heatTool: TColor,
    coolTool: TColor,
} = {
    [EPointType.Water]: { r: 0, g: 0, b: 255 },              // blue
    [EPointType.Sand]: { r: 255, g: 204, b: 0 },             // #ffcc00
    [EPointType.StaticSand]: { r: 230, g: 184, b: 0 },      // darker sand
    [EPointType.Border]: { r: 211, g: 211, b: 211 },         // #d3d3d3
    [EPointType.Stone]: { r: 128, g: 128, b: 128 },          // gray
    [EPointType.StaticStone]: { r: 100, g: 100, b: 100 },    // darker gray
    [EPointType.Fire]: { r: 255, g: 0, b: 0 },               // red
    [EPointType.FireEmitter]: { r: 255, g: 0, b: 0 },        // red
    [EPointType.IceFire]: { r: 173, g: 216, b: 230 },        // lightblue
    [EPointType.Bomb]: { r: 0, g: 0, b: 0 },                 // black
    [EPointType.Ice]: { r: 173, g: 216, b: 230 },            // lightblue
    [EPointType.Steam]: { r: 211, g: 211, b: 211 },          // lightgray
    [EPointType.Clone]: { r: 0, g: 128, b: 0 },              // green
    [EPointType.Gas]: { r: 211, g: 211, b: 211 },            // lightgray
    [EPointType.Lava]: { r: 255, g: 0, b: 0 },               // red
    [EPointType.Wood]: { r: 139, g: 69, b: 19 },             // #8b4513
    [EPointType.BurningWood]: { r: 255, g: 0, b: 0 },        // red
    [EPointType.Dynamite]: { r: 255, g: 68, b: 68 },         // #ff4444
    [EPointType.LiquidGas]: { r: 0, g: 204, b: 255 },        // #00ccff
    [EPointType.Metal]: { r: 192, g: 192, b: 192 },          // #c0c0c0
    [EPointType.MoltenMetal]: { r: 255, g: 51, b: 51 },      // #ff3333
    [EPointType.Glass]: { r: 230, g: 230, b: 250 },          // translucent white
    [EPointType.LiquidGlass]: { r: 255, g: 50, b: 0 },       // much more red
    [EPointType.Electricity_Ground]: { r: 160, g: 160, b: 160 },  // #a0a0a0
    [EPointType.Electricity_Spark]: { r: 255, g: 255, b: 0 },     // #ffff00
    [EPointType.Electricity_Source]: { r: 255, g: 255, b: 0 },    // #ffff00
    [EPointType.Electricity_Amplifier]: { r: 200, g: 200, b: 0 },    // #cccc00
    [EPointType.Heater]: { r: 255, g: 100, b: 0 },           // orange-red
    [EPointType.Cooler]: { r: 100, g: 180, b: 255 },         // light blue
    [EPointType.ColdDetector]: { r: 0, g: 100, b: 255 },     // blue with green
    [EPointType.HotDetector]: { r: 255, g: 130, b: 0 },      // orange
    [EPointType.LiquidDetector]: { r: 0, g: 160, b: 230 },   // sky blue
    [EPointType.ConstantCold]: { r: 0, g: 0, b: 255 },       // blue
    [EPointType.ConstantHot]: { r: 255, g: 0, b: 0 },        // red
    [EPointType.Void]: { r: 0, g: 0, b: 0 },                 // black
    [EPointType.Virus]: { r: 128, g: 0, b: 128 },            // purple
    [EPointType.Heal]: { r: 0, g: 255, b: 255 },             // cyan
    [EPointType.Acid]: { r: 0, g: 255, b: 0 },               // green
    [EPointType.Plant]: { r: 0, g: 255, b: 0 },              // green
    [EPointType.PlantSeed]: { r: 0, g: 255, b: 0 },          // green
    [EPointType.Wire]: { r: 0, g: 0, b: 0 },                 // black
    [EPointType.Pipe]: { r: 0, g: 50, b: 255 },              // blue
    [EPointType.Smoke]: { r: 128, g: 128, b: 128 },          // gray
    [EPointType.Oil]: { r: 30, g: 30, b: 30 },               // dark gray
    [EPointType.BurningOil]: { r: 255, g: 0, b: 0 },         // red
    [EPointType.Snow]: { r: 240, g: 240, b: 240 },           // white
    [EPointType.Magnet]: { r: 70, g: 70, b: 70 },            // dark gray
    [EPointType.WindSource]: { r: 135, g: 206, b: 250 },     // light sky blue
    [EPointType.Ant]: { r: 0, g: 0, b: 0 },                  // black
    [EPointType.FireAnt]: { r: 255, g: 69, b: 0 },           // orangered
    [EPointType.IceAnt]: { r: 30, g: 144, b: 255 },          // dodgerblue
    [EPointType.Worm]: { r: 160, g: 82, b: 45 },             // sienna/brown
    [EPointType.LightSource]: { r: 255, g: 255, b: 128 },    // bright yellow
    [EPointType.Mirror]: { r: 200, g: 200, b: 255 },         // light blueish
    [EPointType.LightDetector]: { r: 255, g: 230, b: 100 },  // amber
    [EPointType.LightBulb]: { r: 255, g: 240, b: 150 },      // warm yellow
    [EPointType.Thermometer]: (point) => {
        const temperature = point.data.temperature || 0;
        if (temperature === 0) {
            return { r: 0, g: 0, b: 0 };
        } else if (temperature > 0) {
            const red = Math.min(255, temperature * 2.55 / 10);
            return { r: red, g: 0, b: 0 };
        } else {
            const blue = Math.min(255, Math.abs(temperature) * 2.55 / 10);
            return { r: 0, g: 0, b: blue };
        }
    },  
    eraser: { r: 200, g: 200, b: 200 },                      // gray
    heatTool: { r: 255, g: 69, b: 0 },                       // orangered
    coolTool: { r: 135, g: 206, b: 250 },                    // lightskyblue
} 