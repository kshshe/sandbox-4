// 1) Extend EPointType with more materials

export enum EPointType {
  // Original Types
  Sand = "Sand",
  StaticSand = "StaticSand",
  Stone = "Stone",
  StaticStone = "StaticStone",
  Void = "Void",
  Clone = "Clone",
  Wood = "Wood",
  BurningWood = "BurningWood",
  Glass = "Glass",
  Fire = "Fire",
  IceFire = "IceFire",
  Steam = "Steam",
  Gas = "Gas",
  Electricity_Spark = "Electricity_Spark",
  Smoke = "Smoke",
  Ant = "Ant",
  
  // NEW Types
  Water = "Water",
  Lava = "Lava",
  Mud = "Mud",
  QuickSand = "QuickSand",
  Metal = "Metal",
  RustingMetal = "RustingMetal",
  Plant = "Plant",
  BurningPlant = "BurningPlant",
  Acid = "Acid",
  Slime = "Slime",
  Ice = "Ice",
  PoisonGas = "PoisonGas",
  Plasma = "Plasma",
}

// 2) Define a more comprehensive interface for behaviors 
//    (including probability, but also other properties).

interface IPointBehavior {
  // The probability for the element to randomly change direction in the simulation
  probabilityToChangeDirection: number;
  
  // The flammability could affect how quickly it ignites or spreads fire
  flammability: number;
  
  // A simple measure for how quickly it moves or flows
  fluidity: number;
  
  // Optional color or visual representation for rendering (just an example)
  color?: string;
  
  // A default temperature range in which this point is stable (example usage in advanced sims)
  stableTemperatureRange?: [number, number];
}

// 3) A map storing behaviors for each point type (original + new).

export const POINT_BEHAVIORS: {
  [key in EPointType]?: IPointBehavior
} = {
  // ====== Original Types ======
  [EPointType.Sand]: {
    probabilityToChangeDirection: 0.01,
    flammability: 0, 
    fluidity: 2,
    color: "#C2B280",
    stableTemperatureRange: [0, 1000],
  },
  [EPointType.StaticSand]: {
    probabilityToChangeDirection: 0,
    flammability: 0,
    fluidity: 0,
    color: "#B8A568",
  },
  [EPointType.Stone]: {
    probabilityToChangeDirection: 0,
    flammability: 0,
    fluidity: 0,
    color: "#808080",
    stableTemperatureRange: [0, 2000],
  },
  [EPointType.StaticStone]: {
    probabilityToChangeDirection: 0,
    flammability: 0,
    fluidity: 0,
    color: "#707070",
  },
  [EPointType.Void]: {
    probabilityToChangeDirection: 0,
    flammability: 0,
    fluidity: 0,
    color: "transparent",
  },
  [EPointType.Clone]: {
    probabilityToChangeDirection: 0,
    flammability: 0,
    fluidity: 0,
    color: "#FFFFFF",
  },
  [EPointType.Wood]: {
    probabilityToChangeDirection: 0,
    flammability: 5,
    fluidity: 0,
    color: "#8B4513",
  },
  [EPointType.BurningWood]: {
    probabilityToChangeDirection: 0,
    flammability: 10, // actively burning
    fluidity: 0,
    color: "#AA2C2C",
  },
  [EPointType.Glass]: {
    probabilityToChangeDirection: 0,
    flammability: 0,
    fluidity: 0,
    color: "#D2F1F7",
    stableTemperatureRange: [0, 1400],
  },
  [EPointType.Fire]: {
    probabilityToChangeDirection: 4,
    flammability: 10,
    fluidity: 8,
    color: "#FF4500",
  },
  [EPointType.IceFire]: {
    probabilityToChangeDirection: 4,
    flammability: 2, // paradoxical but let's say it's somewhat flammable
    fluidity: 10,
    color: "#5BD0FF",
  },
  [EPointType.Steam]: {
    probabilityToChangeDirection: 10,
    flammability: 0,
    fluidity: 10,
    color: "#F0F8FF",
  },
  [EPointType.Gas]: {
    probabilityToChangeDirection: 10,
    flammability: 5, 
    fluidity: 10,
    color: "#ECECEC",
  },
  [EPointType.Electricity_Spark]: {
    probabilityToChangeDirection: 10,
    flammability: 0,
    fluidity: 10,
    color: "#FFFF33",
  },
  [EPointType.Smoke]: {
    probabilityToChangeDirection: 5,
    flammability: 0,
    fluidity: 10,
    color: "#696969",
  },
  [EPointType.Ant]: {
    probabilityToChangeDirection: 0,
    flammability: 0,
    fluidity: 4,
    color: "#000000",
  },

  // ====== NEW Types ======
  [EPointType.Water]: {
    probabilityToChangeDirection: 2,
    flammability: 0,
    fluidity: 9,
    color: "#00BFFF",
    stableTemperatureRange: [0, 99],
  },
  [EPointType.Lava]: {
    probabilityToChangeDirection: 3,
    flammability: 0,
    fluidity: 7,
    color: "#CF1020",
    stableTemperatureRange: [700, 2000],
  },
  [EPointType.Mud]: {
    probabilityToChangeDirection: 1,
    flammability: 0,
    fluidity: 3,
    color: "#3E2723",
  },
  [EPointType.QuickSand]: {
    probabilityToChangeDirection: 2,
    flammability: 0,
    fluidity: 5,
    color: "#C2B280",
  },
  [EPointType.Metal]: {
    probabilityToChangeDirection: 0,
    flammability: 0,
    fluidity: 0,
    color: "#B0B0B0",
    stableTemperatureRange: [0, 1500],
  },
  [EPointType.RustingMetal]: {
    probabilityToChangeDirection: 0,
    flammability: 0,
    fluidity: 0,
    color: "#B7410E",
  },
  [EPointType.Plant]: {
    probabilityToChangeDirection: 0.5,
    flammability: 3,
    fluidity: 0,
    color: "#228B22",
  },
  [EPointType.BurningPlant]: {
    probabilityToChangeDirection: 0,
    flammability: 10,
    fluidity: 0,
    color: "#802C2C",
  },
  [EPointType.Acid]: {
    probabilityToChangeDirection: 4,
    flammability: 0,
    fluidity: 8,
    color: "#9ACD32",
  },
  [EPointType.Slime]: {
    probabilityToChangeDirection: 4,
    flammability: 1,
    fluidity: 6,
    color: "#8FBC8F",
  },
  [EPointType.Ice]: {
    probabilityToChangeDirection: 1,
    flammability: 0,
    fluidity: 1,
    color: "#ADD8E6",
    stableTemperatureRange: [-50, -1],
  },
  [EPointType.PoisonGas]: {
    probabilityToChangeDirection: 8,
    flammability: 2,
    fluidity: 10,
    color: "#98FB98",
  },
  [EPointType.Plasma]: {
    probabilityToChangeDirection: 10,
    flammability: 10,
    fluidity: 10,
    color: "#FF00FF",
    stableTemperatureRange: [1000, 5000],
  },
};

// 4) (Optional) Create a brand-new system for interactions.
//    This example shows how different types might react, 
//    transform, or damage each other.

interface IInteraction {
  reactsWith: EPointType[];
  transformsTo?: EPointType;
  reactionProbability: number;
  damage?: number; // e.g., how much damage is caused if these two collide
}

export const POINT_INTERACTIONS: {
  [key in EPointType]?: IInteraction[]
} = {
  // Water evaporates into Steam when exposed to Fire or Lava
  [EPointType.Water]: [
    {
      reactsWith: [EPointType.Fire, EPointType.Lava],
      transformsTo: EPointType.Steam,
      reactionProbability: 0.8,
      damage: 0,
    },
  ],
  // Lava + Water = Stone (cooling effect)
  [EPointType.Lava]: [
    {
      reactsWith: [EPointType.Water],
      transformsTo: EPointType.Stone,
      reactionProbability: 0.7,
      damage: 0,
    },
  ],
  // Metal can become RustingMetal in contact with Water 
  [EPointType.Metal]: [
    {
      reactsWith: [EPointType.Water],
      transformsTo: EPointType.RustingMetal,
      reactionProbability: 0.4,
      damage: 0,
    },
  ],
  // Acid can corrode Metal or Stone into Void or transform them 
  [EPointType.Acid]: [
    {
      reactsWith: [EPointType.Metal, EPointType.Stone],
      transformsTo: EPointType.Void,
      reactionProbability: 0.6,
      damage: 5,
    },
  ],
  // Fire ignites flammable objects (like Wood, Plant, Slime, Gas)
  [EPointType.Fire]: [
    {
      reactsWith: [EPointType.Wood, EPointType.Plant, EPointType.Slime, EPointType.Gas],
      transformsTo: EPointType.BurningWood, // or burning version of other types
      reactionProbability: 0.9,
      damage: 10,
    },
  ],
  // PoisonGas could be ignited by Fire or Electricity_Spark -> turns into Smoke
  [EPointType.PoisonGas]: [
    {
      reactsWith: [EPointType.Fire, EPointType.Electricity_Spark],
      transformsTo: EPointType.Smoke,
      reactionProbability: 0.7,
      damage: 5,
    },
  ],
};

//
// 5) Re-export your original object, if you still need a simple 
//    "probabilityToChangeDirection" map for quick references.
//
// For convenience, you can derive it from POINT_BEHAVIORS:

export const POINTS_PROBABILITY_TO_CHANGE_DIRECTION_MODIFIERS: {
  [key in EPointType]?: number
} = Object.keys(POINT_BEHAVIORS).reduce((acc, key) => {
  const typedKey = key as EPointType;
  const behavior = POINT_BEHAVIORS[typedKey];
  if (behavior) {
    acc[typedKey] = behavior.probabilityToChangeDirection;
  }
  return acc;
}, {} as { [key in EPointType]?: number });
