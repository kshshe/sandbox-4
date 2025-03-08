import { random } from '../../utils/random';

describe('random utility', () => {
  test('should return a number between 0 and 1', () => {
    const result = random();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });

  test('should return different values on subsequent calls', () => {
    const results = new Set();
    for (let i = 0; i < 10; i++) {
      results.add(random());
    }
    expect(results.size).toBeGreaterThan(1);
  });

  test('should use buffer when available', () => {
    // This test relies on the implementation details
    // We know the buffer is populated in the background
    // So after waiting a bit, the buffer should have values
    jest.useFakeTimers();
    
    // Force buffer to be populated
    jest.advanceTimersByTime(100);
    
    // Call random multiple times to ensure we're using the buffer
    for (let i = 0; i < 100; i++) {
      random();
    }
    
    // Reset timers
    jest.useRealTimers();
    
    // The function should still work after using the buffer
    const result = random();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });
}); 