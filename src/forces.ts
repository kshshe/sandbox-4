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
        const roundedSpeed = Speed.getRoundedSpeed(speed, point.type)
        const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed, neighbours)
        if (pointBySpeed) {
            point.speed.x *= 0.95
            point.speed.y *= 0.95
            // continue;
        } else {
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

            const originalSpeedX = point.speed.x
            const originalSpeedY = point.speed.y
            for (const { point: nPoint, probability } of normalizedAffectedPoints) {
                const xDiff = nPoint.speed.x - originalSpeedX
                const yDiff = nPoint.speed.y - originalSpeedY

                const xDiffToGive = xDiff * probability
                const yDiffToGive = yDiff * probability

                const randomX = Math.random()
                const randomY = Math.random()

                point.speed.x += xDiffToGive * randomX
                point.speed.y += yDiffToGive * randomY

                nPoint.speed.x -= xDiffToGive * (1 - randomX)
                nPoint.speed.y -= yDiffToGive * (1 - randomY)
            }
        }
    }

    Points.save()
}

let framesTimes = [] as number[]
let frames = 0
export const startProcessing = async () => {
    while (true) {
        const now = performance.now()
        processFrame()
        const elapsedTime = performance.now() - now
        const remainingTime = 1000 / 60 - elapsedTime
        await wait(Math.max(0, remainingTime))
        frames++
        framesTimes.push(performance.now() - now)
        if (frames % 50 === 0) {
            framesTimes = framesTimes.slice(-100)
            const averageFrameTime = framesTimes.reduce((acc, time) => acc + time, 0) / framesTimes.length
            const fps = 1000 / averageFrameTime
            Stats.setFps(fps)
            Stats.setAverageSpeed(Points.getActivePoints().reduce((acc, point) => acc + Math.abs(point.speed.x) + Math.abs(point.speed.y), 0) / Points.getActivePoints().length)
        }
    }
}