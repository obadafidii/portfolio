'use client';

import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { Shell } from '@/components/ui/Shell';

const Home = () => {
    return (
        <TerminalWindow
            currentPage="home"
            path="~"
            status={
                <>
                    <span className="hidden sm:inline">Lagos, NG</span>
                    <span>
                        <span style={{ color: 'var(--term-blue)' }}>help</span>{' '}
                        for commands
                    </span>
                </>
            }
        >
            <Shell />
        </TerminalWindow>
    );
};

export default Home;
