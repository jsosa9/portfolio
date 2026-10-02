// Prefixes a public/ asset path with Vite's actual base URL. Needed because
// this site is served from a subpath (base: '/ide-portfolio/' in
// vite.config.ts) — plain string paths like "/projects/x.png" in data files
// don't get that prefix automatically the way real asset imports do, so a
// hardcoded "/projects/x.png" 404s in production. Use this instead:
// publicAsset('projects/x.png') -> '/ide-portfolio/projects/x.png'
export function publicAsset(path: string): string {
    return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
