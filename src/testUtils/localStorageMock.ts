/**
 * Mock implementation of localStorage for testing
 * 
 * Usage example:
 * ```typescript
 * import { localStorageMock } from '../testUtils/localStorageMock';
 * 
 * describe('YourTest', () => {
 *   beforeEach(() => {
 *     // Clear localStorage and reset mocks before each test
 *     localStorageMock.clear();
 *     jest.clearAllMocks();
 *   });
 * 
 *   it('should store and retrieve data', () => {
 *     // Setup test data
 *     localStorageMock.setItem('testKey', JSON.stringify({ value: 'test' }));
 *     
 *     // Verify data was stored
 *     expect(localStorageMock.getItem('testKey')).toBe(JSON.stringify({ value: 'test' }));
 *     expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
 *     
 *     // Test removeItem
 *     localStorageMock.removeItem('testKey');
 *     expect(localStorageMock.getItem('testKey')).toBeNull();
 *   });
 * });
 */
export const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    getAll: () => store,
  };
})();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
}); 