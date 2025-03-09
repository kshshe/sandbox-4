import { EPointType } from "../types";
import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { Controls } from "../classes/controls";
export const staticTemperature = (temperature: number): TForceProcessor => (point) => {
    point.data.temperature = temperature
}

export const convertOnTemperature = (
    type: 'more' | 'less',
    temperature: number,
    typeToConvert: EPointType
): TForceProcessor => (point) => {
    if (!Controls.getIsTemperatureEnabled()) {
        return
    }

    if (!point.data.temperature) {
        point.data.temperature = 15
    }

    if (type === 'more' && point.data.temperature > temperature && point.type !== typeToConvert) {
        point.type = typeToConvert
        Points.markNeighboursAsUsed(point)
    }

    if (type === 'less' && point.data.temperature < temperature && point.type !== typeToConvert) {
        point.type = typeToConvert
        Points.markNeighboursAsUsed(point)
    }
}