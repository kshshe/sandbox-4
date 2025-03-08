export class Stats {
    static data = {
        fps: 0,
        averageSpeed: 0,
        load: 0,
        elapsedTime: 0,
    }

    static setLoad(load: number) {
        Stats.data.load = load
    }

    static setFps(fps: number) {
        Stats.data.fps = fps
    }

    static setAverageSpeed(speed: number) {
        Stats.data.averageSpeed = speed
    }

    static setElapsedTime(elapsedTime: number) {
        Stats.data.elapsedTime = elapsedTime
    }
}