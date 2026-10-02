import type { Project } from "./types";
import { publicAsset } from "../../utils/publicAsset";
import { portfolioNoteUrl } from "../../utils/portfolioSite";

// TODOs left blank rather than invented — same pattern as stackd.ts.
export const llmFromScratch: Project = {
    id: "llm-from-scratch",
    title: "LLM From Scratch",
    subtitle: "TODO — one-line tagline for the project card/header",

    description: "Building an LLM from scratch, piece by piece. Currently: a character-level tokenizer.",
    // longDescription: leave unset, falls back to description above.

    type: "Machine Learning",
    tech: ["Python", "Jupyter"],

    links: {
        github: "https://github.com/jsosa9/llm-from-scratch",
        // live: not applicable — no demo, it's a from-scratch build
    },

    // One entry per section as they get written — tokenizer now, encoder
    // etc. as they're built out.
    notes: [
        { title: "Character-Level Tokenizer", url: portfolioNoteUrl("char-level-tokenizer") },
    ],

    image: publicAsset("projects/default.svg"), // generic placeholder until there's a real screenshot/diagram

    date: "", // TODO
    role: "", // TODO

    highlights: [
        "Character-level tokenizer built from scratch, no libraries",
        "Vocab built via hashmap: each character gets a unique id",
        "Encode/decode round-trips correctly on real text",
    ],

    featured: true,

    // Real code, not invented flavor — pulled directly from tokenizer.ipynb.
    snippet: `class Tokenizer():
    def __init__(self, text):
        self.encoder_map = {}
        self.decoder_map = {}
        self.build_vocab(text)

    def normalization(self, input):
        normalization_outcome = input.lower()
        normalization_outcome = list(normalization_outcome)
        return normalization_outcome

    def build_vocab(self, text):
        list_user_input = self.normalization(text)
        for c in list_user_input:
            self.encoder_map.setdefault(c, len(self.encoder_map) + 1)
            self.decoder_map.setdefault(self.encoder_map.get(c), c)

    def encoder(self, text):
        encoder_outcome = list()
        list_user_input = self.normalization(text)
        for c in list_user_input:
            encoder_outcome.append(self.encoder_map.get(c))
        return encoder_outcome

    def decoder(self, id):
        decoder_outcome = list()
        for n in id:
            decoder_outcome.append(self.decoder_map.get(n))
        return "".join(decoder_outcome)`,

    // Everything below is optional flavor, left out until there's real
    // content for it — the UI hides each section when the field is missing.
    // languages: [{ name: "Python", percent: 100, color: "#3776ab" }],
    // deployHistory: [{ version: "v0.1", msg: "TODO", time: "TODO", status: "success" }],
    // architecture: `TODO — ASCII diagram of the tokenizer pipeline`,
};
