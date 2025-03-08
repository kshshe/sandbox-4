import { random, __fromBufferCount, __fromRandomCount, __bufferSize } from '../../utils/random';

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

  test('should increment fromRandomCount when buffer is empty', () => {
    // Get initial counter value
    const initialFromRandom = __fromRandomCount();
    
    // Call random (should use Math.random directly if buffer is empty)
    random();
    
    // Check that fromRandomCount increased
    expect(__fromRandomCount()).toBeGreaterThan(initialFromRandom);
  });

  test('should increment fromBufferCount when using buffer', () => {
    // Mock the buffer with a non-empty array
    jest.spyOn(Array.prototype, 'pop').mockImplementationOnce(() => 0.5);
    
    // Get initial counter value
    const initialFromBuffer = __fromBufferCount();
    
    // Call random (should use the buffer)
    const result = random();
    
    // Check that fromBufferCount increased
    expect(__fromBufferCount()).toBeGreaterThan(initialFromBuffer);
    
    // Verify the result is from the buffer
    expect(result).toBe(0.5);
    
    // Restore the original implementation
    jest.restoreAllMocks();
  });
}); 