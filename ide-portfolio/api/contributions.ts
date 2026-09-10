// Vercel Edge Function. Fetches the real contribution calendar once, then
// lets Vercel's CDN cache the response for 24h and serve it to every
// visitor globally — no per-visitor GitHub calls, no cron job needed.
export const config = { runtime: 'edge' };

const CONTRIBUTIONS_API = 'https://github-contributions-api.jogruber.de/v4';
const GITHUB_USERNAME = 'jsosa9';

export default async function handler(): Promise<Response> {
    try {
        const res = await fetch(`${CONTRIBUTIONS_API}/${GITHUB_USERNAME}?y=last`);
        if (!res.ok) throw new Error(`upstream ${res.status}`);
        const data = await res.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'content-type': 'application/json',
                // Real-time isn't needed here — Vercel's CDN caches this for
                // 3 days (s-maxage) and serves a stale copy for up to a day
                // while it refreshes in the background, so visitors never
                // wait on a slow refetch, and upstream gets hit rarely.
                'cache-control': 'public, s-maxage=259200, stale-while-revalidate=86400',
            },
        });
    } catch {
        return new Response(JSON.stringify({ error: 'failed to fetch contributions' }), {
            status: 502,
            headers: { 'content-type': 'application/json' },
        });
    }
}
