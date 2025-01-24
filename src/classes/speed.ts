import { POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS } from "../config"
import { EPointType, TCoordinate } from "../types"

export type TRoundedSpeed = {
    x: -1 | 0 | 1
    y: -1 | 0 | 1
}

const POSSIBLE_SPEEDS: TRoundedSpeed[] = [
    { x: 0, y: 1 },
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
]

const distance = (a: TCoordinate, b: TRoundedSpeed) => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function shake<T>(array: T[]): T[] {
    const copy = [...array]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy
}

export class Speed {
    static getSpeedProbabilities(speed: TCoordinate): {
        probability: number
        speed: TRoundedSpeed
    }[] {
        const vectorLength = Math.sqrt(speed.x ** 2 + speed.y ** 2)
        const normalizedSpeed = {
            x: speed.x / vectorLength,
            y: speed.y / vectorLength
        }

        const distances = POSSIBLE_SPEEDS.map(possibleSpeed => distance(normalizedSpeed, possibleSpeed))
        const maxDistance = Math.max(...distances)
        const probabilities = distances.map(d => maxDistance - d)
        const probabilitiesWithIndex = probabilities.map((p, i) => ({ probability: p, speed: POSSIBLE_SPEEDS[i] }))
        return probabilitiesWithIndex
    }

    static getRoundedSpeed(speed: TCoordinate, type: EPointType): TRoundedSpeed {
        const vectorLength = Math.sqrt(speed.x ** 2 + speed.y ** 2)
        if (vectorLength < 0.01) {
            return { x: 0, y: 0 }
        }
        const normalizedSpeed = {
            x: speed.x / vectorLength,
            y: speed.y / vectorLength
        }

        const distances = POSSIBLE_SPEEDS.map(possibleSpeed => distance(normalizedSpeed, possibleSpeed))
        const maxDistance = Math.max(...distances)
        const probabilities = distances.map(d => maxDistance - d)

        const sum = probabilities.reduce((acc, val) => acc + val, 0);
        const normalizedProbabilities = probabilities.map(p => p / sum)
        const averageProbability = normalizedProbabilities.reduce((acc, val) => acc + val, 0) / normalizedProbabilities.length
        const normalizedProbabilitiesWithoutLow = normalizedProbabilities.map(p => p > averageProbability ? p : 0)
        const probabilitiesWithIndex = normalizedProbabilitiesWithoutLow.map((p, i) => ({ probability: p, speed: POSSIBLE_SPEEDS[i] }))
        const shuffledProbabilitiesWithIndex = shake(probabilitiesWithIndex)

        const random = Math.random()

        for (let i = 0; i < shuffledProbabilitiesWithIndex.length; i++) {
            if (random < shuffledProbabilitiesWithIndex[i].probability * (POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS[type] ?? 0.8)) {
                return shuffledProbabilitiesWithIndex[i].speed
            }
        }

        let maxProbability = 0
        let maxProbabilityIndex = 0
        for (let i = 0; i < probabilities.length; i++) {
            if (probabilities[i] > maxProbability) {
                maxProbability = probabilities[i]
                maxProbabilityIndex = i
            }
        }

        return POSSIBLE_SPEEDS[maxProbabilityIndex]
    }
}