import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { WindVectors } from "../classes/windVectors";
import { POINTS_WEIGHTS } from "../constants/pointsWeights";
import { EPointType } from "../types";

// Configuration: elements that are completely unaffected by wind
const WIND_IMMUNE_ELEMENTS: Record<string, boolean> = {
  [EPointType.Border]: true,
  [EPointType.StaticStone]: true,
  [EPointType.Glass]: true,
  [EPointType.Wire]: true,
  [EPointType.Pipe]: true,
  [EPointType.Wood]: true,
  [EPointType.Metal]: true,
  [EPointType.Clone]: true,
  [EPointType.Void]: true,
  [EPointType.Electricity_Ground]: true,
  [EPointType.Electricity_Source]: true,
  [EPointType.Electricity_Amplifier]: true,
  [EPointType.Heater]: true,
  [EPointType.Cooler]: true,
  [EPointType.ColdDetector]: true,
  [EPointType.HotDetector]: true,
  [EPointType.LiquidDetector]: true,
  [EPointType.WindSource]: true,
};

// Wind resistance factor by element weight
const getWindResistance = (weight: number): number => {
  if (weight === Infinity) return 0; // Immovable objects aren't affected
  if (weight < 0) return 2; // Gases and floating particles are affected more
  return 1 / (weight + 0.1); // Lighter elements are affected more
};

export const windForce: TForceProcessor = (point) => {
  // Skip elements immune to wind
  if (WIND_IMMUNE_ELEMENTS[point.type]) {
    return;
  }
  
  // Get all wind vectors affecting this point
  const windVectors = WindVectors.getVectorsAffectingPoint(point.coordinates);
  
  if (windVectors.length === 0) {
    return; // No wind affecting this point
  }
  
  // Calculate wind resistance based on point weight
  const weight = POINTS_WEIGHTS[point.type] || 1;
  const windResistance = getWindResistance(weight);
  
  // Apply each wind vector's effect
  windVectors.forEach(vector => {
    // Calculate force based on wind strength and element's wind resistance
    const forceX = vector.x * vector.strength * windResistance;
    const forceY = vector.y * vector.strength * windResistance;
    
    // Apply force to point's speed
    point.speed.x += forceX;
    point.speed.y += forceY;
    
    // Mark the point as used so its position updates
    Points.markPointAsUsed(point);
  });
}; 