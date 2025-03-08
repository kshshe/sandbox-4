import { Stats } from './stats';

describe('Stats', () => {
  beforeEach(() => {
    // Reset Stats data before each test
    Stats.data.fps = 0;
    Stats.data.averageSpeed = 0;
    Stats.data.load = 0;
  });

  describe('setLoad', () => {
    it('should set the load value correctly', () => {
      // Arrange
      const testLoad = 75;
      
      // Act
      Stats.setLoad(testLoad);
      
      // Assert
      expect(Stats.data.load).toBe(testLoad);
    });
  });

  describe('setFps', () => {
    it('should set the fps value correctly', () => {
      // Arrange
      const testFps = 60;
      
      // Act
      Stats.setFps(testFps);
      
      // Assert
      expect(Stats.data.fps).toBe(testFps);
    });
  });

  describe('setAverageSpeed', () => {
    it('should set the average speed value correctly', () => {
      // Arrange
      const testSpeed = 120;
      
      // Act
      Stats.setAverageSpeed(testSpeed);
      
      // Assert
      expect(Stats.data.averageSpeed).toBe(testSpeed);
    });
  });

  describe('data object', () => {
    it('should have the correct initial values', () => {
      // Assert
      expect(Stats.data.fps).toBe(0);
      expect(Stats.data.averageSpeed).toBe(0);
      expect(Stats.data.load).toBe(0);
    });
  });
}); 