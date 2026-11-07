import {
    Arm,
    Bob,
    Fade,
    Head,
    Path,
    Puff,
    Spin,
    Swing,
    TILE_W,
    Torso,
    Walk,
    at,
    repeat,
    styles,
    waves,
    type SceneProps,
} from './kit';

/*
 * The industrial age, c. 1870: a mill with smoking chimneys, a steam train
 * on the rails, telegraph wires, a blacksmith at the anvil, a paddle
 * steamer, a hot air balloon, a clock tower keeping railway time, and a
 * penny-farthing rolling past.
 */

/** A wheel with spokes that turns as if rolling left. */
const Wheel = ({
    on,
    cx,
    cy,
    r,
    dur,
}: {
    on: boolean;
    cx: number;
    cy: number;
    r: number;
    dur: number;
}) => (
    <g>
        <circle cx={cx} cy={cy} r={r} />
        <g>
            <Spin on={on} at={[cx, cy]} dur={dur} reverse />
            <path
                d={`M ${cx - r} ${cy} H ${cx + r} M ${cx} ${cy - r} V ${cy + r} M ${cx - r * 0.7} ${cy - r * 0.7} L ${cx + r * 0.7} ${cy + r * 0.7} M ${cx - r * 0.7} ${cy + r * 0.7} L ${cx + r * 0.7} ${cy - r * 0.7}`}
                className={styles.cut}
            />
        </g>
    </g>
);

const Mill = ({ on }: { on: boolean }) => (
    <g>
        <path d="M 0 57.6 V 34 H 130 V 57.6" />
        <path d={repeat(5, 26, x => `M ${x} 34 L ${x} 24 L ${x + 26} 34`)} />
        <path
            d={repeat(5, 26, x => `M ${x + 2} 26.6 L ${x + 2} 32`)}
            className={styles.cut}
        />
        <path
            d={[40, 48]
                .map(y => repeat(8, 16, x => `M ${x + 6} ${y} h 6 v 4 h -6 Z`))
                .join(' ')}
            className={styles.cut}
        />
        <path d="M 18 34 V 6 H 26 V 34 M 98 34 V 12 H 105 V 34" />
        <path d="M 17 9 H 27 M 97 15 H 106" className={styles.cut} />
        {[0, 1.2, 2.4].map(b => (
            <Puff
                key={b}
                on={on}
                x={22}
                y={4}
                r={2.6}
                drift={[22, -10]}
                dur={3.6}
                begin={b}
            />
        ))}
        {[0.6, 2].map(b => (
            <Puff
                key={b}
                on={on}
                x={101.6}
                y={10}
                r={2.2}
                drift={[20, -10]}
                dur={3.2}
                begin={b}
            />
        ))}
    </g>
);

const Train = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={-0.4} dur={0.3} />
        {/* locomotive, chimney first */}
        <path d="M 8 34 H 44 V 48 H 8 Q 4 41 8 34 Z" className={styles.solid} />
        <path d="M 14 34 V 24 H 11 L 12 19 H 22 L 21 24 H 18 V 34 M 27 34 Q 31 28.6 35 34" />
        <path d="M 44 25 H 62 V 50 H 44 Z M 42 25 H 64" />
        <path d="M 49 29 h 8 v 7 h -8 Z" className={styles.cut} />
        <path d="M 4 50 H 64 M 2 56 L 8 50 M 5.4 56 L 11 50" />
        <Wheel on={on} cx={16} cy={53.2} r={4.4} dur={0.5} />
        <Wheel on={on} cx={31} cy={50} r={7.4} dur={0.85} />
        <Wheel on={on} cx={50} cy={50} r={7.4} dur={0.85} />
        <g transform="translate(0 4)">
            <Path
                on={on}
                points={['0 4', '4 0', '0 -4', '-4 0', '0 4']}
                times={[0, 0.25, 0.5, 0.75, 1]}
                dur={0.85}
                splined={false}
            />
            <path d="M 31 50 H 50" />
        </g>
        {[0, 0.5, 1, 1.5].map(b => (
            <Puff
                key={b}
                on={on}
                x={17}
                y={17}
                r={2.4}
                drift={[26, -12]}
                dur={2}
                begin={b}
            />
        ))}
        {/* two carriages */}
        {[70, 116].map(x => (
            <g key={x}>
                <path d={`M ${x - 6} 46 H ${x}`} />
                <path
                    d={`M ${x} 32 H ${x + 40} V 50 H ${x} Z M ${x - 2} 32 Q ${x + 20} 26.6 ${x + 42} 32`}
                />
                <path
                    d={repeat(
                        4,
                        9.6,
                        dx => `M ${x + 3 + dx} 35.6 h 6 v 6 h -6 Z`,
                    )}
                    className={styles.cut}
                />
                <Wheel on={on} cx={x + 7} cy={53.2} r={4.4} dur={0.5} />
                <Wheel on={on} cx={x + 33} cy={53.2} r={4.4} dur={0.5} />
            </g>
        ))}
    </g>
);

const Telegraph = () => (
    <g>
        <path d="M 10 57.6 V 14 M 5 17 H 15 M 6 21 H 14 M 90 57.6 V 14 M 85 17 H 95 M 86 21 H 94" />
        <path
            d="M -30 17 Q -10 24 10 17 Q 50 25 90 17 Q 108 22 124 18 M -30 21 Q -10 27 10 21 Q 50 28 90 21 Q 108 25 124 22"
            className={styles.cut}
        />
    </g>
);

const Blacksmith = ({ on }: { on: boolean }) => (
    <g>
        <path
            d="M -22 43 H -6 L -8 47 H -11 V 53 H -7 V 57.6 H -19 V 53 H -15 V 47 H -18 Z"
            className={styles.solid}
        />
        <Head />
        <Torso />
        <path d="M -3.4 30 H 3.6 L 4.6 46 H -5 Z" className={styles.solid} />
        <Walk on={false} />
        <Arm on={on} angles={[66, 0, 66]} dur={0.9}>
            <path d="M -4 23 L -9.4 31 L -12 36" />
            <path d="M -12 36 L -14 41 M -16.6 40 L -11.4 42.2" />
        </Arm>
        {[
            [-17, 39],
            [-12, 37.6],
            [-8, 39.6],
        ].map(([x, y], i) => (
            <circle
                key={i}
                cx={x}
                cy={y}
                r="0.8"
                className={styles.glow}
                opacity={on ? 0 : 0.6}
            >
                <Fade
                    on={on}
                    values={[0, 0, 1, 0]}
                    times={[0, 0.48, 0.52, 0.8]}
                    dur={0.9}
                />
            </circle>
        ))}
    </g>
);

const Steamer = ({ on }: { on: boolean }) => (
    <g>
        <g>
            <Bob on={on} by={1} dur={3.4} />
            <path
                d="M -44 45 Q -40 54 -26 54 H 40 Q 46 50 47 44 Z"
                className={styles.solid}
            />
            <path d="M -26 45 V 37 H 26 V 45" />
            <path
                d={repeat(6, 8, x => `M ${x - 22} 39.6 h 4 v 3 h -4 Z`)}
                className={styles.cut}
            />
            <path d="M -10 37 V 16 H -4 V 37 M 6 37 V 18 H 12 V 37" />
            <path d="M -11 19 H -3 M 5 21 H 13" className={styles.cut} />
            <path d="M 0 46 A 10 10 0 0 1 20 46" />
            <Wheel on={on} cx={10} cy={47} r={8} dur={1.6} />
            {[0, 1.1].map(b => (
                <Puff
                    key={b}
                    on={on}
                    x={-7}
                    y={14}
                    r={2.4}
                    drift={[20, -10]}
                    dur={2.4}
                    begin={b}
                />
            ))}
            {[0.5, 1.6].map(b => (
                <Puff
                    key={b}
                    on={on}
                    x={9}
                    y={16}
                    r={2.2}
                    drift={[18, -10]}
                    dur={2.4}
                    begin={b}
                />
            ))}
        </g>
        <path d={waves(-56, 58, 56.6)} className={styles.cut} />
    </g>
);

const Balloon = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={-3} x={2} dur={7} />
        <path
            d="M 0 2 C 10 2 12 12 4.4 21 H -4.4 C -12 12 -10 2 0 2 Z"
            className={styles.sail}
        />
        <path d="M 0 2 C 10 2 12 12 4.4 21 H -4.4 C -12 12 -10 2 0 2 Z" />
        <path
            d="M 0 2 V 21 M -5 3.6 Q -7 12 -2.4 21 M 5 3.6 Q 7 12 2.4 21"
            className={styles.cut}
        />
        <path d="M -4.4 21 L -2.6 27 M 4.4 21 L 2.6 27" />
        <path d="M -3 27 h 6 v 4 h -6 Z" className={styles.solid} />
    </g>
);

const Gentleman = ({ on }: { on: boolean }) => (
    <g>
        <Head>
            <path
                d="M -3.2 12.4 V 4.6 H 3.2 V 12.4 Z M -5 12.4 H 5"
                className={styles.solid}
            />
        </Head>
        <path d="M -4.6 22 H 4.6 L 4 40 H -5 Z" />
        <path d="M 0 22 V 40" className={styles.cut} />
        <Walk on={on} dur={1.5} />
        <Arm on={on} angles={[0, 12, 0]} dur={1.5}>
            <path d="M -4 23 L -7 32 M -7 32 L -10 57.4" />
        </Arm>
    </g>
);

const Lady = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={0.6} dur={0.75} />
        <Head>
            <path
                d="M -3.4 13 Q -3 8 1 8.6 Q 6 9 5 15 L 3 14 Z"
                className={styles.solid}
            />
        </Head>
        <path d="M -4 22 H 4 L 2.6 32 Q 12 36 8 56 H -7 Q -6 44 -2.6 32 Z" />
        <path d="M -3 40 H 9 M -5 48 H 9" className={styles.cut} />
        <path d="M -4 23 L -6 30 L -8 32" />
    </g>
);

const ClockTower = ({ on }: { on: boolean }) => (
    <g>
        <path d="M 0 57.6 V 14 H 26 V 57.6 M -2 14 H 28 M 0 14 L 13 1 L 26 14" />
        <circle cx="13" cy="22" r="6" />
        <g>
            <Spin on={on} at={[13, 22]} dur={24} />
            <path d="M 13 22 V 17.4" />
        </g>
        <g transform="rotate(120 13 22)">
            <Spin on={on} at={[13, 22]} dur={288} />
            <path d="M 13 22 V 19" />
        </g>
        <path
            d="M 8 36 h 4 v 8 h -4 Z M 14 36 h 4 v 8 h -4 Z M 10 50 h 6 v 7.6 h -6 Z"
            className={styles.cut}
        />
    </g>
);

const PennyFarthing = ({ on }: { on: boolean }) => (
    <g>
        <Wheel on={on} cx={-6} cy={42} r={15.4} dur={2} />
        <Wheel on={on} cx={17} cy={53.4} r={4.2} dur={0.55} />
        <path d="M -6 27 Q 8 26 17 50" />
        <g>
            <Bob on={on} by={-0.6} dur={0.5} />
            <Head cy={9}>
                <path
                    d="M -3.6 7 Q 0 3 3.6 7 Z M -4.8 7 H 2"
                    className={styles.solid}
                />
            </Head>
            <path d="M -4.4 15 H 4 L 1 26 H -3.4 Z" />
            <path d="M -3 17 L -8 23 L -9 26" />
        </g>
        <g>
            <Swing on={on} pivot={[-2, 26]} angles={[-16, 18, -16]} dur={1} />
            <path d="M -2 26 L -9 33 L -6 42" />
        </g>
        <g>
            <Swing on={on} pivot={[-2, 26]} angles={[18, -16, 18]} dur={1} />
            <path d="M -2 26 L -6 34 L -6 42" />
        </g>
    </g>
);

const Rails = () => (
    <g className={styles.ground}>
        <path d={`M 0 58.2 H ${TILE_W}`} />
        <path
            d={repeat(120, 8, x => `M ${x + 2} 59 V 62`)}
            className={styles.cut}
        />
    </g>
);

export const Industry = ({ on }: SceneProps) => (
    <g>
        <Mill on={on} />
        {at(158, <Train on={on} />, 'train')}
        {at(330, <Telegraph />, 'wire')}
        {at(504, <Blacksmith on={on} />, 'smith')}
        {at(568, <Steamer on={on} />, 'steamer')}
        {at(664, <Balloon on={on} />, 'balloon')}
        {at(702, <Gentleman on={on} />, 'gent')}
        {at(726, <Lady on={on} />, 'lady')}
        {at(770, <ClockTower on={on} />, 'clock')}
        {at(832, <Gentleman on={on} />, 'gent2')}
        {at(880, <PennyFarthing on={on} />, 'bike')}
        <Rails />
    </g>
);
