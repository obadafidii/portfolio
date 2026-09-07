'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface ShareBarProps {
    title: string;
    summary: string;
    path: string;
}

const optionClass =
    'share-modal__option cursor-pointer rounded-[4px] border px-3 py-2.5 text-left text-[12px] no-underline transition-colors';

export const ShareBar = ({ title, summary, path }: ShareBarProps) => {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState(path);
    const [status, setStatus] = useState('');
    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();
    const whatsappShareUrl = `${url}?utm_source=whatsapp&utm_medium=share`;
    const xUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
        text: title,
        url,
    })}`;
    const whatsappUrl = `https://wa.me/?${new URLSearchParams({
        text: `${title}\n\n${whatsappShareUrl}`,
    })}`;

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        const trigger = triggerRef.current;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();

        const handleDialogKeys = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                return;
            }

            if (event.key !== 'Tab' || !dialogRef.current) return;

            const focusable = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>('a[href], button'),
            ).filter(element => !element.hasAttribute('disabled'));
            const first = focusable[0];
            const last = focusable.at(-1);

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };

        window.addEventListener('keydown', handleDialogKeys);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleDialogKeys);
            trigger?.focus();
        };
    }, [open]);

    const copyLink = async (successMessage = 'link copied') => {
        try {
            await navigator.clipboard.writeText(url);
            setStatus(successMessage);
        } catch {
            setStatus('copy failed — select the address from your browser');
        }
    };

    const shareToInstagram = async () => {
        if (!navigator.share) {
            await copyLink('link copied — paste it into Instagram');
            return;
        }

        try {
            await navigator.share({ title, text: summary, url });
            setOpen(false);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            await copyLink('link copied — paste it into Instagram');
        }
    };

    const close = () => setOpen(false);

    return (
        <section className="share-bar" aria-label="Share this article">
            <button
                ref={triggerRef}
                type="button"
                className="share-bar__trigger"
                onClick={() => {
                    setUrl(new URL(path, window.location.origin).href);
                    setStatus('');
                    setOpen(true);
                }}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                share ↗
            </button>

            {open ? (
                <div
                    className="share-modal__backdrop"
                    onMouseDown={event => {
                        if (event.currentTarget === event.target) close();
                    }}
                >
                    <div
                        ref={dialogRef}
                        className="share-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={descriptionId}
                    >
                        <div className="share-modal__head">
                            <div>
                                <p id={titleId} className="share-modal__title">
                                    share article
                                </p>
                                <p id={descriptionId} className="share-modal__description">
                                    {title}
                                </p>
                            </div>
                            <button
                                ref={closeRef}
                                type="button"
                                className="share-modal__close"
                                onClick={close}
                                aria-label="Close sharing options"
                            >
                                ×
                            </button>
                        </div>

                        <div className="share-modal__options">
                            <a
                                className={optionClass}
                                href={xUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Share this article on X"
                            >
                                <span>x</span>
                                <span aria-hidden="true">↗</span>
                            </a>
                            <a
                                className={optionClass}
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Share this article on WhatsApp"
                            >
                                <span>whatsapp</span>
                                <span aria-hidden="true">↗</span>
                            </a>
                            <button
                                type="button"
                                className={optionClass}
                                onClick={shareToInstagram}
                                title="Opens your device share menu so you can choose Instagram"
                            >
                                <span>instagram</span>
                                <span aria-hidden="true">↗</span>
                            </button>
                            <button
                                type="button"
                                className={optionClass}
                                onClick={() => copyLink()}
                            >
                                <span>copy link</span>
                                <span aria-hidden="true">⌘</span>
                            </button>
                        </div>

                        <p className="share-modal__status" role="status" aria-live="polite">
                            {status || 'instagram opens your device share menu'}
                        </p>
                    </div>
                </div>
            ) : null}
        </section>
    );
};
