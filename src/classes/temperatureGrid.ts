import { POINTS_HEAT_CAPACITY } from "../config";
import { Bounds } from "./bounds";
import { Controls } from "./controls";
import { Points } from "./points";
import { Storage } from "./storage";

export class TemperatureGrid {
    private static temperatureGrid: number[][] = Storage.get("TemperatureGrid.temperatureGrid", []);

    private static save() {
        Storage.set("TemperatureGrid.temperatureGrid", this.temperatureGrid);
    }

    public static initGrid() {
        const baseTemperature = Controls.getBaseTemperature();
        const bounds = Bounds.getBounds();
        this.temperatureGrid = [];
        for (let x = bounds.left; x <= bounds.right; x++) {
            for (let y = bounds.top; y <= bounds.bottom; y++) {
                this.setTemperatureOnPoint(x, y, baseTemperature);
            }
        }
    }

    private static setTemperatureOnPoint(x: number, y: number, temperature: number) {
        if (!this.temperatureGrid[x]) {
            this.temperatureGrid[x] = [];
        }
        this.temperatureGrid[x][y] = temperature;
    }

    public static updateGridFromPoints() {
        const baseTemperature = Controls.getBaseTemperature();
        const points = [...Points.getPoints()]

        for (const point of points) {
            const x = point.coordinates.x;
            const y = point.coordinates.y;
            this.setTemperatureOnPoint(x, y, point.data.temperature ?? baseTemperature);
        }
        this.save();
    }

    public static getTemperatureOnPoint(x: number, y: number): number {
        const baseTemperature = Controls.getBaseTemperature();
        return this.temperatureGrid[x]?.[y] ?? baseTemperature;
    }

    private static getNeighbourConfig(x, y, isDiagonal) {
        const basicConfig = {
            temp: this.getTemperatureOnPoint(x, y),
            coefficent: isDiagonal ? 0.75 : 1,
        }
        const bounds = Bounds.getBounds();
        if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
            basicConfig.coefficent = 0.01;
        }
        const hasPointThere = Points.getPointByCoordinates({ x, y });
        if (hasPointThere) {
            basicConfig.coefficent *= POINTS_HEAT_CAPACITY[hasPointThere.type] ?? 1
        }
        return basicConfig;
    }

    public static processTemperatureFrame() {
        for (const rowIndex in this.temperatureGrid) {
            const row = this.temperatureGrid[rowIndex];
            for (const colIndex in row) {
                const temperature = this.temperatureGrid[rowIndex][colIndex];
                const x = +rowIndex;
                const y = +colIndex;
                const hasPointHere = Points.getPointByCoordinates({ x, y });
                const heatCapacity = hasPointHere ? POINTS_HEAT_CAPACITY[hasPointHere.type] ?? 1 : 1;
                const neighbours = [
                    // left
                    this.getNeighbourConfig(x - 1, y, false),
                    // right
                    this.getNeighbourConfig(x + 1, y, false),
                    // top
                    this.getNeighbourConfig(x, y - 1, false),
                    // bottom
                    this.getNeighbourConfig(x, y + 1, false),
                    // top left
                    this.getNeighbourConfig(x - 1, y - 1, true),
                    // top right
                    this.getNeighbourConfig(x + 1, y - 1, true),
                    // bottom left
                    this.getNeighbourConfig(x - 1, y + 1, true),
                    // bottom right
                    this.getNeighbourConfig(x + 1, y + 1, true),
                ];
                const temperatureSum = neighbours.reduce((acc, neighbour) => acc + neighbour.temp * neighbour.coefficent, 0);
                const coefficentSum = neighbours.reduce((acc, neighbour) => acc + neighbour.coefficent, 0);
                const averageTemperature = temperatureSum / coefficentSum;
                const diff = averageTemperature - temperature;
                const temperatureToShare = diff * 0.05 / heatCapacity;
                this.setTemperatureOnPoint(x, y, temperature + temperatureToShare);

                if (!hasPointHere) {
                    const baseTemperature = Controls.getBaseTemperature();
                    const airTemperature = baseTemperature;
                    const newTemperature = this.getTemperatureOnPoint(x, y);
                    const temperatureDiff = newTemperature - airTemperature;
                    const temperatureToShareWithAir = temperatureDiff * 0.01;
                    this.setTemperatureOnPoint(x, y, newTemperature - temperatureToShareWithAir);
                }
            }
        }
        this.save();
    }

    public static updatePointsFromGrid() {
        const points = Points.getPoints();

        for (const point of points) {
            const temperatureForPoint = this.getTemperatureOnPoint(point.coordinates.x, point.coordinates.y);
            point.data.temperature = temperatureForPoint;
        }
        this.save();
    }
}