import { POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS } from "../config"
import { TCoordinate } from "../types"
import { random } from "../utils/random"
import { shake } from "../utils/shake"
import { Points, TPoint } from "./points"

export type TRoundedSpeed = {
    x: -1 | 0 | 1
    y: -1 | 0 | 1
}

const distance = (a: TCoordinate, b: TRoundedSpeed) => {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
}

export class Speed {
    static shufflePossibleNeighbours() {
        Speed.possibleNeighbours = shake(Speed.possibleNeighbours)
    }

    static self: TRoundedSpeed = { x: 0, y: 0 }

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

    static getRoundedSpeed(point: TPoint, exceptNeighbours = false, possibleNeighbours = Speed.possibleNeighbours): TRoundedSpeed {
        const { speed, type } = point
        const vectorLength = Math.sqrt(speed.x ** 2 + speed.y ** 2)
        
        if (vectorLength < 0.01) {
            return { x: 0, y: 0 }
        }
        
        const normalizedSpeed = {
            x: speed.x / vectorLength,
            y: speed.y / vectorLength
        }
        
        const neighbours = exceptNeighbours ? Points.getNeighbours(point) : []
        
        let maxDistance = -Infinity
        const distances = new Array(possibleNeighbours.length)
        
        for (let i = 0; i < possibleNeighbours.length; i++) {
            const d = distance(normalizedSpeed, possibleNeighbours[i])
            distances[i] = d
            if (d > maxDistance) {
                maxDistance = d
            }
        }
        
        const probabilities = new Array(distances.length)
        let sum = 0
        
        for (let i = 0; i < distances.length; i++) {
            probabilities[i] = maxDistance - distances[i]
            sum += probabilities[i]
        }
        
        const probabilityModifier = POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS[type] ?? 0.8
        const averageProbability = sum / (distances.length * sum)
        
        const validSpeeds: { probability: number, index: number }[] = []
        
        for (let i = 0; i < probabilities.length; i++) {
            const normalizedProb = probabilities[i] / sum
            
            if (normalizedProb <= averageProbability) {
                continue
            }
            
            if (exceptNeighbours) {
                const speed = possibleNeighbours[i]
                const isNeighbour = neighbours.some(
                    neighbour => 
                        neighbour.coordinates.x === point.coordinates.x + speed.x && 
                        neighbour.coordinates.y === point.coordinates.y + speed.y && 
                        neighbour !== point
                )
                
                if (isNeighbour) {
                    continue
                }
            }
            
            validSpeeds.push({
                probability: normalizedProb * probabilityModifier,
                index: i
            })
        }
        
        if (validSpeeds.length > 0) {
            const randomValue = random()
            
            for (let i = 0; i < validSpeeds.length; i++) {
                if (randomValue < validSpeeds[i].probability) {
                    return possibleNeighbours[validSpeeds[i].index]
                }
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
        
        return possibleNeighbours[maxProbabilityIndex]
    }
}