// Real project — fields below are filled in with what's confirmed from
// content.js (the source of truth shared with the clean portfolio repo).
// Everything marked TODO is intentionally left blank rather than invented —
// fill in and the detail page picks it up automatically (most of these
// fields degrade gracefully when empty — see ContentRenderer.tsx).
import type { Project } from "./types";
import { publicAsset } from "../../utils/publicAsset";

export const stackd: Project = {
    id: "stackd",
    title: "Stackd",
    subtitle: "SMS accountability coaching powered by AI. No app to download. You just text a number.",

    description:
        "AI coaching app: a persona modeled after a public figure checks in daily, classifies messages (check ins, tasks, journal entries), and replies in that person's voice via Gemini.",
    longDescription: `I built this because I kept noticing the same thing: I'd lose hours scrolling instead of doing what I actually wanted to do, and the thing that snapped me out of it was always something dumb and simple, a text that said "hey, are you having a productive day?" or "hey, stop scrolling." A text hits different than a notification you can just swipe away. So I started building something that would send that text for you.

Then I thought: why should the voice be generic? What if you picked someone whose mindset actually drives you, a public figure with a philosophy you respect, and the coach talked like them? That's stackd. You pick a public figure, the app builds an AI coach around their publicly known philosophy and how they communicate, and that coach checks in on you daily, holds you to your goals, tracks your streaks, and pushes back when you're making excuses, all inside your messages app, nothing to install.

Every inbound text goes through the same pipeline: STOP/HELP get intercepted first, the message gets classified (check-in, task, journal, nutrition, bet, or general), the right handler writes structured data to the database, and a voice generator assembles the coach's persona, conversation history, and a set of rules I call HUMAN_BEHAVIOR_RULES before sending it all to Gemini. HUMAN_BEHAVIOR_RULES gets injected into every user-facing Gemini call in the app. It's what keeps the tone consistent everywhere: no markdown, no corporate language, no "as an AI" filler.

Originally I wanted to actually launch this, not as a serious startup, just something people could use for a small fee to cover the cost of keeping it running. But personas turned out to be a real legal minefield, not just a hypothetical one. A lot of public figures are trademarked or represented in ways that make "an AI coach that talks like X" an actual copyright problem. So for now, you can only try the experience through the website demo, not over real SMS.`,

    type: "Full Stack Web App",
    tech: ["Next.js", "FastAPI", "Supabase", "Gemini"],

    links: {
        github: "https://github.com/jsosa9/stackd",
        live: "https://stackd.chat",
    },

    image: publicAsset("projects/stackd.jpeg"),

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
