import {
    Bob,
    Fade,
    Spin,
    Swing,
    Walk,
    at,
    styles,
    type SceneProps,
} from './kit';

/*
 * The future, out in space: a field of stars, a ringed planet, a spinning
 * ring station, a cruiser under thrust, an astronaut drifting, a solar sail,
 * a comet, and a base on the Moon with a rover, a launch tower and the Earth
 * rising over the horizon.
 */

/** Deterministic scatter so every render places the stars the same way. */
const STARS = Array.from({ length: 52 }, (_, i) => {
    const x = (i * 197.3 + 31) % 960;
    const y = 3 + ((i * 61.7 + 11) % 40);
    const r = 0.45 + ((i * 7) % 5) * 0.12;
    return { x, y, r, twinkle: i % 3 === 0, delay: (i % 7) * 0.7 };
});

const Stars = ({ on }: { on: boolean }) => (
    <g>
        {STARS.map(({ x, y, r, twinkle, delay }, i) => (
            <circle key={i} cx={x} cy={y} r={r} className={styles.glow}>
                {twinkle && (
                    <Fade
                        on={on}
                        values={[1, 0.2, 1]}
                        dur={2.6 + (i % 4)}
                        begin={`${-delay}s`}
                    />
                )}
            </circle>
        ))}
    </g>
);

const RingedPlanet = () => (
    <g>
        <circle cx="0" cy="0" r="13" className={styles.sail} />
        <circle cx="0" cy="0" r="13" />
        <path
            d="M -12 -4 Q 0 -6 12 -4 M -12.6 3 Q 0 1.6 12.6 3"
            className={styles.cut}
        />
        <ellipse cx="0" cy="0" rx="25" ry="5" transform="rotate(-14)" />
        <ellipse
            cx="0"
            cy="0"
            rx="20"
            ry="3.6"
            transform="rotate(-14)"
            className={styles.cut}
        />
    </g>
);

const Station = ({ on }: { on: boolean }) => (
    <g>
        <Spin on={on} at={[0, 0]} dur={36} />
        <circle cx="0" cy="0" r="18" />
        <circle cx="0" cy="0" r="15" className={styles.cut} />
        <path d="M 0 -15 V -3 M 0 3 V 15 M -15 0 H -3 M 3 0 H 15" />
        <circle cx="0" cy="0" r="3" className={styles.solid} />
        <path
            d="M -11 -11 l 1.6 1.6 M 11 11 l -1.6 -1.6 M 11 -11 l -1.6 1.6 M -11 11 l 1.6 -1.6"
            className={styles.cut}
        />
    </g>
);

const Cruiser = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={2} x={-4} dur={7} />
        <path
            d="M -26 30 L -10 25.6 H 14 L 22 21 V 39 L 14 34.4 H -10 Z"
            className={styles.solid}
        />
        <path d="M -26 30 L -10 25.6 H 14 L 22 21 V 39 L 14 34.4 H -10 Z" />
        <path d="M -12 30 H 12" className={styles.cut} />
        <path d="M -6 28 h 1 M -1 28 h 1 M 4 28 h 1" />
        <g transform="translate(22 30)">
            <g>
                {on ? (
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        values="1 1;1.4 1;0.9 1;1.2 1;1 1"
                        dur="0.3s"
                        repeatCount="indefinite"
                    />
                ) : null}
                <path d="M 0 -5.4 Q 18 0 0 5.4 Z" className={styles.glow} />
            </g>
        </g>
    </g>
);

const Astronaut = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={-3} x={2} dur={6} />
        <g>
            <Swing on={on} pivot={[0, 26]} angles={[-24, 24, -24]} dur={9} />
            <circle cx="0" cy="17" r="4.2" />
            <path
                d="M -3.6 16 Q 0 13 3.6 16 V 18 Q 0 20 -3.6 18 Z"
                className={styles.solid}
            />
            <path d="M -4.4 22 H 4.4 Q 5.4 22 5.4 24 V 31 H -5.4 V 24 Q -5.4 22 -4.4 22 Z" />
            <path d="M 5.4 23 H 8.4 V 30 H 5.4" className={styles.solid} />
            <path d="M -5 24 L -11 21 M 3 31 L 6 39 M -3 31 L -6 38" />
            <path d="M -2 26 h 4" className={styles.cut} />
        </g>
    </g>
);

const SolarSail = ({ on }: { on: boolean }) => (
    <g>
        <Swing on={on} pivot={[0, 22]} angles={[-8, 8, -8]} dur={14} />
        <path d="M 0 4 L 18 22 L 0 40 L -18 22 Z" className={styles.sail} />
        <path d="M 0 4 L 18 22 L 0 40 L -18 22 Z" />
        <path d="M 0 4 V 40 M -18 22 H 18" className={styles.cut} />
        <circle cx="0" cy="22" r="1.6" className={styles.solid} />
    </g>
);

const Comet = ({ on }: { on: boolean }) => (
    <g>
        <circle cx="0" cy="8" r="1.6" className={styles.glow} />
        <g>
            <Fade on={on} values={[0.9, 0.4, 0.9]} dur={3} />
            <path
                d="M 1.6 7 L 30 2 M 1.6 9 L 30 10 M 1.6 8 L 34 6"
                className={styles.cut}
            />
        </g>
    </g>
);

const SpaceWalker = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={-4} dur={2.4} />
        <circle cx="0" cy="15" r="4.2" />
        <path
            d="M -3.6 14 Q 0 11 3.6 14 V 16 Q 0 18 -3.6 16 Z"
            className={styles.solid}
        />
        <path d="M -4.6 20 H 4.6 V 38 H -4.6 Z" />
        <path d="M 4.6 22 H 8 V 32 H 4.6" className={styles.solid} />
        <path d="M -4 23 L -8 30 M 4 23 L 3 31" />
        <Walk on={on} dur={2.4} reach={[22, -18]} />
    </g>
);

const MoonBase = ({ on }: { on: boolean }) => (
    <g>
        <path d="M 0 57.6 Q 22 47.6 52 47.6 H 316 Q 350 47.6 370 52" />
        <path
            d="M 30 52 q 6 -2 12 0 M 120 51 q 8 -2 16 0 M 250 52 q 6 -2 12 0"
            className={styles.cut}
        />
        {/* habitat domes and a tube between them */}
        <path d="M 52 47.6 A 11 11 0 0 1 74 47.6 M 82 47.6 A 7 7 0 0 1 96 47.6 M 74 44 H 82" />
        <path d="M 57 40 A 6 6 0 0 1 63 37" className={styles.cut} />
        <path d="M 60 47.6 V 43 H 66 V 47.6" className={styles.cut} />
        {/* comms mast with a beacon */}
        <path d="M 126 47.6 V 22 M 122 47.6 L 126 34 L 130 47.6 M 120 26 Q 126 30 132 26" />
        <circle cx="126" cy="21" r="1.2" className={styles.glow}>
            <Fade on={on} values={[1, 0.1, 1]} dur={1.6} />
        </circle>
        {/* rover */}
        <g transform="translate(170 0)">
            <path d="M -10 40 H 10 V 44.6 H -10 Z" className={styles.solid} />
            <path d="M 6 40 V 34 M 4 34 h 4" />
            {[-7, 0, 7].map(x => (
                <g key={x}>
                    <circle cx={x} cy="46" r="1.8" />
                    <g>
                        <Spin on={on} at={[x, 46]} dur={2} reverse />
                        <path
                            d={`M ${x - 1.8} 46 H ${x + 1.8}`}
                            className={styles.cut}
                        />
                    </g>
                </g>
            ))}
        </g>
        {at(214, <SpaceWalker on={on} />, 'walker', { y: 1.9, scale: 0.8 })}
        {/* launch tower with a rocket ready to go */}
        <path
            d="M 270 47.6 V 14 Q 274 5 278 14 V 47.6 Z"
            className={styles.sail}
        />
        <path d="M 270 47.6 V 14 Q 274 5 278 14 V 47.6 M 270 40 L 266 47.6 M 278 40 L 282 47.6" />
        <path
            d="M 288 47.6 V 10 M 294 47.6 V 10 M 288 16 L 294 22 L 288 28 L 294 34 L 288 40 L 294 46 M 278 20 H 288"
            className={styles.cut}
        />
    </g>
);

const EarthRise = () => (
    <g>
        <circle cx="0" cy="0" r="8" className={styles.sail} />
        <circle cx="0" cy="0" r="8" />
        <path
            d="M -5 -3 q 3 -2 5 1 q 2 3 -1 4 M 2 -6 q 3 1 3 4 M -6 3 q 3 0 4 3"
            className={styles.cut}
        />
    </g>
);

export const Future = ({ on }: SceneProps) => (
    <g>
        <Stars on={on} />
        {at(70, <RingedPlanet />, 'planet', { y: 26 })}
        <circle cx="138" cy="12" r="3.4" className={styles.sail} />
        <circle cx="138" cy="12" r="3.4" />
        {at(222, <Station on={on} />, 'station', { y: 28 })}
        {at(330, <Cruiser on={on} />, 'cruiser')}
        {at(424, <Astronaut on={on} />, 'astro')}
        {at(526, <SolarSail on={on} />, 'sail')}
        {at(578, <Comet on={on} />, 'comet', { y: 2 })}
        {at(590, <MoonBase on={on} />, 'base')}
        {at(940, <EarthRise />, 'earth', { y: 16 })}
    </g>
);
