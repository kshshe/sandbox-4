import { TForceProcessor } from ".."

export const throttle = (processor: TForceProcessor, throttleTimes: number): TForceProcessor => {
    let callIndex = 0
    return (point) => {
        if (callIndex === 0) {
            processor(point)
        }
        callIndex = (callIndex + 1) % throttleTimes
    }
}