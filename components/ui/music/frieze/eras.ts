import type { ComponentType } from 'react';

import { China } from './china';
import { Egypt } from './egypt';
import { Future } from './future';
import { Greece } from './greece';
import { Industry } from './industry';
import { Mali } from './mali';
import { Rome } from './rome';
import { Today } from './today';
import type { SceneProps } from './kit';

export interface Era {
    id: string;
    label: string;
    Scene: ComponentType<SceneProps>;
}

/** History in order. Each era gets an equal share of the playing track. */
export const ERAS: Era[] = [
    { id: 'egypt', label: '# ancient egypt, c. 1300 bce', Scene: Egypt },
    { id: 'greece', label: '# classical greece, c. 450 bce', Scene: Greece },
    { id: 'rome', label: '# rome, c. 100 ce', Scene: Rome },
    { id: 'china', label: '# tang china, c. 700', Scene: China },
    { id: 'mali', label: '# mali empire, c. 1350', Scene: Mali },
    { id: 'industry', label: '# industrial age, c. 1870', Scene: Industry },
    { id: 'today', label: '# today', Scene: Today },
    { id: 'future', label: '# the future', Scene: Future },
];

/** Which era a moment in the track belongs to. */
export const eraAt = (time: number, duration: number) => {
    const count = ERAS.length;
    if (Number.isFinite(duration) && duration > 0)
        return Math.min(count - 1, Math.floor((time / duration) * count));
    // Unknown length (a stream): a minute per era.
    return Math.floor(time / 60) % count;
};
