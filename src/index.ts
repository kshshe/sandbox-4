import { Points } from './classes/points';
import './render';
import { startProcessing } from './forces';
import { EPointType } from './types';
import { addConsoleApi } from './utils/addConsoleApi';
import { Bounds } from './classes/bounds';

setTimeout(() => {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < Bounds.getBounds().right; x++) {
            if (Math.random() < 0.9) {
                Points.addPoint({
                    coordinates: { x, y: y + 10 },
                    type: EPointType.Sand,
                    speed: { x: 0, y: 0 },
                })
            }
        }
    }

    const bounds = Bounds.getBounds()

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            Points.addPoint({
                coordinates: { x: x + Math.round(bounds.right / 2) - 5, y: y + Math.round(bounds.bottom / 2) - 5 },
                type: EPointType.Border,
                speed: { x: 0, y: 0 },
            })
        }
    }
}, 200)

void startProcessing();

addConsoleApi();