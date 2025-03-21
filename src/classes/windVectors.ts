import { TCoordinate } from '../types';

export type TWindVector = {
  x: number;
  y: number;
  strength: number;
  radius: number;
};

export class WindVectors {
  private static vectors: Record<string, TWindVector> = {};
  private static cache: Record<string, TWindVector[]> = {};
  private static cacheHits = 0;
  private static cacheMisses = 0;

  static clearCache(): void {
    this.cache = {};
  }

  static getCacheStats(): { hits: number, misses: number } {
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses
    };
  }
  
  static addVector(coordinates: TCoordinate, vector: TWindVector): void {
    const key = `${coordinates.x},${coordinates.y}`;
    if (this.vectors[key]) {
      const isSame = this.vectors[key].strength === vector.strength && this.vectors[key].radius === vector.radius && this.vectors[key].x === vector.x && this.vectors[key].y === vector.y;
      if (isSame) {
        return;
      }
    }
    this.vectors[key] = vector;
    this.clearCache();
  }
  
  static removeVector(coordinates: TCoordinate): void {
    const key = `${coordinates.x},${coordinates.y}`;
    delete this.vectors[key];
    this.clearCache();
  }
  
  static getVectorsAffectingPoint(coordinates: TCoordinate): TWindVector[] {
    const cacheKey = `${coordinates.x},${coordinates.y}`;
    if (this.cache[cacheKey]) {
      this.cacheHits++;
      return this.cache[cacheKey];
    }
    this.cacheMisses++;
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

    this.cache[cacheKey] = result;
    
    return result;
  }
  
  static clearVectors(): void {
    this.vectors = {};
    this.clearCache();
  }
} 