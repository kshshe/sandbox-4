import { Points } from './classes/points'
import { Speed } from './classes/speed'
import { Stats } from './classes/stats'
import { forcesByType } from './forceProcessors'
import { EPointType } from './types'
import { wait } from './utils/wait'
import { Controls } from './classes/controls'

const TEMPERATURE_PART_TO_SHARE_WITH_NEIGHBOUR = 1 / 20
const TEMPERATURE_PART_TO_SHARE_WITH_AIR = 1 / 300
const MAX_SPEED = 6

const processFrame = () => {
    const points = Points.getActivePoints()
    for (const point of points) {
        if (point.wasDeleted) {
            continue
        }
        const forcesList = forcesByType[point.type] || []
        for (const force of forcesList) {
            force(point)
        }

        let speedLength = Math.sqrt(point.speed.x ** 2 + point.speed.y ** 2)
        if (speedLength > MAX_SPEED) {
            point.speed.x *= MAX_SPEED / speedLength
            point.speed.y *= MAX_SPEED / speedLength
            speedLength = MAX_SPEED
        }
        let timesProcess = Math.min(Math.max(1, Math.ceil(speedLength)), 10)

        while (timesProcess--) {
            const prevX = point.coordinates.x
            const prevY = point.coordinates.y

            const neighbours = Points.getNeighbours(point)
            const pointTemperature = point.data.temperature ?? 15
            const airNeighbours = 8 - neighbours.length
            for (const neighbour of neighbours) {
                const neighbourTemperature = neighbour.data.temperature ?? 15
                const temperatureDiff = pointTemperature - neighbourTemperature
                const temperatureToShare = temperatureDiff * TEMPERATURE_PART_TO_SHARE_WITH_NEIGHBOUR
                point.data.temperature = pointTemperature - temperatureToShare
                neighbour.data.temperature = neighbourTemperature + temperatureToShare
            }
            const airTemperature = 15
            for (let i = 0; i < airNeighbours; i++) {
                const temperatureDiff = pointTemperature - airTemperature
                const temperatureToShare = temperatureDiff * TEMPERATURE_PART_TO_SHARE_WITH_AIR
                point.data.temperature = pointTemperature - temperatureToShare
            }
            const roundedSpeed = Speed.getRoundedSpeed(point, true)
            const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed)
            point.speed.x *= 0.95
            point.speed.y *= 0.95
            if (!pointBySpeed) {
                point.coordinates.x += roundedSpeed.x
                point.coordinates.y += roundedSpeed.y
                Points.deletePointInIndex({
                    x: prevX,
                    y: prevY
                })
                Points.setPointInIndex(point.coordinates, point)
            }

            if (speedLength > 5) {
                for (const neighbourDirection of Speed.possibleNeighbours) {
                    const neighbour = Points.getPointByCoordinates({
                        x: point.coordinates.x + neighbourDirection.x,
                        y: point.coordinates.y + neighbourDirection.y,
                    })
                    if (neighbour && neighbour.type !== EPointType.Border) {
                        const diffX = point.coordinates.x - neighbour.coordinates.x
                        const diffY = point.coordinates.y - neighbour.coordinates.y

                        neighbour.speed.x -= diffX * 0.05
                        neighbour.speed.y -= diffY * 0.05
                    }
                }
            }
        }
    }

    Points.save()
    Points.shufflePoints()
    Speed.shufflePossibleNeighbours()
}

let framesTimes = [] as number[]
let frames = 0
export const startProcessing = async () => {
    while (true) {
        const now = performance.now()
        processFrame()
        const elapsedTime = performance.now() - now
        const remainingTime = Controls.getDebugMode() ? 0 : 1000 / 60 - elapsedTime
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