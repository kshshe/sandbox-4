import React from "react";
import styles from "./metrics.module.scss";
import { Stats } from "../../../classes/stats";
import classNames from "classnames";

const LoadMeter: React.FC = () => {
  const [load, setLoad] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLoad(Stats.data.load * 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const limitedLoad = Math.min(100, load);
  const color = [
    Math.floor(limitedLoad * 2.55),
    Math.floor(255 - limitedLoad * 2.55),
    0,
  ];

  return (
    <div className={styles.loadMeter}>
      <div
        className={styles.loadMeterBar}
        style={{
          width: `${load}%`,
          backgroundColor: `rgb(${color.join(",")})`,
        }}
      ></div>
    </div>
  );
};

export const Metrics: React.FC = () => {
  const [fpsHistory, setFpsHistory] = React.useState<number[]>(() =>
    new Array(30).fill(0)
  );
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFpsHistory((prev) => [...prev, Stats.data.fps].slice(-30));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const metricsRef = React.useRef<HTMLDivElement>(null);
  const [shouldBeTransparent, setShouldBeTransparent] = React.useState(false);
  React.useEffect(() => {
    const onMouseMove = (e) => {
      if (!metricsRef.current) return;
      const { top, left, width, height } =
        metricsRef.current.getBoundingClientRect();
      setShouldBeTransparent(
        e.clientX >= left &&
          e.clientX <= left + width &&
          e.clientY >= top &&
          e.clientY <= top + height
      );
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, []);
  const lastFPS = Math.round(fpsHistory[fpsHistory.length - 1]);
  return (
    <div
      className={classNames(styles.metrics, {
        [styles.transparent]: shouldBeTransparent,
      })}
      ref={metricsRef}
    >
      <div className={styles.lastFPS}>{lastFPS} FPS</div>
      <div className={styles.fps}>
        {fpsHistory.map((fps, index) => {
          const percent = (fps / 60) * 100;
          const color = [
            Math.floor(255 - percent * 2.55),
            Math.floor(percent * 2.55),
            0,
          ];
          return (
            <div
              className={styles.fpsBar}
              key={index}
              style={{
                height: `${percent}%`,
                backgroundColor: `rgb(${color.join(",")})`,
              }}
            ></div>
          );
        })}
      </div>
      <LoadMeter />
    </div>
  );
};
