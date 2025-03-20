import { EPointType } from "../types";
import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { Controls } from "../classes/controls";
import { random } from "../utils/random";
export const staticTemperature = (temperature: number): TForceProcessor => (point) => {
    point.data.temperature = temperature
}

const CHANCE_TO_CONVERT = 0.03

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
        Points.markNeighboursAsUsed(point)
        if (random() < CHANCE_TO_CONVERT) {
            point.type = typeToConvert
        }
    }

    if (type === 'less' && point.data.temperature < temperature && point.type !== typeToConvert) {
        Points.markNeighboursAsUsed(point)
        if (random() < CHANCE_TO_CONVERT) {
            point.type = typeToConvert
        }
    }
}

export const moveToBaseTemperature = (intencity: number = 0.1): TForceProcessor => (point) => {
    if (!point.data.temperature) {
        point.data.temperature = 15
    }
    
    const baseTemperature = Controls.getBaseTemperature()
    const temperature = point.data.temperature
    const direction = temperature > baseTemperature ? -1 : 1
    point.data.temperature += direction * intencity
}