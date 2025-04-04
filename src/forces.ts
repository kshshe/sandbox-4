import { Points } from './classes/points'
import { Speed } from './classes/speed'
import { Stats } from './classes/stats'
import { forcesByType } from './forceProcessors'
import { wait } from './utils/wait'
import { Controls } from './classes/controls'
import { Storage } from './classes/storage'
import { CANT_BE_UNSED } from './config'
import { Bounds } from './classes/bounds'
import { TemperatureGrid } from './classes/temperatureGrid'
import { incrementVirusSteps } from './forceProcessors/virus'
import { LightSystem } from "./classes/lightSystem"

const MAX_SPEED = 6
const MAX_UNUSED_ITERATIONS = 50
const USE_POINT_EVERY_N_ITERATION = MAX_UNUSED_ITERATIONS
const MAX_UNUSED_SPEED = 0.3

let iteration = Storage.get('iteration', 0)

// Add a flag to track if we should process a single step
let shouldProcessStep = false

// Function to process a single step when paused
export const processStep = () => {
    shouldProcessStep = true;
}

const processFrame = () => {
    const points = Points.getActivePoints()

    const {
        left,
        right,
        top,
        bottom
    } = Bounds.getBounds()

    iteration++
    incrementVirusSteps()
    for (const index in points) {
        const point = points[index]
        let isUnused = Points.isUnused(point)
        if (point.wasDeleted) {
            continue
        }

        // Ensure visual coordinates are initialized
        if (!point.visualCoordinates) {
            point.visualCoordinates = { ...point.coordinates }
        }

        // If smooth movement is disabled, update visual coordinates immediately
        if (!Controls.getIsSmoothMovementEnabled()) {
            point.visualCoordinates.x = point.coordinates.x
            point.visualCoordinates.y = point.coordinates.y
        }

        if (iteration % USE_POINT_EVERY_N_ITERATION === 0 && +index % 10 === 0) {
            Points.markPointAsUsed(point)
            isUnused = false
        }

        if (!isUnused) {
            const forcesList = forcesByType[point.type] || []
            for (const force of forcesList) {
                force(point, iteration)
            }
        }

        let speedLength = Math.sqrt(point.speed.x ** 2 + point.speed.y ** 2)
        if (speedLength > MAX_SPEED) {
            point.speed.x *= MAX_SPEED / speedLength
            point.speed.y *= MAX_SPEED / speedLength
            speedLength = MAX_SPEED
        }
        let timesProcess = Math.min(Math.max(1, Math.ceil(speedLength)), 10)

        if (!CANT_BE_UNSED[point.type] && speedLength < MAX_UNUSED_SPEED && point.lastMoveOnIteration && iteration - point.lastMoveOnIteration > MAX_UNUSED_ITERATIONS) {
            Points.markPointAsUnused(point)
        }

        while (timesProcess--) {
            const prevX = point.coordinates.x
            const prevY = point.coordinates.y

            if (!isUnused) {
                const roundedSpeed = Speed.getRoundedSpeed(point, true)
                const pointBySpeed = Points.getPointBySpeed(point, roundedSpeed)
                
                point.speed.x *= 0.95
                point.speed.y *= 0.95
                if (!pointBySpeed) {
                    point.coordinates.x += roundedSpeed.x
                    point.coordinates.y += roundedSpeed.y
                    point.lastMoveOnIteration = iteration
                    Points.markNeighboursAsUsed(point)
                    Points.deletePointInIndex({
                        x: prevX,
                        y: prevY
                    })
                    Points.setPointInIndex(point.coordinates, point)
                }
            }
        }

        if (+index % 100 === 0) {
            Speed.shufflePossibleNeighbours()
        }

        const isOutOfBounds = point.coordinates.x < left || point.coordinates.x > right || point.coordinates.y < top || point.coordinates.y > bottom
        if (isOutOfBounds) {
            Points.deletePoint(point)
        }
    }

    Points.save()
    Points.shufflePoints()
    Storage.set('iteration', iteration)

    LightSystem.calculateLighting();
}

let framesTimes = [] as number[]
let frames = 0
const availableTime = 1000 / 60
let lastStatsUpdate = performance.now()
let lastTemperatureUpdate = performance.now()
export const startProcessing = async () => {
    let shouldWaitFor60FPS = true
    while (true) {
        const now = performance.now()
        
        // Check if simulation is paused or if we should process a step
        if (!Controls.getIsPaused() || shouldProcessStep) {
            // Reset step flag
            shouldProcessStep = false;
            
            // Get simulation speed (use 1 for step mode)
            const simulationSpeed = Controls.getIsPaused() ? 1 : Controls.getSimulationSpeed();
            
            // Run the simulation based on speed setting
            // For speeds < 1, we process frames less frequently
            // For speeds > 1, we process multiple frames per cycle
            if (simulationSpeed >= 1) {
                // Process multiple frames for higher speeds
                const framesToProcess = Controls.getIsPaused() ? 1 : Math.floor(simulationSpeed);
                for (let i = 0; i < framesToProcess; i++) {
                    processFrame();
                }
            } else {
                // For slow motion, only process frames occasionally
                // e.g., at speed 0.5, process every other frame
                const shouldProcessThisFrame = Math.random() < simulationSpeed;
                if (shouldProcessThisFrame) {
                    processFrame();
                }
            }
            
            if (now - lastTemperatureUpdate >= availableTime) {
                TemperatureGrid.updateGridFromPoints()
                TemperatureGrid.processTemperatureFrame()
                TemperatureGrid.updatePointsFromGrid()
                lastTemperatureUpdate = now
            }
        }
        
        const nowAfterProcess = performance.now()
        const elapsedTime = nowAfterProcess - now
        const remainingTime = !shouldWaitFor60FPS ? 0 : availableTime - elapsedTime
        Stats.setElapsedTime(elapsedTime)
        const timeElapsedPercent = elapsedTime / availableTime
        Stats.setLoad(timeElapsedPercent)
        await wait(Math.max(0, remainingTime))
        frames++
        framesTimes.push(performance.now() - now)
        if (frames % 60 === 0) {
            shouldWaitFor60FPS = !Controls.getDebugMode() && !Controls.getMaxSpeedMode()
        }
        if (now - lastStatsUpdate >= 1000) {
            framesTimes = framesTimes.slice(-100)
            const averageFrameTime = framesTimes.reduce((acc, time) => acc + time, 0) / framesTimes.length
            const fps = 1000 / averageFrameTime
            Stats.setFps(fps)
            Stats.setAverageSpeed(Points.getActivePoints().reduce((acc, point) => acc + Math.abs(point.speed.x) + Math.abs(point.speed.y), 0) / Points.getActivePoints().length)
            lastStatsUpdate = now
        }
    }
}