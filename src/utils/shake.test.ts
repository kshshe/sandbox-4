import { shake } from './shake';
import { random, __resetMock, __getMockState } from '../__mocks__/utils/random';

// Mock the random module
jest.mock('./random', () => ({
  random: jest.fn(() => random()),
}));

describe('shake', () => {
  beforeEach(() => {
    // Reset the mock before each test
    __resetMock();
  });

  // Test to verify the mock is working correctly
  it('should use the mocked random function', () => {
    // Act
    const randomValue = random();
    
    // Assert - first value in the mock array
    expect(randomValue).toBe(0.5702766495539577);
    expect(__getMockState().callCount).toBe(1);
  });

  it('should not break the original array', () => {
    const array = [1, 2, 3, 4, 5];
    const result = shake(array);
    expect(result).not.toEqual(array);
  });

  it('should produce a random array with the same items', () => {
    const array = [1, 2, 3, 4, 5];
    const result = shake(array);
    expect(result.length).toBe(array.length);
    expect(result).toEqual(expect.arrayContaining(array));
  });

  it('should handle empty arrays', () => {
    const array: number[] = [];
    const result = shake(array);
    expect(result).toEqual([]);
    expect(result).not.toBe(array); // Should still return a new array
    expect(__getMockState().callCount).toBe(0); // No random calls for empty array
  });

  it('should handle arrays with a single element', () => {
    const array = [42];
    const result = shake(array);
    expect(result).toEqual([42]);
    expect(result).not.toBe(array); // Should still return a new array
    expect(__getMockState().callCount).toBe(0); // No random calls for single element
  });

  it('should produce deterministic results with mocked random', () => {
    // With our mock sequence, we can predict the exact shuffle
    const array = [1, 2, 3, 4];
    const result = shake(array);
    
    // Based on the mock random values, we can calculate the expected result
    // First iteration: i=3, j=Math.floor(0.5702766495539577 * 4) = 2, swap 3<->2
    // Second iteration: i=2, j=Math.floor(0.9486430798132726 * 3) = 2, swap 2<->2 (no change)
    // Third iteration: i=1, j=Math.floor(0.5007903441221031 * 2) = 1, swap 1<->1 (no change)
    const expectedResult = [1, 2, 4, 3];
    
    expect(result).toEqual(expectedResult);
    expect(__getMockState().callCount).toBe(3); // 3 random calls for 4 elements
  });

  it('should work with arrays of different data types', () => {
    const array = ['a', 'b', 'c'];
    const result = shake(array);
    expect(result.length).toBe(array.length);
    expect(result).toEqual(expect.arrayContaining(array));
    expect(typeof result[0]).toBe('string');
  });

  it('should make the correct number of random calls', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    shake(array);
    // For n elements, we should make n-1 random calls
    expect(__getMockState().callCount).toBe(array.length - 1);
  });

  it('should work with arrays of objects', () => {
    const array = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' }
    ];
    const result = shake(array);
    
    // Check that the result has the same objects (by reference)
    expect(result.length).toBe(array.length);
    array.forEach(item => {
      expect(result).toContain(item);
    });
    
    // Verify objects are the same references, not copies
    const originalObject = array[0];
    const resultObject = result.find(item => item.id === originalObject.id);
    expect(resultObject).toBe(originalObject);
  });
}); 