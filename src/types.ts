export type TCoordinate = {
    x: number;
    y: number;
}

export enum EPointType {
    Water = 'water',
    Border = 'border',
    Sand = 'sand',
    Stone = 'stone',
    StaticStone = 'staticStone',
    Lava = 'lava',
    Fire = 'fire',
    IceFire = 'iceFire',
    Bomb = 'bomb',
    Ice = 'ice',
    Steam = 'steam',
    Void = 'void',
    Clone = 'clone',
    Gas = 'gas',
    FireEmitter = 'fireEmitter',
    Wood = 'wood',
    BurningWood = 'burningWood',
    Dynamite = 'dynamite',
    LiquidGas = 'liquidGas',
    Metal = 'metal',
    MoltenMetal = 'moltenMetal',
    Electricity_Ground = 'electricityGround',
    Electricity_Spark = 'electricitySpark',
    Electricity_Source = 'electricitySource',
    Virus = 'virus',
    Heal = 'heal',
    Acid = 'acid',
    Plant = 'plant',
    PlantSeed = 'plantSeed',
    ConstantCold = 'constantCold',
    ConstantHot = 'constantHot',
}

export type TPoint = {
    coordinates: TCoordinate
    type: EPointType,
    speed: TCoordinate,
    data: Record<string, any>,
    wasDeleted?: boolean
    lastMoveOnIteration?: number
    visualCoordinates?: TCoordinate
}