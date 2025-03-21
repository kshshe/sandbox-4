import { Storage } from './storage';
import { TCoordinate } from '../types';

export type TWindVector = {
  x: number;
  y: number;
  strength: number;
  radius: number;
};

export class WindVectors {
  private static vectors: Record<string, TWindVector> = Storage.get('windVectors', {});

  static saveVectors(): void {
    Storage.set('windVectors', this.vectors);
  }
  
  static addVector(coordinates: TCoordinate, vector: TWindVector): void {
    const key = `${coordinates.x},${coordinates.y}`;
    this.vectors[key] = vector;
    this.saveVectors();
  }
  
  static removeVector(coordinates: TCoordinate): void {
    const key = `${coordinates.x},${coordinates.y}`;
    delete this.vectors[key];
    this.saveVectors();
  }
  
  static getVectorsAffectingPoint(coordinates: TCoordinate): TWindVector[] {
    const result: TWindVector[] = [];
    
    Object.entries(this.vectors).forEach(([key, vector]) => {
      const [sourceX, sourceY] = key.split(',').map(Number);
      const dx = coordinates.x - sourceX;
      const dy = coordinates.y - sourceY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= vector.radius) {
        // Strength decreases with distance
        const effectiveStrength = vector.strength * (1 - distance / vector.radius);
        result.push({
          ...vector,
          strength: effectiveStrength
        });
      }
    });
    
    return result;
  }
  
  static clearVectors(): void {
    this.vectors = {};
    this.saveVectors();
  }
} 