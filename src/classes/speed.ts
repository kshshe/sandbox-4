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
        const roundedSpeed: TRoundedSpeed = {
            x: 0,
            y: 0
        }
        
        const vectorLength = Math.sqrt(speed.x ** 2 + speed.y ** 2)
        const normalizedSpeed = {
            x: speed.x / vectorLength,
            y: speed.y / vectorLength
        }

        const dotProduct = (a: TCoordinate, b: TCoordinate) => a.x * b.x + a.y * b.y

        const probabilities = POSSIBLE_SPEEDS.map(possibleSpeed => {
            const dot = dotProduct(normalizedSpeed, possibleSpeed)
            return (dot + 1) / 2
        })

        const sum = probabilities.reduce((acc, val) => acc + val, 0);
        const normalizedProbabilities = probabilities.map(p => {
            const normalized = p / sum
            if (normalized < 0.3) {
                return 0
            }
        })

        const random = Math.random()

        for (let i = 0; i < normalizedProbabilities.length; i++) {
            if (random < normalizedProbabilities[i]) {
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