import { Storage } from './storage';
import { localStorageMock } from '../testUtils/localStorageMock';

describe('Storage', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Reset Storage class state
    Storage['data'] = {};
    Storage['isLoaded'] = false;
    
    // Clear any intervals that might have been set
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  describe('load', () => {
    it('should load data from localStorage', () => {
      // Setup localStorage with test data
      const testData = { testKey: 'testValue' };
      localStorageMock.setItem('storage', JSON.stringify(testData));
      
      // Call load method
      Storage.load();
      
      // Verify data was loaded
      expect(Storage['data']).toEqual(testData);
      expect(Storage['isLoaded']).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('storage');
    });

    it('should handle empty localStorage', () => {
      // Ensure localStorage returns null
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      // Call load method
      Storage.load();
      
      // Verify default empty object is used
      expect(Storage['data']).toEqual({});
      expect(Storage['isLoaded']).toBe(true);
    });

    it('should handle JSON parse errors', () => {
      // Setup invalid JSON in localStorage
      localStorageMock.getItem.mockReturnValueOnce('invalid json');
      
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Call load method
      Storage.load();
      
      // Verify error was logged and default empty object is used
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(Storage['data']).toEqual({});
      expect(Storage['isLoaded']).toBe(true);
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('should not reload data if already loaded', () => {
      // Setup initial data
      Storage['data'] = { initialKey: 'initialValue' };
      Storage['isLoaded'] = true;
      
      // Setup different data in localStorage
      localStorageMock.setItem('storage', JSON.stringify({ newKey: 'newValue' }));
      
      // Call load method
      Storage.load();
      
      // Verify data was not reloaded
      expect(Storage['data']).toEqual({ initialKey: 'initialValue' });
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });

    it('should set up interval for auto-saving', () => {
      jest.useFakeTimers();
      const saveSpy = jest.spyOn(Storage as any, 'save');
      
      Storage.load();
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      expect(saveSpy).toHaveBeenCalled();
      saveSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('should clear data and save', () => {
      // Setup initial data
      Storage['data'] = { testKey: 'testValue' };
      
      // Spy on save method
      const saveSpy = jest.spyOn(Storage as any, 'save');
      
      // Call clear method
      Storage.clear();
      
      // Verify data was cleared and save was called
      expect(Storage['data']).toEqual({});
      expect(saveSpy).toHaveBeenCalled();
      
      saveSpy.mockRestore();
    });
  });

  describe('save', () => {
    it('should save data to localStorage', () => {
      // Setup test data
      const testData = { testKey: 'testValue' };
      Storage['data'] = testData;
      
      // Call save method
      (Storage as any).save();
      
      // Verify data was saved to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('storage', JSON.stringify(testData));
    });

    it('should handle localStorage errors', () => {
      // Setup localStorage to throw error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });
      
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Call save method
      (Storage as any).save();
      
      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('set', () => {
    it('should set value in data object', () => {
      // Call set method
      Storage.set('testKey', 'testValue');
      
      // Verify value was set
      expect(Storage['data']).toEqual({ testKey: 'testValue' });
    });

    it('should override existing value', () => {
      // Setup initial data
      Storage['data'] = { testKey: 'initialValue' };
      
      // Call set method
      Storage.set('testKey', 'newValue');
      
      // Verify value was updated
      expect(Storage['data']).toEqual({ testKey: 'newValue' });
    });
  });

  describe('get', () => {
    it('should load data if not loaded', () => {
      // Spy on load method
      const loadSpy = jest.spyOn(Storage, 'load');
      
      // Call get method
      Storage.get('testKey', null);
      
      // Verify load was called
      expect(loadSpy).toHaveBeenCalled();
      
      loadSpy.mockRestore();
    });

    it('should return value from data object', () => {
      // Setup test data
      Storage['data'] = { testKey: 'testValue' };
      Storage['isLoaded'] = true;
      
      // Call get method
      const result = Storage.get('testKey', null);
      
      // Verify correct value was returned
      expect(result).toBe('testValue');
    });

    it('should return fallback value if key not found', () => {
      // Setup empty data
      Storage['data'] = {};
      Storage['isLoaded'] = true;
      
      // Call get method with fallback
      const result = Storage.get('nonExistentKey', 'fallbackValue');
      
      // Verify fallback value was returned
      expect(result).toBe('fallbackValue');
    });

    it('should return null if key not found and no fallback provided', () => {
      // Setup empty data
      Storage['data'] = {};
      Storage['isLoaded'] = true;
      
      // Call get method without fallback
      const result = Storage.get('nonExistentKey');
      
      // Verify null was returned
      expect(result).toBe(null);
    });
  });
}); 