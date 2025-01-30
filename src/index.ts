import { Points } from './classes/points';
import './render';
import { startProcessing } from './forces';
import { EPointType } from './types';
import { addConsoleApi } from './utils/addConsoleApi';
import { Bounds } from './classes/bounds';
import { Storage } from './classes/storage';
import './ui/main'

Points.init()

setTimeout(() => {
    if (!Storage.get('wasInit', false)) {
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

        // fill with water
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                Points.addPoint({
                    coordinates: { x: x - 5 + i, y: y - 9 + j },
                    type: EPointType.Water,
                    speed: { x: 0, y: 1 },
                })
            }
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                Points.addPoint({
                    coordinates: { x: x - 5 + i, y: y + j + 5 },
                    type: EPointType.Sand,
                    speed: { x: 0, y: 0 },
                })
            }
        }

        Storage.set('wasInit', true)
    }
}, 200)

void startProcessing();

addConsoleApi();