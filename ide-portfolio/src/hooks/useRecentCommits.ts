import { useEffect, useState } from 'react';
import type { RecentCommit } from '../services/githubActivity';
import { profile } from '../data/profile';
import { withDailyCache, THREE_DAYS_MS } from '../utils/cachedFetch';

// Goes through our own /api/recent-commits (see api/recent-commits.ts),
// which does the multi-repo GitHub lookups server-side and is cached
// globally by Vercel's CDN for 24h — not a per-browser fetch.
const RECENT_COMMITS_ENDPOINT = '/api/recent-commits';
const GITHUB_USERNAME = profile.links.github.split('/').filter(Boolean).pop() || '';

async function fetchFromApi(): Promise<RecentCommit[]> {
    const res = await fetch(RECENT_COMMITS_ENDPOINT);
    if (!res.ok) throw new Error(`Recent commits request failed: ${res.status}`);
    return res.json();
}

export function useRecentCommits() {
    const [commits, setCommits] = useState<RecentCommit[] | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!GITHUB_USERNAME) {
            setError(true);
            return;
        }
        let cancelled = false;
        withDailyCache(`gh_recent_commits_${GITHUB_USERNAME}`, fetchFromApi, THREE_DAYS_MS)
            .then((data) => {
                if (!cancelled) setCommits(data);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return { commits, error };
}
