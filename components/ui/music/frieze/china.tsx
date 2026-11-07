import {
    Arm,
    Bob,
    Ground,
    Head,
    Robe,
    Stand,
    Swing,
    Torso,
    Tunic,
    Walk,
    at,
    quad,
    repeat,
    styles,
    waves,
    type SceneProps,
} from './kit';

/*
 * Tang China, c. 700: the Great Wall riding a ridge, a pagoda, a scholar
 * painting, rice planted in flooded fields, a kite on the wind, a junk
 * under battened sails, and an arched bridge with a willow and a lantern.
 */

const HILL: [[number, number], [number, number], [number, number]] = [
    [0, 57.6],
    [96, 12],
    [232, 57.6],
];

const GreatWall = () => {
    const top = HILL.map(
        ([x, y]) => [x, y - 6] as [number, number],
    ) as typeof HILL;
    const merlons = Array.from({ length: 30 }, (_, i) => {
        const [x, y] = quad(top[0], top[1], top[2], 0.02 + i * 0.033);
        return `M ${x.toFixed(1)} ${y.toFixed(1)} v -2.2 h 2.4 v 2.2`;
    }).join(' ');
    const tower = (t: number) => {
        const [x, y] = quad(top[0], top[1], top[2], t);
        return (
            <g key={t} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                <path d="M -6 2 V -10 H 6 V 2" />
                <path d="M -9 -10 Q -6 -10.6 -5 -13 H 5 Q 6 -10.6 9 -10" />
                <path d="M -1.6 -2 V -6 H 1.6 V -2" className={styles.cut} />
            </g>
        );
    };
    return (
        <g>
            <path d="M 0 57.6 Q 46 38 104 57.6" className={styles.cut} />
            <path
                d={`M ${HILL[0].join(' ')} Q ${HILL[1].join(' ')} ${HILL[2].join(' ')}`}
            />
            <path
                d={`M ${top[0].join(' ')} Q ${top[1].join(' ')} ${top[2].join(' ')}`}
            />
            <path d={merlons} className={styles.cut} />
            {tower(0.28)}
            {tower(0.74)}
        </g>
    );
};

const Pagoda = () => {
    const tiers = [28, 24, 20, 16, 12];
    return (
        <g>
            {tiers.map((w, i) => {
                const bottom = 57.6 - i * 8;
                const top = bottom - 8;
                const half = w / 2;
                return (
                    <g key={w}>
                        <path
                            d={`M ${-half + 3} ${bottom} V ${top + 1.4} M ${half - 3} ${bottom} V ${top + 1.4}`}
                        />
                        <path
                            d={`M ${-half - 3} ${top - 0.6} Q ${-half} ${top + 2} ${-half + 2} ${top + 1.4} H ${half - 2} Q ${half} ${top + 2} ${half + 3} ${top - 0.6}`}
                        />
                        <path
                            d={`M -1.6 ${bottom} V ${bottom - 4.6} H 1.6 V ${bottom}`}
                            className={styles.cut}
                        />
                    </g>
                );
            })}
            <path d="M 0 17.6 V 8 M -2 14 H 2 M -1.6 11 H 1.6" />
        </g>
    );
};

const Scholar = ({ on }: { on: boolean }) => (
    <g>
        <path d="M -24 46 H -8 M -22 46 V 57.6 M -10 46 V 57.6" />
        <path d="M -23 44.8 H -12" className={styles.cut} />
        <Head cy={25}>
            <circle cx="1" cy="20.6" r="1.4" className={styles.solid} />
        </Head>
        <path d="M -4.6 31 H 4.6 L 8 52 Q 0 54 -10 52 Z" />
        <path d="M 0 36 L -2 51" className={styles.cut} />
        <path d="M -12 57.6 H 12" className={styles.cut} />
        <Arm on={on} from={[-4, 32]} angles={[0, 8, -4, 0]} dur={1.6}>
            <path d="M -4 32 L -10 38 L -14 41 L -15.4 45" />
        </Arm>
    </g>
);

const Bamboo = ({ on }: { on: boolean }) => (
    <g>
        {[
            [0, 8, 0],
            [7, 14, 1.2],
            [14, 5, 2.1],
        ].map(([x, top, delay]) => (
            <g key={x}>
                <Swing
                    on={on}
                    pivot={[x, 57.6]}
                    angles={[-2, 2, -2]}
                    dur={4.6}
                    begin={`${-delay}s`}
                />
                <path d={`M ${x} 57.6 V ${top}`} />
                <path
                    d={repeat(5, 9, y => `M ${x - 1} ${50 - y} h 2`)}
                    className={styles.cut}
                />
                <path
                    d={`M ${x} ${top + 6} q -5 -1 -8 2 M ${x} ${top + 12} q 5 -1 8 2 M ${x} ${top + 2} q 4 -4 7 -3`}
                />
            </g>
        ))}
    </g>
);

const RicePlanter = ({ on, delay = 0 }: { on: boolean; delay?: number }) => (
    <g>
        <g>
            <Swing
                on={on}
                pivot={[0, 38]}
                angles={[-14, -48, -48, -14]}
                dur={3.4}
                begin={`${-delay}s`}
            />
            <Head>
                <path d="M -9 13.4 L 0 7 L 9 13.4 Z" className={styles.solid} />
            </Head>
            <Torso top={22} hip={38} />
            <path d="M -4 23 L -7 31 L -9 35" />
        </g>
        <path d="M -3 37 H 3.2 L 4.6 44 H -5.4 Z" />
        <Stand />
        <path d={waves(-14, 14, 51.6, 1)} className={styles.cut} />
    </g>
);

const Seedlings = () => (
    <path
        d={repeat(7, 7, x => `M ${x} 52 l -1.4 -3.6 M ${x} 52 l 1.4 -3.6`)}
        className={styles.cut}
    />
);

const KiteFlier = ({ on }: { on: boolean }) => (
    <g>
        <Head />
        <Robe />
        <path d="M 4 23 L 6 31" />
        <path d="M -4 23 L -7 18 L -8 14" />
        <g>
            <Swing on={on} pivot={[-8, 14]} angles={[-3, 5, -3]} dur={4} />
            <path d="M -8 14 Q 12 12 34 8" className={styles.cut} />
            <g transform="translate(34 7)">
                <Swing
                    on={on}
                    pivot={[0, 0]}
                    angles={[-10, 10, -10]}
                    dur={2.2}
                />
                <path
                    d="M 0 -6 L 4.6 0 L 0 6 L -4.6 0 Z"
                    className={styles.solid}
                />
                <path
                    d="M 0 6 q -2.4 3 0 5.4 q 2.4 3 0 5.4"
                    className={styles.cut}
                />
            </g>
        </g>
    </g>
);

const Junk = ({ on }: { on: boolean }) => (
    <g>
        <g>
            <Bob on={on} by={1.2} dur={3.6} />
            <path
                d="M -40 44 Q -36 54 -20 54 H 26 Q 36 54 42 38 L 30 45 H -32 Z"
                className={styles.solid}
            />
            <path d="M -11 45 V 12 M 15 45 V 8" />
            {[
                [-26, 15, -2],
                [1, 11, 27],
            ].map(([x0, top, x1]) => (
                <g key={x0}>
                    <path
                        d={`M ${x0} ${top} H ${x1} L ${x1 + 2} 42 H ${x0} Z`}
                        className={styles.sail}
                    />
                    <path
                        d={`M ${x0} ${top} H ${x1} L ${x1 + 2} 42 H ${x0} Z`}
                    />
                    <path
                        d={repeat(
                            5,
                            5.4,
                            y =>
                                `M ${x0} ${top + 5 + y} H ${x1 + 0.4 + y / 14}`,
                        )}
                        className={styles.cut}
                    />
                </g>
            ))}
        </g>
        <path d={waves(-52, 52, 56.4)} className={styles.cut} />
    </g>
);

const Porter = ({ on, phase = 0 }: { on: boolean; phase?: number }) => (
    <g>
        <Head>
            <path d="M -7 13.6 L 0 8.4 L 7 13.6 Z" className={styles.solid} />
        </Head>
        <Torso />
        <Tunic />
        <Walk on={on} phase={phase} />
        <g>
            <Bob on={on} by={1.4} dur={0.8} begin={`${-phase}s`} />
            <path d="M -16 22.6 Q 0 19.6 16 22.6" />
            <path
                d="M -14 22.4 L -17 32 M -14 22.4 L -11 32 M 14 22.4 L 11 32 M 14 22.4 L 17 32"
                className={styles.cut}
            />
            <path
                d="M -18 32 H -10 L -11 38 H -17 Z M 10 32 H 18 L 17 38 H 11 Z"
                className={styles.solid}
            />
            <path d="M -4.4 23 L -9 25 L -12 22" />
        </g>
    </g>
);

const ParasolLady = ({ on, phase = 0 }: { on: boolean; phase?: number }) => (
    <g>
        <g>
            <Bob on={on} by={0.8} dur={1.4} begin={`${-phase}s`} />
            <Head>
                <path d="M 1.6 12 Q 5 10 4 15" className={styles.solid} />
            </Head>
            <path d="M -11 11 Q 0 1 11 11 Z" className={styles.solid} />
            <path d="M 0 11 V 28 M 0 28 L -4 25" />
        </g>
        <path d="M -4.6 22 H 4.6 L 6.6 56 Q 0 57.8 -7.4 56 Z" />
        <path d="M -3 26 L -6 50 M 2 26 L 3.6 52" className={styles.cut} />
        <path d="M -5.4 56 L -8 57.6" />
    </g>
);

const Bridge = ({ on }: { on: boolean }) => {
    const posts = Array.from({ length: 9 }, (_, i) => {
        const [x, y] = quad([6, 53], [60, 21], [114, 53], 0.1 + i * 0.1);
        return `M ${x.toFixed(1)} ${(y + 4.6).toFixed(1)} V ${y.toFixed(1)}`;
    }).join(' ');
    return (
        <g>
            <path d="M 0 57.6 Q 60 26 120 57.6" />
            <path d="M 6 53 Q 60 21 114 53" />
            <path d={posts} className={styles.cut} />
            <path d="M 34 57.6 Q 60 30 86 57.6" />
            <path d={waves(30, 92, 57)} className={styles.cut} />
            {at(60, <ParasolLady on={on} phase={0.3} />, 'crossing', {
                y: -1.4,
                scale: 0.75,
            })}
        </g>
    );
};

const Willow = ({ on }: { on: boolean }) => (
    <g>
        <path d="M 0 57.6 Q -2 40 2 26 Q 4 18 -2 12 M 1 30 Q 8 22 14 20" />
        <g>
            <Swing on={on} pivot={[0, 14]} angles={[-3, 3, -3]} dur={5} />
            <path
                d="M -2 12 Q -12 14 -14 34 M -2 12 Q -9 16 -10 42 M -2 12 Q -6 18 -6 46 M 0 14 Q 4 22 3 38 M 4 18 Q 7 26 6 46 M 14 20 Q 20 26 19 42 M 10 22 Q 13 30 12 48 M 14 20 Q 24 22 24 36 M -2 12 Q 6 8 14 20 M -2 12 Q -14 8 -18 26"
                className={styles.cut}
            />
        </g>
        {/* a lantern hanging from the branch */}
        <g>
            <Swing on={on} pivot={[8, 22]} angles={[-8, 8, -8]} dur={3} />
            <path d="M 8 22 V 27" className={styles.cut} />
            <ellipse
                cx="8"
                cy="30.6"
                rx="3"
                ry="3.6"
                className={styles.solid}
            />
            <path d="M 6.4 34.4 H 9.6 M 8 34.4 V 37" />
        </g>
    </g>
);

const Cloud = () => (
    <path
        d="M 0 8 q 0 -4.4 4 -4 q 1 -3.4 5 -2 q 3 -2.6 6 0.6 q 3.6 0 3 3.4 q 0 2 -3 2 H 2 q -2 0 -2 0 Z M 4.4 6 q 1.6 -1.6 3 0"
        className={styles.cut}
    />
);

export const China = ({ on }: SceneProps) => (
    <g>
        <GreatWall />
        {at(272, <Pagoda />, 'pagoda')}
        {at(324, <Scholar on={on} />, 'scholar')}
        {at(348, <Bamboo on={on} />, 'bamboo')}
        {at(396, <RicePlanter on={on} />, 'rice1')}
        {at(408, <Seedlings />, 'seed')}
        {at(456, <RicePlanter on={on} delay={1.4} />, 'rice2')}
        {at(500, <KiteFlier on={on} />, 'kite')}
        {at(608, <Junk on={on} />, 'junk')}
        {at(556, <Cloud />, 'cloud1')}
        {at(674, <Porter on={on} />, 'porter')}
        {at(708, <ParasolLady on={on} phase={0.7} />, 'lady')}
        {at(740, <Bridge on={on} />, 'bridge')}
        {at(900, <Willow on={on} />, 'willow')}
        {at(870, <Cloud />, 'cloud2', { y: 2 })}
        <Ground double={false} />
    </g>
);
