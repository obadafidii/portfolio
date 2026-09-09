'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Figure } from '../Figure';
import styles from './DatabaseVisuals.module.css';

// A finite timeline keeps pause/resume and manual stepping on the same path.
function useTimeline(lastStep: number) {
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        if (!playing) return;
        const timer = window.setTimeout(() => {
            if (step < lastStep) setStep(step + 1);
            if (step >= lastStep - 1) setPlaying(false);
        }, 1600);
        return () => window.clearTimeout(timer);
    }, [lastStep, playing, step]);

    return {
        step,
        playing,
        lastStep,
        toggle() {
            if (step === lastStep) setStep(0);
            setPlaying((current) => !current);
        },
        next() {
            setPlaying(false);
            setStep((current) => Math.min(current + 1, lastStep));
        },
        reset() {
            setPlaying(false);
            setStep(0);
        },
    };
}

function Controls({ timeline }: { timeline: ReturnType<typeof useTimeline> }) {
    return (
        <div className={styles.controls}>
            <button type="button" onClick={timeline.toggle} aria-pressed={timeline.playing}>
                {timeline.playing
                    ? 'Pause'
                    : timeline.step === timeline.lastStep
                      ? 'Replay'
                      : 'Play'}
            </button>
            <button
                type="button"
                onClick={timeline.next}
                disabled={timeline.step === timeline.lastStep}
            >
                Step →
            </button>
            <button type="button" onClick={timeline.reset}>
                Reset
            </button>
            <span>
                {timeline.step + 1} / {timeline.lastStep + 1}
            </span>
        </div>
    );
}

const WRITE_STEPS = [
    [
        'A write arrives',
        'The client sends PUT name = David. No success response has been sent yet.',
    ],
    [
        'Append to the WAL buffer',
        'The database encodes the record in its WAL buffer. These bytes are still in memory.',
    ],
    [
        'Write to the kernel',
        'The WAL bytes enter the operating system’s page cache. The modified pages are dirty; they are not yet guaranteed durable.',
    ],
    [
        'Flush with fsync()',
        'The database calls fsync() on the WAL file. The kernel flushes its dirty pages to storage while the caller waits.',
    ],
    [
        'Disk reports completion',
        'The device reports completion and fsync() returns successfully. The WAL record is now durable.',
    ],
    [
        'Acknowledge the write',
        'The database can report success to the client. The durable WAL can recover this write even before the memtable reaches an SSTable.',
    ],
];

export function WalDiskWrite() {
    const timeline = useTimeline(WRITE_STEPS.length - 1);
    const { step } = timeline;
    const nodes = [
        {
            title: 'Client',
            label: step === 5 ? '✓ committed' : 'PUT name = David',
            active: step === 0 || step === 5,
            filled: true,
        },
        {
            title: 'Database · WAL',
            label: step >= 1 ? 'record 01 buffered' : 'waiting for write',
            active: step === 1,
            filled: step >= 1,
        },
        {
            title: 'Kernel page cache',
            label:
                step >= 4 ? '✓ pages synced' : step >= 2 ? 'dirty WAL pages' : 'no pending bytes',
            active: step === 2 || step === 3,
            filled: step >= 2,
        },
        {
            title: 'Disk · WAL file',
            label:
                step >= 4
                    ? '✓ record 01 durable'
                    : step === 3
                      ? 'writing bytes…'
                      : 'record not persisted',
            active: step === 4,
            filled: step >= 4,
        },
    ];

    return (
        <section aria-label="WAL write to disk animation" className={styles.visual}>
            <Figure
                caption="A synchronous WAL write: buffer → dirty pages → disk → acknowledgement. The disk stores the WAL here; flushing a memtable to an SSTable is a separate operation."
                controls={<Controls timeline={timeline} />}
            >
                <div className={styles.eyebrow}>01 / the durability boundary</div>
                <div className={styles.writeFlow}>
                    {nodes.map((node, index) => (
                        <div className={styles.nodeGroup} key={node.title}>
                            <div
                                className={`${styles.node} ${node.filled ? styles.filled : ''} ${node.active ? styles.active : ''}`}
                            >
                                <span className={styles.nodeIndex}>0{index + 1}</span>
                                <strong>{node.title}</strong>
                                <span>{node.label}</span>
                                <div className={styles.bytes} aria-hidden="true">
                                    {[0, 1, 2, 3].map((byte) => (
                                        <i key={byte} />
                                    ))}
                                </div>
                            </div>
                            {index < nodes.length - 1 && (
                                <span
                                    className={`${styles.arrow} ${step > index ? styles.passed : ''}`}
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                <div className={`${styles.returnPath} ${step >= 4 ? styles.acknowledged : ''}`}>
                    <span aria-hidden="true">←</span>
                    {step === 5
                        ? 'Database → client: write committed'
                        : step === 4
                          ? 'Disk → kernel → database: fsync() succeeded'
                          : 'Acknowledgement waits for successful fsync()'}
                </div>
                <div className={styles.narration} aria-live="polite" aria-atomic="true">
                    <strong>{WRITE_STEPS[step][0]}</strong>
                    <p>{WRITE_STEPS[step][1]}</p>
                </div>
            </Figure>
        </section>
    );
}

const RECORDS = [
    { lsn: '01', operation: 'PUT name = David' },
    { lsn: '02', operation: 'PUT city = Lagos' },
    { lsn: '03', operation: 'PUT name = Ada' },
    { lsn: '04', operation: 'DEL city' },
    { lsn: '05', operation: 'PUT name = Da…' },
];

const RECOVERY_STEPS = [
    [
        'After the crash',
        'Memory is empty. The WAL files on disk remain, including a partial final record from the interrupted write.',
    ],
    [
        'Find the recovery point',
        'Open the WAL segments still needed since the last checkpoint. In this example, replay starts at record 01.',
    ],
    [
        'Validate record 01',
        'Its length and checksum are valid. Apply PUT name = David to the new memtable.',
    ],
    ['Validate record 02', 'The next record is valid. Apply PUT city = Lagos in sequence.'],
    [
        'Validate record 03',
        'This valid PUT replaces the earlier name. Replaying in order changes David to Ada.',
    ],
    [
        'Validate record 04',
        'This valid delete records a tombstone for city. Reads now treat city as absent.',
    ],
    [
        'Reject the partial tail',
        'Record 05 is incomplete and fails validation. Stop here; do not apply it or anything after it.',
    ],
    [
        'Recover the valid prefix',
        'Discard the incomplete tail in this example. The recovered state is name = Ada; city is deleted.',
    ],
    [
        'Flush the rebuilt memtable',
        'When the rebuilt memtable is flushed to an SSTable, its values and tombstones are persisted too. Recovery has preserved the last valid state.',
    ],
];

export function WalRecovery() {
    const timeline = useTimeline(RECOVERY_STEPS.length - 1);
    const { step } = timeline;
    const name = step >= 4 ? 'Ada' : step >= 2 ? 'David' : '—';
    const city = step >= 5 ? '† deleted' : step >= 3 ? 'Lagos' : '—';

    return (
        <section aria-label="WAL recovery and replay animation" className={styles.visual}>
            <Figure
                caption="Replay valid records in sequence to rebuild state. This simplified example discards an incomplete tail; handling other corruption depends on the database’s recovery policy."
                controls={<Controls timeline={timeline} />}
            >
                <div className={styles.eyebrow}>02 / rebuilding from the log</div>
                <div className={styles.recoveryGrid}>
                    <div>
                        <div className={styles.panelTitle}>
                            WAL on disk <span>read in LSN order ↓</span>
                        </div>
                        <div className={styles.records}>
                            {RECORDS.map((record, index) => {
                                const valid = index < 4 && step >= index + 2;
                                const invalid = index === 4 && step >= 6;
                                const current = step === index + 2;
                                return (
                                    <div
                                        key={record.lsn}
                                        className={`${styles.record} ${valid ? styles.valid : ''} ${invalid ? styles.invalid : ''} ${current ? styles.current : ''} ${invalid && step >= 7 ? styles.discarded : ''}`}
                                    >
                                        <span className={styles.lsn}>{record.lsn}</span>
                                        <code>{record.operation}</code>
                                        <span className={styles.recordStatus}>
                                            {invalid
                                                ? step >= 7
                                                    ? 'discarded'
                                                    : '× invalid'
                                                : valid
                                                  ? '✓ applied'
                                                  : 'unread'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={styles.stateColumn}>
                        <div className={styles.panelTitle}>
                            Rebuilt memtable <span>in memory</span>
                        </div>
                        <div className={styles.stateTable}>
                            <div>
                                <span>key</span>
                                <span>value</span>
                            </div>
                            <div key={`name-${name}`} className={step >= 2 ? styles.changed : ''}>
                                <code>name</code>
                                <strong>{name}</strong>
                            </div>
                            <div key={`city-${city}`} className={step >= 3 ? styles.changed : ''}>
                                <code>city</code>
                                <strong>{city}</strong>
                            </div>
                        </div>
                        <div className={`${styles.sstable} ${step === 8 ? styles.persisted : ''}`}>
                            <span>
                                {step === 8
                                    ? '↓ flushed to SSTable'
                                    : 'SSTable · waiting for flush'}
                            </span>
                            <code>
                                {step === 8 ? 'name = Ada · city = †' : 'No recovered entries yet'}
                            </code>
                        </div>
                    </div>
                </div>
                <div className={styles.narration} aria-live="polite" aria-atomic="true">
                    <strong>{RECOVERY_STEPS[step][0]}</strong>
                    <p>{RECOVERY_STEPS[step][1]}</p>
                </div>
            </Figure>
        </section>
    );
}

function ReplicationNode({
    title,
    subtitle,
    active,
    children,
}: {
    title: string;
    subtitle: string;
    active: boolean;
    children: ReactNode;
}) {
    return (
        <div className={`${styles.replicationNode} ${active ? styles.active : ''}`}>
            <div className={styles.panelTitle}>
                {title}
                <span>{subtitle}</span>
            </div>
            {children}
        </div>
    );
}

const PHYSICAL_STEPS = [
    [
        'Start from a shared snapshot',
        'Both replicas begin from the same base backup as the leader. Their replay position is LSN 40.',
    ],
    [
        'The leader advances',
        'A committed update changes name from David to Ada. Its physical WAL records cover LSN 41–42.',
    ],
    [
        'Stream the WAL bytes',
        'The leader sends the same physical WAL stream to both replicas. Each replica receives bytes into its own WAL.',
    ],
    [
        'Replica A replays',
        'Replica A applies records 41–42 to its data pages. Replica B has received the bytes but has not replayed them yet.',
    ],
    [
        'Replica B catches up',
        'Replica B replays the same records. Both replicas now expose name = Ada at replay position 42.',
    ],
    [
        'Report progress',
        'Replicas report their positions to the leader. Receiving WAL and replaying WAL are distinct steps; this example uses asynchronous replication.',
    ],
];

export function PhysicalReplication() {
    const timeline = useTimeline(PHYSICAL_STEPS.length - 1);
    const { step } = timeline;
    const replicas = [step >= 3, step >= 4];

    return (
        <section aria-label="Physical replication animation" className={styles.visual}>
            <Figure
                caption="Physical replication streams WAL records to compatible replicas, which replay them against a shared starting snapshot. Byte values and LSNs are illustrative."
                controls={<Controls timeline={timeline} />}
            >
                <div className={styles.eyebrow}>03 / one WAL stream, matching replicas</div>
                <ReplicationNode
                    title="Leader"
                    subtitle="physical WAL · source database"
                    active={step === 1}
                >
                    <div className={styles.replicationValue}>
                        name = <strong>{step >= 1 ? 'Ada' : 'David'}</strong>
                    </div>
                    <div className={styles.byteStream}>
                        <span>LSN 40 · base</span>
                        <span className={step >= 1 ? styles.bytePresent : ''}>41 · A3 0F</span>
                        <span className={step >= 1 ? styles.bytePresent : ''}>42 · B8 21</span>
                    </div>
                </ReplicationNode>
                <div className={`${styles.transfer} ${step >= 2 ? styles.transferReady : ''}`}>
                    <span aria-hidden="true">{step >= 5 ? '↑' : '↓'}</span>
                    {step >= 5
                        ? 'Replay positions returned to leader'
                        : step >= 2
                          ? 'Same WAL bytes → both replicas'
                          : 'Waiting for the next WAL records'}
                </div>
                <div className={styles.replicaGrid}>
                    {replicas.map((replayed, index) => (
                        <ReplicationNode
                            key={index}
                            title={`Replica ${index === 0 ? 'A' : 'B'}`}
                            subtitle="same storage format"
                            active={step === index + 3}
                        >
                            <div className={styles.byteStream}>
                                <span className={step >= 2 ? styles.bytePresent : ''}>
                                    41 · A3 0F
                                </span>
                                <span className={step >= 2 ? styles.bytePresent : ''}>
                                    42 · B8 21
                                </span>
                            </div>
                            <div className={styles.replicationValue} key={String(replayed)}>
                                name ={' '}
                                <strong className={replayed ? styles.changed : ''}>
                                    {replayed ? 'Ada' : 'David'}
                                </strong>
                            </div>
                            <div className={styles.position}>
                                <span>
                                    received <b>{step >= 2 ? '42' : '40'}</b>
                                </span>
                                <span>
                                    replayed <b>{replayed ? '42' : '40'}</b>
                                </span>
                            </div>
                        </ReplicationNode>
                    ))}
                </div>
                <div className={styles.narration} aria-live="polite" aria-atomic="true">
                    <strong>{PHYSICAL_STEPS[step][0]}</strong>
                    <p>{PHYSICAL_STEPS[step][1]}</p>
                </div>
            </Figure>
        </section>
    );
}

const LOGICAL_STEPS = [
    [
        'Start with an existing row',
        'The source and subscriber have already completed their initial snapshot. User 1 is named David. The Kafka topic has no new events.',
    ],
    [
        'Commit an update',
        'The source changes user 1 from David to Ada and records the committed transaction in its WAL.',
    ],
    [
        'Decode the change',
        'Logical decoding turns the WAL record into a row change: UPDATE users, key 1, name Ada. The event shown here is a simplified representation.',
    ],
    [
        'Apply at the subscriber',
        'The database subscriber applies the row change to its users table. It needs compatible published columns, but does not copy physical data pages.',
    ],
    [
        'Ingest into Kafka',
        'A CDC connector publishes the same change to the users.changes topic, keyed by user ID. Kafka stores an event; it does not replay database pages.',
    ],
    [
        'One change, two destinations',
        'The subscriber now reads name = Ada. Kafka retains the update event for downstream consumers. The destinations can process changes at different speeds.',
    ],
];

export function LogicalReplication() {
    const timeline = useTimeline(LOGICAL_STEPS.length - 1);
    const { step } = timeline;

    return (
        <section aria-label="Logical replication and Kafka animation" className={styles.visual}>
            <Figure
                caption="Logical decoding exposes row changes. A database subscriber applies them, while a CDC connector can publish them to Kafka for other consumers. Initial snapshots are assumed complete."
                controls={<Controls timeline={timeline} />}
            >
                <div className={styles.eyebrow}>04 / one change, different systems</div>
                <div className={styles.replicaGrid}>
                    <ReplicationNode
                        title="Source database"
                        subtitle="users · id 1"
                        active={step === 1}
                    >
                        <div className={styles.replicationValue}>
                            name = <strong>{step >= 1 ? 'Ada' : 'David'}</strong>
                        </div>
                        <div className={styles.eventHint}>
                            {step >= 1 ? '✓ transaction committed in WAL' : 'Ready for a write'}
                        </div>
                    </ReplicationNode>
                    <ReplicationNode
                        title="Logical decoder"
                        subtitle="WAL → row changes"
                        active={step === 2}
                    >
                        <div
                            className={`${styles.changeEvent} ${step >= 2 ? styles.eventVisible : ''}`}
                        >
                            <span>UPDATE users · key 1</span>
                            <code>name: David → Ada</code>
                        </div>
                        <div className={styles.eventHint}>
                            {step >= 2 ? 'Decoded event ready' : 'Waiting for committed WAL'}
                        </div>
                    </ReplicationNode>
                </div>
                <div className={`${styles.transfer} ${step >= 2 ? styles.transferReady : ''}`}>
                    <span aria-hidden="true">↓</span>
                    {step >= 2
                        ? 'Publish the logical change to independent consumers'
                        : 'No change to distribute yet'}
                </div>
                <div className={styles.replicaGrid}>
                    <ReplicationNode
                        title="Database subscriber"
                        subtitle="apply the row change"
                        active={step === 3}
                    >
                        <div className={styles.replicationValue} key={String(step >= 3)}>
                            name ={' '}
                            <strong className={step >= 3 ? styles.changed : ''}>
                                {step >= 3 ? 'Ada' : 'David'}
                            </strong>
                        </div>
                        <div className={styles.eventHint}>
                            {step >= 3 ? '✓ UPDATE applied to user 1' : 'Waiting for the update'}
                        </div>
                    </ReplicationNode>
                    <ReplicationNode
                        title="Kafka"
                        subtitle="via CDC connector · users.changes"
                        active={step === 4}
                    >
                        <div
                            className={`${styles.changeEvent} ${step >= 4 ? styles.eventVisible : ''}`}
                        >
                            <span>key: 1 · operation: update</span>
                            <code>after: name = Ada</code>
                        </div>
                        <div className={styles.eventHint}>
                            {step >= 4 ? '✓ 1 event available to consumers' : '0 new events'}
                        </div>
                    </ReplicationNode>
                </div>
                <div className={styles.narration} aria-live="polite" aria-atomic="true">
                    <strong>{LOGICAL_STEPS[step][0]}</strong>
                    <p>{LOGICAL_STEPS[step][1]}</p>
                </div>
            </Figure>
        </section>
    );
}
