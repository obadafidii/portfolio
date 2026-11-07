import {
    Arm,
    Bob,
    Ground,
    Head,
    Path,
    Robe,
    Spin,
    Swing,
    Walk,
    at,
    repeat,
    styles,
    type SceneProps,
} from './kit';

/*
 * The Mali Empire, c. 1350: the Great Mosque of Djenné bristling with
 * toron beams, the Mansa enthroned under his parasol, a griot on the kora,
 * drummers, women pounding grain, a baobab, a salt caravan crossing in from
 * the Sahara, a Timbuktu scholar reading, and gold weighed on a balance.
 */

const Mosque = () => {
    const towers: [number, number][] = [
        [34, 12],
        [90, 6],
        [146, 12],
    ];
    const pinnacles = [22, 52, 62, 72, 108, 118, 128, 158];
    return (
        <g>
            <path d="M 4 57.6 H 176 M 8 52 H 172 M 8 52 V 57.6 M 172 52 V 57.6" />
            <path d="M 16 52 V 26 H 164 V 52" />
            {towers.map(([x, top]) => (
                <g key={x}>
                    <path
                        d={`M ${x - 7} 52 V ${top + 6} Q ${x - 7} ${top} ${x} ${top - 2} Q ${x + 7} ${top} ${x + 7} ${top + 6} V 52`}
                    />
                    <ellipse
                        cx={x}
                        cy={top - 4.4}
                        rx="1.4"
                        ry="2"
                        className={styles.solid}
                    />
                    <path
                        d={[top + 10, top + 20, top + 30]
                            .map(
                                y => `M ${x - 7} ${y} h -3 M ${x + 7} ${y} h 3`,
                            )
                            .join(' ')}
                    />
                    <path d={`M ${x} ${top + 4} V 50`} className={styles.cut} />
                </g>
            ))}
            {pinnacles.map(p => (
                <path
                    key={p}
                    d={`M ${p - 2.2} 26 V 21 Q ${p} 18.4 ${p + 2.2} 21 V 26`}
                />
            ))}
            <path
                d={[34, 44]
                    .map(y =>
                        [22, 50, 62, 74, 106, 118, 130, 158]
                            .map(x => `M ${x} ${y} h 2.6`)
                            .join(' '),
                    )
                    .join(' ')}
                className={styles.cut}
            />
            <path d="M 84 52 V 42 Q 90 36 96 42 V 52" />
        </g>
    );
};

/** The Mansa on his throne under a parasol, holding a staff of gold. */
const Mansa = () => (
    <g>
        <path d="M 8 34 V 4 M -7 8.6 Q 8 0 23 8.6 Z" />
        <path d="M -7 8.6 Q 8 0 23 8.6 Z" className={styles.sail} />
        <path d="M -2 34 H 12 V 57.6 H -2 Z" />
        <path d="M 9 34 V 57.6" className={styles.cut} />
        <Head cy={14}>
            <path d="M -3.4 12 Q 0 7.4 3.6 12 Z" className={styles.solid} />
        </Head>
        <path d="M -4.6 21 H 4.6 L 3 34 H -3 Z" className={styles.solid} />
        <path d="M -3 33 H -12 L -12.4 57.6 L -15.6 57.6 M 0 34 L -12 34" />
        <path d="M -4 23 L -8 28 M -8 30 L -11 10" />
        <circle cx="-11.2" cy="9" r="1.8" className={styles.solid} />
    </g>
);

/** Seated on a low stool, playing the kora. */
const Griot = ({ on }: { on: boolean }) => (
    <g>
        <Head cy={25}>
            <path
                d="M -3.4 23 Q 0 18 4 22.6 Q 1 24 -3.4 23 Z"
                className={styles.solid}
            />
        </Head>
        <path d="M -4.6 31 H 4.6 L 8 52 Q 0 54 -10 52 Z" />
        <path d="M -12 57.6 H 10 M -2 52 V 57.6 M 6 52 V 57.6" />
        <circle cx="-12" cy="46" r="6" className={styles.sail} />
        <circle cx="-12" cy="46" r="6" />
        <path d="M -12 46 L -17 16" />
        <path
            d="M -10 44 L -16.4 19 M -13.6 44 L -17.4 21"
            className={styles.cut}
        />
        <Arm on={on} from={[-4, 32]} angles={[0, 7, 0]} dur={0.6}>
            <path d="M -4 32 L -11 36 L -14.4 33" />
        </Arm>
        <Arm on={on} from={[3, 32]} angles={[0, -6, 0]} dur={0.8}>
            <path d="M 3 32 L -6 40 L -11 40" />
        </Arm>
    </g>
);

const Drummer = ({ on }: { on: boolean }) => (
    <g>
        <Head cy={25} />
        <path d="M -4.6 31 H 4.6 L 2.4 44 H -2.4 Z" />
        <path d="M -2.4 44 H -6 L -7 57.6 M 0 44 V 57.6 M 6 44 V 57.6 M -2 44 H 8" />
        <path
            d="M -20 38 H -8 L -10 46 Q -13 48 -12 51 L -11 57.6 H -17 L -16 51 Q -15 48 -18 46 Z"
            className={styles.sail}
        />
        <path d="M -20 38 H -8 L -10 46 Q -13 48 -12 51 L -11 57.6 H -17 L -16 51 Q -15 48 -18 46 Z" />
        <g>
            <Bob on={on} by={-3} dur={0.42} />
            <path d="M -4 32 L -10 34 L -15 36.4" />
        </g>
        <g>
            <Bob on={on} by={-3} dur={0.42} begin="-0.21s" />
            <path d="M 3 32 L -6 35 L -12 36.4" />
        </g>
    </g>
);

/** Pounding grain in a mortar with a long pestle. */
const Pounder = ({ on, phase = 0 }: { on: boolean; phase?: number }) => (
    <g>
        <Head>
            <path
                d="M -3.8 12.6 Q -1 6.4 5.4 10.4 Q 3 13 -3.8 12.6 Z"
                className={styles.solid}
            />
        </Head>
        <path d="M -4.6 22 H 4.6 L 2.4 34 L 6 56 Q 0 57.8 -7 56 L -2.4 34 Z" />
        <path d="M -2.4 34 H 2.4" className={styles.cut} />
        <path d="M -5.6 56 L -8 57.6 M 4.4 56.6 L 3 57.6" />
        <path
            d="M -16 46 H -4 L -6 52 L -5 57.6 H -15 L -14 52 Z"
            className={styles.solid}
        />
        <g transform="translate(0 -6)">
            <Path
                on={on}
                points={['0 -6', '0 4', '0 -6']}
                times={[0, 0.5, 1]}
                dur={1.1}
                begin={`${-phase}s`}
            />
            <path d="M -10 50 V 12" />
            <path d="M -4 29 L -9.4 30 M -3 31 L -9.4 36" />
        </g>
    </g>
);

const Baobab = ({ on }: { on: boolean }) => (
    <g>
        <path
            d="M -8 57.6 Q -5 42 -6.4 28 H 6.4 Q 5 42 8 57.6 Z"
            className={styles.solid}
        />
        <g>
            <Swing on={on} pivot={[0, 28]} angles={[-1, 1, -1]} dur={7} />
            <path d="M -6 28 L -16 21 M -3 27 L -6 16 M 3 27 L 5 15 M 6 28 L 16 22 M -16 21 l -3 -2 M 16 22 l 4 -3" />
            {[
                [-17, 19],
                [-6, 14],
                [5, 13],
                [17, 20],
                [-11, 17],
                [11, 17],
            ].map(([x, y]) => (
                <ellipse
                    key={x}
                    cx={x}
                    cy={y}
                    rx="3.4"
                    ry="2"
                    className={styles.solid}
                />
            ))}
        </g>
    </g>
);

/** One camel leg from the hip at (0, 0). */
const CamelLeg = ({
    on,
    angles,
    phase,
}: {
    on: boolean;
    angles: [number, number];
    phase: number;
}) => (
    <g transform={`rotate(${angles[0]} 0 0)`}>
        <Swing
            on={on}
            pivot={[0, 0]}
            angles={[angles[0], angles[1], angles[0]]}
            dur={1.7}
            begin={`${-phase}s`}
        />
        <path d="M 0 0 L 0.8 10 L 0 20.6 L -2 20.6" />
    </g>
);

const Camel = ({
    on,
    phase = 0,
    load,
}: {
    on: boolean;
    phase?: number;
    load: 'rider' | 'salt';
}) => (
    <g>
        {[
            [-9, 0, [12, -12]],
            [-6, 0.85, [12, -12]],
            [5, 0.4, [-10, 12]],
            [8, 1.25, [-10, 12]],
        ].map(([x, p, a]) => (
            <g key={x as number} transform={`translate(${x} 37)`}>
                <CamelLeg
                    on={on}
                    angles={a as [number, number]}
                    phase={phase + (p as number)}
                />
            </g>
        ))}
        <g>
            <Bob on={on} by={0.9} dur={0.85} begin={`${-phase}s`} />
            <path
                d="M -12 34 Q -8 21 0 24 Q 8 21 11 30 Q 13 36 8 38.4 H -10 Q -14 37 -12 34 Z"
                className={styles.solid}
            />
            <path
                d="M -10 31 Q -16 30 -18 22 L -21 18.6 L -26.4 19.6 L -26.4 22.4 L -21.4 22.6 Q -19 32 -9 36 Z"
                className={styles.solid}
            />
            <path d="M 11 31 Q 14.4 34 13 39" />
            {load === 'rider' ? (
                <g transform="translate(-1 0)">
                    <Head cy={11}>
                        <path
                            d="M -3.6 9 Q 0 4 4 8.6 Q 1 10.4 -3.6 9 Z"
                            className={styles.solid}
                        />
                    </Head>
                    <path d="M -4 17.6 H 4 L 3 25 H -3 Z" />
                    <path d="M -3.6 19 L -8 23 L -12 22" />
                </g>
            ) : (
                <g>
                    <path
                        d="M -7 16 H 7 V 23 H -7 Z M -6 10 H 6 V 16 H -6 Z"
                        className={styles.sail}
                    />
                    <path d="M -7 16 H 7 V 23 H -7 Z M -6 10 H 6 V 16 H -6 Z" />
                </g>
            )}
        </g>
    </g>
);

const Leader = ({ on }: { on: boolean }) => (
    <g>
        <Head>
            <path
                d="M -3.6 13 Q 0 7.4 4.4 12 Q 1 14 -3.6 13 Z"
                className={styles.solid}
            />
            <path d="M 3.4 14 Q 6 18 4 22" className={styles.cut} />
        </Head>
        <path d="M -4.6 22 H 4.6 L 4.6 44 H -5.6 Z" />
        <Walk on={on} dur={1.7} />
        <path d="M -4 23 L -9 30 M -10 8 L -8 57" />
        <path d="M 4 23 L 9 27 Q 14 26 16 22" className={styles.cut} />
    </g>
);

const Reader = ({ on }: { on: boolean }) => (
    <g>
        <g>
            <Swing on={on} pivot={[0, 31]} angles={[0, -8, -8, 0]} dur={4.4} />
            <Head cy={25}>
                <path
                    d="M -3.6 23 Q 0 18 4.2 22.4 Q 1 24.4 -3.6 23 Z"
                    className={styles.solid}
                />
            </Head>
        </g>
        <path d="M -4.6 31 H 4.6 L 8 52 Q 0 54 -10 52 Z" />
        <path d="M -12 57.6 H 10" className={styles.cut} />
        <path
            d="M -16 38 L -10 36 L -4 38 L -10 40.6 Z"
            className={styles.sail}
        />
        <path d="M -16 38 L -10 36 L -4 38 L -10 40.6 Z M -10 36 V 40.6" />
        <path d="M -4 32 L -8 38 M 3 32 L -4 39" />
    </g>
);

const Houses = () => (
    <g>
        <path d="M 0 57.6 V 38 H 28 V 57.6" />
        <path
            d={repeat(
                4,
                8,
                x => `M ${x + 2} 38 V 34 Q ${x + 4} 32 ${x + 6} 34 V 38`,
            )}
        />
        <path d="M 10 57.6 V 48 H 17 V 57.6" />
        <path d="M 34 57.6 V 30 H 66 V 57.6" />
        <path
            d={repeat(
                5,
                7.6,
                x => `M ${x + 35} 30 V 26 Q ${x + 37} 24 ${x + 39} 26 V 30`,
            )}
        />
        <path d="M 46 57.6 V 47 H 54 V 57.6 M 40 38 h 5 v 4 h -5 Z M 56 38 h 5 v 4 h -5 Z" />
        <path
            d="M 28 44 h 3 M 66 36 h 3 M 66 46 h 3 M 34 40 h -3"
            className={styles.cut}
        />
    </g>
);

const MaliDancer = ({ on, phase = 0 }: { on: boolean; phase?: number }) => (
    <g>
        <g>
            <Bob on={on} by={-2} dur={0.7} begin={`${-phase}s`} />
            <Head>
                <path
                    d="M -3.8 12.6 Q -1 6.4 5.4 10.4 Q 3 13 -3.8 12.6 Z"
                    className={styles.solid}
                />
            </Head>
            <Arm on={on} angles={[30, 120, 30]} dur={1.4} begin={`${-phase}s`}>
                <path d="M -4 23 L -10 27 L -14 24" />
            </Arm>
            <Arm
                on={on}
                from={[4, 23]}
                angles={[-10, -100, -10]}
                dur={1.4}
                begin={`${-phase - 0.7}s`}
            >
                <path d="M 4 23 L 10 27 L 13 24" />
            </Arm>
            <path d="M -4.6 22 H 4.6 L 2.4 34 H -2.4 Z" />
        </g>
        <g>
            <Swing
                on={on}
                pivot={[0, 34]}
                angles={[-6, 6, -6]}
                dur={1.4}
                begin={`${-phase}s`}
            />
            <path d="M -3 34 H 3 L 8 50 H -9 Z" className={styles.solid} />
        </g>
        <path d="M -3 50 L -2 57.6 L -5 57.6 M 3 50 L 4 57.6 L 1 57.6" />
    </g>
);

const GoldWeigher = ({ on }: { on: boolean }) => (
    <g>
        <path d="M -24 44 H -4 M -22 44 V 57.6 M -6 44 V 57.6" />
        <path d="M -14 44 V 30" />
        <g>
            <Swing on={on} pivot={[-14, 30]} angles={[-7, 7, -7]} dur={3.2} />
            <path d="M -22 30 H -6 M -22 30 L -24 36 M -22 30 L -20 36 M -6 30 L -8 36 M -6 30 L -4 36 M -25 36 H -19 M -9 36 H -3" />
            <circle cx="-22" cy="34.8" r="1" className={styles.solid} />
        </g>
        <Head>
            <path
                d="M -3.6 13 Q 0 7.4 4.4 12 Q 1 14 -3.6 13 Z"
                className={styles.solid}
            />
        </Head>
        <Robe />
        <path d="M -4 23 L -9 29 L -12 30" />
    </g>
);

const SahelSun = ({ on }: { on: boolean }) => (
    <g>
        <circle cx="0" cy="0" r="4.4" />
        <g>
            <Spin on={on} at={[0, 0]} dur={40} />
            <path
                d={Array.from({ length: 8 }, (_, i) => {
                    const a = (i * Math.PI) / 4;
                    return `M ${(Math.cos(a) * 6.6).toFixed(2)} ${(Math.sin(a) * 6.6).toFixed(2)} L ${(Math.cos(a) * 9).toFixed(2)} ${(Math.sin(a) * 9).toFixed(2)}`;
                }).join(' ')}
                className={styles.cut}
            />
        </g>
    </g>
);

const Sand = () => (
    <g>
        <Ground double={false} />
        <path
            d={repeat(48, 20, x => `M ${x + 4} 61.4 q 3 -1.6 6 0`)}
            className={styles.cut}
        />
    </g>
);

export const Mali = ({ on }: SceneProps) => (
    <g>
        <Mosque />
        {at(206, <Mansa />, 'mansa', { flip: true })}
        {at(246, <Griot on={on} />, 'griot')}
        {at(282, <Drummer on={on} />, 'drum')}
        {at(318, <Pounder on={on} />, 'pound1')}
        {at(346, <Pounder on={on} phase={0.55} />, 'pound2')}
        {at(392, <Baobab on={on} />, 'baobab')}
        {at(434, <Leader on={on} />, 'leader')}
        {at(474, <Camel on={on} load="rider" />, 'camel1')}
        {at(522, <Camel on={on} phase={0.4} load="salt" />, 'camel2')}
        {at(570, <Camel on={on} phase={0.8} load="salt" />, 'camel3')}
        {at(622, <Reader on={on} />, 'reader')}
        {at(650, <Houses />, 'houses')}
        {at(752, <MaliDancer on={on} />, 'dance1')}
        {at(780, <MaliDancer on={on} phase={0.35} />, 'dance2')}
        {at(838, <GoldWeigher on={on} />, 'gold')}
        {at(890, <Baobab on={on} />, 'baobab2', { y: 6, scale: 0.9 })}
        {at(936, <SahelSun on={on} />, 'sun', { y: 12 })}
        <Sand />
    </g>
);
