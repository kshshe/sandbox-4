import { Controls } from './controls';
import { Storage } from './storage';
import { EPointType } from '../types';
import { localStorageMock } from '../testUtils/localStorageMock';

// Mock the Storage class
jest.mock('./storage', () => ({
  Storage: {
    get: jest.fn((key, fallback) => fallback),
    set: jest.fn(),
  },
}));

describe('Controls', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Reset Controls class state
    Controls['state'] = {
      debugMode: false,
      drawingType: EPointType.Water,
      baseTemperature: 20,
      brushSize: 2,
      maxSpeedMode: false,
      isTemperatureEnabled: false,
    };
    Controls['subscribers'] = [];
  });

  describe('state initialization', () => {
    it('should initialize state with values from Storage', () => {
      // We need to verify that Storage.get was called during Controls class initialization
      // Since the class is already imported and initialized, we can check if the mocked Storage.get
      // was called with the expected parameters during the initial import
      
      // Re-initialize the Controls state to trigger Storage.get calls
      const originalState = Controls.state;
      
      // Create a new Controls instance to trigger initialization
      jest.isolateModules(() => {
        // This will re-execute the module code, including the static initialization
        const { Controls } = require('./controls');
      });
      
      // Verify Storage.get was called for each state property
      expect(Storage.get).toHaveBeenCalledWith('Controls.debugMode', false);
      expect(Storage.get).toHaveBeenCalledWith('Controls.drawingType', EPointType.Water);
      expect(Storage.get).toHaveBeenCalledWith('Controls.baseTemperature', 20);
      expect(Storage.get).toHaveBeenCalledWith('Controls.brushSize', 2);
    });
  });

  describe('subscription', () => {
    it('should add subscriber and return unsubscribe function', () => {
      const callback = jest.fn();
      
      // Subscribe to state changes
      const unsubscribe = Controls.subscribe('debugMode', callback);
      
      // Verify subscriber was added
      expect(Controls['subscribers']).toHaveLength(1);
      expect(Controls['subscribers'][0]).toEqual({
        key: 'debugMode',
        callback
      });
      
      // Call unsubscribe function
      unsubscribe();
      
      // Verify subscriber was removed
      expect(Controls['subscribers']).toHaveLength(0);
    });

    it('should call subscribers when state changes', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      // Subscribe to different state properties
      Controls.subscribe('debugMode', callback1);
      Controls.subscribe('brushSize', callback2);
      
      // Change debugMode state
      Controls.setDebugMode(true);
      
      // Verify only debugMode subscriber was called
      expect(callback1).toHaveBeenCalledWith(Controls.state);
      expect(callback2).not.toHaveBeenCalled();
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Change brushSize state
      Controls.setBrushSize(5);
      
      // Verify only brushSize subscriber was called
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(Controls.state);
    });
  });

  describe('setState', () => {
    it('should update state and call subscribers', () => {
      // Spy on callSubscribers method
      const callSubscribersSpy = jest.spyOn(Controls, 'callSubscribers');
      
      // Set state
      Controls.setState('debugMode', true);
      
      // Verify state was updated
      expect(Controls.state.debugMode).toBe(true);
      expect(Storage.set).toHaveBeenCalledWith('Controls.debugMode', true);
      expect(callSubscribersSpy).toHaveBeenCalledWith('debugMode');
      
      callSubscribersSpy.mockRestore();
    });

    it('should not update state or call subscribers if value is the same', () => {
      // Set initial state
      Controls.state.debugMode = false;
      
      // Spy on callSubscribers method
      const callSubscribersSpy = jest.spyOn(Controls, 'callSubscribers');
      
      // Set state to same value
      Controls.setState('debugMode', false);
      
      // Verify state was not updated and subscribers were not called
      expect(Storage.set).not.toHaveBeenCalled();
      expect(callSubscribersSpy).not.toHaveBeenCalled();
      
      callSubscribersSpy.mockRestore();
    });
  });

  describe('getter and setter methods', () => {
    it('should get and set brushSize', () => {
      // Test getter
      expect(Controls.getBrushSize()).toBe(2);
      
      // Spy on setState method
      const setStateSpy = jest.spyOn(Controls, 'setState');
      
      // Test setter
      Controls.setBrushSize(5);
      
      // Verify setState was called with correct parameters
      expect(setStateSpy).toHaveBeenCalledWith('brushSize', 5);
      
      setStateSpy.mockRestore();
    });

    it('should get and set drawingType', () => {
      // Test getter
      expect(Controls.getDrawingType()).toBe(EPointType.Water);
      
      // Spy on setState method
      const setStateSpy = jest.spyOn(Controls, 'setState');
      
      // Test setter
      Controls.setDrawingType(EPointType.Fire);
      
      // Verify setState was called with correct parameters
      expect(setStateSpy).toHaveBeenCalledWith('drawingType', EPointType.Fire);
      
      setStateSpy.mockRestore();
    });

    it('should get and set debugMode', () => {
      // Test getter
      expect(Controls.getDebugMode()).toBe(false);
      
      // Spy on setState method
      const setStateSpy = jest.spyOn(Controls, 'setState');
      
      // Test setter
      Controls.setDebugMode(true);
      
      // Verify setState was called with correct parameters
      expect(setStateSpy).toHaveBeenCalledWith('debugMode', true);
      
      setStateSpy.mockRestore();
    });

    it('should get and set baseTemperature', () => {
      // Test getter
      expect(Controls.getBaseTemperature()).toBe(20);
      
      // Spy on setState method
      const setStateSpy = jest.spyOn(Controls, 'setState');
      
      // Test setter
      Controls.setBaseTemperature(25);
      
      // Verify setState was called with correct parameters
      expect(setStateSpy).toHaveBeenCalledWith('baseTemperature', 25);
      
      setStateSpy.mockRestore();
    });
  });
}); 