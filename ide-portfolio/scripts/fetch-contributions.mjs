// Runs before every build. Fetches a fresh snapshot of the GitHub
// contribution calendar and bundles it into the app as a fallback so the
// widget always has real data to render, even if the live jogruber.de
// request fails for a visitor (first load, no localStorage cache yet).
// Never fails the build — if the network call fails, the previously
// checked-in snapshot is left untouched.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const GITHUB_USERNAME = 'jsosa9';
const CONTRIBUTIONS_API = 'https://github-contributions-api.jogruber.de/v4';
const OUT_PATH = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../src/data/contributionsFallback.json'
);

try {
    const res = await fetch(`${CONTRIBUTIONS_API}/${GITHUB_USERNAME}?y=last`);
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    await writeFile(OUT_PATH, JSON.stringify(data), 'utf-8');
    console.log(`[fetch-contributions] wrote fresh snapshot to ${OUT_PATH}`);
} catch (err) {
    console.warn(`[fetch-contributions] skipped refresh (${err.message}); keeping existing snapshot`);
}
