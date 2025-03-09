import { Bounds } from "./bounds";
import { Controls } from "./controls";
import { Points } from "./points";
import { Storage } from "./storage";
import { POINTS_HEAT_CAPACITY } from "../config";
import { TCoordinate } from "../types";

// Temperature processing constants
const MIN_SIZE = 4; // Minimum size of a quadtree node
const TEMPERATURE_SHARE_FACTOR = 0.05;
const AIR_SHARE_FACTOR = 0.08;
const AIR_SHARE_MULTIPLIER = 1;

// Neighbor coefficient constants
const DIAGONAL_COEFFICIENT = 0.75;
const NORMAL_COEFFICIENT = 1;
const BOUNDARY_COEFFICIENT = 0.01;

// Heat capacity constants
const DEFAULT_HEAT_CAPACITY = 1;

export class QuadTreeNode {
  x: number;
  y: number;
  size: number;
  temperature: number;
  children: QuadTreeNode[] | null = null;
  isLeaf = true;
  hasPoints = false;

  constructor(x: number, y: number, size: number, temperature: number) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.temperature = temperature;
  }

  // Check if this node contains the given point
  contains(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x < this.x + this.size &&
      y >= this.y &&
      y < this.y + this.size
    );
  }

  // Subdivide this node into four children
  subdivide(): void {
    if (!this.isLeaf) return;
    
    const halfSize = this.size / 2;
    this.children = [
      new QuadTreeNode(this.x, this.y, halfSize, this.temperature),
      new QuadTreeNode(this.x + halfSize, this.y, halfSize, this.temperature),
      new QuadTreeNode(this.x, this.y + halfSize, halfSize, this.temperature),
      new QuadTreeNode(this.x + halfSize, this.y + halfSize, halfSize, this.temperature),
    ];
    this.isLeaf = false;
  }

  // Get the leaf node that contains the given point
  getLeafAt(x: number, y: number): QuadTreeNode | null {
    if (!this.contains(x, y)) return null;
    
    if (this.isLeaf) return this;
    
    for (const child of this.children!) {
      const leaf = child.getLeafAt(x, y);
      if (leaf) return leaf;
    }
    
    return null;
  }

  // Get all neighboring leaf nodes
  getNeighbors(): QuadTreeNode[] {
    if (!this.isLeaf) {
      throw new Error("getNeighbors can only be called on leaf nodes");
    }
    
    // This is a simplified implementation - a full one would need to traverse the tree
    // to find all adjacent leaf nodes, which is more complex
    const neighbors: QuadTreeNode[] = [];
    
    // For now, we'll just return an empty array as the actual implementation
    // would be quite complex and depend on the tree structure
    return neighbors;
  }
}

export class TemperatureQuadTree {
  private static root: QuadTreeNode | null = null;
  private static pointsMap: Map<string, { point: any, node: QuadTreeNode }> = new Map();

  // Initialize the quad tree
  public static init(): void {
    const bounds = Bounds.getBounds();
    const baseTemperature = Controls.getBaseTemperature();
    
    // Calculate the size needed to cover the entire bounds
    const width = bounds.right - bounds.left + 1;
    const height = bounds.bottom - bounds.top + 1;
    const size = Math.max(width, height);
    
    // Create the root node
    this.root = new QuadTreeNode(bounds.left, bounds.top, size, baseTemperature);
    
    // Add all points to the tree
    this.updateFromPoints();
    
    // Save the state
    this.save();
  }

  private static save(): void {
    // We don't actually save the entire tree structure as it would be too large
    // Instead, we'll recreate it each time from the points
    Storage.set("TemperatureQuadTree.initialized", true);
  }

  // Update the quad tree from points
  public static updateFromPoints(): void {
    if (!this.root) this.init();
    
    const points = Points.getPoints();
    this.pointsMap.clear();
    
    for (const point of points) {
      const { x, y } = point.coordinates;
      const temperature = point.data.temperature ?? Controls.getBaseTemperature();
      
      // Find or create the leaf node for this point
      let node = this.ensureLeafNodeAt(x, y);
      if (node) {
        node.temperature = temperature;
        node.hasPoints = true;
        this.pointsMap.set(`${x},${y}`, { point, node });
      }
    }
    
    // After adding all points, check if we need to refine the tree
    this.refineTree();
  }

  // Ensure there's a leaf node at the given coordinates
  private static ensureLeafNodeAt(x: number, y: number): QuadTreeNode | null {
    if (!this.root) return null;
    
    if (!this.root.contains(x, y)) {
      // Point is outside our current bounds, we'd need to expand the tree
      // This is a simplification - a full implementation would handle this
      return null;
    }
    
    let current = this.root;
    
    // Traverse down to a leaf node, subdividing as needed
    while (!current.isLeaf) {
      let found = false;
      
      for (const child of current.children!) {
        if (child.contains(x, y)) {
          current = child;
          found = true;
          break;
        }
      }
      
      if (!found) {
        // This shouldn't happen if our contains logic is correct
        return null;
      }
    }
    
    // If the leaf is too large, subdivide it until we reach MIN_SIZE
    while (current.size > MIN_SIZE) {
      current.subdivide();
      
      // Find which child contains our point
      for (const child of current.children!) {
        if (child.contains(x, y)) {
          current = child;
          break;
        }
      }
    }
    
    return current;
  }

  // Refine the tree based on temperature gradients
  private static refineTree(): void {
    if (!this.root) return;
    
    // This is a simplified implementation
    // A full implementation would traverse the tree and subdivide nodes
    // where there are large temperature gradients
    
    // For now, we'll just ensure that areas with points have appropriate resolution
  }

  // Process one frame of temperature simulation
  public static processTemperatureFrame(): void {
    if (!this.root) this.init();
    
    const baseTemperature = Controls.getBaseTemperature();
    
    // Create a new tree for the updated temperatures
    // In a real implementation, we'd use a more efficient approach
    const newTemperatures = new Map<QuadTreeNode, number>();
    
    // Process all leaf nodes
    if (this.root) {
      this.processNode(this.root, newTemperatures, baseTemperature, TEMPERATURE_SHARE_FACTOR, AIR_SHARE_FACTOR);
    }
    
    // Update the tree with new temperatures
    for (const [node, temp] of newTemperatures.entries()) {
      node.temperature = temp;
    }
    
    // Update points from the tree
    this.updatePointsFromTree();
    
    // Save the state
    this.save();
  }

  // Process a node and its children recursively
  private static processNode(
    node: QuadTreeNode,
    newTemperatures: Map<QuadTreeNode, number>,
    baseTemperature: number,
    temperatureShareFactor: number,
    airShareFactor: number
  ): void {
    if (node.isLeaf) {
      // For leaf nodes, calculate the new temperature
      this.processLeafNode(node, newTemperatures, baseTemperature, temperatureShareFactor, airShareFactor);
    } else {
      // For non-leaf nodes, process all children
      for (const child of node.children!) {
        this.processNode(child, newTemperatures, baseTemperature, temperatureShareFactor, airShareFactor);
      }
    }
  }

  // Process a leaf node
  private static processLeafNode(
    node: QuadTreeNode,
    newTemperatures: Map<QuadTreeNode, number>,
    baseTemperature: number,
    temperatureShareFactor: number,
    airShareFactor: number
  ): void {
    // Get the current temperature
    const currentTemperature = node.temperature;
    
    // Find all neighboring nodes
    const neighbors = this.getNeighborsOf(node);
    
    // Calculate the average temperature of neighbors
    let temperatureSum = 0;
    let coefficientSum = 0;
    
    for (const neighbor of neighbors) {
      const coefficient = this.getNeighborCoefficient(node, neighbor);
      temperatureSum += neighbor.temperature * coefficient;
      coefficientSum += coefficient;
    }
    
    if (coefficientSum === 0) {
      // No neighbors, maintain current temperature
      newTemperatures.set(node, currentTemperature);
      return;
    }
    
    const averageTemperature = temperatureSum / coefficientSum;
    const diff = averageTemperature - currentTemperature;
    
    // Check if there's a point at this location
    const hasPoint = node.hasPoints;
    const heatCapacity = hasPoint ? this.getHeatCapacityAt(node.x, node.y) : 1;
    
    const temperatureToShare = diff * temperatureShareFactor / heatCapacity;
    let newTemperature = currentTemperature + temperatureToShare;
    
    // Apply air temperature adjustment for non-point cells
    if (!hasPoint) {
      // Calculate the difference from base temperature
      const temperatureDiff = newTemperature - baseTemperature;
      
      // Apply a stronger effect to move air temperature toward base temperature more quickly
      // Using a higher airShareFactor for faster convergence to base temperature
      const temperatureToShareWithAir = temperatureDiff * airShareFactor * AIR_SHARE_MULTIPLIER;
      
      // Apply the adjustment
      newTemperature -= temperatureToShareWithAir;
    }
    
    newTemperatures.set(node, newTemperature);
  }

  // Get all neighboring nodes of a leaf node
  private static getNeighborsOf(node: QuadTreeNode): QuadTreeNode[] {
    if (!node.isLeaf) {
      throw new Error("getNeighborsOf can only be called on leaf nodes");
    }
    
    const neighbors: QuadTreeNode[] = [];
    
    // Check all 8 directions
    const directions = [
      { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
      { dx: -1, dy: 0 },                     { dx: 1, dy: 0 },
      { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 }
    ];
    
    if (!this.root) return neighbors;
    
    for (const { dx, dy } of directions) {
      // For simplicity, we'll just check the center point of each direction
      const x = node.x + node.size / 2 + dx * node.size;
      const y = node.y + node.size / 2 + dy * node.size;
      
      const neighborNode = this.root.getLeafAt(x, y);
      if (neighborNode && neighborNode !== node) {
        neighbors.push(neighborNode);
      }
    }
    
    return neighbors;
  }

  // Get the coefficient for a neighbor based on its position
  private static getNeighborCoefficient(node: QuadTreeNode, neighbor: QuadTreeNode): number {
    // Determine if this is a diagonal neighbor
    const isDiagonal = 
      (neighbor.x !== node.x && neighbor.y !== node.y);
    
    // Base coefficient
    let coefficient = isDiagonal ? DIAGONAL_COEFFICIENT : NORMAL_COEFFICIENT;
    
    // Check if the neighbor is outside bounds
    const bounds = Bounds.getBounds();
    if (
      neighbor.x < bounds.left || 
      neighbor.x + neighbor.size > bounds.right + 1 || 
      neighbor.y < bounds.top || 
      neighbor.y + neighbor.size > bounds.bottom + 1
    ) {
      coefficient = BOUNDARY_COEFFICIENT;
    }
    
    // Apply heat capacity if there's a point
    if (neighbor.hasPoints) {
      coefficient *= this.getHeatCapacityAt(neighbor.x, neighbor.y);
    }
    
    return coefficient;
  }

  // Get the heat capacity at a specific location
  private static getHeatCapacityAt(x: number, y: number): number {
    const point = Points.getPointByCoordinates({ x, y });
    if (!point) return DEFAULT_HEAT_CAPACITY;
    
    return POINTS_HEAT_CAPACITY[point.type] ?? DEFAULT_HEAT_CAPACITY;
  }

  // Update all points with temperatures from the tree
  public static updatePointsFromTree(): void {
    for (const { point, node } of this.pointsMap.values()) {
      point.data.temperature = node.temperature;
    }
  }

  // Get the temperature at a specific location
  public static getTemperatureAt(x: number, y: number): number {
    if (!this.root) return Controls.getBaseTemperature();
    
    const node = this.root.getLeafAt(x, y);
    return node ? node.temperature : Controls.getBaseTemperature();
  }
} 