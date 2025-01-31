import React from "react";
import styles from "./settings-panel.module.scss";
import { useControls } from "../../hooks/useControls";

export const SettingsPanel: React.FC = () => {
  const [isOpened, setIsOpened] = React.useState(false);
  const [isDebugMode, setIsDebugMode] = useControls("debugMode");

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
      setIsDebugMode(!isDebugMode);
    };
    window.addEventListener("keyup", handleKey);
    return () => window.removeEventListener("keyup", handleKey);
  }, [isDebugMode]);

  const button = (
    <button
      className={styles.floatingButton}
      onClick={(e) => {
        setIsOpened(o => !o);
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
          />
          <span>Debug mode</span>
        </label>
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
