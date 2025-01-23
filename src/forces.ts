import { Points } from './classes/points'
import { Speed } from './classes/speed'
import { Stats } from './classes/stats'
import { forcesByType } from './forceProcessors'
import { EPointType } from './types'
import { wait } from './utils/wait'

const processFrame = () => {
    const points = Points.getActivePoints()
    for (const point of points) {
        for (const force of forcesByType[point.type]) {
            force(point)
        }

        const neighbours = Points.getNeighbours(point)
        const { speed } = point
        const roundedSpeed = Speed.getRoundedSpeed(speed)
        const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed, neighbours)
        if (!pointBySpeed) {
            point.coordinates.x += roundedSpeed.x
            point.coordinates.y += roundedSpeed.y
        }

        const speedProbabilities = Speed.getSpeedProbabilities(point.speed)
        const speeds = speedProbabilities.reduce((acc, { probability, speed }) => {
            acc[`${speed.x + point.coordinates.x}_${speed.y + point.coordinates.y}`] = probability
            return acc
        })
        const affectedPoints = neighbours
            .filter(neighbour => neighbour.type !== EPointType.Border)
            .filter(neighbour => speeds[`${neighbour.coordinates.x}_${neighbour.coordinates.y}`])
        if (affectedPoints.length) {
            const sum = affectedPoints.reduce((acc, point) => acc + speeds[`${point.coordinates.x}_${point.coordinates.y}`], 0)
            const normalizedAffectedPoints = affectedPoints.map(point => ({
                point,
                probability: speeds[`${point.coordinates.x}_${point.coordinates.y}`] / sum
            }))

            const xSpeedToShare = point.speed.x / 3
            const ySpeedToShare = point.speed.y / 3

            point.speed.x -= xSpeedToShare
            point.speed.y -= ySpeedToShare

            for (const { point: affectedPoint, probability } of normalizedAffectedPoints) {
                affectedPoint.speed.x += xSpeedToShare * probability
                affectedPoint.speed.y += ySpeedToShare * probability
            }
        }
    }
}

let framesTimes = [] as number[]
let frames = 0
export const startProcessing = async () => {
    while (true) {
        const now = performance.now()
        processFrame()
        await wait(1)
        frames++
        framesTimes.push(performance.now() - now)
        if (frames % 50 === 0) {
            framesTimes = framesTimes.slice(-100)
            const averageFrameTime = framesTimes.reduce((acc, time) => acc + time, 0) / framesTimes.length
            const fps = 1000 / averageFrameTime
            Stats.setFps(fps)
        }
    }
}