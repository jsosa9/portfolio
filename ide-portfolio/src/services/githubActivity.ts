// Real recent commits, pulled from GitHub's public REST API — no token
// needed since these are public repos. Aggregates across your most
// recently-pushed repos rather than one hardcoded repo.

export interface RecentCommit {
    repo: string;
    message: string;
    sha: string;
    date: string;
    url: string;
}

// Repos to skip entirely — matched as a case-insensitive substring of the
// repo name. Add more here if another noisy/auto-generated repo shows up.
const EXCLUDED_REPO_SUBSTRINGS = ['neetcode'];

interface GithubRepo {
    name: string;
    fork: boolean;
    pushed_at: string;
}

interface GithubCommitApiResponse {
    sha: string;
    html_url: string;
    commit: {
        message: string;
        author?: { date: string };
        committer?: { date: string };
    };
}

export async function fetchRecentCommits(
    username: string,
    opts: { maxRepos?: number; maxCommits?: number } = {}
): Promise<RecentCommit[]> {
    const { maxRepos = 5, maxCommits = 6 } = opts;

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=pushed&per_page=20`);
    if (!reposRes.ok) throw new Error(`Failed to list repos: ${reposRes.status}`);
    const repos: GithubRepo[] = await reposRes.json();

    const candidateRepos = repos
        .filter((r) => !r.fork)
        .filter((r) => !EXCLUDED_REPO_SUBSTRINGS.some((ex) => r.name.toLowerCase().includes(ex)))
        .slice(0, maxRepos);

    const commitLists = await Promise.all(
        candidateRepos.map(async (repo): Promise<RecentCommit[]> => {
            try {
                const res = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=2`);
                if (!res.ok) return [];
                const commits: GithubCommitApiResponse[] = await res.json();
                return commits.map((c) => ({
                    repo: repo.name,
                    message: c.commit.message.split('\n')[0],
                    sha: c.sha,
                    date: c.commit.author?.date || c.commit.committer?.date || repo.pushed_at,
                    url: c.html_url,
                }));
            } catch {
                return [];
            }
        })
    );

    return commitLists
        .flat()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, maxCommits);
}

export function formatRelativeTime(dateStr: string): string {
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    const steps: [number, string][] = [
        [60, 'sec'],
        [60, 'min'],
        [24, 'hr'],
        [7, 'day'],
        [4.345, 'week'],
        [12, 'month'],
    ];

    let value = diffSec;
    let unit = 'sec';
    for (const [divisor, name] of steps) {
        if (value < divisor) {
            unit = name;
            break;
        }
        value = Math.floor(value / divisor);
        unit = name;
    }

    if (unit === 'month' && value >= 12) {
        const years = Math.floor(value / 12);
        return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
    if (value <= 0) return 'just now';
    return `${value} ${unit}${value !== 1 ? 's' : ''} ago`;
}
