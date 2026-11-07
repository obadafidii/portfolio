import type { ReactNode } from 'react';

import {
    Bob,
    Ground,
    Stand,
    Swing,
    Walk,
    at,
    styles,
    type SceneProps,
} from './kit';

/*
 * Ancient Egypt, c. 1300 BCE. Figures are drawn the way Egyptian reliefs
 * draw people: heads and legs in profile, shoulders square to the viewer,
 * everyone on one ground line, walking toward the pharaoh.
 */

/** Head with a striped wig, facing left. Centre of the head at (0, cy). */
const EgyptHead = ({ cy = 15, crown }: { cy?: number; crown?: ReactNode }) => (
    <g>
        <path
            d={`M 1.2 ${cy - 4} Q 5.6 ${cy - 3.2} 5 ${cy + 5.6} L 1.6 ${cy + 5.2} Z`}
            className={styles.solid}
        />
        <circle cx="0" cy={cy} r="3.4" className={styles.solid} />
        <path d={`M -3.2 ${cy - 0.2} l -1.5 1 l 1.4 0.6`} />
        <path d={`M 0 ${cy + 3.4} V ${cy + 6.2}`} />
        {crown}
    </g>
);

/** Square shoulders, a tapered torso and a pleated kilt, facing left. */
const Body = () => (
    <g>
        <path d="M -4.8 22 H 4.8 L 2.4 35 H -2.4 Z" />
        <path d="M -3 34.6 H 3.2 L 5 43 H -6 Z" className={styles.solid} />
        <path d="M -1 35.5 L -2.6 42.6" className={styles.cut} />
    </g>
);

/* ------------------------------------------------------------- figures */

/** Seated on a block throne, facing right, holding crook and flail. */
const Pharaoh = () => (
    <g transform="scale(-1 1)">
        <path d="M -2 34 H 12 V 57.6 H -2 Z" />
        <path d="M 9 34 V 57.6" className={styles.cut} />
        <path d="M -6 57.6 H 16" />
        <EgyptHead
            cy={13}
            crown={
                <path
                    d="M -2.6 10 Q -3 3 0 0.6 Q 3 3 3.2 10 Z"
                    className={styles.solid}
                />
            }
        />
        <path d="M -4.8 20 H 4.8 L 2.4 33 H -2.4 Z" />
        {/* lap and shins */}
        <path d="M -2.4 33 H -12 L -12.4 57.6 L -15.6 57.6" />
        <path d="M 3 33 H -10" className={styles.cut} />
        {/* crook and flail crossed on the chest */}
        <path d="M -3 22 L -9 31 M -9 31 q -1.6 -2.4 0.6 -3.6" />
        <path d="M 2 22 L -5 15 M -5 15 l -2.4 1.2 M -5 15 l -1 2.4 M -5 15 l 0.2 2.8" />
    </g>
);

/** Fan bearer standing behind the throne, holding an ostrich fan high. */
const FanBearer = ({ on }: { on: boolean }) => (
    <g transform="scale(-1 1)">
        <EgyptHead />
        <Body />
        <Stand />
        <g>
            <Swing on={on} pivot={[-3, 23]} angles={[0, -7, 0]} dur={4.2} />
            <path d="M -3.6 23 L -9 13 L -10 -2" />
            <path
                d="M -10 -2 q -8 -1 -9 6 q 5 -3 9 -6 q 7 1 9 7 q -5 -4 -9 -7"
                className={styles.solid}
            />
        </g>
    </g>
);

/** Kneeling, lifting a bowl of offerings toward the throne. */
const Offerer = ({ on }: { on: boolean }) => (
    <g>
        <EgyptHead cy={27} />
        <path d="M -4.8 34 H 4.8 L 2.6 46 H -2.6 Z" />
        {/* kneeling: thigh forward, shin flat on the ground */}
        <path d="M -2.6 46 H 4 L 6 57.6 H 12" />
        <path d="M -2.6 46 L -6 57.6 H -2.4" />
        <g>
            <Bob on={on} by={-2.2} dur={3.6} />
            <path d="M -4 35 L -10 30 L -11 25" />
            <path d="M -16 25 H -6 Q -8 29.5 -11 29.5 Q -14 29.5 -16 25 Z" />
            <circle cx="-11" cy="23.2" r="1.6" className={styles.solid} />
        </g>
    </g>
);

/** Bowing low to the pharaoh, arms forward. The bow repeats slowly. */
const Bower = ({ on, delay = 0 }: { on: boolean; delay?: number }) => (
    <g>
        <g>
            <Swing
                on={on}
                pivot={[0, 36]}
                angles={[-8, -48, -48, -8]}
                dur={4.8}
                begin={`${-delay}s`}
            />
            <EgyptHead />
            <path d="M -4.8 22 H 4.8 L 2.4 36 H -2.4 Z" />
            <path d="M -4 23 L -8 31 L -11 33" />
        </g>
        <path d="M -3 35 H 3.2 L 5 43 H -6 Z" className={styles.solid} />
        <Stand />
    </g>
);

/** Walking with a yoke on the shoulders and a water jar at each end. */
const WaterCarrier = ({ on, phase = 0 }: { on: boolean; phase?: number }) => (
    <g>
        <EgyptHead />
        <Body />
        <Walk on={on} phase={phase} />
        <g>
            <Bob on={on} by={1.4} dur={0.8} begin={`${-phase}s`} />
            <path d="M -15 22.6 Q 0 19.4 15 22.6" />
            <path d="M -13 22.4 V 30 M 13 22.4 V 30" />
            <path
                d="M -16 30 H -10 L -10.8 36.5 Q -13 38.4 -15.2 36.5 Z"
                className={styles.solid}
            />
            <path
                d="M 10 30 H 16 L 15.2 36.5 Q 13 38.4 10.8 36.5 Z"
                className={styles.solid}
            />
            <path d="M -4.4 23 L -9 26 L -12 23" />
        </g>
    </g>
);

/** Walking with a tall jar balanced on the head, one hand steadying it. */
const JarBearer = ({ on, phase = 0 }: { on: boolean; phase?: number }) => (
    <g>
        <g>
            <Bob on={on} by={0.8} dur={0.8} begin={`${-phase}s`} />
            <EgyptHead />
            <path
                d="M -3 10.8 H 3 Q 5.4 7 2.4 4.4 H -2.4 Q -5.4 7 -3 10.8 Z M -1.4 4.4 V 2.6 H 1.4 V 4.4"
                className={styles.solid}
            />
            <path d="M -4.4 23 L -7 14 L -3.8 8.6" />
        </g>
        {/* fitted sheath dress */}
        <path d="M -4.8 22 H 4.8 L 2.4 34 L 4.4 50 H -5 L -2.4 34 Z" />
        <Walk on={on} phase={phase} />
        <path d="M 4.4 23 L 6 33 L 5 38" />
    </g>
);

/** Carrying a basket of grain on one shoulder. */
const BasketCarrier = ({ on, phase = 0 }: { on: boolean; phase?: number }) => (
    <g>
        <EgyptHead />
        <Body />
        <Walk on={on} phase={phase} />
        <g>
            <Bob on={on} by={1} dur={0.8} begin={`${-phase}s`} />
            <path
                d="M -3 21.6 H 9 L 7.4 13 H -1.4 Z"
                className={styles.solid}
            />
            <path d="M -1 13 Q 3 9 7.4 13" />
            <path d="M -4.4 23 L -6.6 18 L -2 15" />
        </g>
    </g>
);

/** Swinging a hoe into the field. */
const Farmer = ({ on, delay = 0 }: { on: boolean; delay?: number }) => (
    <g>
        <g>
            <Swing
                on={on}
                pivot={[0, 36]}
                angles={[-6, -24, -6]}
                dur={2.4}
                begin={`${-delay}s`}
            />
            <EgyptHead />
            <path d="M -4.8 22 H 4.8 L 2.4 36 H -2.4 Z" />
            <g>
                <Swing
                    on={on}
                    pivot={[-4, 23]}
                    angles={[-40, 30, -40]}
                    dur={2.4}
                    begin={`${-delay}s`}
                />
                <path d="M -4 23 L -10 27" />
                <path d="M -10 27 L -2 34 M -10 27 L -16 22.6 L -18 29" />
            </g>
        </g>
        <path d="M -3 35 H 3.2 L 5 43 H -6 Z" className={styles.solid} />
        <Stand />
    </g>
);

/** Seated on a stool, playing a tall arched harp. The hands pluck. */
const Harpist = ({ on }: { on: boolean }) => (
    <g>
        <EgyptHead cy={21} />
        <path d="M -4.8 28 H 4.8 L 2.4 42 H -2.4 Z" />
        <path d="M 6 44 H -2 L -10 44 L -11 57.6 H -14" />
        <path d="M 2 44 V 57.6 M 8 44 V 57.6 M 0 44 H 10" />
        {/* the harp: a sound box at the base and an arched neck */}
        <path d="M -12 57.6 Q -30 40 -22 10 Q -18 6 -16 12" />
        <path d="M -12 57.6 L -15 52 L -10 50 Z" className={styles.solid} />
        <path
            d="M -14 50 L -19 16 M -16.4 51 L -20.6 22 M -18.6 51.6 L -22 30"
            className={styles.cut}
        />
        <g>
            <Swing on={on} pivot={[-4, 29]} angles={[4, -10, 4]} dur={0.9} />
            <path d="M -4 29 L -11 33 L -16 30" />
        </g>
        <g>
            <Swing on={on} pivot={[4, 29]} angles={[-6, 8, -6]} dur={1.1} />
            <path d="M 4 29 L -6 38 L -14 40" />
        </g>
    </g>
);

/** Clapping in time, arms raised. */
const Clapper = ({ on }: { on: boolean }) => (
    <g>
        <EgyptHead />
        <path d="M -4.8 22 H 4.8 L 2.4 34 L 4.4 50 H -5 L -2.4 34 Z" />
        <Stand />
        <g>
            <Swing on={on} pivot={[-4, 23]} angles={[0, 18, 0]} dur={0.9} />
            <path d="M -4 23 L -10 16 L -9 10" />
        </g>
        <g>
            <Swing on={on} pivot={[4, 23]} angles={[0, -18, 0]} dur={0.9} />
            <path d="M 4 23 L -4 15 L -8 10" />
        </g>
    </g>
);

/** A reed boat on the Nile with an oarsman. */
const Boat = ({ on }: { on: boolean }) => (
    <g>
        <g>
            <Bob on={on} by={1.2} dur={3} />
            <path
                d="M -48 46 Q -20 58 22 54 Q 40 52 48 40 Q 40 47 22 48 Q -18 50 -48 46 Z"
                className={styles.solid}
            />
            <path d="M -40 49 Q -12 54 30 50" className={styles.cut} />
            {/* oarsman, kneeling */}
            <g transform="translate(-6 0)">
                <EgyptHead cy={31} />
                <path d="M -4 37 H 4 L 2 47 H -2 Z" />
                <g>
                    <Swing
                        on={on}
                        pivot={[-3, 38]}
                        angles={[-18, 22, -18]}
                        dur={3}
                    />
                    <path d="M -3 38 L -10 41" />
                    <path d="M -16 34 L 2 60" />
                    <path d="M 0 57 L 4 63 L 6 59 Z" className={styles.solid} />
                </g>
            </g>
            {/* mast and a square linen sail */}
            <path d="M 16 50 V 12 M 4 14 H 28 M 5 40 H 27" />
            <path
                d="M 5 14.6 H 27 Q 24 27 27 39.4 H 5 Q 8 27 5 14.6 Z"
                className={styles.sail}
            />
        </g>
        {/* water, drawn as the hieroglyph for water */}
        <path
            d="M -64 59.5 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2 l 4 -2 l 4 2"
            className={styles.cut}
        />
    </g>
);

/** A date palm. The fronds sway a little. */
const Palm = ({ on }: { on: boolean }) => (
    <g>
        <path d="M 0 57.6 Q 3 36 -1 14" />
        <path
            d="M -1 34 l 2 -1 M -0.4 40 l 2 -1 M 0.6 46 l 2 -1 M 1.6 52 l 2 -1"
            className={styles.cut}
        />
        <g>
            <Swing on={on} pivot={[-1, 14]} angles={[-4, 5, -4]} dur={6} />
            <path d="M -1 14 Q -10 8 -18 16 M -1 14 Q -8 4 -16 4 M -1 14 Q 4 4 13 5 M -1 14 Q 8 9 16 17 M -1 14 Q 0 6 2 2" />
            <circle cx="-3" cy="17" r="1.3" className={styles.solid} />
            <circle cx="1" cy="17.6" r="1.3" className={styles.solid} />
        </g>
    </g>
);

/** An ibis wading and pecking at the ground. */
const Ibis = ({ on }: { on: boolean }) => (
    <g>
        <path
            d="M -2 40 Q 6 34 14 38 Q 12 44 2 44 Q -1 43 -2 40 Z"
            className={styles.solid}
        />
        <path d="M 4 44 L 2 57.6 M 8 44 L 9 57.6" />
        <g>
            <Swing
                on={on}
                pivot={[-1, 40]}
                angles={[0, 0, -62, 0, 0]}
                dur={5}
            />
            <path d="M -1 40 Q -6 32 -3 28" />
            <circle cx="-3.4" cy="27.6" r="1.6" className={styles.solid} />
            <path d="M -4.6 28 Q -10 30 -12 36" />
        </g>
    </g>
);

/* ---------------------------------------------------------- hieroglyphs */

const Ankh = () => (
    <g>
        <ellipse cx="0" cy="3" rx="2.4" ry="3" />
        <path d="M -4 6.4 H 4 M 0 6 V 15" />
    </g>
);

const Eye = () => (
    <g>
        <path d="M -6 4 Q 0 -1 6 4 Q 0 7 -6 4 Z" />
        <circle cx="0" cy="3.6" r="1.4" className={styles.solid} />
        <path d="M -1 6.4 L -2 11 Q -3 13 -5 12 M 2 6 L 6 10" />
    </g>
);

const Sun = () => (
    <g>
        <circle cx="0" cy="4" r="4" />
        <circle cx="0" cy="4" r="1" className={styles.solid} />
    </g>
);

const Reed = () => (
    <g>
        <path d="M 0 15 V 2 Q 3 3 2 7 M 0 4 l -2 -2" />
    </g>
);

const Glyphs = ({ x, items }: { x: number; items: ReactNode[] }) => (
    <g transform={`translate(${x} 4)`} className={styles.glyphs}>
        {items.map((item, idx) => (
            <g key={idx} transform={`translate(${idx * 14} 0)`}>
                {item}
            </g>
        ))}
    </g>
);

export const Egypt = ({ on }: SceneProps) => (
    <g>
        {at(26, <FanBearer on={on} />, 'fan')}
        {at(58, <Pharaoh />, 'pharaoh')}
        <Glyphs x={44} items={[<Sun key="s" />]} />
        {at(104, <Offerer on={on} />, 'offer')}
        {at(136, <Bower on={on} />, 'bow1')}
        {at(166, <Bower on={on} delay={0.6} />, 'bow2')}
        <Glyphs
            x={190}
            items={[<Ankh key="a" />, <Reed key="r" />, <Eye key="e" />]}
        />
        {at(240, <WaterCarrier on={on} />, 'water')}
        {at(286, <JarBearer on={on} phase={0.4} />, 'jar')}
        {at(322, <BasketCarrier on={on} phase={0.8} />, 'basket')}
        {at(374, <Palm on={on} />, 'palm1')}
        {at(404, <Ibis on={on} />, 'ibis')}
        {at(446, <Palm on={on} />, 'palm2')}
        {at(530, <Boat on={on} />, 'boat')}
        <Glyphs x={600} items={[<Sun key="s" />, <Ankh key="a" />]} />
        {at(640, <Farmer on={on} />, 'farm1')}
        {at(676, <Farmer on={on} delay={1.2} />, 'farm2')}
        {at(720, <Ibis on={on} />, 'ibis2')}
        <Glyphs x={760} items={[<Eye key="e" />, <Reed key="r" />]} />
        {at(806, <Harpist on={on} />, 'harp')}
        {at(840, <Clapper on={on} />, 'clap')}
        {at(880, <WaterCarrier on={on} phase={0.5} />, 'water2')}
        {at(920, <JarBearer on={on} phase={0.2} />, 'jar2')}
        <Ground />
    </g>
);
