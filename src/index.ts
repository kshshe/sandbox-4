import { Points } from './classes/points';
import './render';
import { startProcessing } from './forces';
import { EPointType } from './types';
import { addConsoleApi } from './utils/addConsoleApi';

Points.addPoint({
    type: EPointType.Water,
    coordinates: { x: 5, y: 5 },
    speed: { x: 0, y: 0 }
})

Points.addPoint({
    type: EPointType.Water,
    coordinates: { x: 10, y: 5 },
    speed: { x: 0, y: 1 }
})

Points.addPoint({
    type: EPointType.Water,
    coordinates: { x: 10, y: 2 },
    speed: { x: 0, y: 0.5 }
})

Points.addPoint({
    type: EPointType.Water,
    coordinates: { x: 20, y: 30 },
    speed: { x: 0, y: -1 }
})

void startProcessing();

addConsoleApi();