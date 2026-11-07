import info from './info';

const ogImageUrl = new URL(`${info.url}/api/og`);

ogImageUrl.searchParams.append('title', info.name);
ogImageUrl.searchParams.append('description', info.description);
ogImageUrl.searchParams.append('type', 'website');

export default ogImageUrl;
