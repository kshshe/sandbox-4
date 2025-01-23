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
        } else {
            point.speed.x /= 2
            if (point.speed.x < 0.01) point.speed.x = 0
            point.speed.y /= 2
            if (point.speed.y < 0.01) point.speed.y = 0
            if (pointBySpeed.type !== EPointType.Border) {
                pointBySpeed.speed.x += roundedSpeed.x / 2
                if (pointBySpeed.speed.x < 0.01) pointBySpeed.speed.x = 0
                pointBySpeed.speed.y += roundedSpeed.y / 2
                if (pointBySpeed.speed.y < 0.01) pointBySpeed.speed.y = 0
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