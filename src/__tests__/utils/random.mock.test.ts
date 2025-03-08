import { random, __resetMock, __getMockState } from '../../__mocks__/utils/random';

jest.mock('../../utils/random');

describe('random utility mock', () => {
  beforeEach(() => {
    // Reset the mock state before each test
    __resetMock();
  });

  test('should return values from the pre-generated array in sequence', () => {
    const { mockRandomValues } = __getMockState();
    
    // Call random for each value in the mock array
    const results: number[] = [];
    for (let i = 0; i < mockRandomValues.length; i++) {
      results.push(random());
    }
    
    // Verify we got the expected values in sequence
    expect(results).toEqual(mockRandomValues);
  });

  test('should cycle through the array when reaching the end', () => {
    const { mockRandomValues } = __getMockState();
    
    // Call random for more times than the array length
    const results: number[] = [];
    for (let i = 0; i < mockRandomValues.length * 2; i++) {
      results.push(random());
    }
    
    // Verify the values cycle
    expect(results.slice(0, mockRandomValues.length)).toEqual(mockRandomValues);
    expect(results.slice(mockRandomValues.length)).toEqual(mockRandomValues);
  });

  test('should track call count correctly', () => {
    // Call random multiple times
    const callTimes = 5;
    for (let i = 0; i < callTimes; i++) {
      random();
    }
    
    // Verify the call count
    const { callCount } = __getMockState();
    expect(callCount).toBe(callTimes);
  });

  test('should reset state correctly', () => {
    // Call random a few times
    random();
    random();
    
    // Reset the mock
    __resetMock();
    
    // Verify state is reset
    const { callCount, currentIndex } = __getMockState();
    expect(callCount).toBe(0);
    expect(currentIndex).toBe(0);
    
    // Verify next call starts from beginning
    expect(random()).toBe(__getMockState().mockRandomValues[0]);
  });
}); 