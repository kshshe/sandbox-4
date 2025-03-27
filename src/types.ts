export type TCoordinate = {
    x: number;
    y: number;
}

export enum EPointType {
    Smoke = 'smoke',
    Water = 'water',
    Border = 'border',
    Sand = 'sand',
    StaticSand = 'staticSand',
    Stone = 'stone',
    StaticStone = 'staticStone',
    Lava = 'lava',
    Fire = 'fire',
    Oil = 'oil',
    BurningOil = 'burningOil',
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
    Electricity_Amplifier = 'electricityAmplifier',
    Heater = 'heater',
    Cooler = 'cooler',
    Virus = 'virus',
    Heal = 'heal',
    Acid = 'acid',
    Plant = 'plant',
    PlantSeed = 'plantSeed',
    Glass = 'glass',
    LiquidGlass = 'liquidGlass',
    ConstantCold = 'constantCold',
    ConstantHot = 'constantHot',
    ColdDetector = 'coldDetector',
    HotDetector = 'hotDetector',
    LiquidDetector = 'liquidDetector',
    Wire = 'wire',
    Pipe = 'pipe',
    Snow = 'snow',
    Magnet = 'magnet',
    WindSource = 'windSource',
    Ant = 'ant',
    FireAnt = 'fireAnt',
    IceAnt = 'iceAnt',
    Worm = 'worm',
    LightSource = 'lightSource',
    Mirror = 'mirror',
    LightDetector = 'lightDetector',
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