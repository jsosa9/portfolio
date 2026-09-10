// Shared shape for a project entry. Most fields beyond the basics are
// optional — the UI (ContentRenderer, SecondarySidebar) already hides each
// section gracefully when its field is missing, so an in-progress project
// like stackd.ts can omit flavor fields (languages, deployHistory, snippet,
// architecture) until they're written for real.
export interface ProjectLanguage {
    name: string;
    percent: number;
    color: string;
}

export interface ProjectDeployEntry {
    version: string;
    msg: string;
    time: string;
    status: string;
}

export interface Project {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    longDescription?: string;
    type: string; // used unguarded (e.g. Terminal.tsx's `ls` command) — always provide a real value
    tech: string[];
    links: {
        github?: string;
        live?: string;
    };
    image?: string;
    date?: string;
    role?: string;
    highlights?: string[];
    featured?: boolean;
    languages?: ProjectLanguage[];
    deployHistory?: ProjectDeployEntry[];
    snippet?: string;
    architecture?: string;
}
