import { TCoordinate } from "../types"

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

export class Speed {
    static getRoundedSpeed(speed: TCoordinate) {
        const vectorLength = Math.sqrt(speed.x ** 2 + speed.y ** 2)
        const normalizedSpeed = {
            x: speed.x / vectorLength,
            y: speed.y / vectorLength
        }

        const distance = (a: TCoordinate, b: TRoundedSpeed) => {
            return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
        }

        const distances = POSSIBLE_SPEEDS.map(possibleSpeed => distance(normalizedSpeed, possibleSpeed))
        const maxDistance = Math.max(...distances)
        const probabilities = distances.map(d => maxDistance - d)

        const sum = probabilities.reduce((acc, val) => acc + val, 0);
        const normalizedProbabilities = probabilities.map(p => p / sum)
        const averageProbability = normalizedProbabilities.reduce((acc, val) => acc + val, 0) / normalizedProbabilities.length
        const normalizedProbabilitiesWithoutLow = normalizedProbabilities.map(p => p > averageProbability ? p : 0)

        const random = Math.random()

        for (let i = 0; i < normalizedProbabilitiesWithoutLow.length; i++) {
            if (random < normalizedProbabilitiesWithoutLow[i]) {
                return POSSIBLE_SPEEDS[i]
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