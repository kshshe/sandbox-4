import { TForceProcessor } from ".";
import { Points, TPoint } from "../classes/points";
import { PLANT_CAN_GROW_ON, PLANT_ENERGY_INITIAL } from "../constants/pointsExceptions";
import { EPointType } from "../types";

export const plant: TForceProcessor = (point: TPoint) => {
    if (point.data.temperature < 1) {
        return;
    }

    if (point.data.energy === undefined) {
        point.data.energy = Math.floor(Math.random() * (PLANT_ENERGY_INITIAL.to - PLANT_ENERGY_INITIAL.from)) + PLANT_ENERGY_INITIAL.from;
    }

    if (point.data.energy <= -20) {
        Points.deletePoint(point);
        return;
    }

    const belowPoints = [
        { x: point.coordinates.x, y: point.coordinates.y + 1 },
        { x: point.coordinates.x - 1, y: point.coordinates.y + 1 },
        { x: point.coordinates.x + 1, y: point.coordinates.y + 1 }
    ];

    const pointBelow = belowPoints.map(coordinates => Points.getPointByCoordinates(coordinates)).filter(Boolean)[0];

    if (!pointBelow || !PLANT_CAN_GROW_ON[pointBelow.type]) {
        Points.markPointAsUsed(point)
        point.data.energy -= 1;
        return;
    }

    if (point.data.energy <= 0) {
        return;
    }

    const possibleGrowthPoints = [
        { x: point.coordinates.x, y: point.coordinates.y - 1 },
        { x: point.coordinates.x - 1, y: point.coordinates.y - 1 },
        { x: point.coordinates.x + 1, y: point.coordinates.y - 1 }
    ];

    const isGrowthBlocked = possibleGrowthPoints.some(coordinates => 
        Points.getPointByCoordinates(coordinates)
    );

    if (isGrowthBlocked) {
        return;
    }

    Points.markPointAsUsed(point);
    if (Math.random() < 0.1) {
        const availablePoints = possibleGrowthPoints.filter(coordinates => 
            !Points.getPointByCoordinates(coordinates)
        );

        const randomGrowthPoint = availablePoints[Math.floor(Math.random() * availablePoints.length)];

        if (randomGrowthPoint) {
            point.type = EPointType.Plant
            Points.onPointUpdated(point);
            if (pointBelow.type === EPointType.PlantSeed) {
                pointBelow.type = EPointType.Plant;
                Points.onPointUpdated(pointBelow);
            }

            Points.addPoint({
                coordinates: randomGrowthPoint,
                type: EPointType.Plant,
                speed: { x: 0, y: 0 },
                data: {
                    energy: point.data.energy - 1
                }
            });
        }
    }
}; 