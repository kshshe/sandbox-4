import React from "react";
import styles from "./settings-panel.module.scss";
import { useControls } from "../../hooks/useControls";

export const SettingsPanel: React.FC = () => {
  const [isOpened, setIsOpened] = React.useState(false);
  const [isDebugMode, setIsDebugMode] = useControls("debugMode");
  const [maxSpeedMode, setMaxSpeedMode] = useControls("maxSpeedMode");
  const [isTemperatureEnabled, setIsTemperatureEnabled] = useControls("isTemperatureEnabled");
  const [baseTemperature, setBaseTemperature] = useControls("baseTemperature");
  const [isSmoothMovementEnabled, setIsSmoothMovementEnabled] = useControls("isSmoothMovementEnabled");

  React.useEffect(() => {
    if (!isOpened) {
      return;
    }
    const handleOutsideClick = () => {
      setIsOpened(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpened]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "d") {
        setIsDebugMode(!isDebugMode);
      }
      if (e.key === "m") {
        setMaxSpeedMode(!maxSpeedMode);
      }
      if (e.key === "t") {
        setIsTemperatureEnabled(!isTemperatureEnabled);
      }
    };
    window.addEventListener("keyup", handleKey);
    return () => window.removeEventListener("keyup", handleKey);
  }, [isDebugMode, maxSpeedMode, isTemperatureEnabled, isSmoothMovementEnabled]);

  const button = (
    <button
      className={styles.floatingButton}
      onClick={(e) => {
        setIsOpened((o) => !o);
        e.stopPropagation();
      }}
    >
      ⚙️
    </button>
  );

  const modal = (
    <div
      className={styles.modal}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div>
        <label>
          <input
            type="checkbox"
            checked={isDebugMode}
            onChange={(e) => setIsDebugMode(e.target.checked)}
          />{" "}
          Debug mode
        </label>
        <label>
          <input
            type="checkbox"
            checked={maxSpeedMode}
            onChange={(e) => setMaxSpeedMode(e.target.checked)}
          />{" "}
          Max speed mode
        </label>
        <label>
          <input
            type="checkbox"
            checked={isTemperatureEnabled}
            onChange={(e) => setIsTemperatureEnabled(e.target.checked)}
          />{" "}
          Temperature processing
        </label>
        <label>
          <input
            type="checkbox"
            checked={isSmoothMovementEnabled}
            onChange={(e) => setIsSmoothMovementEnabled(e.target.checked)}
          />{" "}
          Smooth movement
        </label>
        {isTemperatureEnabled && (
          <p>
            <label>Air temperature: {baseTemperature}°C</label>
            <input
              type="range"
              min={-200}
              max={200}
              value={baseTemperature}
              onChange={(e) => setBaseTemperature(+e.target.value)}
            />
          </p>
        )}
        <p>
          <button
            onClick={() => {
              setIsDebugMode(false);
              setMaxSpeedMode(false);
              setIsTemperatureEnabled(true);
              setBaseTemperature(20);
              setIsSmoothMovementEnabled(true);
              setIsOpened(false);
            }}
          >
            Reset
          </button>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {button}
      {isOpened && modal}
    </>
  );
};
