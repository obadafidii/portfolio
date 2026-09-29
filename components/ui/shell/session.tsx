'use client';

import {
    createContext,
    useContext,
    useRef,
    useState,
    type Dispatch,
    type MutableRefObject,
    type ReactNode,
    type SetStateAction,
} from 'react';

import type { Cwd } from './registry';

export interface ShellBlock {
    id: number;
    command: string;
    cwd: Cwd;
    output: ReactNode;
}

interface ShellSessionValue {
    blocks: ShellBlock[];
    setBlocks: Dispatch<SetStateAction<ShellBlock[]>>;
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    history: string[];
    setHistory: Dispatch<SetStateAction<string[]>>;
    historyIdx: number;
    setHistoryIdx: Dispatch<SetStateAction<number>>;
    nextId: MutableRefObject<number>;
}

const ShellSessionContext = createContext<ShellSessionValue | null>(null);

export const PaneShellSessionProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [blocks, setBlocks] = useState<ShellBlock[]>([]);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIdx, setHistoryIdx] = useState(-1);
    const nextId = useRef(0);

    return (
        <ShellSessionContext.Provider
            value={{
                blocks,
                setBlocks,
                input,
                setInput,
                history,
                setHistory,
                historyIdx,
                setHistoryIdx,
                nextId,
            }}
        >
            {children}
        </ShellSessionContext.Provider>
    );
};

export const usePaneShellSession = () => useContext(ShellSessionContext);
