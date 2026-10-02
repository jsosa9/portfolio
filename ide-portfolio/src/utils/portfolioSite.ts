// The clean portfolio site owns /notes — this site links out to it rather
// than duplicating that content. Same pattern as portfolio's
// IDE_VERSION_URL: real localhost URL in dev (actually testable), a clearly
// marked placeholder in prod until the clean site has a real deployed URL.
const PORTFOLIO_SITE_URL = import.meta.env.DEV
    ? 'http://localhost:5175'
    : 'https://TODO-set-real-portfolio-url.vercel.app';

export function portfolioNoteUrl(slug: string): string {
    return `${PORTFOLIO_SITE_URL}/notes/${slug}`;
}
