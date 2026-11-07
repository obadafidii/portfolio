import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import info from '@/misc/info';

export const runtime = 'nodejs';

/* Terminal palette from app/globals.css, dark theme. */
const C = {
    paper: '#0a0d12',
    line: '#1e242e',
    bright: '#f2f6fa',
    muted: '#98a3b3',
    faint: '#7a8492',
    green: '#56d364',
    blue: '#79c0ff',
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || info.name;
    const description = searchParams.get('description') || info.description;
    const type = searchParams.get('type') || 'website';
    const host = new URL(info.url).hostname;
    const cwd = type === 'article' ? '~/writing' : '~';
    const command = type === 'article' ? 'cat post.md' : 'whoami';

    return new ImageResponse(
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: C.paper,
                padding: 64,
                fontFamily: 'ui-monospace, Menlo, monospace',
            }}
        >
            <div style={{ display: 'flex', gap: 10 }}>
                {[0, 1, 2].map(dot => (
                    <div
                        key={dot}
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: C.line,
                        }}
                    />
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                    style={{ display: 'flex', fontSize: 28, marginBottom: 28 }}
                >
                    <span style={{ color: C.green }}>david@obadafidi</span>
                    <span style={{ color: C.blue }}>:{cwd}$</span>
                    <span style={{ color: C.bright, marginLeft: 14 }}>
                        {command}
                    </span>
                </div>
                <div
                    style={{
                        fontSize: title.length > 40 ? 56 : 68,
                        fontWeight: 700,
                        color: C.bright,
                        lineHeight: 1.12,
                        marginBottom: 24,
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        fontSize: 28,
                        color: C.muted,
                        lineHeight: 1.4,
                        maxWidth: 1000,
                    }}
                >
                    {description}
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${C.line}`,
                    paddingTop: 22,
                    fontSize: 22,
                    color: C.faint,
                }}
            >
                <span>{host}</span>
                <span>{type === 'article' ? 'article' : info.role}</span>
            </div>
        </div>,
        {
            width: 1200,
            height: 630,
        },
    );
}
