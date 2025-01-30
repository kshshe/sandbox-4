import React from "react";
import styles from "./reset-button.module.scss";
import { Storage } from "../../../classes/storage";

export const ResetButton: React.FC = () => {
  return (
    <button
      className={styles.floatingButton}
      onClick={(e) => {
        Storage.clear();
        window.location.reload();
      }}
    >
      🔄
    </button>
  );
};
