// Generic "fetch once, reuse for a while" helper backed by localStorage.
// Used for GitHub data (contributions, recent commits) so a returning
// visitor doesn't re-hit /api on every page load — same data reused for
// as long as the caller's ttlMs says, one real fetch per browser per window.

interface CacheEntry<T> {
    data: T;
    fetchedAt: number;
}

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const THREE_DAYS_MS = 3 * ONE_DAY_MS;

export async function withDailyCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = ONE_DAY_MS
): Promise<T> {
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const entry: CacheEntry<T> = JSON.parse(raw);
            if (Date.now() - entry.fetchedAt < ttlMs) {
                return entry.data;
            }
        }
    } catch {
        // localStorage unavailable (private browsing, blocked storage, bad
        // JSON) — just fall through and fetch fresh.
    }

    try {
        const data = await fetcher();
        try {
            const entry: CacheEntry<T> = { data, fetchedAt: Date.now() };
            localStorage.setItem(key, JSON.stringify(entry));
        } catch {
            // storage full/blocked — non-fatal, we just won't cache this time.
        }
        return data;
    } catch (err) {
        // Live fetch failed — serve whatever we last cached, even if stale,
        // rather than surfacing an error to a returning visitor.
        try {
            const raw = localStorage.getItem(key);
            if (raw) return (JSON.parse(raw) as CacheEntry<T>).data;
        } catch {
            // fall through to rethrow
        }
        throw err;
    }
}
