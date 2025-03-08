import { Storage as OriginalStorage } from '../../classes/storage';

// Create a mock class that extends the original Storage class
export class Storage {
  private static data: Record<string, any> = {};
  private static isLoaded: boolean = false;
  private static saveInterval: NodeJS.Timeout | null = null;

  // Mock implementation of load
  public static load() {
    if (this.isLoaded) {
      return;
    }

    this.isLoaded = true;

    // Don't actually set up an interval in tests
    if (!this.saveInterval) {
      this.saveInterval = setInterval(() => {
        // No-op in mock
      }, 1000) as unknown as NodeJS.Timeout;
    }
  }

  // Mock implementation of clear
  public static clear() {
    this.data = {};
  }

  // Mock implementation of set
  public static set<T>(key: string, value: T) {
    this.data[key] = value;
  }

  // Mock implementation of get
  public static get<T>(key: string, fallback: T | null = null): T {
    this.load();
    return this.data[key] ?? fallback;
  }

  // Helper methods for testing
  public static __getData() {
    return this.data;
  }

  public static __setData(data: Record<string, any>) {
    this.data = data;
  }

  public static __getIsLoaded() {
    return this.isLoaded;
  }

  public static __setIsLoaded(isLoaded: boolean) {
    this.isLoaded = isLoaded;
  }

  public static __reset() {
    this.data = {};
    this.isLoaded = false;
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
}

// Export the original Storage class as well for reference
export { OriginalStorage }; 