import { TForceProcessor } from ".."

export const throttle = (processor: TForceProcessor, throttleTimes: number): TForceProcessor => {
    let callIndex = 0
    return (point, step) => {
        if (callIndex === 0) {
            processor(point, step)
        }
        callIndex = (callIndex + 1) % throttleTimes
    }
}