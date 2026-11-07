import {
    Arm,
    Bob,
    Head,
    Robe,
    Swing,
    TILE_W,
    Walk,
    at,
    repeat,
    styles,
    waves,
    type SceneProps,
} from './kit';

/*
 * Classical Greece, c. 450 BCE, in the manner of black-figure pottery:
 * athletes as solid silhouettes, a temple, a trireme under oar and sail,
 * a philosopher mid-argument, and a Greek key running along the ground.
 */

const Temple = () => (
    <g>
        <path d="M 18 57.6 H 132 M 21 55 H 129 M 24 52.4 H 126" />
        {[33, 50, 67, 84, 101, 118].map(cx => (
            <g key={cx}>
                <path
                    d={`M ${cx - 2.2} 52.4 V 23.4 M ${cx + 2.2} 52.4 V 23.4 M ${cx - 3.6} 23.2 H ${cx + 3.6}`}
                />
                <path d={`M ${cx} 51 V 25`} className={styles.cut} />
            </g>
        ))}
        <path d="M 24 23 H 126 V 18 H 24 Z" />
        <path
            d={repeat(16, 6.4, x => `M ${27 + x} 18.6 V 22.4`)}
            className={styles.cut}
        />
        <path d="M 22 18 L 75 6 L 128 18" />
        <path d="M 36 16.4 L 75 8.4 L 114 16.4 Z" className={styles.cut} />
        <circle cx="75" cy="13" r="1.6" className={styles.solid} />
    </g>
);

/** Seated listener, chin on hand. Faces left unless flipped. */
const Listener = () => (
    <g>
        <Head cy={25} />
        <path d="M -4.6 31 H 4.6 L 2.4 44 H -2.4 Z" />
        <path d="M -2.4 44 H -10 L -11 57.6 H -14.4" />
        <path d="M 0 44 V 57.6 M 7 44 V 57.6 M -2 44 H 9" />
        <path d="M -4 32 L -7 39 L -4.4 29.4" />
    </g>
);

const Philosopher = ({ on }: { on: boolean }) => (
    <g>
        <Head>
            <path d="M -3 17.4 Q -1 21.6 2 18.4" className={styles.solid} />
        </Head>
        <Robe />
        <path d="M -4.6 22 L 4 34" className={styles.cut} />
        <Arm on={on} angles={[6, 40, 14, 6]} dur={5}>
            <path d="M -4 23 L -9 30 L -14 27" />
        </Arm>
        <path d="M 4 23 L 6 32" />
        <path d="M 3 32 h 7 v 3.4 h -7 Z" className={styles.solid} />
    </g>
);

/** A runner from a prize amphora, at full stride. */
const Runner = ({ on, phase = 0 }: { on: boolean; phase?: number }) => (
    <g>
        <Bob on={on} by={-1.6} dur={0.35} begin={`${-phase}s`} />
        <g transform="rotate(-10 0 42)">
            <Head />
            <path
                d="M -4.6 22 H 4.6 L 2.6 36 L 3 42 H -3 L -2.6 36 Z"
                className={styles.solid}
            />
            <Arm on={on} angles={[-50, 40, -50]} dur={0.7} begin={`${-phase}s`}>
                <path d="M -4 23 L -8 30 L -12 28" />
            </Arm>
            <Arm
                on={on}
                from={[4, 23]}
                angles={[40, -50, 40]}
                dur={0.7}
                begin={`${-phase}s`}
            >
                <path d="M 4 23 L 0 31 L -3 33" />
            </Arm>
            <Walk on={on} phase={phase} dur={0.7} reach={[34, -30]} />
        </g>
    </g>
);

const DiscusThrower = ({ on }: { on: boolean }) => (
    <g>
        <Head />
        <path
            d="M -4.6 22 H 4.6 L 2.6 36 L 3 42 H -3 L -2.6 36 Z"
            className={styles.solid}
        />
        <g transform="rotate(16 0 42)">
            <path d="M 0 42 L -2 57.6 L -5.4 57.6" />
        </g>
        <g transform="rotate(-18 0 42)">
            <path d="M 0 42 L 2 50 L 0 57.6 L -3 57.6" />
        </g>
        <path d="M -4 23 L -10 27 L -13 24" />
        <Arm on={on} from={[4, 23]} angles={[50, -110, 50]} dur={3}>
            <path d="M 4 23 L 12 29" />
            <ellipse
                cx="13.6"
                cy="30"
                rx="2.6"
                ry="1.6"
                className={styles.solid}
            />
        </Arm>
    </g>
);

const Amphora = () => (
    <g>
        <path
            d="M -3 32 H 3 V 35 Q 8 37 7 44 Q 6 51 2 54 L 3 57.6 H -3 L -2 54 Q -6 51 -7 44 Q -8 37 -3 35 Z"
            className={styles.solid}
        />
        <path d="M -3 34 Q -8.6 33 -6.8 39.4 M 3 34 Q 8.6 33 6.8 39.4" />
    </g>
);

const Trireme = ({ on }: { on: boolean }) => (
    <g>
        <g>
            <Bob on={on} by={1} dur={3.2} />
            <path
                d="M -60 50 L -54 46.6 Q -10 49 52 45 Q 58 42 60 34 Q 62 46 50 52 Q 0 55.4 -50 53 Z"
                className={styles.solid}
            />
            <path d="M -60 50 L -68 51.2 L -60 52.4" />
            <path d="M -54 46 Q 0 47.4 52 43.6" className={styles.cut} />
            <path d="M 0 46 V 13 M -17 15 H 17" />
            <path
                d="M -16 15.6 H 16 Q 13.6 27 16 38 H -16 Q -13.6 27 -16 15.6 Z"
                className={styles.sail}
            />
            {/* the oars sweep together; the skew pivots them at the hull */}
            <g transform="translate(0 51)">
                <g>
                    {on ? (
                        <animateTransform
                            attributeName="transform"
                            type="skewX"
                            values="-16;18;-16"
                            dur="2.2s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                        />
                    ) : null}
                    <path
                        d={repeat(11, 8, x => `M ${-42 + x} 0 L ${-44 + x} 8`)}
                    />
                </g>
            </g>
        </g>
        <path d={waves(-74, 70, 56.6)} className={styles.cut} />
    </g>
);

const OliveTree = ({ on }: { on: boolean }) => (
    <g>
        <path d="M 0 57.6 Q -3 48 1 42 Q 4 36 -1 30 M 0 40 Q 6 36 9 31" />
        <g>
            <Swing on={on} pivot={[0, 40]} angles={[-2, 2.4, -2]} dur={6} />
            <ellipse cx="-6" cy="26" rx="7" ry="4" className={styles.solid} />
            <ellipse cx="4" cy="21" rx="8" ry="4.4" className={styles.solid} />
            <ellipse cx="11" cy="29" rx="6" ry="3.4" className={styles.solid} />
            <ellipse cx="-3" cy="17" rx="5" ry="3" className={styles.solid} />
        </g>
    </g>
);

/** Potter at a kick wheel, shaping a vase. */
const Potter = ({ on }: { on: boolean }) => (
    <g>
        {/* the wheel and the vase on it */}
        <path d="M -24 47 H -8 M -16 47 V 57.6 M -21 57.6 H -11" />
        <path
            d="M -19 47 Q -22 41 -18 36.6 H -14 Q -10 41 -13 47 Z"
            className={styles.solid}
        />
        <g>
            <Bob on={on} by={0} x={5} dur={0.5} />
            <path d="M -19 42 h 1.6" />
        </g>
        <Head cy={25} />
        <path d="M -4.6 31 H 4.6 L 2.4 44 H -2.4 Z" />
        <path d="M -2.4 44 H -6 L -7 57.6 H -10" />
        <path d="M 0 44 V 57.6 M 6 44 V 57.6 M -2 44 H 8" />
        <g>
            <Bob on={on} by={1} dur={1.4} />
            <path d="M -4 32 L -10 37 L -12.6 40 M -3 33 L -9 39.6 L -11 43" />
        </g>
    </g>
);

const Hoplite = ({ on, phase = 0 }: { on: boolean; phase?: number }) => (
    <g>
        <Head>
            <path d="M -3 11.6 Q 2 4.6 7 11" className={styles.solid} />
        </Head>
        <path d="M -4.6 22 H 4.6 L 2.4 36 H -2.4 Z" />
        <path d="M -3 34.6 H 3.2 L 5 42 H -6 Z" />
        <Walk on={on} phase={phase} />
        <path d="M 5 4 V 52 M 3.8 4.4 L 5 0.6 L 6.2 4.4" />
        <path d="M 4 23 L 5 30" />
        <circle cx="-5" cy="30" r="7.4" className={styles.solid} />
        <circle cx="-5" cy="30" r="3" className={styles.cut} />
    </g>
);

const AulosPlayer = ({ on }: { on: boolean }) => (
    <g>
        <g>
            <Bob on={on} by={0.8} dur={1} />
            <Head />
            <path d="M -3.6 16.4 L -12 26 M -3.6 16.8 L -13.4 23" />
            <path d="M -4 23 L -8 26 L -10.6 24.6 M 4 23 L -2 28 L -7 21.6" />
        </g>
        <Robe />
    </g>
);

const Dancer = ({ on }: { on: boolean }) => (
    <g>
        <g>
            <Bob on={on} by={-1.4} dur={0.9} />
            <Head />
            <Arm on={on} angles={[20, 110, 20]} dur={1.8}>
                <path d="M -4 23 L -10 27 L -14 25" />
            </Arm>
            <Arm on={on} from={[4, 23]} angles={[-20, -110, -20]} dur={1.8}>
                <path d="M 4 23 L 10 27 L 13 24" />
            </Arm>
        </g>
        <g>
            <Swing on={on} pivot={[0, 22]} angles={[-5, 5, -5]} dur={1.8} />
            <path d="M -4.6 22 H 4.6 L 9 50 Q 0 53 -10 50 Z" />
            <path d="M -2 30 L -5 50 M 2 30 L 4 50" className={styles.cut} />
        </g>
        <path d="M -3 50 L -2 57.6 L -5 57.6 M 3 50 L 4 57.6 L 1 57.6" />
    </g>
);

const Owl = () => (
    <g>
        <ellipse cx="0" cy="9" rx="3.6" ry="4.6" />
        <path d="M -3 5 L -3.4 2.6 L -1.4 4.4 M 3 5 L 3.4 2.6 L 1.4 4.4" />
        <circle cx="-1.4" cy="6.6" r="0.9" className={styles.solid} />
        <circle cx="1.4" cy="6.6" r="0.9" className={styles.solid} />
        <path d="M -2 13.6 L -2 15 M 2 13.6 L 2 15" />
    </g>
);

const Ruins = () => (
    <g>
        <path d="M 0 57.6 H 52 M 3 55 H 49" />
        <path d="M 10 55 V 22.4 M 14.4 55 V 22.4 M 8.6 22.2 H 15.8 M 7 18 H 17.4 V 22.2" />
        <path d="M 12.2 54 V 24" className={styles.cut} />
        <path d="M 34 55 V 37 L 36 35 L 37.4 37.6 L 38.4 35.4 V 55" />
        <path d="M 36.2 54 V 38" className={styles.cut} />
        <path d="M 42 57.6 V 53 H 52 V 57.6" />
    </g>
);

/** A Greek key along the ground. */
const Meander = () => (
    <g className={styles.ground}>
        <path d={`M 0 58.4 H ${TILE_W} M 0 63.6 H ${TILE_W}`} />
        <path
            d={repeat(
                120,
                8,
                x =>
                    `M ${x + 1} 62.8 V 59.4 H ${x + 7} V 62 H ${x + 3.6} V 60.6`,
            )}
            className={styles.cut}
        />
    </g>
);

export const Greece = ({ on }: SceneProps) => (
    <g>
        <Temple />
        {at(160, <Philosopher on={on} />, 'philo')}
        {at(186, <Listener />, 'listen', { flip: true })}
        {at(226, <Runner on={on} />, 'run1')}
        {at(256, <Runner on={on} phase={0.24} />, 'run2')}
        {at(286, <Runner on={on} phase={0.46} />, 'run3')}
        {at(334, <DiscusThrower on={on} />, 'discus')}
        {at(376, <Amphora />, 'amph1')}
        {at(394, <Amphora />, 'amph2', { y: 11.5, scale: 0.8 })}
        {at(490, <Trireme on={on} />, 'ship')}
        {at(600, <OliveTree on={on} />, 'olive')}
        {at(660, <Potter on={on} />, 'potter')}
        {at(712, <Hoplite on={on} />, 'hop1')}
        {at(740, <Hoplite on={on} />, 'hop2')}
        {at(796, <AulosPlayer on={on} />, 'aulos')}
        {at(826, <Dancer on={on} />, 'dance')}
        {at(866, <Owl />, 'owl')}
        {at(896, <Ruins />, 'ruins')}
        <Meander />
    </g>
);
