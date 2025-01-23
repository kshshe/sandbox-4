export class Stats {
    static data = {
        fps: 0,
    }

    static setFps(fps: number) {
        Stats.data.fps = fps
    }
}