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
- **Icon**: Add emoji to `pointTypeIcon.ts`
- **Description**: Add to `pointTypeHint.ts`

### Special Properties (if needed)
- **Initial Temperature**: Add to temperature constants (only in case of points which temperature is different from the base temperature)
- **Electricity Conductivity**: Add to `pointsElectricity.ts`
- **Liquid Behavior**: Add to `pointsLiquids.ts`
- **Element Group**: Add to appropriate element group (`pointTypeIcon.ts`)

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

## 4. Create Custom Force Processors (if needed)
If your point needs unique behaviors, create a new processor in a separate file:
```typescript
export const yourNewProcessor = (point: TPoint, step: number) => {
    // Custom behavior implementation
}
```