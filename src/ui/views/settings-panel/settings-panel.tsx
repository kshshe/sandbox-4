import React from "react";
import styles from "./settings-panel.module.scss";
import classNames from "classnames";
import { useControls } from "../../hooks/useControls";

export const SettingsPanel: React.FC = () => {
  const [isOpened, setIsOpened] = React.useState(false);

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

  const button = (
    <button
      className={classNames(styles.floatingButton, {
        [styles.isOpened]: isOpened,
      })}
      onClick={(e) => {
        setIsOpened(true);
        e.stopPropagation();
      }}
    >
      ⚙️
    </button>
  );

  const [isDebugMode, setIsDebugMode] = useControls("debugMode");

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
