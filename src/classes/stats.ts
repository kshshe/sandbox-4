export class Stats {
    static data = {
        fps: 0,
        averageSpeed: 0,
    }

    static setFps(fps: number) {
        Stats.data.fps = fps
    }

    static setAverageSpeed(speed: number) {
        Stats.data.averageSpeed = speed
    }
}