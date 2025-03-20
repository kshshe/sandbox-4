import { TCoordinate } from "../types";
import { Storage } from "./storage";

export interface TConnection {
  from: TCoordinate;
  to: TCoordinate;
  type: 'wire' | 'pipe';
  lastUsed?: number;
}

export class Connections {
  private static connections: TConnection[] = Storage.get('Connections', []);

  static saveConnections(): void {
    this.mergeConnections();
    Storage.set('Connections', this.connections);
  }

  static deleteAllConnections(): void {
    this.connections = [];
    this.saveConnections();
  }

  static mergeConnections(): void {
    let wasChanged = false;
    for (const conn of this.connections) {
      const toX = conn.to.x;
      const toY = conn.to.y;

      if (conn.to.x === conn.from.x && conn.to.y === conn.from.y) {
        this.removeConnection(conn);
        wasChanged = true;
        continue;
      }

      for (const otherConn of this.connections) {
        if (otherConn === conn) continue;

        if (
          otherConn.from.x === toX && otherConn.from.y === toY
        ) {
          conn.to = otherConn.to;
          this.removeConnection(otherConn);
          wasChanged = true;
          break;
        }
      }
    }
    if (wasChanged) {
      this.saveConnections();
    }
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

  static getConnectionFromOrTo(coordinates: TCoordinate): TConnection[] {
    return this.connections.filter(
      c => c.from.x === coordinates.x && c.from.y === coordinates.y ||
        c.to.x === coordinates.x && c.to.y === coordinates.y
    );
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