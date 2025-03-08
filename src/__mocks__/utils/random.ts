// Pre-generated array of random numbers
const mockRandomValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
let currentIndex = 0;

// Stats for testing purposes
let callCount = 0;

export function random() {
  callCount++;
  
  // Cycle through the array
  const value = mockRandomValues[currentIndex];
  currentIndex = (currentIndex + 1) % mockRandomValues.length;
  
  return value;
}

// Reset function for testing
export function __resetMock() {
  currentIndex = 0;
  callCount = 0;
}

// For testing purposes
export function __getMockState() {
  return {
    currentIndex,
    callCount,
    mockRandomValues: [...mockRandomValues]
  };
} 