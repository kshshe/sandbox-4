// Global TypeScript declarations

// Extend NodeJS namespace for timeout types
declare namespace NodeJS {
  interface Timeout {
    _destroyed?: boolean;
  }
}

// Extend Window interface for test mocks
interface Window {
  localStorage: Storage;
} 