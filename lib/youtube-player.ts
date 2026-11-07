export interface YouTubePlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    destroy: () => void;
    getIframe: () => HTMLIFrameElement;
}

interface PlayerEvent {
    target: YouTubePlayer;
    data: number;
}

interface YouTubeAPI {
    Player: new (
        element: HTMLElement,
        options: {
            videoId: string;
            width: string;
            height: string;
            host: string;
            playerVars: Record<string, string | number>;
            events: {
                onReady: (event: PlayerEvent) => void;
                onStateChange: (event: PlayerEvent) => void;
                onError: (event: PlayerEvent) => void;
                onAutoplayBlocked: () => void;
            };
        },
    ) => YouTubePlayer;
}

declare global {
    interface Window {
        YT?: YouTubeAPI;
        onYouTubeIframeAPIReady?: () => void;
    }
}

let apiPromise: Promise<YouTubeAPI> | undefined;

/** Load only after a visitor requests music; share concurrent requests. */
export function loadYouTubeAPI(): Promise<YouTubeAPI> {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;

    apiPromise = new Promise<YouTubeAPI>((resolve, reject) => {
        const script = document.createElement('script');
        const previousReady = window.onYouTubeIframeAPIReady;
        const cleanup = () => {
            window.clearTimeout(timeout);
            script.removeEventListener('error', fail);
            if (window.onYouTubeIframeAPIReady === ready) {
                window.onYouTubeIframeAPIReady = previousReady;
            }
        };
        const fail = () => {
            cleanup();
            script.remove();
            reject(new Error('YouTube could not be loaded.'));
        };
        const ready = () => {
            cleanup();
            if (window.YT?.Player) resolve(window.YT);
            else reject(new Error('YouTube player is unavailable.'));
            previousReady?.();
        };
        const timeout = window.setTimeout(fail, 15000);

        window.onYouTubeIframeAPIReady = ready;
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.addEventListener('error', fail, { once: true });
        document.head.appendChild(script);
    }).catch(error => {
        apiPromise = undefined;
        throw error;
    });

    return apiPromise;
}
