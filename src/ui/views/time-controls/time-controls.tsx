import React from "react";
import { useControls } from "../../hooks/useControls";
import styles from "./time-controls.module.scss";
import { processStep } from "../../../forces";

export const TimeControls: React.FC = () => {
  const [isPaused, setIsPaused] = useControls('isPaused');
  const [simulationSpeed, setSimulationSpeed] = useControls('simulationSpeed');

  // Predefined speed options
  const speedOptions = [
    { value: 0.25, label: "0.25x" },
    { value: 0.5, label: "0.5x" },
    { value: 1, label: "1x" },
    { value: 2, label: "2x" },
    { value: 4, label: "4x" }
  ];

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      // Space to toggle pause
      if (e.key === "p" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setIsPaused(!isPaused);
      }
      
      // Number keys 1-5 for speed presets
      if (e.key >= "1" && e.key <= "5" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const index = parseInt(e.key) - 1;
        if (index >= 0 && index < speedOptions.length) {
          setSimulationSpeed(speedOptions[index].value);
        }
      }
      
      // Right arrow key for step when paused
      if (e.key === "ArrowRight" && isPaused) {
        processStep();
      }
    };
    
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isPaused, setIsPaused, setSimulationSpeed, speedOptions]);

  return (
    <div className={styles.timeControls}>
      <div className={styles.controlsRow}>
        <button
          className={`${styles.controlButton} ${isPaused ? styles.active : ''}`}
          onClick={() => setIsPaused(!isPaused)}
          title="Pause/Resume (Space)"
        >
          {isPaused ? "▶️" : "⏸️"}
        </button>
        
        {isPaused && (
          <button
            className={styles.controlButton}
            onClick={processStep}
            title="Step Forward (Right Arrow)"
          >
            ⏭️
          </button>
        )}
      </div>
      
      <div className={styles.speedControls}>
        {speedOptions.map((option, index) => (
          <button
            key={option.value}
            className={`${styles.speedButton} ${Math.abs(simulationSpeed - option.value) < 0.01 ? styles.active : ''}`}
            onClick={() => setSimulationSpeed(option.value)}
            title={`Set speed to ${option.label} (${index + 1})`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}; 