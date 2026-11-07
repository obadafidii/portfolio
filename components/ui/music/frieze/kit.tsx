import type { ReactNode } from 'react';

import styles from '../Frieze.module.css';

/*
 * Shared drawing kit for the frieze scenes.
 *
 * Coordinates: one tile is 960 × 64, the ground line is at y = 58, and people
 * stand about 46 units tall. Figures face left unless they are flipped, so
 * the wall reads as a procession drifting left.
 *
 * Every animation helper renders nothing when motion is off, which leaves
 * each figure in its resting pose for visitors who prefer reduced motion.
 */

export { styles };

export const TILE_W = 960;
export const TILE_H = 64;
export const GROUND = 58;

export interface SceneProps {
    /** Motion allowed. */
    on: boolean;
    /** Which repeat of the tile this is, to stagger one-off events. */
    copy: number;
}

const EASE = '0.45 0 0.55 1';
const splines = (count: number) => Array(count).fill(EASE).join(';');

/* ----------------------------------------------------------- animation */

/** Rotation loop around a pivot. */
export const Swing = ({
    on,
    pivot,
    angles,
    dur,
    begin = '0s',
}: {
    on: boolean;
    pivot: [number, number];
    angles: number[];
    dur: number;
    begin?: string;
}) =>
    on ? (
        <animateTransform
            attributeName="transform"
            type="rotate"
            values={angles.map(a => `${a} ${pivot[0]} ${pivot[1]}`).join(';')}
            dur={`${dur}s`}
            begin={begin}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines={splines(angles.length - 1)}
        />
    ) : null;

/** Continuous rotation around a centre, for wheels, blades and stations. */
export const Spin = ({
    on,
    at: [cx, cy],
    dur,
    reverse = false,
}: {
    on: boolean;
    at: [number, number];
    dur: number;
    reverse?: boolean;
}) =>
    on ? (
        <animateTransform
            attributeName="transform"
            type="rotate"
            values={`0 ${cx} ${cy};${reverse ? -360 : 360} ${cx} ${cy}`}
            dur={`${dur}s`}
            repeatCount="indefinite"
        />
    ) : null;

/** Small translate loop: up and down by default, or along any offset. */
export const Bob = ({
    on,
    by,
    x = 0,
    dur,
    begin = '0s',
}: {
    on: boolean;
    by: number;
    x?: number;
    dur: number;
    begin?: string;
}) =>
    on ? (
        <animateTransform
            attributeName="transform"
            type="translate"
            values={`0 0;${x} ${by};0 0`}
            dur={`${dur}s`}
            begin={begin}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines={splines(2)}
        />
    ) : null;

/**
 * Translate through a list of points at given key times. The parent group's
 * own transform is the pose shown when motion is off.
 */
export const Path = ({
    on,
    points,
    times,
    dur,
    begin = '0s',
    splined = true,
}: {
    on: boolean;
    points: string[];
    times: number[];
    dur: number;
    begin?: string;
    splined?: boolean;
}) =>
    on ? (
        <animateTransform
            attributeName="transform"
            type="translate"
            values={points.join(';')}
            keyTimes={times.join(';')}
            dur={`${dur}s`}
            begin={begin}
            repeatCount="indefinite"
            {...(splined
                ? {
                      calcMode: 'spline',
                      keySplines: splines(points.length - 1),
                  }
                : {})}
        />
    ) : null;

/** Opacity loop, for twinkling, smoke and lights. */
export const Fade = ({
    on,
    values,
    times,
    dur,
    begin = '0s',
}: {
    on: boolean;
    values: number[];
    times?: number[];
    dur: number;
    begin?: string;
}) =>
    on ? (
        <animate
            attributeName="opacity"
            values={values.join(';')}
            keyTimes={times?.join(';')}
            dur={`${dur}s`}
            begin={begin}
            repeatCount="indefinite"
        />
    ) : null;

/** A puff that rises, drifts and fades: smoke, steam, exhaust. */
export const Puff = ({
    on,
    x,
    y,
    r,
    drift = [8, -18],
    dur,
    begin = 0,
}: {
    on: boolean;
    x: number;
    y: number;
    r: number;
    drift?: [number, number];
    dur: number;
    begin?: number;
}) =>
    on ? (
        <circle cx={x} cy={y} r={r} className={styles.smoke} opacity="0">
            <animateTransform
                attributeName="transform"
                type="translate"
                values={`0 0;${drift[0]} ${drift[1]}`}
                dur={`${dur}s`}
                begin={`${-begin}s`}
                repeatCount="indefinite"
            />
            <animate
                attributeName="opacity"
                values="0;0.9;0"
                keyTimes="0;0.2;1"
                dur={`${dur}s`}
                begin={`${-begin}s`}
                repeatCount="indefinite"
            />
            <animate
                attributeName="r"
                values={`${r};${r * 2.2}`}
                dur={`${dur}s`}
                begin={`${-begin}s`}
                repeatCount="indefinite"
            />
        </circle>
    ) : null;

/* -------------------------------------------------------------- layout */

/** Place a child at x (and optionally y), optionally mirrored to face right. */
export const at = (
    x: number,
    child: ReactNode,
    key: string,
    {
        y = 0,
        flip = false,
        scale = 1,
    }: { y?: number; flip?: boolean; scale?: number } = {},
) => (
    <g
        key={key}
        transform={`translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}${scale !== 1 ? ` scale(${scale})` : ''}`}
    >
        {child}
    </g>
);

/** A point on a quadratic curve, for placing things along hills and walls. */
export const quad = (
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    t: number,
): [number, number] => {
    const u = 1 - t;
    return [
        u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
        u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ];
};

/** Repeat a path segment n times along x. */
export const repeat = (
    n: number,
    step: number,
    segment: (x: number) => string,
) => Array.from({ length: n }, (_, i) => segment(i * step)).join(' ');

/** A wavy waterline from x0 to x1 at y. */
export const waves = (
    x0: number,
    x1: number,
    y: number,
    amp = 1.2,
    step = 6,
) => {
    let d = `M ${x0} ${y}`;
    for (let x = x0; x < x1; x += step)
        d += ` q ${step / 4} ${-amp} ${step / 2} 0 t ${step / 2} 0`;
    return d;
};

/* -------------------------------------------------------------- people */

/** A round head in profile with a neck. Centre at (0, cy). */
export const Head = ({
    cy = 15,
    children,
}: {
    cy?: number;
    children?: ReactNode;
}) => (
    <g>
        <circle cx="0" cy={cy} r="3.4" className={styles.solid} />
        <path d={`M -3.2 ${cy + 0.4} l -1 0.8 l 1 0.4`} />
        <path d={`M 0 ${cy + 3.4} V ${cy + 6.4}`} />
        {children}
    </g>
);

/** Shoulders and a tapered torso from y = top to the hips. */
export const Torso = ({
    top = 22,
    hip = 36,
}: {
    top?: number;
    hip?: number;
}) => <path d={`M -4.6 ${top} H 4.6 L 2.4 ${hip} H -2.4 Z`} />;

/** A short tunic or kilt over the hips. */
export const Tunic = ({ solid = true }: { solid?: boolean }) => (
    <path
        d="M -3 34.6 H 3.2 L 5 44 H -6 Z"
        className={solid ? styles.solid : undefined}
    />
);

/** A long robe to the ankles; legs are hidden under it. */
export const Robe = ({ solid = false }: { solid?: boolean }) => (
    <g>
        <path
            d="M -4.6 22 H 4.6 L 6.6 56 Q 0 57.8 -7.4 56 Z"
            className={solid ? styles.solid : undefined}
        />
        <path d="M 0 30 L -1.6 55" className={styles.cut} />
        <path d="M -5.4 56 L -8 57.6 M 4.6 56.4 L 3 57.6" />
    </g>
);

/** One leg from the hip at (0, 42), foot pointing left. */
export const Leg = () => <path d="M 0 42 L 0 57.6 L -3.4 57.6" />;

/** Walking (or running) legs. Phase shifts which leg leads. */
export const Walk = ({
    on,
    phase = 0,
    dur = 1.6,
    reach = [16, -12],
}: {
    on: boolean;
    phase?: number;
    dur?: number;
    reach?: [number, number];
}) => (
    <g>
        <g transform={`rotate(${reach[0]} 0 42)`}>
            <Swing
                on={on}
                pivot={[0, 42]}
                angles={[reach[0], reach[1], reach[0]]}
                dur={dur}
                begin={`${-phase}s`}
            />
            <Leg />
        </g>
        <g transform={`rotate(${reach[1]} 0 42)`}>
            <Swing
                on={on}
                pivot={[0, 42]}
                angles={[reach[1], reach[0], reach[1]]}
                dur={dur}
                begin={`${-phase}s`}
            />
            <Leg />
        </g>
    </g>
);

/** Standing legs, one foot a little forward. */
export const Stand = () => (
    <g>
        <g transform="rotate(10 0 42)">
            <Leg />
        </g>
        <g transform="rotate(-4 0 42)">
            <Leg />
        </g>
    </g>
);

/** An arm (or anything held) that swings from the shoulder. */
export const Arm = ({
    on,
    from = [-4, 23],
    angles,
    dur,
    begin = '0s',
    children,
}: {
    on: boolean;
    from?: [number, number];
    angles: number[];
    dur: number;
    begin?: string;
    children: ReactNode;
}) => (
    <g transform={`rotate(${angles[0]} ${from[0]} ${from[1]})`}>
        <Swing on={on} pivot={from} angles={angles} dur={dur} begin={begin} />
        {children}
    </g>
);

/** Plain ground: a double line along the whole tile. */
export const Ground = ({ double = true }: { double?: boolean }) => (
    <path
        d={`M 0 ${GROUND + 0.4} H ${TILE_W}${double ? ` M 0 ${GROUND + 3} H ${TILE_W}` : ''}`}
        className={styles.ground}
    />
);
