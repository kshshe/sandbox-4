import { initCanvas } from "./canvas";
import { initInteractions } from "./interactions";
import { drawPoints } from "./renderer";

// Initialize the canvas
initCanvas();

// Initialize user interactions
initInteractions();

// Start the rendering loop
drawPoints(); 