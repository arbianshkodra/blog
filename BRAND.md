# arbianshkodra.com — Brand Reference

**Canonical source of truth for the site's design tokens.** When values
conflict between this file and any other source (CSS, components), this file
wins. Update this file first, then propagate to `src/styles/global.css`.

The identity is a **terminal**: monospace everything, green-on-dark, quiet.
Restraint over decoration. The aesthetic comes from the shell prompts, the
palette, and the shell-comment section headers — not from ASCII art or
gimmicks. (An ASCII banner was tried and deliberately removed — too busy.)

---

## Palette

Defined as `@theme` tokens in `src/styles/global.css`.

| Token             | Value     | Notes                                  |
|-------------------|-----------|----------------------------------------|
| term-green        | `#4ade80` | primary accent (prompts, headings dark)|
| term-green-dim    | `#22c55e` | links, inline code, `user@host`        |
| term-amber        | `#fbbf24` | reserved / warnings                    |
| Dark page bg      | `#0a0a0a` | near-black                             |
| Dark card bg      | neutral-900/40 | terminal window body              |
| Light page bg     | neutral-50 | light mode                            |
| Prompt `~` path   | sky-500 / sky-400 | the cwd segment in prompts     |
| `:` `$` punctuation | neutral-500 | dim separators                     |

Dark mode adds a subtle CRT **scanline overlay** (`body::before`,
`mix-blend-mode: overlay`) — keep it faint; it should read as texture, not
noise.

---

## Typography

Everything is monospace. There is no proportional font.

| Role            | Font        | Notes                          |
|-----------------|-------------|--------------------------------|
| All text        | Geist Mono  | `--font-sans` and `--font-mono` both point here |
| Fallback        | ui-monospace, SFMono-Regular, Menlo, Consolas, monospace | |

Body being full-mono is a deliberate trade-off (on-brand, slightly harder for
very long reads). Revisit only if a long post feels heavy — the fix would be
mono headings/code + a proportional body, documented here first.

---

## Voice of the UI (microcopy)

- Header logo: `arbian@shkodra:~$` (green user@host, sky `~`, dim `:` `$`).
- Nav: `cd blog | projects | / grep` — shell verbs, not plain labels.
- Section headings on the homepage: shell comments — `# latest posts`,
  `# recent projects`, `# connect`.
- Hero: a fake zsh session — `whoami`, `cat about.txt`, `ls ~/interests`,
  then a blinking block cursor. Keep it short; it's an intro, not a resume.

---

## Identity / positioning

Arbian is framed as a **builder & experimenter at the edge of AI agents and
infrastructure** — not pinned to one language or job title. AI / agents / LLM
tooling lead; systems and infrastructure depth is one domain among several,
not the headline. Keep hero + metadata consistent with this framing.
