'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, ThumbsUp } from '@phosphor-icons/react';
import type { Reaction, ReactionState } from '@/lib/reactions';
import styles from './PostReactions.module.css';

export function PostReactions({ postKey }: { postKey: string }) {
    const [state, setState] = useState<ReactionState | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const inFlight = useRef(false);
    const requestVersion = useRef(0);
    const endpoint = `/api/reactions/${postKey.split('/').map(encodeURIComponent).join('/')}`;

    const load = useCallback(async (signal?: AbortSignal) => {
        const version = ++requestVersion.current;
        try {
            const response = await fetch(endpoint, { cache: 'no-store', signal });
            if (!response.ok) throw new Error();
            const next: ReactionState = await response.json();
            if (!signal?.aborted && version === requestVersion.current) {
                setState(next);
                setMessage('');
            }
        } catch {
            if (!signal?.aborted && version === requestVersion.current) {
                setMessage('Reactions are unavailable right now.');
            }
        }
    }, [endpoint]);

    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);
        // Refresh shared totals when a reader returns to the article.
        const refresh = () => {
            if (!document.hidden && !inFlight.current) void load(controller.signal);
        };
        document.addEventListener('visibilitychange', refresh);
        return () => {
            controller.abort();
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [load]);

    const react = async (choice: Exclude<Reaction, null>) => {
        if (inFlight.current || !state) return;
        inFlight.current = true;
        requestVersion.current += 1;
        setBusy(true);
        setMessage('');
        const reaction = state.selected === choice ? null : choice;
        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reaction }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error || 'Could not save your reaction.');
            setState(body);
            setMessage(reaction ? 'Thanks for reading!' : 'Reaction removed.');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not save your reaction. Try again.');
        } finally {
            inFlight.current = false;
            setBusy(false);
        }
    };

    return (
        <section className={styles.reactions} aria-label="React to this article" aria-busy={busy}>
            <span className={styles.label}>Enjoyed this article?</span>
            <div className={styles.buttons}>
                {(['like', 'love'] as const).map(choice => {
                    const Icon = choice === 'like' ? ThumbsUp : Heart;
                    const selected = state?.selected === choice;
                    return (
                        <button
                            key={choice}
                            type="button"
                            className={styles.button}
                            aria-pressed={selected}
                            disabled={busy || !state}
                            onClick={() => void react(choice)}
                        >
                            <Icon size={18} weight={selected ? 'fill' : 'regular'} aria-hidden="true" />
                            {choice === 'like' ? 'Like' : 'Love'}
                            <span className={styles.count}>{state ? state[choice].toLocaleString() : '—'}</span>
                        </button>
                    );
                })}
            </div>
            <div className={styles.status} role="status" aria-live="polite">
                {message || (state ? 'One reaction per reader. Tap again to undo.' : 'Loading reactions…')}
                {!state && message && <button type="button" onClick={() => void load()}>Retry</button>}
            </div>
        </section>
    );
}
