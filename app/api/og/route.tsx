import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import info from '@/misc/info';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'David Dada';
    const description =
        searchParams.get('description') || 'Computer Scientist and Experienced Backend Engineer.';
    const type = searchParams.get('type') || 'website';

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF',
                    padding: 50,
                    fontFamily: 'Arial, sans-serif',
                    color: '#fff',
                }}
            >
                <div style={{ display: 'flex', color: '#577fbc', fontSize: 24, marginBottom: 32 }}>
                    {new URL(info.url).hostname} / writing
                </div>

                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 'bold',
                        color: '#577fbc',
                        lineHeight: 1.1,
                        marginBottom: 24,
                        maxWidth: '100%',
                    }}
                >
                    {title}
                </div>
                <div style={{ fontSize: 28, color: '#7C8498', maxWidth: '100%' }}>{description}</div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 50,
                        left: 50,
                        fontSize: 24,
                        color: '#94a3b8',
                    }}
                >
                    {type === 'article' ? 'Article' : 'Portfolio'}
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
