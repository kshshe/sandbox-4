import React from "react";
import styles from "./settings-panel.module.scss";
import { useControls } from "../../hooks/useControls";

export const SettingsPanel: React.FC = () => {
  const [isOpened, setIsOpened] = React.useState(false);
  const [isDebugMode, setIsDebugMode] = useControls("debugMode");
  const [baseTemperature, setBaseTemperature] = useControls("baseTemperature");

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
      if (e.key !== "d") {
        return;
      }
      setIsDebugMode(!isDebugMode);
    };
    window.addEventListener("keyup", handleKey);
    return () => window.removeEventListener("keyup", handleKey);
  }, [isDebugMode]);

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
        <p>
          <label>Debug mode</label>
          <label>
            <input
              type="checkbox"
              checked={isDebugMode}
              onChange={(e) => setIsDebugMode(e.target.checked)}
            />{" "}
            Enabled
          </label>
        </p>
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
        <p>
          <button
            onClick={() => {
              setIsDebugMode(false);
              setBaseTemperature(20);
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
