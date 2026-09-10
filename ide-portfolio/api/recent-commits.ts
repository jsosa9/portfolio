// Vercel Edge Function — same caching approach as api/contributions.ts.
// Does the multi-request "list repos, then fetch latest commits per repo"
// work server-side once, then the CDN caches the finished result for 24h
// and every visitor just gets that, globally shared.
export const config = { runtime: 'edge' };

import { fetchRecentCommits } from '../src/services/githubActivity';
import { profile } from '../src/data/profile';

const GITHUB_USERNAME = profile.links.github.split('/').filter(Boolean).pop() || '';

export default async function handler(): Promise<Response> {
    try {
        const commits = await fetchRecentCommits(GITHUB_USERNAME);

        return new Response(JSON.stringify(commits), {
            status: 200,
            headers: {
                'content-type': 'application/json',
                // Same reasoning as api/contributions.ts — this is the
                // pricier fetch (up to 6 GitHub requests chained together),
                // so a longer window matters more here.
                'cache-control': 'public, s-maxage=259200, stale-while-revalidate=86400',
            },
        });
    } catch {
        return new Response(JSON.stringify({ error: 'failed to fetch recent commits' }), {
            status: 502,
            headers: { 'content-type': 'application/json' },
        });
    }
}
