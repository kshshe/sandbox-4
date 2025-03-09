import { POINTS_HEAT_CAPACITY } from "../config";
import { Bounds } from "./bounds";
import { Controls } from "./controls";
import { Points } from "./points";
import { Storage } from "./storage";
import { TemperatureQuadTree } from "./quadTree";

export class TemperatureGrid {
    private static temperatureGrid: number[][] = Storage.get("TemperatureGrid.temperatureGrid", []);

    private static save() {
        Storage.set("TemperatureGrid.temperatureGrid", this.temperatureGrid);
    }

    public static initGrid() {
        // Initialize both the traditional grid and the quadtree
        const baseTemperature = Controls.getBaseTemperature();
        const bounds = Bounds.getBounds();
        this.temperatureGrid = [];
        for (let x = bounds.left; x <= bounds.right; x++) {
            for (let y = bounds.top; y <= bounds.bottom; y++) {
                this.setTemperatureOnPoint(x, y, baseTemperature);
            }
        }
        
        // Initialize the quadtree
        TemperatureQuadTree.init();
    }

    private static setTemperatureOnPoint(x: number, y: number, temperature: number) {
        if (!this.temperatureGrid[x]) {
            this.temperatureGrid[x] = [];
        }
        this.temperatureGrid[x][y] = temperature;
    }

    public static updateGridFromPoints() {
        const baseTemperature = Controls.getBaseTemperature();
        const points = [...Points.getPoints()];

        for (const point of points) {
            const x = point.coordinates.x;
            const y = point.coordinates.y;
            this.setTemperatureOnPoint(x, y, point.data.temperature ?? baseTemperature);
        }
        
        // Update the quadtree from points
        TemperatureQuadTree.updateFromPoints();
        
        this.save();
    }

    public static getTemperatureOnPoint(x: number, y: number): number {
        // Use the quadtree for temperature lookup
        return TemperatureQuadTree.getTemperatureAt(x, y);
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
        // Use the quadtree for temperature processing
        TemperatureQuadTree.processTemperatureFrame();
        
        // For backward compatibility, we'll also update our traditional grid
        // from the quadtree results
        this.updateTraditionalGridFromQuadTree();
    }
    
    private static updateTraditionalGridFromQuadTree() {
        const bounds = Bounds.getBounds();
        
        for (let x = bounds.left; x <= bounds.right; x++) {
            for (let y = bounds.top; y <= bounds.bottom; y++) {
                const temperature = TemperatureQuadTree.getTemperatureAt(x, y);
                this.setTemperatureOnPoint(x, y, temperature);
            }
        }
        
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
        // Use the quadtree to update points
        TemperatureQuadTree.updatePointsFromTree();
        
        // For backward compatibility, also update from our traditional grid
        const points = Points.getPoints();

        for (const point of points) {
            const temperatureForPoint = this.getTemperatureOnPoint(point.coordinates.x, point.coordinates.y);
            point.data.temperature = temperatureForPoint;
        }
        this.save();
    }
}