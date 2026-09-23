'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useId, useRef, useState, type ReactNode } from 'react';

import { runCommand, suggestionsFor, type Cwd } from '@/components/ui/shell/registry';
import { usePaneNavigation } from '@/components/layout/split-state';
import { usePaneShellSession, type ShellBlock } from './session';

interface CommandLineProps {
    cwd: Cwd;
    /** Rendered above the prompt on first paint, e.g. the page's own listing. */
    children?: ReactNode;
    autoFocus?: boolean;
}

export const Prompt = ({ cwd }: { cwd: Cwd }) => (
    <>
        <span className="term-host">david@obadafidi</span>
        <span className="term-sym">:{cwd}$</span>
    </>
);

export const CommandLine = ({ cwd, children, autoFocus = false }: CommandLineProps) => {
    const router = useRouter();
    const paneNavigate = usePaneNavigation();
    const paneSession = usePaneShellSession();
    const [localBlocks, setLocalBlocks] = useState<ShellBlock[]>([]);
    const [localInput, setLocalInput] = useState('');
    const [localHistory, setLocalHistory] = useState<string[]>([]);
    const [localHistoryIdx, setLocalHistoryIdx] = useState(-1);
    const [selectedSuggestion, setSelectedSuggestion] = useState(0);
    const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
    const localNextId = useRef(0);
    const blocks = paneSession?.blocks ?? localBlocks;
    const setBlocks = paneSession?.setBlocks ?? setLocalBlocks;
    const input = paneSession?.input ?? localInput;
    const setInput = paneSession?.setInput ?? setLocalInput;
    const history = paneSession?.history ?? localHistory;
    const setHistory = paneSession?.setHistory ?? setLocalHistory;
    const historyIdx = paneSession?.historyIdx ?? localHistoryIdx;
    const setHistoryIdx = paneSession?.setHistoryIdx ?? setLocalHistoryIdx;
    const nextId = paneSession?.nextId ?? localNextId;
    const inputRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const inputId = useId();
    const suggestionsId = `${inputId}-suggestions`;
    const suggestions = suggestionsDismissed ? [] : suggestionsFor(input, cwd);
    const activeSuggestion = Math.min(selectedSuggestion, suggestions.length - 1);

    const submit = useCallback(
        (command: string) => {
            const output = runCommand(command, {
                cwd,
                navigate: href => (paneNavigate ? paneNavigate(href) : router.push(href)),
                clear: () => setBlocks([]),
            });

            if (output === 'CLEARED') return;
            if (output === null) return;

            setBlocks(prev => [...prev, { id: nextId.current++, command, cwd, output }]);
            window.requestAnimationFrame(() =>
                endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
            );
        },
        [cwd, nextId, paneNavigate, router, setBlocks],
    );

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const command = input.trim();
        if (!command) return;
        setHistory(prev => [command, ...prev]);
        setHistoryIdx(-1);
        setInput('');
        setSuggestionsDismissed(false);
        setSelectedSuggestion(0);
        submit(command);
    };

    const acceptSuggestion = (suggestion: string, appendSpace = true) => {
        const lastSpace = input.lastIndexOf(' ');
        const prefix = lastSpace >= 0 ? input.slice(0, lastSpace + 1) : '';
        setInput(`${prefix}${suggestion}${appendSpace ? ' ' : ''}`);
        setSelectedSuggestion(0);
        setSuggestionsDismissed(appendSpace);
        window.requestAnimationFrame(() => inputRef.current?.focus());
    };

    const complete = () => {
        if (suggestions.length === 0) return;
        const fragment = input.slice(input.lastIndexOf(' ') + 1);
        const prefixMatches = suggestions.filter(item => item.startsWith(fragment));
        const matches = prefixMatches.length > 0 ? prefixMatches : suggestions;
        const shared = matches.reduce((acc, item) => {
            let i = 0;
            while (i < acc.length && i < item.length && acc[i] === item[i]) i++;
            return acc.slice(0, i);
        });
        const completion = matches.length === 1 || !shared.startsWith(fragment)
            ? suggestions[Math.max(activeSuggestion, 0)]
            : shared;
        acceptSuggestion(completion, matches.length === 1);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && suggestions.length > 0 && activeSuggestion >= 0) {
            const suggestion = suggestions[activeSuggestion];
            const fragment = input.slice(input.lastIndexOf(' ') + 1);
            if (suggestion !== fragment) {
                event.preventDefault();
                acceptSuggestion(suggestion);
                return;
            }
        }
        if (event.key === 'Tab') {
            event.preventDefault();
            complete();
            return;
        }
        if (event.key === 'Escape' && suggestions.length > 0) {
            event.preventDefault();
            setSuggestionsDismissed(true);
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (suggestions.length > 0) {
                setSelectedSuggestion(index =>
                    index <= 0 ? suggestions.length - 1 : index - 1,
                );
                return;
            }
            const idx = Math.min(historyIdx + 1, history.length - 1);
            if (idx >= 0) {
                setHistoryIdx(idx);
                setInput(history[idx]);
            }
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (suggestions.length > 0) {
                setSelectedSuggestion(index => (index + 1) % suggestions.length);
                return;
            }
            const idx = historyIdx - 1;
            setHistoryIdx(idx);
            setInput(idx >= 0 ? history[idx] : '');
        }
    };

    return (
        <div
            className="min-h-full"
            role="presentation"
            onClick={event => {
                if (!(event.target as HTMLElement).closest('a,button,input,textarea,select,[contenteditable="true"]')) {
                    inputRef.current?.focus();
                }
            }}
        >
            {children}

            {blocks.map(block => (
                <div key={block.id} className="mt-3">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <Prompt cwd={block.cwd} />
                        <span className="term-cmd">{block.command}</span>
                    </div>
                    {block.output}
                </div>
            ))}

            <div className="mt-3">
                <form onSubmit={onSubmit} className="terminal-prompt-form flex items-baseline gap-x-2">
                    <Prompt cwd={cwd} />
                    <label htmlFor={inputId} className="sr-only">
                        Terminal command
                    </label>
                    <input
                        id={inputId}
                        ref={inputRef}
                        value={input}
                        onChange={event => {
                            setInput(event.target.value);
                            setSelectedSuggestion(0);
                            setSuggestionsDismissed(false);
                        }}
                        onKeyDown={onKeyDown}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        autoFocus={autoFocus}
                        role="combobox"
                        aria-label="Terminal command"
                        aria-autocomplete="list"
                        aria-controls={suggestions.length > 0 ? suggestionsId : undefined}
                        aria-expanded={suggestions.length > 0}
                        aria-activedescendant={
                            activeSuggestion >= 0
                                ? `${suggestionsId}-${activeSuggestion}`
                                : undefined
                        }
                        className="term-cmd min-w-0 flex-1 bg-transparent outline-none"
                    />
                </form>

                {suggestions.length > 0 ? (
                    <div id={suggestionsId} className="term-completions" role="listbox">
                        <div className="term-completions__hint">
                            <span>completions</span>
                            <span>↑↓ select · enter/tab accept · esc close</span>
                        </div>
                        {suggestions.map((suggestion, index) => (
                            <button
                                id={`${suggestionsId}-${index}`}
                                key={suggestion}
                                type="button"
                                role="option"
                                aria-selected={index === activeSuggestion}
                                data-active={index === activeSuggestion}
                                className="term-completions__option"
                                onMouseDown={event => event.preventDefault()}
                                onClick={() => acceptSuggestion(suggestion)}
                            >
                                <span aria-hidden="true">
                                    {index === activeSuggestion ? '▸' : ' '}
                                </span>
                                <span>{suggestion}</span>
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>

            <div ref={endRef} />
        </div>
    );
};
