export type TCoordinate = {
    x: number;
    y: number;
}

export enum EPointType {
    Water = 'water',
    Border = 'border',
    Sand = 'sand',
    Stone = 'stone',
    Fire = 'fire',
    IceFire = 'iceFire',
    Bomb = 'bomb',
    Ice = 'ice',
    Steam = 'steam',

    ConstantCold = 'constantCold',
    ConstantHot = 'constantHot',
}