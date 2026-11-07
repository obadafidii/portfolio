import {
    Arm,
    Bob,
    Ground,
    Head,
    Path,
    Robe,
    Spin,
    Swing,
    Torso,
    Tunic,
    Walk,
    at,
    repeat,
    styles,
    type SceneProps,
} from './kit';

/*
 * Rome, c. 100 CE: an aqueduct carrying water, a legion marching in step
 * behind its eagle, a chariot at full gallop, the Colosseum, an orator in
 * a toga, and a trader leading a donkey toward a triumphal arch.
 */

const Aqueduct = ({ on }: { on: boolean }) => (
    <g>
        <path d="M 6 13 V 57.6 M 202 13 V 57.6 M 6 34 H 202 M 6 31 H 202 M 6 16 H 202 M 6 13 H 202" />
        <path
            d={repeat(
                8,
                24.5,
                x => `M ${x + 10} 57.6 V 45 A 10 10 0 0 1 ${x + 30} 45 V 57.6`,
            )}
        />
        <path
            d={repeat(
                16,
                12.25,
                x => `M ${x + 9} 31 V 23 A 4 4 0 0 1 ${x + 17} 23 V 31`,
            )}
        />
        {/* water running along the channel on top */}
        <g>
            <Path
                on={on}
                points={['0 0', '-12 0']}
                times={[0, 1]}
                dur={1.6}
                splined={false}
            />
            <path
                d={repeat(16, 12, x => `M ${x + 14} 14.6 h 5`)}
                className={styles.cut}
            />
        </g>
    </g>
);

const Legionary = ({ on }: { on: boolean }) => (
    <g>
        <Head>
            <path d="M -4.4 12 Q 0 7.4 4.4 12" className={styles.solid} />
        </Head>
        <Torso />
        <path
            d="M -3.6 26 H 3.6 M -3.2 29.4 H 3.2 M -2.8 32.6 H 2.8"
            className={styles.cut}
        />
        <Tunic />
        <Walk on={on} dur={1.3} />
        <path d="M 3 24 L 15 5 M 14 7.4 L 16.6 2.6 L 12.6 5.4" />
        <path d="M -12 23.4 H -3 V 44 H -12 Z" className={styles.solid} />
        <circle cx="-7.5" cy="33.6" r="1.6" />
    </g>
);

const StandardBearer = ({ on }: { on: boolean }) => (
    <g>
        <Head />
        <Torso />
        <Tunic />
        <Walk on={on} dur={1.3} />
        <path d="M -4 23 L -7 27" />
        <path d="M -7 2 V 56" />
        {/* the eagle and a banner below it */}
        <path d="M -13.4 4.4 Q -10 0 -7 3 Q -4 0 -0.6 4.4" />
        <circle cx="-7" cy="3.6" r="1.2" className={styles.solid} />
        <path
            d="M -13 9 H -7 V 18 L -10 16 L -13 18 Z"
            className={styles.sail}
        />
    </g>
);

/** One horse leg from the shoulder at (0, 0). */
const HorseLeg = ({
    on,
    angles,
    dur,
    begin = '0s',
}: {
    on: boolean;
    angles: number[];
    dur: number;
    begin?: string;
}) => (
    <g transform={`rotate(${angles[0]} 0 0)`}>
        <Swing on={on} pivot={[0, 0]} angles={angles} dur={dur} begin={begin} />
        <path d="M 0 0 L -0.6 9 L 0.8 17" />
    </g>
);

const Chariot = ({ on }: { on: boolean }) => (
    <g>
        <Bob on={on} by={-1.2} dur={0.5} />
        {/* horse at a gallop */}
        <g transform="translate(-20 40)">
            <HorseLeg on={on} angles={[-34, 26, -34]} dur={0.5} />
        </g>
        <g transform="translate(-17 40)">
            <HorseLeg on={on} angles={[20, -30, 20]} dur={0.5} />
        </g>
        <g transform="translate(-7 40)">
            <HorseLeg on={on} angles={[30, -26, 30]} dur={0.5} />
        </g>
        <g transform="translate(-4 40)">
            <HorseLeg on={on} angles={[-20, 32, -20]} dur={0.5} />
        </g>
        <ellipse cx="-12" cy="36" rx="11" ry="5.6" className={styles.solid} />
        <path
            d="M -19 33 L -26 22 L -22.6 19.4 L -15 30 Z"
            className={styles.solid}
        />
        <path
            d="M -26 22 L -33 25.4 L -31.4 27.8 L -24 25.6"
            className={styles.solid}
        />
        <path d="M -23.6 19.8 L -22.6 16.4 M -21 31 Q -17 22 -22 19.6" />
        <path d="M -1.4 34 Q 4 34 3 44" />
        {/* car, pole and wheel */}
        <path d="M 1 44 L -6 39" />
        <path d="M 3 30 H 11 Q 14 37 12.4 44 H 3 Z" />
        <g>
            <Spin on={on} at={[8, 50]} dur={0.7} reverse />
            <circle cx="8" cy="50" r="7.4" />
            <path d="M 0.6 50 H 15.4 M 8 42.6 V 57.4" className={styles.cut} />
        </g>
        {/* charioteer with reins and a whip */}
        <g transform="translate(7 0)">
            <Head cy={13} />
            <path d="M -4.4 19.6 H 4.4 L 2.4 31 H -2.4 Z" />
            <path d="M -3.6 21 L -8 27 L -26 28" className={styles.cut} />
            <Arm on={on} from={[3, 21]} angles={[0, -40, 0]} dur={1}>
                <path d="M 3 21 L 8 14 L 13 4" />
            </Arm>
        </g>
    </g>
);

const Colosseum = () => (
    <g>
        <path d="M 0 57.6 V 13 Q 70 8 140 13 V 57.6" />
        <path d="M 0 44 H 140 M 0 31 H 140 M 0 19 Q 70 15 140 19" />
        {[50, 37, 25].map((spring, row) => (
            <path
                key={spring}
                d={repeat(
                    10,
                    14,
                    x =>
                        `M ${x + 3.6} ${row === 0 ? 57.6 : spring + 6} V ${spring} A 3.4 3.4 0 0 1 ${x + 10.4} ${spring}`,
                )}
            />
        ))}
        <path
            d={repeat(10, 14, x => `M ${x + 5} 16.6 h 4`)}
            className={styles.cut}
        />
    </g>
);

const Orator = ({ on }: { on: boolean }) => (
    <g>
        <Head />
        <Robe />
        <path d="M 4.6 22 L -5 40" className={styles.cut} />
        <Arm on={on} angles={[50, 72, 50]} dur={3.4}>
            <path d="M -4 23 L -10 26 L -14 24" />
        </Arm>
    </g>
);

const Citizen = ({ arm = false }: { arm?: boolean }) => (
    <g>
        <Head />
        <Robe />
        <path d="M 4.6 22 L -5 40" className={styles.cut} />
        {arm && <path d="M -4 23 L -6 31 L -9 33" />}
    </g>
);

const Cypress = ({ on, delay = 0 }: { on: boolean; delay?: number }) => (
    <g>
        <Swing
            on={on}
            pivot={[0, 57.6]}
            angles={[-1.6, 1.6, -1.6]}
            dur={5}
            begin={`${-delay}s`}
        />
        <path
            d="M 0 57.6 V 52 Q -7 40 0 8 Q 7 40 0 52"
            className={styles.solid}
        />
    </g>
);

const Donkey = ({ on }: { on: boolean }) => (
    <g>
        {[
            [-6, 0],
            [-4, 0.65],
            [6, 0.35],
            [8, 1],
        ].map(([x, phase]) => (
            <g key={x} transform={`translate(${x} 43)`}>
                <HorseLeg
                    on={on}
                    angles={[14, -14, 14]}
                    dur={1.3}
                    begin={`${-phase}s`}
                />
            </g>
        ))}
        <ellipse cx="1" cy="40" rx="10" ry="5" className={styles.solid} />
        <path
            d="M -7 37 L -13 29.6 L -18 32 L -14 36.4 Z"
            className={styles.solid}
        />
        <path d="M -13 30 L -13.4 24.4 M -11.6 30.4 L -10.6 25" />
        <path d="M 10.4 38 Q 13 42 12 47" />
        <path d="M -3 31.6 H 6 V 41 H -3 Z" className={styles.sail} />
    </g>
);

const Trader = ({ on }: { on: boolean }) => (
    <g>
        <Head />
        <Torso />
        <Tunic />
        <Walk on={on} dur={1.3} />
        <path d="M 4 23 L 8 29 L 12 31 Q 16 34 19 33" />
    </g>
);

const TriumphalArch = () => (
    <g>
        <path d="M 0 57.6 V 18 H 70 V 57.6 M -2 18 H 72 M 0 11 H 70 V 18 M 0 11 V 18" />
        <path d="M 24 57.6 V 38 A 11 11 0 0 1 46 38 V 57.6" />
        <path
            d="M 6 57.6 V 20 M 64 57.6 V 20 M 18 57.6 V 20 M 52 57.6 V 20"
            className={styles.cut}
        />
        <path d="M 8 14.4 H 62" className={styles.cut} />
        <path
            d="M 26 11 L 29 5 L 34 5 L 33 2.6 L 37 2.6 L 41 5 L 44 11 Z"
            className={styles.solid}
        />
    </g>
);

const Paving = () => (
    <g>
        <Ground />
        <path
            d={repeat(96, 10, x => `M ${x + 5} 58.6 V 61`)}
            className={styles.cut}
        />
    </g>
);

export const Rome = ({ on }: SceneProps) => (
    <g>
        <Aqueduct on={on} />
        {at(224, <StandardBearer on={on} />, 'eagle')}
        {at(250, <Legionary on={on} />, 'leg1')}
        {at(276, <Legionary on={on} />, 'leg2')}
        {at(302, <Legionary on={on} />, 'leg3')}
        {at(328, <Legionary on={on} />, 'leg4')}
        {at(398, <Chariot on={on} />, 'chariot')}
        {at(456, <Colosseum />, 'colosseum')}
        {at(636, <Orator on={on} />, 'orator', { flip: true })}
        {at(662, <Citizen arm />, 'cit1')}
        {at(684, <Citizen />, 'cit2')}
        {at(718, <Cypress on={on} />, 'cyp1')}
        {at(734, <Cypress on={on} delay={1.4} />, 'cyp2')}
        {at(776, <Trader on={on} />, 'trader')}
        {at(808, <Donkey on={on} />, 'donkey')}
        {at(866, <TriumphalArch />, 'arch')}
        <Paving />
    </g>
);
