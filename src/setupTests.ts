// Add any global test setup here
import '@testing-library/jest-dom';

// Mock for requestAnimationFrame
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = (callback) => {
    setTimeout(callback, 0);
    return 0;
  };
} 