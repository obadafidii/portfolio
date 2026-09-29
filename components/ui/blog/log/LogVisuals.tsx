'use client';

import Image from 'next/image';
import { cloudinaryImageLoader } from '@/lib/cloudinary';
import { useEffect, useState } from 'react';
import { Figure } from '../Figure';
import styles from './LogVisuals.module.css';

const OPERATIONS = ['SET x=1', 'ADD user', 'COMMIT', 'SET y=2', 'DELETE x'];
const RECORDS = Array.from({ length: 9 }, (_, index) => index + 1);
const SEGMENTS = [
    RECORDS.slice(0, 3),
    RECORDS.slice(3, 6),
    RECORDS.slice(6, 9),
];
const abstractLogSketchSrc =
    'https://res.cloudinary.com/cloudlord/image/upload/v1790165229/portfolio/blog/abstract-shape-of-a-log.png';

const useAutoCycle = (maximum: number, intervalMs: number, pauseSteps = 2) => {
    const [step, setStep] = useState(1);

    useEffect(() => {
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        if (reducedMotion.matches) {
            setStep(maximum);
            return;
        }

        const timer = window.setInterval(() => {
            setStep(current =>
                current >= maximum + pauseSteps ? 1 : current + 1,
            );
        }, intervalMs);

        return () => window.clearInterval(timer);
    }, [intervalMs, maximum, pauseSteps]);

    return Math.min(step, maximum);
};

const Record = ({
    number,
    visible = true,
}: {
    number: number;
    visible?: boolean;
}) => (
    <div
        className={`${styles.record} ${visible ? styles.recordVisible : ''}`}
        aria-hidden={!visible}
    >
        <span className={styles.recordIndex}>
            {String(number).padStart(2, '0')}
        </span>
        <span className={styles.recordPayload}>event</span>
    </div>
);

export const AppendDirection = () => {
    const visibleEntries = useAutoCycle(OPERATIONS.length, 850);

    return (
        <Figure caption="fig 2 — an append-only log grows at one end. Existing entries never move to make room for a new one.">
            <div
                className={styles.appendScene}
                role="img"
                aria-label="Operations appearing one at a time from left to right in an append-only log"
            >
                <div className={styles.directionLine} aria-hidden="true">
                    <span>oldest</span>
                    <span className={styles.directionRule} />
                    <span>append here →</span>
                </div>
                <div className={styles.operationTrack}>
                    {OPERATIONS.map((operation, index) => (
                        <div
                            key={operation}
                            className={`${styles.operation} ${index < visibleEntries ? styles.operationVisible : ''}`}
                        >
                            <span>{String(index + 1).padStart(2, '0')}</span>
                            {operation}
                        </div>
                    ))}
                    <div className={styles.writeHead} aria-hidden="true">
                        +
                    </div>
                </div>
            </div>
        </Figure>
    );
};

export const SegmentRotation = () => {
    const step = useAutoCycle(15, 800, 2) - 1;
    const activeSegment = Math.floor(step / 5);
    const recordsInFile = Math.min(step % 5, 3);
    const writtenRecords = activeSegment * 3 + recordsInFile;

    return (
        <Figure caption="fig 3 — when a segment reaches its limit, it is sealed and appends continue in a new segment.">
            <div
                className={styles.segmentScene}
                role="img"
                aria-label="Nine log records filling three segment files in order"
            >
                <div className={styles.segmentFlow}>
                    {SEGMENTS.slice(0, activeSegment + 1).map(
                        (segment, segmentIndex) => {
                            const isSealed = segmentIndex < activeSegment;
                            const isActive = segmentIndex === activeSegment;
                            const count = isSealed ? 3 : recordsInFile;

                            return (
                                <div
                                    key={segmentIndex}
                                    className={styles.segmentGroup}
                                >
                                    <div
                                        className={`${styles.segment} ${isActive ? styles.segmentActive : ''} ${isSealed ? styles.segmentSealed : ''}`}
                                    >
                                        <div className={styles.segmentHeader}>
                                            <span>
                                                log-
                                                {String(
                                                    segmentIndex + 1,
                                                ).padStart(4, '0')}
                                            </span>
                                            <span>
                                                {isSealed
                                                    ? 'sealed'
                                                    : count === 3
                                                      ? 'FULL'
                                                      : 'appending'}
                                            </span>
                                        </div>
                                        <div className={styles.segmentRecords}>
                                            {segment.map(number => (
                                                <Record
                                                    key={number}
                                                    number={number}
                                                    visible={
                                                        number <= writtenRecords
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <div className={styles.capacity}>
                                            <span
                                                style={{
                                                    width: `${(count / 3) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <div className={styles.fileCount}>
                                            {count} / 3 records
                                        </div>
                                    </div>
                                    {segmentIndex < activeSegment ? (
                                        <span
                                            className={styles.segmentArrow}
                                            aria-hidden="true"
                                        >
                                            →
                                        </span>
                                    ) : null}
                                </div>
                            );
                        },
                    )}
                </div>
                <div className={styles.segmentLegend}>
                    {recordsInFile === 0
                        ? `Created log-${String(activeSegment + 1).padStart(4, '0')} — ready for appends`
                        : recordsInFile === 3
                          ? 'File full — seal it, then create the next file'
                          : `Appending record ${writtenRecords} to the current file`}
                </div>
            </div>
        </Figure>
    );
};

export const AbstractLogSketch = () => (
    <figure className="not-prose my-8">
        <div className={styles.sketchFrame}>
            <Image
                src={abstractLogSketchSrc}
                alt="Hand-drawn log with numbered records appended from left to right and a new fifth record at the tail"
                width={768}
                height={1280}
                loader={cloudinaryImageLoader}
                sizes="(max-width: 768px) 100vw, 768px"
                className={styles.sketchImage}
            />
        </div>
        <figcaption className={styles.caption}>
            fig 4 — the original sketch: previous entries stay fixed while
            record 5 is appended at the tail.
        </figcaption>
    </figure>
);

export const NumberedAppend = () => {
    const visibleRecords = useAutoCycle(7, 720);

    return (
        <Figure caption="fig 5 — sequence numbers make the order explicit: record n + 1 can only follow record n.">
            <div
                className={styles.numberedScene}
                role="img"
                aria-label="Seven numbered entries appearing in sequence in a log"
            >
                <div className={styles.numberedTrack}>
                    {Array.from({ length: 7 }, (_, index) => {
                        const number = index + 1;
                        return (
                            <Record
                                key={number}
                                number={number}
                                visible={number <= visibleRecords}
                            />
                        );
                    })}
                    <span className={styles.tailMarker}>tail</span>
                </div>
                <div className={styles.sequenceReadout}>
                    <span>next sequence number</span>
                    <strong>
                        {String((visibleRecords % 7) + 1).padStart(2, '0')}
                    </strong>
                </div>
            </div>
        </Figure>
    );
};
