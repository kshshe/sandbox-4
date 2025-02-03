import React from "react";
import styles from "./metrics.module.scss";
import { Stats } from "../../../classes/stats";
import classNames from "classnames";
import { Points } from "../../../classes/points";
import { Bounds } from "../../../classes/bounds";
import { TemperatureGrid } from "../../../classes/temperatureGrid";

const TemperatureMap: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const bounds = Bounds.getBounds();
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    let frameId: number | null = null;
    const onFrame = () => {
      let maxTemp = 1;
      let minTemp = -1;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const temperature = TemperatureGrid.getTemperatureOnPoint(
            x + bounds.left,
            y + bounds.top
          );
          maxTemp = Math.max(maxTemp, temperature);
          minTemp = Math.min(minTemp, temperature);
        }
      }

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      if (maxTemp === minTemp) {
        frameId = window.requestAnimationFrame(onFrame);
        return;
      }

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const temperature = TemperatureGrid.getTemperatureOnPoint(
            x + bounds.left,
            y + bounds.top
          );
          ctx.fillStyle = temperature > 0 ? `rgba(255, 0, 0, ${Math.min(1, temperature / Math.abs(maxTemp))})` : `rgba(0, 0, 255, ${Math.min(1, -temperature / Math.abs(minTemp))})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      frameId = window.requestAnimationFrame(onFrame);
    };
    frameId = window.requestAnimationFrame(onFrame);
    return () => window.cancelAnimationFrame(frameId as number);
  }, [canvasRef.current, width, height]);

  return (
    <canvas
      className={styles.temperatureMap}
      ref={canvasRef}
      width={width}
      height={height}
    />
  );
};

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

  if (pointsTotal === 0) {
    return null;
  }

  const processedPercent = Math.min(
    99.99,
    (pointsProcessed / pointsTotal) * 100
  );
  return (
    <div className={styles.processedPointsMeter}>
      <div className={styles.processedPointsMeterText}>Processing:</div>
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
        <strong>{Math.round(processedPercent)}%</strong> of points
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
      <TemperatureMap />
      <ProcessedPointsMeter />
      <div className={styles.hint}>
        <strong>d</strong> - debug mode
        <br />
        <a href="https://t.me/kshshe" target="_blank" rel="noreferrer">
          developer
        </a>
        ,{" "}
        <a
          href="https://github.com/kshshe/sandbox-4"
          target="_blank"
          rel="noreferrer"
        >
          code
        </a>
      </div>
    </div>
  );
};
