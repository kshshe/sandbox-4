import React from "react";
import { useControls } from "../../hooks/useControls";
import * as styles from "./elements-panel.module.scss";
import classNames from "classnames";
import { POINTS_COLORS, POINT_TYPE_ICON, POINTS_SHORTCUTS, REVERSED_POINTS_SHORTCUTS } from "../../../config";
import { Tooltip } from 'react-tooltip'
import { POINT_TYPE_HINT } from "../../../constants/pointTypeHint";
import { ELEMENT_GROUPS } from "../../../constants/pointTypeIcon";
import { EPointType } from "../../../types";

const ICONS = {
  [EPointType.Water]: new URL(
    'icons/water.svg',
    import.meta.url
  ).href,
} as const

const Icon = ({ type }: { type: string }) => {
  const icon = POINT_TYPE_ICON[type as keyof typeof POINT_TYPE_ICON]
  if (!icon) {
    return null
  }
  const importedSrc = ICONS[type as keyof typeof ICONS]
  if (
    importedSrc) {
    return <img src={importedSrc} alt={type} className={styles.icon} />
  }
  return <span>{icon}</span>
}

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
      <Icon type={drawingType} />
    </button>
  );

  const renderElementButton = (type: string) => {
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
          boxShadow: `0 0 0 2px rgb(${color.r}, ${color.g}, ${color.b})`,
        }}
        data-tooltip-id={`tooltip-${type}`}
      >
        <Icon type={type} />
        {REVERSED_POINTS_SHORTCUTS[type] && (
          <span className={styles.shortcut}>{REVERSED_POINTS_SHORTCUTS[type]}</span>
        )}
      </button>
    );
  };

  const panel = (
    <div
      className={classNames(styles.panelContainer, {
        [styles.isClosing]: isClosing,
      })}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {ELEMENT_GROUPS.map((group, index) => (
        <div key={group.name} className={classNames(styles.groupContainer, {
          [styles.last]: index === ELEMENT_GROUPS.length - 1,
        })}>
          <h3 className={styles.groupTitle}>{group.name}</h3>
          <div className={styles.elementsRow}>
            {group.elements.map((type) => renderElementButton(type as string))}
          </div>
        </div>
      ))}
      <div>
        {Object.keys(POINT_TYPE_ICON).map((type) => (
          <Tooltip
            key={type}
            id={`tooltip-${type}`}
            content={POINT_TYPE_HINT[type] ?? type}
            place="top"
          />
        ))}
      </div>
    </div>
  );

  return <>
    {button}
    {isOpened && panel}
  </>
};
