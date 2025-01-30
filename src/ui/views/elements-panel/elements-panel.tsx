import React from "react";
import { useControls } from "../../hooks/useControls";
import styles from "./elements-panel.module.scss";
import classNames from "classnames";
import { POINT_TYPE_ICON } from "../../../config";

export const ElementsPanel: React.FC = () => {
  const [isClosing, setIsClosing] = React.useState(false);
  const [isOpened, setIsOpened] = React.useState(false);
  const [drawingType, setDrawingType] = useControls("drawingType");

  React.useEffect(() => {
    if (!isOpened) {
      return;
    }
    const closePanel = () => {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setIsOpened(false);
      }, 300);
    };
    window.addEventListener("click", closePanel);
    return () => {
      window.removeEventListener("click", closePanel);
    };
  }, [isOpened]);

  const button = (
    <button
      className={classNames(styles.floatingButton, {
        [styles.isOpened]: isOpened && !isClosing,
      })}
      onClick={(e) => {
        setIsOpened(true);
        e.stopPropagation();
      }}
    >
      {POINT_TYPE_ICON[drawingType]}
    </button>
  );

  const panel = (
    <div
      className={classNames(styles.panelContainer, {
        [styles.isClosing]: isClosing,
      })}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {Object.keys(POINT_TYPE_ICON).map((type) => (
        <button
          key={type}
          className={styles.panelButton}
          onClick={() => {
            setDrawingType(type as any);
            setIsOpened(false);
          }}
        >
          {POINT_TYPE_ICON[type]}
        </button>
      ))}
    </div>
  );

  return <>
    {button}
    {isOpened && panel}
  </>
};
