// Real project — fields below are filled in with what's confirmed from
// content.js (the source of truth shared with the clean portfolio repo).
// Everything marked TODO is intentionally left blank rather than invented —
// fill in and the detail page picks it up automatically (most of these
// fields degrade gracefully when empty — see ContentRenderer.tsx).
import type { Project } from "./types";

export const stackd: Project = {
    id: "stackd",
    title: "Stackd",
    subtitle: "TODO — one-line tagline for the project card/header",

    description:
        "AI coaching app: a persona modeled after a public figure checks in daily, classifies messages (check ins, tasks, journal entries), and replies in that person's voice via Gemini.",
    // longDescription: leave unset and the detail page falls back to
    // `description` above. Fill in for a fuller multi-paragraph writeup.
    // longDescription: `TODO`,

    type: "Full Stack Web App",
    tech: ["Next.js", "FastAPI", "Supabase", "Gemini"],

    links: {
        github: "", // TODO — real repo URL (content.js only had your generic profile link as a placeholder)
        // live: "", // TODO — optional, omit entirely if there's no deployed demo
    },

    image: "", // TODO — real screenshot. Simplest: drop a file in public/projects/ and reference it as "/projects/stackd.png"

    date: "", // TODO — when you built it
    role: "", // TODO — e.g. "Solo Developer" or your actual role if it was a team project

    highlights: [
        "Persona modeled after a public figure checks in daily",
        "Classifies incoming messages into check-ins, tasks, and journal entries",
        "Replies in the persona's own voice via Gemini",
    ],

    featured: true,

    // Everything below is optional flavor — the UI hides each section
    // entirely when the field is missing, so it's safe to leave these out
    // until you provide the real content.
    // languages: [{ name: "TypeScript", percent: 60, color: "#3178c6" }, ...],
    // deployHistory: [{ version: "v1.0", msg: "TODO", time: "TODO", status: "success" }],
    // snippet: `TODO — a real code excerpt`,
    // architecture: `TODO — ASCII diagram of how it actually works`,
};
