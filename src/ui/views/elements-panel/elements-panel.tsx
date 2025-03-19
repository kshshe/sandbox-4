import React from "react";
import { useControls } from "../../hooks/useControls";
import styles from "./elements-panel.module.scss";
import classNames from "classnames";
import { POINTS_COLORS, POINT_TYPE_ICON, POINTS_SHORTCUTS, REVERSED_POINTS_SHORTCUTS } from "../../../config";
import { Tooltip } from 'react-tooltip'
import { POINT_TYPE_HINT } from "../../../constants/pointTypeHint";
import { POINT_ORDER } from "../../../constants/pointTypeIcon";

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
        setIsOpened(false);
        setIsClosing(false);
      }, 300);
    };
    window.addEventListener("click", closePanel);
    return () => {
      window.removeEventListener("click", closePanel);
    };
  }, [isOpened]);

  React.useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.key === " ") {
        if (!isOpened) {
          setIsOpened(true);
        } else {
          setIsClosing(true);
          setTimeout(() => {
            setIsOpened(false);
            setIsClosing(false);
          }, 300);
        }
      }

      if (POINTS_SHORTCUTS[e.key]) {
        setDrawingType(POINTS_SHORTCUTS[e.key]);
        setIsOpened(false);
      }
    };
    window.addEventListener("keyup", handleSpace);
    return () => {
      window.removeEventListener("keyup", handleSpace);
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
      {POINT_ORDER.map((type, index) => {
        if (type === 'divider') {
          return <div key={type + index} className={styles.divider} />
        }
        const color = POINTS_COLORS[type] ?? { r: 0, g: 0, b: 0 }
        return (
          <button
            key={type}
            className={styles.panelButton}
            onClick={() => {
              setDrawingType(type as any);
              setIsOpened(false);
            }}
            style={{
              // inset shadow by POINTS_COLORS
              boxShadow: `0 0 0 2px rgb(${color.r}, ${color.g}, ${color.b})`,
            }}
            data-tooltip-id={`tooltip-${type}`}
          >
            {POINT_TYPE_ICON[type]}
            {REVERSED_POINTS_SHORTCUTS[type] && (
              <span className={styles.shortcut}>{REVERSED_POINTS_SHORTCUTS[type]}</span>
            )}
          </button>
        )
      })}
      {Object.keys(POINT_TYPE_ICON).map((type) => (
        <Tooltip
          key={type}
          id={`tooltip-${type}`}
          content={POINT_TYPE_HINT[type] ?? type}
          place="top"
        />
      ))}
    </div>
  );

  return <>
    {button}
    {isOpened && panel}
  </>
};
