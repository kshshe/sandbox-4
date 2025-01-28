import { POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS } from "../config"
import { EPointType, TCoordinate } from "../types"
import { random } from "../utils/random"
import { shake } from "../utils/shake"
import { Points, TPoint } from "./points"

export type TRoundedSpeed = {
    x: -1 | 0 | 1
    y: -1 | 0 | 1
}

const distance = (a: TCoordinate, b: TRoundedSpeed) => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export class Speed {
    static shufflePossibleNeighbours() {
        Speed.possibleNeighbours = shake(Speed.possibleNeighbours)
    }

    static rounded: {
        left: TRoundedSpeed
        right: TRoundedSpeed
        up: TRoundedSpeed
        down: TRoundedSpeed
        leftUp: TRoundedSpeed
        rightUp: TRoundedSpeed
        leftDown: TRoundedSpeed
        rightDown: TRoundedSpeed
        topLeft: TRoundedSpeed
        topRight: TRoundedSpeed
        bottomLeft: TRoundedSpeed
        bottomRight: TRoundedSpeed
    } = {
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 },
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            leftUp: { x: -1, y: -1 },
            rightUp: { x: 1, y: -1 },
            leftDown: { x: -1, y: 1 },
            rightDown: { x: 1, y: 1 },
            topLeft: { x: -1, y: -1 },
            topRight: { x: 1, y: -1 },
            bottomLeft: { x: -1, y: 1 },
            bottomRight: { x: 1, y: 1 },
        }

    static possibleNeighbours: TRoundedSpeed[] = [
        Speed.rounded.left,
        Speed.rounded.right,
        Speed.rounded.up,
        Speed.rounded.down,
        Speed.rounded.leftUp,
        Speed.rounded.rightUp,
        Speed.rounded.leftDown,
        Speed.rounded.rightDown,
    ]

    static getRoundedSpeed(point: TPoint, exceptNeighbours = false): TRoundedSpeed {
        const neighbours = exceptNeighbours ? Points.getNeighbours(point) : []
        const { speed, type } = point
        const vectorLength = Math.sqrt(speed.x ** 2 + speed.y ** 2)
        if (vectorLength < 0.01) {
            return { x: 0, y: 0 }
        }
        const normalizedSpeed = {
            x: speed.x / vectorLength,
            y: speed.y / vectorLength
        }

        let maxDistance = -Infinity
        const distances = Speed.possibleNeighbours.map(possibleSpeed => {
            const d = distance(normalizedSpeed, possibleSpeed)
            if (d > maxDistance) {
                maxDistance = d
            }
            return d
        })
        const probabilities = distances.map(d => maxDistance - d)

        const sum = probabilities.reduce((acc, val) => acc + val, 0);
        const normalizedProbabilities = probabilities.map(p => p / sum)
        const averageProbability = normalizedProbabilities.reduce((acc, val) => acc + val, 0) / normalizedProbabilities.length
        const normalizedProbabilitiesWithoutLow = normalizedProbabilities.map(p => p > averageProbability ? p : 0)
        const probabilitiesWithIndex = normalizedProbabilitiesWithoutLow.map((p, i) => ({ probability: p, speed: Speed.possibleNeighbours[i] }))
        const shuffledProbabilitiesWithIndex = probabilitiesWithIndex.filter(prob => {
            const isNeighbour = neighbours.some(neighbour => neighbour.coordinates.x === point.coordinates.x + prob.speed.x && neighbour.coordinates.y === point.coordinates.y + prob.speed.y && neighbour !== point)
            return !isNeighbour
        })

        const randomValue = random()

        for (let i = 0; i < shuffledProbabilitiesWithIndex.length; i++) {
            if (randomValue < shuffledProbabilitiesWithIndex[i].probability * (POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS[type] ?? 0.8)) {
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

        return Speed.possibleNeighbours[maxProbabilityIndex]
    }
}