import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { Speed } from "../classes/speed";
import { EPointType } from "../types";
import { random } from "../utils/random";

const POINTS_TO_IGNORE = {
    [EPointType.Void]: true,
    [EPointType.Clone]: true,
    [EPointType.Virus]: true,
    [EPointType.Border]: true,
    [EPointType.Heal]: true,
}

let stepsSinceLastActivity = 0;

export const incrementVirusSteps = () => {
    stepsSinceLastActivity = (stepsSinceLastActivity ?? 0) + 1;
}

export const virus: TForceProcessor = (point) => {
    const neighbors = Points.getNeighbours(point);

    for (const neighbor of neighbors) {
        // Skip Void and Clone points as per requirements
        if (POINTS_TO_IGNORE[neighbor.type]) {
            continue;
        }

        Points.markPointAsUsed(point);
        
        if (random() < 0.01) {
            neighbor.data.originalType = neighbor.type;
            neighbor.type = EPointType.Virus;
            Points.markNeighboursAsUsed(neighbor);
            stepsSinceLastActivity = 0;
        }
    }

    if (stepsSinceLastActivity > 20) {
        const possibleDirections = Speed.possibleNeighbours;
        const randomDirection = possibleDirections[Math.floor(random() * possibleDirections.length)];
        const pointThere = Points.getPointByCoordinates({
            x: point.coordinates.x + randomDirection.x,
            y: point.coordinates.y + randomDirection.y,
        })

        if (!pointThere) {
            Points.addPoint({
                ...point,
                coordinates: {
                    x: point.coordinates.x + randomDirection.x,
                    y: point.coordinates.y + randomDirection.y,
                },
            })
            stepsSinceLastActivity = 0;
        }
    }
} 