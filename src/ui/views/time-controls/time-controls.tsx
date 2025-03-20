import React from "react";
import { useControls } from "../../hooks/useControls";
import * as styles from "./time-controls.module.scss";
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