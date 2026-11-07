'use client';

import { useLayoutEffect, useRef, useState } from 'react';

type WindowState = 'open' | 'minimizing' | 'minimized' | 'restoring' | 'closed';

export const useWindowMotion = () => {
    const [windowState, setWindowState] = useState<WindowState>('open');
    const windowRef = useRef<HTMLDivElement>(null);
    const restoreRef = useRef<HTMLButtonElement>(null);
    const dockIconRef = useRef<HTMLSpanElement>(null);
    const minimizeRef = useRef<HTMLButtonElement>(null);
    const transitioning = useRef(false);
    const focusAfterTransition = useRef(false);
    const scrollPosition = useRef({ x: 0, y: 0 });

    const hideWindow = (state: 'minimized' | 'closed') => {
        if (transitioning.current || windowState !== 'open') return;
        scrollPosition.current = { x: window.scrollX, y: window.scrollY };
        focusAfterTransition.current = true;
        const animate =
            state === 'minimized' &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        transitioning.current = animate;
        setWindowState(animate ? 'minimizing' : state);
    };

    const restoreWindow = () => {
        if (
            transitioning.current ||
            !['minimized', 'closed'].includes(windowState)
        )
            return;
        focusAfterTransition.current = true;
        const animate =
            windowState === 'minimized' &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        transitioning.current = animate;
        setWindowState(animate ? 'restoring' : 'open');
    };

    useLayoutEffect(() => {
        if (windowState === 'open' || windowState === 'restoring') {
            // The mounted window must be visible before restoring document scroll.
            if (focusAfterTransition.current) {
                window.scrollTo({
                    left: scrollPosition.current.x,
                    top: scrollPosition.current.y,
                    behavior: 'instant',
                });
            }
        }

        if (windowState !== 'minimizing' && windowState !== 'restoring') {
            if (focusAfterTransition.current) {
                focusAfterTransition.current = false;
                const target =
                    windowState === 'open' ? minimizeRef : restoreRef;
                target.current?.focus({ preventScroll: true });
            }
            return;
        }

        const element = windowRef.current;
        const dock = dockIconRef.current;
        const restoring = windowState === 'restoring';
        const finish = () => {
            transitioning.current = false;
            setWindowState(restoring ? 'open' : 'minimized');
        };
        if (!element || !dock) {
            finish();
            return;
        }

        const bounds = element.getBoundingClientRect();
        const target = dock.getBoundingClientRect();
        // Keep the currently visible window intact, including a sticky titlebar
        // on long pages; offscreen content stays outside this fixed crop.
        const left = Math.max(0, bounds.left);
        const top = Math.max(0, bounds.top);
        const width = Math.max(
            1,
            Math.min(window.innerWidth, bounds.right) - left,
        );
        const height = Math.max(
            1,
            Math.min(window.innerHeight, bounds.bottom) - top,
        );
        const scale = Math.min(target.width / width, target.height / height);
        const x =
            target.left +
            target.width / 2 -
            bounds.left -
            (left - bounds.left + width / 2) * scale;
        const y =
            target.top +
            target.height / 2 -
            bounds.top -
            (top - bounds.top + height / 2) * scale;
        const previousClip = element.style.clipPath;
        element.style.clipPath = `inset(${top - bounds.top}px ${Math.max(0, bounds.right - window.innerWidth)}px ${Math.max(0, bounds.bottom - window.innerHeight)}px ${left - bounds.left}px)`;

        // macOS Scale-style motion: one continuous transform into the dock.
        const animation = element.animate(
            [
                {
                    offset: 0,
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1,
                },
                { offset: 0.88, opacity: 1 },
                {
                    offset: 1,
                    transform: `translate(${x}px, ${y}px) scale(${scale})`,
                    opacity: 0,
                },
            ],
            {
                duration: 420,
                easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                direction: restoring ? 'reverse' : 'normal',
                fill: 'both',
            },
        );
        let disposed = false;
        const complete = () => {
            if (!disposed) finish();
        };
        void animation.finished.then(complete, () => {});

        const preventScroll = (event: Event) => event.preventDefault();
        const preventScrollKey = (event: KeyboardEvent) => {
            if (
                [
                    'ArrowUp',
                    'ArrowDown',
                    'PageUp',
                    'PageDown',
                    'Home',
                    'End',
                    ' ',
                ].includes(event.key)
            )
                event.preventDefault();
        };
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const finishForMotionPreference = () => {
            if (motion.matches) complete();
        };
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });
        window.addEventListener('keydown', preventScrollKey);
        window.addEventListener('resize', complete);
        motion.addEventListener('change', finishForMotionPreference);
        return () => {
            disposed = true;
            animation.cancel();
            element.style.clipPath = previousClip;
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
            window.removeEventListener('keydown', preventScrollKey);
            window.removeEventListener('resize', complete);
            motion.removeEventListener('change', finishForMotionPreference);
        };
    }, [windowState]);

    return {
        windowState,
        hideWindow,
        restoreWindow,
        windowRef,
        restoreRef,
        dockIconRef,
        minimizeRef,
    };
};
