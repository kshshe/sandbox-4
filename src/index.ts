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
                    type: Math.random() > 0.5 ? EPointType.Sand : EPointType.Water,
                    speed: { x: 0, y: 0 },
                })
            }
        }
    }

    const bounds = Bounds.getBounds()

    const x = Math.floor(bounds.right / 2)
    const y = Math.floor(bounds.bottom / 2)

    for (let i = 1; i < 10; i++) {
        Points.addPoint({
            coordinates: { x: x + i - 5, y },
            type: EPointType.Border,
            speed: { x: 0, y: 0 },
        })
    }

    for (let i = 0; i < 10; i++) {
        Points.addPoint({
            coordinates: { x: x + 5, y: y + i - 9 },
            type: EPointType.Border,
            speed: { x: 0, y: 0 },
        })
    }

    for (let i = 0; i < 10; i++) {
        Points.addPoint({
            coordinates: { x: x - 5, y: y - i },
            type: EPointType.Border,
            speed: { x: 0, y: 0 },
        })
    }
}, 200)

void startProcessing();

addConsoleApi();