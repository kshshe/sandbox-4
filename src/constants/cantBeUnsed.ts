import { EPointType } from "../types";

// Interface defining the properties we might care about
export interface IPointTypeProperties {
    readonly isImmutable?: boolean;   // Cannot be erased/overwritten easily
    readonly isSolid?: boolean;       // Blocks movement/physics
    readonly isFlammable?: boolean;   // Can catch fire
    readonly isConductive?: boolean;  // Conducts electricity
    readonly isAgent?: boolean;       // Is a creature/mobile entity
    readonly emitsLight?: boolean;    // Does it produce light?
    // Add other relevant boolean or non-boolean properties:
    // readonly density?: number;
    // readonly defaultColor?: string;
}

// Define default properties for types not explicitly listed
const DEFAULT_PROPERTIES: Readonly<IPointTypeProperties> = {
    isImmutable: false,
    isSolid: false,
    isFlammable: false,
    isConductive: false,
    isAgent: false,
    emitsLight: false,
};

// Map storing properties for specific types. Only list non-default properties.
// Using Partial<Record<...>> allows defining only the types with specific properties.
export const POINT_TYPE_PROPERTIES: Partial<Readonly<Record<EPointType, Readonly<IPointTypeProperties>>>> = {
    // Structural / Immutable
    [EPointType.Border]: { isImmutable: true, isSolid: true },
    [EPointType.Void]: { isImmutable: true },

    // Sources / Emitters
    [EPointType.Clone]: { isImmutable: true },
    [EPointType.ConstantCold]: { isImmutable: true },
    [EPointType.ConstantHot]: { isImmutable: true, emitsLight: true }, // Hot things might glow
    [EPointType.FireEmitter]: { isImmutable: true, emitsLight: true },
    [EPointType.Electricity_Source]: { isImmutable: true, isConductive: true }, // Source itself might be conductive

    // Materials (assuming some exist)
    // [EPointType.Wood]: { isSolid: true, isFlammable: true, density: 0.7 },
    // [EPointType.Stone]: { isSolid: true, density: 2.5 },
    // [EPointType.Metal]: { isSolid: true, isConductive: true, density: 7.8 },
    // [EPointType.Oil]: { isFlammable: true, density: 0.9 },
    // [EPointType.Water]: { isConductive: true, density: 1.0 },

    // Hazards / States
    [EPointType.Bomb]: { isSolid: true }, // Bomb itself might be solid before exploding
    [EPointType.Dynamite]: { isSolid: true }, // Dynamite stick might be solid
    [EPointType.Fire]: { isFlammable: true, emitsLight: true }, // Fire propagates, is hot, emits light
    [EPointType.IceFire]: { emitsLight: true }, // Special type, maybe cold damage + light?
    [EPointType.BurningWood]: { isFlammable: true, emitsLight: true }, // Is burning, emits light, might lose solidity
    [EPointType.Electricity_Ground]: { isConductive: true },
    [EPointType.Electricity_Spark]: { isConductive: true, emitsLight: true },

    // Special Zones
    [EPointType.Heal]: {}, // Maybe no specific property other than its type? Or emits effect?

    // Agents
    [EPointType.Ant]: { isAgent: true, isSolid: true }, // Agents usually occupy space
    [EPointType.FireAnt]: { isAgent: true, isSolid: true, emitsLight: true }, // Fire ants might glow slightly
    [EPointType.IceAnt]: { isAgent: true, isSolid: true },
    [EPointType.Worm]: { isAgent: true }, // Worm might not be solid if underground?
};

/**
 * Retrieves the properties object for a given point type, merging with defaults.
 * @param pointType The point type.
 * @returns A readonly properties object.
 */
export function getPointTypeProperties(pointType: EPointType): Readonly<IPointTypeProperties> {
    const specificProps = POINT_TYPE_PROPERTIES[pointType] ?? {};
    // Merge defaults with specific properties. Specific properties override defaults.
    return { ...DEFAULT_PROPERTIES, ...specificProps };
}

// --- Optional: Specific helper functions can still be useful ---

export function isPointTypeImmutable(pointType: EPointType): boolean {
    return getPointTypeProperties(pointType).isImmutable ?? false; // Nullish Coalescing for safety
}

export function isPointTypeSolid(pointType: EPointType): boolean {
    return getPointTypeProperties(pointType).isSolid ?? false;
}

export function isPointTypeFlammable(pointType: EPointType): boolean {
    return getPointTypeProperties(pointType).isFlammable ?? false;
}

// ... other helpers as needed ...


// --- Example Usage ---
// const typeToCheck = EPointType.Fire;
// const props = getPointTypeProperties(typeToCheck);
//
// if (props.isImmutable) console.log("Is immutable");
// if (props.isSolid) console.log("Is solid");
// if (props.isFlammable) console.log("Is flammable");
// if (props.emitsLight) console.log("Emits light");
//
// // Direct helper usage
// if (!isPointTypeImmutable(typeToCheck)) {
//     // Allow modification
// }
