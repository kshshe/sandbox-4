import React from "react";
import * as styles from "./control-buttons.module.scss";
import { Storage } from "../../../classes/storage";
import { useControls } from "../../hooks/useControls";

export const ControlButtons: React.FC = () => {
  const [brushSize, setBrushSize] = useControls('brushSize');

  React.useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        setBrushSize(Math.min(5, brushSize + 1));
      } else if (e.key === "ArrowDown") {
        setBrushSize(Math.max(1, brushSize - 1));
      }
    };
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [brushSize, setBrushSize]);

  return (
    <div className={styles.controlButtons}>
      <button
        className={styles.floatingButton}
        onClick={(e) => {
          Storage.clear();
          window.location.reload();
        }}
      >
        🔄
      </button>

      <button
        className={styles.floatingButton}
        onClick={(e) => {
          setBrushSize(brushSize === 5 ? 1 : brushSize + 1);
        }}
      >
        <span
          style={{
            fontSize: `${brushSize * 8}px`,
          }}
        >🖌️</span>
      </button>
    </div>
  );
};
