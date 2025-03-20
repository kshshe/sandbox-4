import { TForceProcessor } from ".";
import { Points } from "../classes/points";
import { Connections } from "../classes/connections";
import { LIQUID_POINT_TYPES } from "../constants/pointsLiquids";

export const pipeTeleport: TForceProcessor = (point, iteration) => {
  if (!LIQUID_POINT_TYPES[point.type]) return;
  
  const pipes = Connections.getPipeFromPoint(point.coordinates);
  for (const pipe of pipes) {
    const endPoint = Points.getPointByCoordinates(pipe.to);
    if (!endPoint) {
      pipe.lastUsed = iteration;
      // Teleport liquid to the end of the pipe
      Points.deletePoint(point);
      Points.addPoint({
        coordinates: pipe.to,
        type: point.type,
        speed: { ...point.speed },
        data: { ...point.data }
      });
      break;
    }
  }
} 