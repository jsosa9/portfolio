// Identity data shared with the clean portfolio (jsosa9/portfolio). Both
// repos import these same files from ../../../shared-data/ — a sibling
// folder to both projects, not a per-repo copy. Edit them there, not here.
import profileData from '../../../shared-data/profile.json';
import projectsData from '../../../shared-data/projects.json';
import experienceData from '../../../shared-data/experience.json';
import hackathonsData from '../../../shared-data/hackathons.json';

export interface SharedProfile {
  name: string;
  tagline: string;
  about: string;
  location: string;
  links: {
    email: string;
    phone?: string;
    linkedin: string;
    github: string;
    site?: string;
  };
  skills: string[];
}

export const profile = profileData as SharedProfile;
export const sharedProjects = projectsData;
export const sharedExperience = experienceData;
export const sharedHackathons = hackathonsData;

// convenience — first-name only, used in a few tight UI spots (tabs, badges)
export const firstName = profile.name.split(' ')[0];

// IDE-only persona copy — this doesn't exist in the shared JSON on purpose
// (it's flavor for this site's "status line" UI, not a fact about Jose).
// Edit freely, it has no effect on the clean portfolio.
export const idePersona = {
  role: 'Full Stack Developer & AI Builder',
  currentRole: 'CS Student @ Rutgers',
  status: 'Building Stackd',
  availabilityNote: 'Open to internships',
  // Fallback shown only while the real GitHub commit feed is loading (or if
  // it fails) — see useRecentCommits / ContentRenderer's home view.
  recentActivity: [
    { action: 'Building', target: 'Stackd, an AI coaching app', time: 'ongoing', url: undefined as string | undefined },
    { action: 'Migrating', target: '300+ E2E tests to Cypress', time: 'at ADP', url: undefined as string | undefined },
    { action: 'Grounding', target: "NJ's AI Assistant in real docs", time: 'at NJ OOI', url: undefined as string | undefined },
  ],
};
