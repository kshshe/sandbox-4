import { Points } from './classes/points'
import { Speed } from './classes/speed'
import { wait } from './utils/wait'

const processFrame = () => {
    const points = Points.getActivePoints()
    for (const point of points) {
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

const framesTimes = [] as number[]
let frames = 0
export const startProcessing = async () => {
    while (true) {
        const now = Date.now()
        processFrame()
        frames++
        framesTimes.push(Date.now() - now)
        if (frames % 100 === 0) {
            framesTimes.splice(0, framesTimes.length - 100)
            const fps = 1000 / (framesTimes.reduce((a, b) => a + b) / framesTimes.length)
            console.log('FPS:', fps)
        }
        await wait(10)
    }
}