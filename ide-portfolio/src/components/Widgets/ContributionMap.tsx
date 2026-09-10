import { useRef, useState, useEffect, useCallback } from 'react';
import { THEMES } from '../../data/themes';
import { profile } from '../../data/profile';
import { withDailyCache, THREE_DAYS_MS } from '../../utils/cachedFetch';

// Goes through our own /api/contributions (see api/contributions.ts), which
// Vercel's CDN caches for 24h and serves to every visitor — not a per-browser
// cache. The localStorage layer below is just an extra same-browser
// accelerator on top of that; the CDN cache is what makes it actually global.
const CONTRIBUTIONS_ENDPOINT = '/api/contributions';
const GITHUB_USERNAME = profile.links.github.split('/').filter(Boolean).pop() || '';

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

export const CanvasContributionMap = ({ theme }: { theme: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [days, setDays] = useState<ContributionDay[] | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!GITHUB_USERNAME) {
            setError(true);
            return;
        }
        let cancelled = false;
        withDailyCache(
            `gh_contributions_${GITHUB_USERNAME}`,
            () =>
                fetch(CONTRIBUTIONS_ENDPOINT).then((res) => {
                    if (!res.ok) throw new Error(`Contributions request failed: ${res.status}`);
                    return res.json() as Promise<ContributionsResponse>;
                }),
            THREE_DAYS_MS
        )
            .then((json) => {
                if (cancelled) return;
                setDays(json.contributions);
                const lastYearTotal = Object.values(json.total || {})[0];
                setTotal(lastYearTotal ?? json.contributions.reduce((sum, d) => sum + d.count, 0));
            })
            .catch(() => {
                if (!cancelled) setError(true);
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
                    {error
                        ? "couldn't load contributions"
                        : total === null
                            ? 'loading contributions…'
                            : `${total} contributions in the last year`}
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
