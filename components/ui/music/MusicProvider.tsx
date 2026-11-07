'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from 'react';

import type { Track } from '@/lib/music';
import styles from './Music.module.css';

type MusicStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface MusicContextValue {
    status: MusicStatus;
    track: Track | null;
    trackCount: number;
    play: () => void;
    pause: () => void;
    next: () => void;
    /** The audio element, for visuals that follow the track's progress. */
    audio: RefObject<HTMLAudioElement | null>;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic() {
    const context = useContext(MusicContext);
    if (!context) throw new Error('Music controls need MusicProvider.');
    return context;
}

/**
 * Audio only, with no visible player. Plays the files in public/music one
 * after another and loops the list. The <audio> element lives in the root
 * layout, so playback continues across client-side navigation and split
 * panes. Nothing downloads until a visitor presses play.
 */
export function MusicProvider({
    tracks,
    children,
}: {
    tracks: Track[];
    children: ReactNode;
}) {
    const [status, setStatus] = useState<MusicStatus>('idle');
    const [index, setIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const indexRef = useRef(0);
    const failuresRef = useRef(0);

    const load = useCallback(
        (audio: HTMLAudioElement, nextIndex: number) => {
            indexRef.current = nextIndex;
            setIndex(nextIndex);
            audio.src = tracks[nextIndex].src;
            audio.load();
        },
        [tracks],
    );

    const start = useCallback((audio: HTMLAudioElement) => {
        setStatus('loading');
        audio.play().catch((error: unknown) => {
            // AbortError means a pause() or track change interrupted play.
            if (error instanceof DOMException && error.name === 'AbortError')
                return;
            setStatus(audio.error ? 'error' : 'paused');
        });
    }, []);

    const getAudio = useCallback(() => {
        if (audioRef.current) return audioRef.current;

        const audio = new Audio();
        audio.preload = 'none';
        audio.addEventListener('playing', () => {
            failuresRef.current = 0;
            setStatus('playing');
        });
        audio.addEventListener('pause', () => {
            if (!audio.ended) setStatus('paused');
        });
        audio.addEventListener('waiting', () => setStatus('loading'));
        audioRef.current = audio;
        return audio;
    }, []);

    /* Advance on end, and skip tracks that fail to load. */
    useEffect(() => {
        const audio = getAudio();

        const advance = () => {
            if (tracks.length === 0) return;
            load(audio, (indexRef.current + 1) % tracks.length);
            start(audio);
        };

        const onError = () => {
            failuresRef.current += 1;
            if (failuresRef.current >= tracks.length) {
                failuresRef.current = 0;
                setStatus('error');
                return;
            }
            advance();
        };

        audio.addEventListener('ended', advance);
        audio.addEventListener('error', onError);
        return () => {
            audio.removeEventListener('ended', advance);
            audio.removeEventListener('error', onError);
        };
    }, [getAudio, load, start, tracks.length]);

    const play = useCallback(() => {
        if (tracks.length === 0) {
            setStatus('error');
            return;
        }
        const audio = getAudio();
        if (!audio.src || status === 'error') load(audio, indexRef.current);
        start(audio);
    }, [getAudio, load, start, status, tracks.length]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        setStatus(current => (current === 'error' ? current : 'paused'));
    }, []);

    const next = useCallback(() => {
        if (tracks.length === 0) return;
        const audio = getAudio();
        load(audio, (indexRef.current + 1) % tracks.length);
        start(audio);
    }, [getAudio, load, start, tracks.length]);

    const track = tracks[index] ?? null;

    // Lock-screen and media-key controls on phones and laptops.
    useEffect(() => {
        if (status === 'idle' || !track || !('mediaSession' in navigator))
            return;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
        });
        navigator.mediaSession.setActionHandler('play', play);
        navigator.mediaSession.setActionHandler('pause', pause);
        navigator.mediaSession.setActionHandler(
            'nexttrack',
            tracks.length > 1 ? next : null,
        );
    }, [status, track, play, pause, next, tracks.length]);

    useEffect(
        () => () => {
            audioRef.current?.pause();
            audioRef.current = null;
        },
        [],
    );

    const value = useMemo(
        () => ({
            status,
            track,
            trackCount: tracks.length,
            play,
            pause,
            next,
            audio: audioRef,
        }),
        [status, track, tracks.length, play, pause, next],
    );

    return (
        <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
    );
}

export function MusicControls() {
    const { status, track, trackCount, play, pause, next } = useMusic();
    const active = status === 'playing' || status === 'loading';
    const title = track?.title ?? 'music';
    const label =
        trackCount === 0
            ? 'no music'
            : status === 'error'
              ? 'unavailable'
              : status === 'loading'
                ? 'loading'
                : active
                  ? 'pause'
                  : 'play';

    return (
        <span className={styles.controls}>
            <button
                type="button"
                className={styles.toggle}
                data-playing={status === 'playing'}
                onClick={active ? pause : play}
                aria-label={
                    status === 'error'
                        ? `${title} could not load. Try again`
                        : `${active ? 'Pause' : 'Play'} ${title}`
                }
                title={`${label} · ${title}`}
            >
                <span className={styles.symbol} aria-hidden="true">
                    {active ? 'Ⅱ' : '▶'}
                </span>
                <span className={styles.title}>{title}</span>
                <span className={styles.state}>{label}</span>
            </button>
            {active && trackCount > 1 && (
                <button
                    type="button"
                    className={styles.skip}
                    onClick={next}
                    aria-label="Next track"
                    title="next track"
                >
                    <span aria-hidden="true">⏭</span>
                </button>
            )}
            <span className="sr-only" role="status">
                {status === 'playing'
                    ? `Playing ${title}`
                    : status === 'error'
                      ? `${title} could not load`
                      : ''}
            </span>
        </span>
    );
}
