import { useRef, useState, useEffect, useCallback } from 'react';
import { THEMES } from '../../data/themes';
import { profile } from '../../data/profile';
import { withDailyCache, THREE_DAYS_MS } from '../../utils/cachedFetch';
import contributionsFallback from '../../data/contributionsFallback.json';

// This site is a static GitHub Pages build with no serverless functions
// available, so we hit the public contributions API directly from the
// browser. The localStorage layer below (withDailyCache) caches the result
// per-visitor for a few days to avoid refetching on every visit, and falls
// back to stale cache if the live fetch fails. contributionsFallback.json
// (refreshed at build time, see scripts/fetch-contributions.mjs) covers the
// remaining case — a first-time visitor whose live fetch fails with no
// cache to fall back to — so the widget always has real data to render.
const CONTRIBUTIONS_API = 'https://github-contributions-api.jogruber.de/v4';
const GITHUB_USERNAME = profile.links.github.split('/').filter(Boolean).pop() || '';
const CONTRIBUTIONS_ENDPOINT = `${CONTRIBUTIONS_API}/${GITHUB_USERNAME}?y=last`;
const FETCH_TIMEOUT_MS = 8000;
const RETRY_DELAYS_MS = [300, 900];

async function fetchWithRetry(url: string): Promise<ContributionsResponse> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`Contributions request failed: ${res.status}`);
            return (await res.json()) as ContributionsResponse;
        } catch (err) {
            lastErr = err;
            if (attempt < RETRY_DELAYS_MS.length) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
            }
        } finally {
            clearTimeout(timer);
        }
    }
    throw lastErr;
}

interface ContributionDay {
    date: string;
    count: number;
    level: number; // 0-4, provided by the API
}

interface ContributionsResponse {
    total: Record<string, number>;
    contributions: ContributionDay[];
}

// Legend Component using current theme colors
const LegendBox = ({ opacity, label, theme }: { opacity: number, label: string, theme: string }) => {
    // @ts-ignore
    const activeTheme = THEMES[theme] || THEMES.default;
    const colors = {
        // @ts-ignore
        border: activeTheme.colors['--border'],
        // @ts-ignore
        accent: activeTheme.colors['--accent']
    };

    const bgStyle = opacity === 0
        ? { backgroundColor: colors.border, opacity: 0.4 }
        : { backgroundColor: colors.accent, opacity: opacity };

    return (
        <div
            style={{ width: 10, height: 10, borderRadius: 2, ...bgStyle }}
            className="inline-block"
            title={label}
        />
    );
};

// Real GitHub contribution levels (0-4) map to opacity the same way GitHub's
// own graph fades from empty to darkest green.
const LEVEL_OPACITY = [0.12, 0.4, 0.6, 0.8, 1.0];

const fallbackData = contributionsFallback as ContributionsResponse;
const fallbackTotal =
    Object.values(fallbackData.total || {})[0] ??
    fallbackData.contributions.reduce((sum, d) => sum + d.count, 0);

export const CanvasContributionMap = ({ theme }: { theme: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // Seed with the build-time snapshot so the widget always has real data
    // to paint immediately, even before (or if) the live fetch resolves.
    const [days, setDays] = useState<ContributionDay[] | null>(fallbackData.contributions);
    const [total, setTotal] = useState<number | null>(fallbackTotal);
    const [stale, setStale] = useState(false);

    useEffect(() => {
        if (!GITHUB_USERNAME) return;
        let cancelled = false;
        withDailyCache(
            `gh_contributions_${GITHUB_USERNAME}`,
            () => fetchWithRetry(CONTRIBUTIONS_ENDPOINT),
            THREE_DAYS_MS
        )
            .then((json) => {
                if (cancelled) return;
                setDays(json.contributions);
                const lastYearTotal = Object.values(json.total || {})[0];
                setTotal(lastYearTotal ?? json.contributions.reduce((sum, d) => sum + d.count, 0));
                setStale(false);
            })
            .catch(() => {
                // Live fetch failed and there was no cache to fall back to
                // (withDailyCache already tried) — keep showing the bundled
                // snapshot rather than blanking the widget out.
                if (!cancelled) setStale(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const getThemeColors = useCallback(() => {
        // @ts-ignore
        const activeTheme = THEMES[theme] || THEMES.default;
        return {
            border: activeTheme.colors['--border'],
            accent: activeTheme.colors['--accent'],
            textSecondary: activeTheme.colors['--text-secondary'],
        };
    }, [theme]);

    useEffect(() => {
        if (!days) return;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Bucket days into weeks (columns) the same way GitHub's real graph
        // does: each column is one week, rows are Sun (0) through Sat (6).
        const weeks: (ContributionDay | null)[][] = [];
        let currentWeek: (ContributionDay | null)[] = [];
        days.forEach((day, i) => {
            const dow = new Date(`${day.date}T00:00:00`).getDay();
            if (i === 0) {
                for (let pad = 0; pad < dow; pad++) currentWeek.push(null);
            }
            currentWeek.push(day);
            if (dow === 6) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });
        if (currentWeek.length) weeks.push(currentWeek);

        const COLS = weeks.length;
        const ROWS = 7;
        const GAP = 3;
        const MIN_BLOCK_SIZE = 8;
        const LEFT_OFFSET = 28;
        const TOP_OFFSET = 20;
        const PADDING = 10;

        let currentBlockSize = MIN_BLOCK_SIZE;

        const render = () => {
            const rect = container.getBoundingClientRect();
            const availableWidth = rect.width - PADDING * 2 - LEFT_OFFSET;
            const totalGapSpace = (COLS - 1) * GAP;

            let size = Math.floor((availableWidth - totalGapSpace) / COLS);
            size = Math.max(size, MIN_BLOCK_SIZE);
            currentBlockSize = size;

            const totalWidth = PADDING * 2 + LEFT_OFFSET + COLS * (size + GAP) - GAP;
            const totalHeight = PADDING * 2 + TOP_OFFSET + ROWS * (size + GAP) - GAP;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = totalWidth * dpr;
            canvas.height = totalHeight * dpr;
            canvas.style.width = `${totalWidth}px`;
            canvas.style.height = `${totalHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const colors = getThemeColors();
            ctx.clearRect(0, 0, totalWidth, totalHeight);

            // --- LABELS ---
            ctx.font = '500 10px sans-serif';
            // @ts-ignore
            ctx.fillStyle = colors.textSecondary;
            ctx.textBaseline = 'middle';

            const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
            dayLabels.forEach((label, r) => {
                if (!label) return;
                const y = PADDING + TOP_OFFSET + r * (currentBlockSize + GAP) + currentBlockSize / 2;
                ctx.fillText(label, PADDING, y);
            });

            let lastMonth = -1;
            weeks.forEach((week, c) => {
                const firstRealDay = week.find((d) => d !== null);
                if (!firstRealDay) return;
                const month = new Date(`${firstRealDay.date}T00:00:00`).getMonth();
                if (month !== lastMonth) {
                    lastMonth = month;
                    const x = PADDING + LEFT_OFFSET + c * (currentBlockSize + GAP);
                    const label = new Date(`${firstRealDay.date}T00:00:00`).toLocaleString('en-US', { month: 'short' });
                    ctx.fillText(label, x, PADDING + 8);
                }
            });

            // --- GRID ---
            weeks.forEach((week, c) => {
                week.forEach((day, r) => {
                    const x = PADDING + LEFT_OFFSET + c * (currentBlockSize + GAP);
                    const y = PADDING + TOP_OFFSET + r * (currentBlockSize + GAP);

                    const level = day ? day.level : -1;
                    const alpha = level >= 0 ? LEVEL_OPACITY[level] : 0.12;

                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();

                    if (theme === 'monokai' || theme === 'solarizedDark' || theme === 'highContrast') {
                        ctx.rect(x, y, currentBlockSize, currentBlockSize);
                    } else if (theme === 'dracula' || theme === 'synthwave') {
                        ctx.arc(x + currentBlockSize / 2, y + currentBlockSize / 2, currentBlockSize / 2, 0, Math.PI * 2);
                    } else {
                        ctx.roundRect(x, y, currentBlockSize, currentBlockSize, 2);
                    }

                    if (level > 0) {
                        // @ts-ignore
                        ctx.fillStyle = colors.accent;
                        if (theme === 'synthwave' || theme === 'dracula') {
                            // @ts-ignore
                            ctx.shadowColor = colors.accent;
                            ctx.shadowBlur = 8 * alpha;
                        }
                    } else {
                        // @ts-ignore
                        ctx.fillStyle = colors.border;
                    }

                    ctx.fill();
                    ctx.restore();
                });
            });
        };

        render();
        window.addEventListener('resize', render);
        return () => window.removeEventListener('resize', render);
    }, [days, theme, getThemeColors]);

    return (
        <div className="mb-12 border border-[var(--border)] rounded-md bg-[var(--bg-activity)] p-5 max-w-full inline-block transition-colors duration-300">
            <div className="flex justify-between items-end mb-4 w-full">
                <h2 className="text-sm md:text-base text-[var(--text-primary)] font-sans font-medium">
                    {total === null
                        ? 'loading contributions…'
                        : `${total} contributions in the last year${stale ? ' (cached)' : ''}`}
                </h2>
            </div>

            <div ref={containerRef} className="w-full overflow-x-auto custom-scrollbar">
                <canvas ref={canvasRef} className="block" />
            </div>

            <div className="flex justify-between items-center mt-4 text-[10px] md:text-xs text-[var(--text-secondary)] font-sans w-full">
                <div className="hidden sm:block opacity-50">
                    Live from {GITHUB_USERNAME ? `github.com/${GITHUB_USERNAME}` : 'GitHub'}.
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                    <span className="mr-1">Less</span>
                    <LegendBox opacity={0} label="0" theme={theme} />
                    <LegendBox opacity={0.4} label="1-3" theme={theme} />
                    <LegendBox opacity={0.6} label="4-6" theme={theme} />
                    <LegendBox opacity={1.0} label="7+" theme={theme} />
                    <span className="ml-1">More</span>
                </div>
            </div>
        </div>
    );
};
