import { POINTS_HEAT_CAPACITY } from "../config";
import { Bounds } from "./bounds";
import { Points } from "./points";
import { Storage } from "./storage";

export class TemperatureGrid {
    private static AIR_TARGET_TEMPERATURE = 20;
    private static temperatureGrid: number[][] = Storage.get("TemperatureGrid.temperatureGrid", []);
    private static lastHeight: number = Storage.get("TemperatureGrid.lastHeight", 0);
    private static lastWidth: number = Storage.get("TemperatureGrid.lastWidth", 0);

    private static save() {
        Storage.set("TemperatureGrid.temperatureGrid", this.temperatureGrid);
        Storage.set("TemperatureGrid.lastHeight", this.lastHeight);
        Storage.set("TemperatureGrid.lastWidth", this.lastWidth);
    }

    private static resetIfBoundsChanged() {
        const bounds = Bounds.getBounds();
        if (bounds.bottom - bounds.top !== this.lastHeight || bounds.right - bounds.left !== this.lastWidth) {
            this.lastHeight = bounds.bottom - bounds.top;
            this.lastWidth = bounds.right - bounds.left;
            this.temperatureGrid = [];
        }
        this.save();
    }

    private static setTemperatureOnPoint(x: number, y: number, temperature: number) {
        if (!this.temperatureGrid[x]) {
            this.temperatureGrid[x] = [];
        }
        this.temperatureGrid[x][y] = temperature;
    }

    public static updateGridFromPoints() {
        this.resetIfBoundsChanged();

        const points = Points.getPoints();

        for (const point of points) {
            const x = point.coordinates.x;
            const y = point.coordinates.y;
            this.setTemperatureOnPoint(x, y, point.data.temperature ?? this.AIR_TARGET_TEMPERATURE);
        }
        this.save();
    }

    public static getTemperatureOnPoint(x: number, y: number): number {
        return this.temperatureGrid[x]?.[y] ?? this.AIR_TARGET_TEMPERATURE;
    }

    private static getNeighbourConfig(x, y, isDiagonal) {
        const basicConfig = {
            temp: this.getTemperatureOnPoint(x, y),
            coefficent: isDiagonal ? 0.75 : 1,
        }
        const hasPointThere = Points.getPointByCoordinates({ x, y });
        if (hasPointThere) {
            basicConfig.coefficent *= POINTS_HEAT_CAPACITY[hasPointThere.type] ?? 1
        }
        return basicConfig;
    }

    public static processTemperatureFrame() {
        this.resetIfBoundsChanged();

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
                    // move temperature to the air
                    const airTemperature = this.AIR_TARGET_TEMPERATURE;
                    const temperatureDiff = temperature - airTemperature;
                    const temperatureToShareWithAir = temperatureDiff * 0.005;
                    this.setTemperatureOnPoint(x, y, temperature - temperatureToShareWithAir);
                }
            }
        }
    }

    public static updatePointsFromGrid() {
        this.resetIfBoundsChanged();

        const points = Points.getPoints();

        for (const point of points) {
            const temperatureForPoint = this.getTemperatureOnPoint(point.coordinates.x, point.coordinates.y);
            point.data.temperature = temperatureForPoint;
        }
    }
}