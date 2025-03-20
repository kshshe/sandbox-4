import { TCoordinate } from "../types";
import { Storage } from "./storage";

export interface TConnection {
  from: TCoordinate;
  to: TCoordinate;
  type: 'wire' | 'pipe';
}

export class Connections {
  private static connections: TConnection[] = Storage.get('Connections', []);

  static saveConnections(): void {
    Storage.set('Connections', this.connections);
  }

  static addConnection(connection: TConnection): void {
    this.connections.push(connection);
    this.saveConnections();
  }

  static removeConnection(connection: TConnection): void {
    this.connections = this.connections.filter(
      c => !(c.from.x === connection.from.x && 
             c.from.y === connection.from.y && 
             c.to.x === connection.to.x && 
             c.to.y === connection.to.y &&
             c.type === connection.type)
    );
    this.saveConnections();
  }

  static getWireFromPoint(coordinates: TCoordinate): TConnection[] {
    return this.connections.filter(
      c => c.from.x === coordinates.x && c.from.y === coordinates.y && c.type === 'wire'
    );
  }

  static getPipeFromPoint(coordinates: TCoordinate): TConnection[] {
    return this.connections.filter(
      c => c.from.x === coordinates.x && c.from.y === coordinates.y && c.type === 'pipe'
    );
  }

  static getAllConnections(): TConnection[] {
    return [...this.connections];
  }
} 