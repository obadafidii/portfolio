import info from './info';

const ogImageUrl = new URL(`${info.url}/api/og`);

ogImageUrl.searchParams.append('title', 'David Dada');
ogImageUrl.searchParams.append(
    'description',
    'Computer Scientist and Experienced Backend Engineer.',
);
ogImageUrl.searchParams.append('type', 'website');

export default ogImageUrl;
