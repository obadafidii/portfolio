'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button, Figure } from '../Figure';
import styles from './PipelineRobots.module.css';

type Mode = 'serial' | 'pipeline';

const STAGES = [
    { name: 'fetch', color: 'var(--term-blue)' },
    { name: 'decode', color: 'var(--term-violet)' },
    { name: 'execute', color: 'var(--term-green)' },
] as const;

const INSTRUCTIONS = ['I1', 'I2', 'I3', 'I4'];

export const PipelineRobots = () => {
    const [mode, setMode] = useState<Mode>('serial');
    const [tick, setTick] = useState(0);
    const [running, setRunning] = useState(false);

    const maxTicks =
        mode === 'serial' ? INSTRUCTIONS.length * STAGES.length : 6;

    useEffect(() => {
        if (!running) return;

        const timer = window.setInterval(() => {
            setTick(current => {
                if (current >= maxTicks) {
                    setRunning(false);
                    return current;
                }
                return current + 1;
            });
        }, 900);

        return () => window.clearInterval(timer);
    }, [maxTicks, running]);

    const chooseMode = (next: Mode) => {
        setMode(next);
        setTick(0);
        setRunning(false);
    };

    const occupants = useMemo(
        () =>
            STAGES.map((_, stageIndex) => {
                if (tick === 0) return null;

                if (mode === 'serial') {
                    const activeStage = (tick - 1) % STAGES.length;
                    const instruction = Math.floor((tick - 1) / STAGES.length);
                    return stageIndex === activeStage
                        ? (INSTRUCTIONS[instruction] ?? null)
                        : null;
                }

                const instruction = tick - 1 - stageIndex;
                return INSTRUCTIONS[instruction] ?? null;
            }),
        [mode, tick],
    );

    const completed =
        mode === 'serial'
            ? Math.min(INSTRUCTIONS.length, Math.floor(tick / STAGES.length))
            : Math.min(INSTRUCTIONS.length, Math.max(0, tick - 2));

    const status =
        tick === 0
            ? 'The clock is stopped. Step once or run the animation.'
            : completed === INSTRUCTIONS.length
              ? mode === 'serial'
                  ? `${INSTRUCTIONS.length} instructions complete in ${tick} ticks. The pipeline can finish the same work in 6.`
                  : `${INSTRUCTIONS.length} instructions complete in ${tick} ticks — half the time of the one-robot design.`
              : mode === 'serial'
                ? `${occupants.find(Boolean)} is moving through one stage. The other hardware is idle.`
                : `${occupants.filter(Boolean).length} stages are working at once; ${completed} instruction${completed === 1 ? '' : 's'} complete.`;

    const step = () => {
        setRunning(false);
        setTick(current => (current >= maxTicks ? 0 : current + 1));
    };

    const toggleRunning = () => {
        if (running) {
            setRunning(false);
            return;
        }

        if (tick >= maxTicks) setTick(0);
        setRunning(true);
    };

    return (
        <Figure
            caption="fig 1 — compare one robot doing every job with three specialist robots working as a pipeline. after the pipeline fills, one instruction completes on each tick."
            controls={
                <>
                    <Button
                        onClick={() => chooseMode('serial')}
                        active={mode === 'serial'}
                    >
                        one robot
                    </Button>
                    <Button
                        onClick={() => chooseMode('pipeline')}
                        active={mode === 'pipeline'}
                    >
                        three-robot pipeline
                    </Button>
                    <Button onClick={toggleRunning} active={running}>
                        {running
                            ? 'pause'
                            : tick >= maxTicks
                              ? 'replay'
                              : 'run'}
                    </Button>
                    <Button onClick={step}>one tick</Button>
                    <Button
                        onClick={() => {
                            setTick(0);
                            setRunning(false);
                        }}
                    >
                        reset
                    </Button>
                </>
            }
        >
            <div className={styles.figure}>
                <div className={styles.readout}>
                    <Metric label="clock" value={`tick ${tick}`} />
                    <Metric
                        label="design"
                        value={
                            mode === 'serial'
                                ? '1 robot · 3 jobs'
                                : '3 robots · 1 job each'
                        }
                    />
                    <Metric
                        label="completed"
                        value={`${completed} / ${INSTRUCTIONS.length}`}
                    />
                </div>

                <div className={styles.track}>
                    {STAGES.map((stage, stageIndex) => {
                        const occupant = occupants[stageIndex];
                        const showRobot =
                            mode === 'pipeline' || Boolean(occupant);

                        return (
                            <div
                                key={stage.name}
                                className={`${styles.stage} ${occupant ? styles.stageActive : ''}`}
                                style={
                                    {
                                        '--stage-color': stage.color,
                                    } as React.CSSProperties
                                }
                            >
                                <div className={styles.stageHead}>
                                    <span className={styles.stageIndex}>
                                        0{stageIndex + 1}
                                    </span>
                                    <span className={styles.stageName}>
                                        {stage.name}
                                    </span>
                                </div>
                                <div className={styles.stageBody}>
                                    <div
                                        className={styles.robotBay}
                                        aria-hidden="true"
                                    >
                                        {showRobot ? (
                                            <Robot
                                                working={Boolean(occupant)}
                                            />
                                        ) : null}
                                    </div>
                                    <div
                                        className={`${styles.packet} ${occupant ? styles.packetActive : ''}`}
                                    >
                                        {occupant
                                            ? `${occupant} · ${stage.name}`
                                            : 'idle'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.status} aria-live="polite">
                    {status}
                </div>
            </div>
        </Figure>
    );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
    <div className={styles.metric}>
        <span className={styles.metricLabel}>{label}</span>
        <span className={styles.metricValue}>{value}</span>
    </div>
);

const Robot = ({ working }: { working: boolean }) => (
    <div className={`${styles.robot} ${working ? styles.robotWorking : ''}`}>
        <span className={styles.antenna} />
        <span className={styles.head}>
            <span className={styles.eye} />
            <span className={styles.eye} />
        </span>
        <span className={styles.body} />
    </div>
);
