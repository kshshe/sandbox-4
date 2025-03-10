import { TForceProcessor } from ".";
import { Points, TPoint } from "../classes/points";
import { EPointType } from "../types";

const CAN_GROW_ON = {
    [EPointType.Sand]: true,
    [EPointType.Plant]: true,
    [EPointType.PlantSeed]: true,
}

const ENERGY_INITIAL = {
    from: 5,
    to: 15,
}

export const plant: TForceProcessor = (point: TPoint) => {
    if (point.data.temperature < 1) {
        return;
    }

    if (point.data.energy === undefined) {
        point.data.energy = Math.floor(Math.random() * (ENERGY_INITIAL.to - ENERGY_INITIAL.from)) + ENERGY_INITIAL.from;
    }

    if (point.data.energy <= 0) {
        return;
    }

    const possibleGrowthPoints = [
        { x: point.coordinates.x, y: point.coordinates.y - 1 },
        { x: point.coordinates.x - 1, y: point.coordinates.y - 1 },
        { x: point.coordinates.x + 1, y: point.coordinates.y - 1 }
    ];

    const belowPoints = [
        { x: point.coordinates.x, y: point.coordinates.y + 1 },
        { x: point.coordinates.x - 1, y: point.coordinates.y + 1 },
        { x: point.coordinates.x + 1, y: point.coordinates.y + 1 }
    ];

    const pointBelow = belowPoints.map(coordinates => Points.getPointByCoordinates(coordinates)).filter(Boolean)[0];

    if (!pointBelow || !CAN_GROW_ON[pointBelow.type]) {
        return;
    }

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
            if (pointBelow.type === EPointType.PlantSeed) {
                pointBelow.type = EPointType.Plant;
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