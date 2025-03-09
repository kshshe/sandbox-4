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
        const baseTemperature = Controls.getBaseTemperature();
        const bounds = Bounds.getBounds();
        
        // Pre-calculate diagonal coefficient
        const temperatureShareFactor = 0.05;
        const airShareFactor = 0.01;
        
        // Use typed arrays for better performance
        const width = this.temperatureGrid.length;
        if (width === 0) return;
        
        // Find the maximum column length to determine grid height
        let height = 0;
        for (let i = 0; i < width; i++) {
            if (this.temperatureGrid[i]) {
                height = Math.max(height, this.temperatureGrid[i].length);
            }
        }
        if (height === 0) return;
        
        // Create a new grid with the same dimensions
        const newTemperatureGrid: number[][] = new Array(width);
        for (let i = 0; i < width; i++) {
            newTemperatureGrid[i] = new Array(height);
        }
        
        // Process the grid using numerical indices for better performance
        for (let x = 0; x < width; x++) {
            const row = this.temperatureGrid[x];
            if (!row) continue;
            
            for (let y = 0; y < row.length; y++) {
                const currentTemperature = row[y];
                if (currentTemperature === undefined) continue;
                
                const hasPointHere = Points.getPointByCoordinates({ x, y });
                const heatCapacity = hasPointHere ? POINTS_HEAT_CAPACITY[hasPointHere.type] ?? 1 : 1;
                
                // Calculate temperature from neighbors
                let temperatureSum = 0;
                let coefficientSum = 0;
                
                // Process all neighbors
                const neighborData = this.processNeighbors(x, y, bounds);
                temperatureSum = neighborData.temperatureSum;
                coefficientSum = neighborData.coefficientSum;
                
                const averageTemperature = temperatureSum / coefficientSum;
                const diff = averageTemperature - currentTemperature;
                const temperatureToShare = diff * temperatureShareFactor / heatCapacity;
                let newTemperature = currentTemperature + temperatureToShare;
                
                // Apply air temperature adjustment for non-point cells
                if (!hasPointHere) {
                    const temperatureDiff = newTemperature - baseTemperature;
                    const temperatureToShareWithAir = temperatureDiff * airShareFactor;
                    newTemperature -= temperatureToShareWithAir;
                }
                
                newTemperatureGrid[x][y] = newTemperature;
            }
        }
        
        // Update the temperature grid with new values
        this.temperatureGrid = newTemperatureGrid;
        this.save();
    }
    
    private static processNeighbors(
        x: number, 
        y: number, 
        bounds: { left: number, right: number, top: number, bottom: number }
    ): { temperatureSum: number, coefficientSum: number } {
        const diagonalCoefficient = 0.75;
        const normalCoefficient = 1;
        const boundaryCoefficient = 0.01;
        
        let temperatureSum = 0;
        let coefficientSum = 0;
        
        // Process all 8 neighbors
        const neighbors = [
            { nx: x - 1, ny: y, coef: normalCoefficient },     // Left
            { nx: x + 1, ny: y, coef: normalCoefficient },     // Right
            { nx: x, ny: y - 1, coef: normalCoefficient },     // Top
            { nx: x, ny: y + 1, coef: normalCoefficient },     // Bottom
            { nx: x - 1, ny: y - 1, coef: diagonalCoefficient }, // Top-left
            { nx: x + 1, ny: y - 1, coef: diagonalCoefficient }, // Top-right
            { nx: x - 1, ny: y + 1, coef: diagonalCoefficient }, // Bottom-left
            { nx: x + 1, ny: y + 1, coef: diagonalCoefficient }  // Bottom-right
        ];
        
        for (const neighbor of neighbors) {
            const { nx, ny, coef } = neighbor;
            let coefficient = coef;
            
            // Apply boundary conditions
            if (nx < bounds.left || nx > bounds.right || ny < bounds.top || ny > bounds.bottom) {
                coefficient = boundaryCoefficient;
            }
            
            // Apply point heat capacity
            const neighborPoint = Points.getPointByCoordinates({ x: nx, y: ny });
            if (neighborPoint) {
                coefficient *= POINTS_HEAT_CAPACITY[neighborPoint.type] ?? 1;
            }
            
            const temp = this.getTemperatureOnPoint(nx, ny);
            temperatureSum += temp * coefficient;
            coefficientSum += coefficient;
        }
        
        return { temperatureSum, coefficientSum };
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