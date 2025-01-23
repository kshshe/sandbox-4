import { Points } from './classes/points'
import { Speed } from './classes/speed'
import { forces } from './forceProcessors'
import { wait } from './utils/wait'

const processFrame = () => {
    const points = Points.getActivePoints()
    for (const point of points) {
        for (const force of forces) {
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
            point.speed.y /= 2
            pointBySpeed.speed.x += roundedSpeed.x / 2
            pointBySpeed.speed.y += roundedSpeed.y / 2
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
        if (frames % 400 === 0) {
            framesTimes = framesTimes.slice(-100)
            const averageFrameTime = framesTimes.reduce((acc, time) => acc + time, 0) / framesTimes.length
            const fps = 1000 / averageFrameTime
            console.log('FPS:', Math.round(fps), 'Frames:', frames)
        }
    }
}