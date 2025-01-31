import React from "react";
import styles from "./metrics.module.scss";
import { Stats } from "../../../classes/stats";
import classNames from "classnames";
import { Points } from "../../../classes/points";

const ProcessedPointsMeter: React.FC = () => {
  const [pointsTotal, setPointsTotal] = React.useState(0);
  const [pointsProcessed, setPointsProcessed] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const points = Points.getActivePoints();
      setPointsTotal(points.length);
      const active = points.filter((point) => !Points.isUnused(point));
      setPointsProcessed(active.length);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const processedPercent = (pointsProcessed / pointsTotal) * 100;
  return (
    <div className={styles.processedPointsMeter}>
      <svg
        className={styles.processedPointsMeterChart}
        viewBox="0 0 40 40"
        width="40"
        height="40"
      >
        <circle cx="20" cy="20" r="15" fill="#ddd" />
        <path
          d={`
            M 20,20
            L 20,5
            A 15,15 0 ${processedPercent > 50 ? 1 : 0} 1 ${
            20 + 15 * Math.sin((processedPercent * Math.PI) / 50)
          },${20 - 15 * Math.cos((processedPercent * Math.PI) / 50)}
            Z
          `}
          fill={`rgba(${[
            Math.floor(processedPercent * 2.55),
            Math.floor(255 - processedPercent * 2.55),
            0,
          ].join(",")})`}
        />
      </svg>
      <div className={styles.processedPointsMeterText}>
        Processing <strong>{Math.round(processedPercent)}%</strong> of points
        <br />
        {pointsProcessed} of {pointsTotal}
      </div>
    </div>
  );
};

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
      <ProcessedPointsMeter />
    </div>
  );
};
