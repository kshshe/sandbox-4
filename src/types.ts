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

    ConstantCold = 'constantCold',
    ConstantHot = 'constantHot',
}