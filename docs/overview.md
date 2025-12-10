# Appraise+ Overview

This app helps UK doctors turn real clinical work and training experiences into structured portfolio entries and receive supervisor-style feedback.

## How it works
- Users draft a note, choose a form type (or AUTO), and optionally link capabilities.
- The app calls NanoGPT to generate or refine entries and to produce supervisor feedback.
- Output includes structured content plus 3–5 suggested tags.

## Key files
- `services/prompts.ts` — all AI system prompts and prompt builders (edit text here).
- `services/aiService.ts` — wraps AI calls (NanoGPT endpoint, prompt wiring, tag parsing).
- `components/` — UI building blocks (Console, Notes, Settings, Sidebar, etc.).
- `context/` — React contexts (authentication, theming).
- `lib/firebase.ts` — Firebase initialization.
- `App.tsx` / `index.tsx` — app entry and layout wiring.
- `constants.ts` / `types.ts` — shared enums, types, and static lists.

## Editing prompts (non-coder friendly)
1. Open `services/prompts.ts`.
2. Update the text blocks under:
   - `APPRAISAL_SYSTEM_PROMPT` (main instructions for generating entries).
   - `FORM_TEMPLATES_PROMPT` (per-form structures).
   - `SUPERVISOR_SYSTEM_PROMPT` (feedback guidance).
3. Save. The app will use the new wording on the next run/build.

## API keys
- NanoGPT key fallback is hardcoded in `services/aiService.ts` (`DEFAULT_NANOGPT_API_KEY`).
- You can override with env vars: `VITE_NANOGPT_API_KEY` or `VITE_GEMINI_API_KEY` (see `vite.config.ts`).

## Running
- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`

## Notes on structure
- Prompts are centralized for easy editing.
- Business logic is isolated in `services/`.
- UI components stay in `components/` to keep presentation separate from logic.

## Improving further
- Add code-splitting/lazy-loading to shrink the main bundle.
- Remove hardcoded secrets before shipping; rely on env vars or a backend proxy.
- Add automated tests around AI prompt builders and tag parsing.
