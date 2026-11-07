import {
    Arm,
    Bob,
    Fade,
    GROUND,
    Head,
    Path,
    Spin,
    Torso,
    Walk,
    at,
    repeat,
    styles,
    waves,
    type SceneProps,
} from './kit';

/*
 * Today: a city skyline, someone shipping code on a laptop, a phone walker
 * and a runner, a crowd of one pointing at the sky, and out at sea a booster
 * coming back from space, firing its engine, unfolding its legs and landing
 * upright on a drone ship. Wind turbines and solar panels close the scene.
 */

const SEA_FROM = 336;
const SEA_TO = 716;

const BUILDINGS: [number, number, number][] = [
    [0, 18, 30],
    [20, 14, 42],
    [36, 20, 24],
    [58, 12, 50],
    [72, 22, 34],
    [96, 16, 40],
    [114, 24, 28],
    [140, 14, 46],
    [156, 16, 22],
];

const Skyline = ({ on }: { on: boolean }) => (
    <g>
        {BUILDINGS.map(([x, w, h]) => {
            const top = 57.6 - h;
            const rows = Math.floor((h - 6) / 5);
            const cols = Math.floor((w - 4) / 4);
            return (
                <g key={x}>
                    <path d={`M ${x} 57.6 V ${top} H ${x + w} V 57.6`} />
                    <path
                        d={Array.from({ length: rows }, (_, r) =>
                            repeat(
                                cols,
                                4,
                                dx =>
                                    `M ${x + 3 + dx} ${top + 4 + r * 5} h 1.4`,
                            ),
                        ).join(' ')}
                        className={styles.cut}
                    />
                </g>
            );
        })}
        <path d="M 64 7.6 V 1.6" />
        <circle cx="64" cy="1.6" r="1.2" className={styles.glow}>
            <Fade on={on} values={[1, 0.15, 1]} dur={2} />
        </circle>
    </g>
);

const Coder = ({ on }: { on: boolean }) => (
    <g>
        <path d="M -24 44 H -6 M -22 44 V 57.6 M -8 44 V 57.6" />
        <path d="M -20 43.4 H -11 M -20 43.4 L -22.6 35.6" />
        <path d="M -21.6 37 L -20 42" className={styles.glow} opacity="0.4" />
        <Head cy={25} />
        <path d="M -4.6 31 H 4.6 L 2.4 44 H -2.4 Z" />
        <path d="M -2.4 44 H -10 L -11 57.6 H -14.4" />
        <path d="M 1 44 V 57.6 M 8 44 V 57.6 M -1 44 H 9 M 8 44 V 30" />
        <g>
            <Bob on={on} by={-1} dur={0.3} />
            <path d="M -4 32 L -9 39 L -14 42" />
        </g>
        <g>
            <Bob on={on} by={-1} dur={0.3} begin="-0.15s" />
            <path d="M 3 32 L -5 40 L -11 42.4" />
        </g>
    </g>
);

const PhoneWalker = ({ on }: { on: boolean }) => (
    <g>
        <g transform="rotate(-8 0 18)">
            <Head />
        </g>
        <Torso hip={38} />
        <path d="M -2.4 38 H 2.4 L 3 42 H -3 Z" />
        <Walk on={on} dur={1.7} />
        <path d="M -4 23 L -6 31 L -9 26" />
        <path d="M -10.6 21.4 h 2.6 v 4.4 h -2.6 Z" className={styles.solid} />
        <path d="M 4 23 L 6 32" />
    </g>
);

const Runner = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={-1.4} dur={0.36} />
        <g transform="rotate(-8 0 42)">
            <Head>
                <path d="M -3.6 13 Q 0 9 3.8 12.6" className={styles.cut} />
            </Head>
            <Torso hip={38} />
            <path d="M -2.4 38 H 2.4 L 3 42 H -3 Z" />
            <Arm on={on} angles={[-40, 30, -40]} dur={0.72}>
                <path d="M -4 23 L -6 30 L -11 28" />
            </Arm>
            <Arm on={on} from={[4, 23]} angles={[30, -40, 30]} dur={0.72}>
                <path d="M 4 23 L 2 30 L -3 29" />
            </Arm>
            <Walk on={on} dur={0.72} reach={[32, -28]} />
        </g>
    </g>
);

/** Faces right, pointing up at the landing. */
const Watcher = ({ on }: { on: boolean }) => (
    <g>
        <Head />
        <Torso hip={38} />
        <path d="M -2.4 38 H 2.4 L 3 42 H -3 Z" />
        <g>
            <g transform="rotate(10 0 42)">
                <path d="M 0 42 L 0 57.6 L -3.4 57.6" />
            </g>
            <g transform="rotate(-4 0 42)">
                <path d="M 0 42 L 0 57.6 L -3.4 57.6" />
            </g>
        </g>
        <Arm on={on} angles={[0, -6, 0]} dur={2.4}>
            <path d="M -4 23 L -10 16 L -14 9" />
        </Arm>
        <path d="M 4 23 L 6 32" />
    </g>
);

/*
 * The landing loop, in fractions of LANDING seconds: the booster drops in
 * from above, lights its landing burn, deploys its legs, touches down, cuts
 * the engine, sits for a while, then fades for the next one.
 */
const LANDING = 16;
const DECK = 51.4;
const LEG_REACH = 5.5;

const Booster = ({ on, begin }: { on: boolean; begin: string }) => {
    const leg = (side: 1 | -1) => (
        <g transform={`rotate(${side * 140} ${side * 2.5} -3)`}>
            {on ? (
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values={`0 ${side * 2.5} -3;0 ${side * 2.5} -3;${side * 140} ${side * 2.5} -3;${side * 140} ${side * 2.5} -3`}
                    keyTimes="0;0.47;0.55;1"
                    dur={`${LANDING}s`}
                    begin={begin}
                    repeatCount="indefinite"
                />
            ) : null}
            <path d={`M ${side * 2.5} -3 L ${side * 2.5} -15`} />
        </g>
    );

    return (
        <g transform={`translate(0 ${DECK - LEG_REACH})`}>
            <g>
                <Path
                    on={on}
                    points={['0 -66', '0 -66', '0 -12', '0 0', '0 0']}
                    times={[0, 0.06, 0.48, 0.6, 1]}
                    dur={LANDING}
                    begin={begin}
                />
                <Fade
                    on={on}
                    values={[1, 1, 0, 0]}
                    times={[0, 0.9, 0.97, 1]}
                    dur={LANDING}
                    begin={begin}
                />
                {/* landing burn */}
                <g opacity="0">
                    <Fade
                        on={on}
                        values={[0, 0, 1, 1, 0, 0]}
                        times={[0, 0.3, 0.32, 0.6, 0.61, 1]}
                        dur={LANDING}
                        begin={begin}
                    />
                    <g>
                        {on ? (
                            <animateTransform
                                attributeName="transform"
                                type="scale"
                                values="1 1;1 1.5;1 0.9;1 1.3;1 1"
                                dur="0.24s"
                                repeatCount="indefinite"
                            />
                        ) : null}
                        <path
                            d="M -2.2 0 Q 0 11 2.2 0 Z"
                            className={styles.glow}
                        />
                        <path d="M -1.4 0 Q 0 6 1.4 0" className={styles.cut} />
                    </g>
                </g>
                {leg(-1)}
                {leg(1)}
                <path d="M -2.5 -2 V -40 Q 0 -41 2.5 -40 V -2 Z" />
                <path
                    d="M -2.5 -40 H 2.5 V -35 H -2.5 Z"
                    className={styles.solid}
                />
                <path d="M -2.5 -2 L -3.2 0 H 3.2 L 2.5 -2" />
                <path d="M -2.5 -37 h -2.6 M 2.5 -37 h 2.6" />
                <path d="M 0 -32 V -6" className={styles.cut} />
            </g>
        </g>
    );
};

/** Steam thrown up off the deck at touchdown. */
const Touchdown = ({ on, begin }: { on: boolean; begin: string }) =>
    on ? (
        <g>
            {[-1, 1].map(side => (
                <circle
                    key={side}
                    cx={side * 6}
                    cy={DECK - 2}
                    r="2"
                    className={styles.smoke}
                    opacity="0"
                >
                    <animate
                        attributeName="opacity"
                        values="0;0;1;0;0"
                        keyTimes="0;0.56;0.6;0.78;1"
                        dur={`${LANDING}s`}
                        begin={begin}
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="r"
                        values="2;2;3;7;7"
                        keyTimes="0;0.56;0.6;0.78;1"
                        dur={`${LANDING}s`}
                        begin={begin}
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="cx"
                        values={`${side * 6};${side * 6};${side * 8};${side * 18};${side * 18}`}
                        keyTimes="0;0.56;0.6;0.78;1"
                        dur={`${LANDING}s`}
                        begin={begin}
                        repeatCount="indefinite"
                    />
                </circle>
            ))}
        </g>
    ) : null;

const DroneShip = ({ on, copy }: { on: boolean; copy: number }) => {
    const begin = `${-copy * 5.3}s`;
    return (
        <g>
            <g>
                <Bob on={on} by={0.6} dur={4.2} />
                <path
                    d="M -34 52 H 34 L 30 57.4 H -30 Z"
                    className={styles.solid}
                />
                <path d="M -37 51.6 H 37" />
                <path d="M -33 51.6 V 47.6 H -27 V 51.6 M 27 51.6 V 46.6 H 33 V 51.6" />
                <ellipse
                    cx="0"
                    cy="51"
                    rx="10"
                    ry="0.9"
                    className={styles.cut}
                />
                <Touchdown on={on} begin={begin} />
                <Booster on={on} begin={begin} />
            </g>
        </g>
    );
};

const Freighter = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={0.8} dur={5} />
        <path d="M -32 50 H 30 L 26 57 H -28 Z" className={styles.solid} />
        <path d="M -32 50 L -36 48" />
        <path d="M -26 50 V 44 H -2 V 50 M -24 44 V 39 H -6 V 44 M -2 50 V 45 H 16 V 50" />
        <path
            d="M -20 44 V 50 M -14 44 V 50 M -8 44 V 50 M -18 39 V 44 M -12 39 V 44 M 4 45 V 50 M 10 45 V 50"
            className={styles.cut}
        />
        <path d="M 18 50 V 38 H 26 V 50 M 21 38 V 34" />
        <path d="M 20 41 h 4" className={styles.cut} />
    </g>
);

const Satellite = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={1.4} x={6} dur={18} />
        <path d="M -3 6 h 6 v 5 h -6 Z" className={styles.solid} />
        <path
            d="M -15 7 h 11 v 3 h -11 Z M 4 7 h 11 v 3 h -11 Z"
            className={styles.sail}
        />
        <path d="M -15 7 h 11 v 3 h -11 Z M 4 7 h 11 v 3 h -11 Z" />
        <path
            d="M -11 7 V 10 M -7.4 7 V 10 M 7.4 7 V 10 M 11 7 V 10"
            className={styles.cut}
        />
        <path d="M 0 11 V 13 M -2 14.6 Q 0 12.4 2 14.6" />
    </g>
);

const Plane = () => (
    <g>
        <path
            d="M -9 10 H 7 Q 10 10 10 8.4 L 8 8.4 L 6 9 H -6 Q -9 9 -9 10 Z"
            className={styles.solid}
        />
        <path d="M -1 9.6 L 3 14 H 5 L 3.4 9.6 M -1 9.4 L 2 6.6 H 3.6 L 2.4 9.4" />
        <path d="M 12 9.2 H 46" className={styles.cut} opacity="0.6" />
        <path d="M 12 10.4 H 40" className={styles.cut} opacity="0.4" />
    </g>
);

const Turbine = ({ on, dur }: { on: boolean; dur: number }) => (
    <g>
        <path d="M -0.8 57.6 L -0.4 18 M 0.8 57.6 L 0.4 18" />
        <path d="M -1.6 16.4 h 4 v 2.4 h -4 Z" className={styles.solid} />
        <g>
            <Spin on={on} at={[0, 17.6]} dur={dur} />
            <path d="M 0 17.6 L 0 3.6 M 0 17.6 L 12.1 24.6 M 0 17.6 L -12.1 24.6" />
        </g>
    </g>
);

const Solar = () => (
    <g>
        {[0, 18, 36, 54].map(x => (
            <g key={x}>
                <path
                    d={`M ${x - 7} 52 L ${x - 3} 45 H ${x + 9} L ${x + 5} 52 Z`}
                    className={styles.sail}
                />
                <path
                    d={`M ${x - 7} 52 L ${x - 3} 45 H ${x + 9} L ${x + 5} 52 Z`}
                />
                <path
                    d={`M ${x - 5} 48.6 H ${x + 7} M ${x - 1} 45 L ${x - 5} 52 M ${x + 3} 45 L ${x - 1} 52`}
                    className={styles.cut}
                />
                <path d={`M ${x - 4} 52 V 57.6 M ${x + 3} 52 V 57.6`} />
            </g>
        ))}
    </g>
);

const Shore = () => (
    <g>
        <path
            d={`M 0 ${GROUND + 0.4} H ${SEA_FROM} M ${SEA_TO} ${GROUND + 0.4} H 960 M 0 ${GROUND + 3} H ${SEA_FROM} M ${SEA_TO} ${GROUND + 3} H 960`}
            className={styles.ground}
        />
        <path
            d={waves(SEA_FROM, SEA_TO, 57.6, 1.2, 8)}
            className={styles.cut}
        />
        <path
            d={waves(SEA_FROM + 4, SEA_TO - 4, 61, 1, 10)}
            className={styles.cut}
            opacity="0.5"
        />
    </g>
);

export const Today = ({ on, copy }: SceneProps) => (
    <g>
        <Skyline on={on} />
        {at(200, <Coder on={on} />, 'coder')}
        {at(228, <PhoneWalker on={on} />, 'phone')}
        {at(260, <Runner on={on} />, 'runner')}
        {at(312, <Watcher on={on} />, 'watcher', { flip: true })}
        {at(420, <Plane />, 'plane')}
        {at(402, <Freighter on={on} />, 'freighter')}
        {at(526, <DroneShip on={on} copy={copy} />, 'ship')}
        {at(640, <Satellite on={on} />, 'sat')}
        {at(752, <Turbine on={on} dur={5.2} />, 'wt1')}
        {at(786, <Turbine on={on} dur={6.4} />, 'wt2')}
        {at(820, <Turbine on={on} dur={4.6} />, 'wt3')}
        {at(870, <Solar />, 'solar')}
        <Shore />
    </g>
);
