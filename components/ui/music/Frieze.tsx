'use client';

import { useEffect, useState } from 'react';

import { useMusic } from './MusicProvider';
import { ERAS, eraAt } from './frieze/eras';
import { TILE_H, TILE_W } from './frieze/kit';
import styles from './Frieze.module.css';

/*
 * A carved wall that only appears while music plays. Over the length of the
 * track it walks through history, one civilization at a time: Egypt, Greece,
 * Rome, Tang China, the Mali Empire, the industrial age, today and the
 * future. Each era drifts left as a procession, and as an era's time runs
 * out the next civilization walks in from the right and pushes it off.
 */

const FADE_MS = 900;
/** Length of a handover; keep in step with the arrive/depart keyframes. */
const SWAP_MS = 9000;
/** Start each handover early so it is halfway done at the era boundary. */
const LEAD_S = SWAP_MS / 2000;

/** One era's wall: three copies of its tile drifting left. */
export function EraWall({
    era,
    motion,
    arriving = false,
    leaving = false,
}: {
    era: number;
    motion: boolean;
    arriving?: boolean;
    leaving?: boolean;
}) {
    const { id, Scene } = ERAS[era];
    return (
        <div
            className={`${styles.layer} ${styles.tinted}`}
            data-era={id}
            data-arriving={arriving ? '' : undefined}
            data-leaving={leaving ? '' : undefined}
        >
            <div className={styles.strip}>
                <div className={styles.wall}>
                    {[0, 1, 2].map(copy => (
                        <svg
                            key={copy}
                            viewBox={`0 0 ${TILE_W} ${TILE_H}`}
                            className={styles.tile}
                            preserveAspectRatio="xMinYMax meet"
                            focusable="false"
                        >
                            <g className={styles.ink}>
                                <Scene on={motion} copy={copy} />
                            </g>
                        </svg>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function Frieze() {
    const { status, audio } = useMusic();
    const playing = status === 'playing';
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [motion, setMotion] = useState(true);
    const [era, setEra] = useState(0);
    const [layers, setLayers] = useState([{ era: 0, key: 0, arriving: false }]);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setMotion(!query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    /*
     * Show while playing. Short gaps (buffering, the switch between tracks)
     * keep the wall up; a real pause fades it out and then removes it.
     */
    useEffect(() => {
        if (playing) {
            setMounted(true);
            const frame = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(frame);
        }
        const hide = window.setTimeout(() => setVisible(false), 1200);
        const unmount = window.setTimeout(
            () => setMounted(false),
            1200 + FADE_MS,
        );
        return () => {
            window.clearTimeout(hide);
            window.clearTimeout(unmount);
        };
    }, [playing]);

    /* Follow the track: its progress decides the era. */
    useEffect(() => {
        const element = audio.current;
        if (!element) return;
        const update = () =>
            setEra(eraAt(element.currentTime + LEAD_S, element.duration));
        update();
        element.addEventListener('timeupdate', update);
        element.addEventListener('durationchange', update);
        return () => {
            element.removeEventListener('timeupdate', update);
            element.removeEventListener('durationchange', update);
        };
    }, [audio, playing]);

    /* Keep the previous era on screen while it hands over to the next. */
    useEffect(() => {
        setLayers(current => {
            const top = current[current.length - 1];
            if (top.era === era) return current;
            return [
                { ...top, arriving: false },
                { era, key: top.key + 1, arriving: true },
            ];
        });
    }, [era]);

    /* The era's name changes halfway through, when the new wall leads. */
    const [labelEra, setLabelEra] = useState(0);
    useEffect(() => {
        const next = layers[layers.length - 1].era;
        if (layers.length < 2) {
            setLabelEra(next);
            return;
        }
        const half = window.setTimeout(() => setLabelEra(next), SWAP_MS / 2);
        return () => window.clearTimeout(half);
    }, [layers]);

    useEffect(() => {
        if (layers.length < 2) return;
        const done = window.setTimeout(
            () =>
                setLayers(current => [
                    { ...current[current.length - 1], arriving: false },
                ]),
            SWAP_MS,
        );
        return () => window.clearTimeout(done);
    }, [layers]);

    if (!mounted) return null;

    return (
        <div
            className={styles.frieze}
            data-frieze={visible ? 'on' : 'off'}
            data-motion={motion ? 'on' : 'off'}
            aria-hidden="true"
        >
            {layers.map((layer, idx) => (
                <EraWall
                    key={layer.key}
                    era={layer.era}
                    motion={motion}
                    arriving={layer.arriving}
                    leaving={idx < layers.length - 1}
                />
            ))}
            <span
                key={labelEra}
                className={`${styles.label} ${styles.tinted}`}
                data-era={ERAS[labelEra].id}
            >
                {ERAS[labelEra].label}
            </span>
        </div>
    );
}
