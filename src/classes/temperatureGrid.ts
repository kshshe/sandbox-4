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