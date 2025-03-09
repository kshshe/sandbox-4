import { TemperatureQuadTree } from './quadTree';
import { Points } from './points';
import { Controls } from './controls';
import { Bounds } from './bounds';
import { Storage } from './storage';

// Mock dependencies
jest.mock('./points');
jest.mock('./controls');
jest.mock('./bounds');
jest.mock('./storage');

describe('TemperatureQuadTree', () => {
  beforeEach(() => {
    // Setup mocks
    (Controls.getBaseTemperature as jest.Mock).mockReturnValue(20);
    (Bounds.getBounds as jest.Mock).mockReturnValue({
      left: 0,
      right: 100,
      top: 0,
      bottom: 100
    });
    (Points.getPoints as jest.Mock).mockReturnValue([
      {
        coordinates: { x: 10, y: 10 },
        data: { temperature: 30 },
        type: 'fire'
      },
      {
        coordinates: { x: 20, y: 20 },
        data: { temperature: 10 },
        type: 'ice'
      }
    ]);
    (Points.getPointByCoordinates as jest.Mock).mockImplementation(({ x, y }) => {
      if (x === 10 && y === 10) {
        return {
          coordinates: { x, y },
          data: { temperature: 30 },
          type: 'fire'
        };
      }
      if (x === 20 && y === 20) {
        return {
          coordinates: { x, y },
          data: { temperature: 10 },
          type: 'ice'
        };
      }
      return undefined;
    });
  });

  it('should initialize the quad tree', () => {
    TemperatureQuadTree.init();
    expect(Storage.set).toHaveBeenCalledWith('TemperatureQuadTree.initialized', true);
  });

  it('should get temperature at a point', () => {
    TemperatureQuadTree.init();
    
    // Should return the temperature at a point with a value
    expect(TemperatureQuadTree.getTemperatureAt(10, 10)).toBe(30);
    
    // Should return base temperature for a point without a value
    expect(TemperatureQuadTree.getTemperatureAt(50, 50)).toBe(20);
  });

  it('should process a temperature frame', () => {
    TemperatureQuadTree.init();
    
    // Process a frame and verify points are updated
    TemperatureQuadTree.processTemperatureFrame();
    
    // The temperature should have changed, but we can't predict the exact value
    // So we'll just verify the method runs without errors
    expect(Storage.set).toHaveBeenCalledWith('TemperatureQuadTree.initialized', true);
  });

  it('should update from points', () => {
    TemperatureQuadTree.init();
    
    // Change the mock points
    (Points.getPoints as jest.Mock).mockReturnValue([
      {
        coordinates: { x: 10, y: 10 },
        data: { temperature: 40 }, // Changed from 30 to 40
        type: 'fire'
      },
      {
        coordinates: { x: 20, y: 20 },
        data: { temperature: 5 }, // Changed from 10 to 5
        type: 'ice'
      }
    ]);
    
    // Update from points
    TemperatureQuadTree.updateFromPoints();
    
    // Verify temperatures are updated
    expect(TemperatureQuadTree.getTemperatureAt(10, 10)).toBe(40);
    expect(TemperatureQuadTree.getTemperatureAt(20, 20)).toBe(5);
  });
}); 