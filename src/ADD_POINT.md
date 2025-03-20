# How to Add a New Point Type

## 1. Define the Point Type in Enum
Add to `src/types.ts`:
```typescript
export enum EPointType {
    // ... existing code ...
    YourNewPointType = 'yourNewPointType',
}
```

## 2. Configure Point Properties

### Basic Properties
- **Weight**: Add to `pointsWeights.ts` (use `Infinity` for static objects)
- **Color**: Add RGB values to `pointsColors.ts`
- **Icon**: Add emoji to `pointTypeIcon.ts` (only for types that can be added manually)
- **Description**: Add to `pointTypeHint.ts` (only for types that can be added manually)
- **Name**: Add to `pointNames.ts` (display name for the point type)

### Special Properties (if needed)
- **Initial Temperature**: Add to temperature constants (only in case of points which temperature is different from the base temperature)
- **Electricity Conductivity**: Add to `pointsElectricity.ts`
- **Liquid Behavior**: Add to `pointsLiquids.ts`
- **Element Group**: Add to appropriate element group in `pointTypeIcon.ts` (ELEMENT_GROUPS array)

## 3. Define Behavior
Add force processors in `src/forceProcessors/index.ts`:
```typescript
export const forcesByType: Record<EPointType, TForceProcessor[]> = {
    // ... existing code ...
    [EPointType.YourNewPointType]: [
        ...BASIC_FORCES,
        // Add custom behaviors and reactions
    ],
}
```

Common base behaviors:
- `...BASIC_FORCES` - for elements affected by gravity (sand, water, etc.)
- `...BASIC_TEMPERATURE_PROCESSORS` - for elements with temperature behavior
- `staticForce` - for immobile elements

## 4. Create Custom Force Processors (if needed)
If your point needs unique behaviors, create a new processor in a separate file:
```typescript
import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { EPointType } from "../types";

export const yourNewProcessor: TForceProcessor = (point) => {
    // Get neighboring points if needed
    const neighbors = Points.getNeighbours(point, true);
    
    // Implement custom behavior
    // ...
    
    // Mark point as used when applying forces
    Points.markPointAsUsed(point);
}
```

## 5. Implementation Examples

### Example: Attraction to Another Element
To create an element that's attracted to another element type:

```typescript
export const attractionProcessor: TForceProcessor = (point) => {
    const neighbors = Points.getNeighbours(point, true);
    
    // Find target elements
    const targetElements = neighbors.filter(neighbor => 
        neighbor.type === EPointType.TargetType
    );
    
    if (targetElements.length === 0) {
        return;
    }
    
    // Mark as used
    Points.markPointAsUsed(point);
    
    // Apply attraction forces
    for (const targetPoint of targetElements) {
        // Calculate direction vector
        const dirX = targetPoint.coordinates.x - point.coordinates.x;
        const dirY = targetPoint.coordinates.y - point.coordinates.y;
        
        // Apply force
        point.speed.x += dirX * 0.01;
        point.speed.y += dirY * 0.01;
    }
}
```

### Common Patterns
- **Temperature Reactions**: Use `convertOnTemperature` for state changes
- **Lifetime**: Use `lifetime(min, max)` for elements that expire
- **Chaos**: Use `chaos(amount)` for random movement
- **Liquid Behavior**: Use `liquid` for flowing elements