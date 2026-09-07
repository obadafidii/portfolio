'use client';

import { motion } from 'framer-motion';

import info from '@/misc/info';
import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';

const CHANNELS = [
    { flag: '--email', label: info.email, href: `mailto:${info.email}` },
    { flag: '--linkedin', label: 'in/obadafidi', href: info.socials.linkedin },
    { flag: '--github', label: new URL(info.github).pathname.slice(1), href: info.github },
    { flag: '--x', label: `@${new URL(info.socials.twitter).pathname.slice(1)}`, href: info.socials.twitter },
    { flag: '--resume', label: 'man david', href: '/resume', internal: true },
    { flag: '--pdf', label: 'resume.pdf', href: '/resume.pdf' },
];

const ContactPage = () => {
    return (
        <TerminalWindow
            currentPage="contact"
            path="~/contact"
            status={<span>reply time ~24h</span>}
        >
            <CommandLine cwd="~/contact">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-wrap items-baseline gap-x-2">
                    <Prompt cwd="~/contact" />
                    <span className="term-cmd">mail david</span>
                </div>

                <div className="ink-muted measure mt-3">
                    <p>
                        I build backend systems — distributed services, storage engines and
                        the tooling around them. If you have a hard problem in that shape, or
                        just want to talk about databases, write to me.
                    </p>
                </div>

                <div className="mt-8">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <Prompt cwd="~/contact" />
                        <span className="term-cmd">contact --list</span>
                    </div>

                    <div className="mt-2 space-y-0.5">
                        {CHANNELS.map(channel => (
                            <a
                                key={channel.flag}
                                href={channel.href}
                                target={
                                    channel.internal || channel.href.startsWith('mailto:')
                                        ? undefined
                                        : '_blank'
                                }
                                rel="noopener noreferrer"
                                className="term-row group"
                            >
                                <span className="ink-faint w-[12ch] shrink-0">
                                    {channel.flag}
                                </span>
                                <span
                                    className="group-hover:underline"
                                    style={{ color: 'var(--term-blue)' }}
                                >
                                    {channel.label}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>

                <p className="ink-faint mt-8 text-[11px]">
                    open --email · open --resume · or type below
                </p>
            </motion.div>
            </CommandLine>
        </TerminalWindow>
    );
};

export default ContactPage;
