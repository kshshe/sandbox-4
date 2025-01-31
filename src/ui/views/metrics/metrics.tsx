import React from 'react';
import styles from './metrics.module.scss';
import { Stats } from '../../../classes/stats';

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
        Math.floor(255 - (limitedLoad * 2.55)),
        0
    ]

    return (
        <div className={styles.loadMeter}>
            <div className={styles.loadMeterBar} style={{ width: `${load}%`, backgroundColor: `rgb(${color.join(',')})` }}></div>
        </div>
    );
}

export const Metrics: React.FC = () => {
    const [fpsHistory, setFpsHistory] = React.useState<number[]>(() => new Array(30).fill(0));
    React.useEffect(() => {
        const interval = setInterval(() => {
            setFpsHistory((prev) => ([...prev, Stats.data.fps].slice(-30)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className={styles.metrics}>
            <div className={styles.fps}>
                {fpsHistory.map((fps, index) => {
                    const percent = (fps / 60) * 100;
                    const color = [
                        Math.floor(255 - (percent * 2.55)),
                        Math.floor(percent * 2.55),
                        0
                    ]
                    return (
                        <div className={styles.fpsBar} key={index} style={{ 
                            height: `${percent}%`,
                            backgroundColor: `rgb(${color.join(',')})`
                         }}></div>
                    );
                })}
            </div>
            <LoadMeter />
        </div>
    );
}