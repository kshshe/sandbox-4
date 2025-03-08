import { Storage } from '../../__mocks__/classes/storage';

// Mock the Storage module
jest.mock('../../classes/storage', () => ({
  Storage: jest.fn(() => Storage),
}));

describe('Example of using Storage mock', () => {
  beforeEach(() => {
    // Reset the mock before each test
    Storage.__reset();
  });

  it('should use mocked Storage.get', () => {
    // Setup test data in the mock
    Storage.__setData({ testKey: 'testValue' });
    Storage.__setIsLoaded(true);
    
    // Use the mocked Storage.get method
    const result = Storage.get('testKey', 'fallback');
    
    // Verify the result
    expect(result).toBe('testValue');
  });

  it('should use mocked Storage.set', () => {
    // Use the mocked Storage.set method
    Storage.set('newKey', 'newValue');
    
    // Verify the data was set in the mock
    expect(Storage.__getData()).toEqual({ newKey: 'newValue' });
  });

  it('should use mocked Storage.clear', () => {
    // Setup initial data
    Storage.__setData({ testKey: 'testValue' });
    
    // Use the mocked Storage.clear method
    Storage.clear();
    
    // Verify the data was cleared
    expect(Storage.__getData()).toEqual({});
  });

  it('should use mocked Storage.load', () => {
    // Verify initial state
    expect(Storage.__getIsLoaded()).toBe(false);
    
    // Use the mocked Storage.load method
    Storage.load();
    
    // Verify isLoaded was set to true
    expect(Storage.__getIsLoaded()).toBe(true);
  });
}); 