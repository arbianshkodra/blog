# arbianshkodra.com — Project Notes (for the agent)

Terminal-aesthetic personal blog. This file is the playbook for anyone —
human or agent — working on the site. Read it before editing.

- **Repo:** `github.com/arbianshkodra/blog` (public)
- **Live site:** https://arbianshkodra.com (not yet deployed)
- **Source:** `~/Projects/personal/arbianshkodra-blog`
- **Stack:** Astro 5 (Astro Micro base), Tailwind v4, MDX. Zero framework JS.
- **Deploy target:** Cloudflare Pages (chosen over GitHub Pages — faster,
  better caching, free). Builds on push to `main`.
- **Package manager:** npm (not pnpm — single static site, not worth it).

## GitHub account gotcha (important)

`gh` has two accounts: `work-account` ([redacted] work, usually active) and
`arbianshkodra` (owns this repo + accelero). Run gh/git via a login shell
(`bash -lc '...'`). Before pushing here: `gh auth switch --user arbianshkodra`,
then switch back to `work-account` when done. A 404 on `arbianshkodra/*` from the
`work-account` session means the wrong account is active, not a missing repo.

## Positioning

Arbian is a **builder & experimenter at the edge of AI agents and
infrastructure** — not "engineering," not "Go dev." AI/agents/LLM-tooling lead;
messaging-infra is one domain among several. Keep all copy consistent (see
`BRAND.md`).

## Publishing guardrails (non-negotiable)

- **Draft LOCALLY, push when ready.** The repo is public — draft commits are
  visible in git history. Keep a `content/blog/<slug>.notes.md`-style working
  file if useful; it's fine, just don't commit half-baked prose.
- **Topics:** Arbian's own OSS (accelero), AI-agent/LLM experiments, general
  engineering craft, and the messaging/carrier domain **in the abstract**.
- **NEVER leak [redacted] internals** — no incidents, customer data, internal
  repo names, architecture specifics, or "what broke last week." Frame as
  "what I learned about X," never "what happened at [redacted]." He publishes
  under his real name as a VP; readers will see it.
- **No invented facts or URLs.** Don't fabricate repo links, benchmarks, or
  quotes. Don't dress up forks (hcloud, kube-hetzner, ohmyzsh) as portfolio
  projects — only original work goes on the projects page.

## Writing a post (discipline, adapted from joe.dev)

- Pick a one-line **spine**: the post's central claim/question. Every section
  serves it. A section serving a different thread is a different post — cut it.
- **Verify every factual claim** against a primary source before it ships.
  Flag unverifiable claims, never fabricate.
- **Bias to cut.** Length is the enemy of retention. The open earns two short
  paragraphs before the first real idea. If a paragraph can be deleted without
  loss, delete it.
- **No em/en-dashes; run an AI-tell / banned-word pass.** Humanize — the
  `humanizer` skill exists for this. The value is the concrete detail only
  Arbian has (a real bug, a real decision), not generic prose.
- One idea per section, one analogy per point.

## Commands

- `npm install` — restore deps (node_modules is gitignored).
- `npm run dev` — local dev server at :4321.
- `npm run build` — production build to `./dist/` (also generates sitemap +
  RSS + Pagefind search index). Must pass before push.

## Structure

- `src/consts.ts` — site metadata, socials (canonical config).
- `src/pages/index.astro` — the terminal hero + homepage sections.
- `src/content/blog/<slug>/index.md(x)` — posts. Frontmatter: title,
  description, date, tags, optional draft.
- `src/content/projects/<slug>/index.md` — projects (same shape + demoURL,
  repoURL). `draft: true` hides from the site.
- `src/components/Giscus.astro` — comments. **Not yet live**: repo/category
  IDs are TODO placeholders until GitHub Discussions is enabled and
  giscus.app generates real IDs. See the comment block in that file.
- `BRAND.md` — design tokens (source of truth). `CHECKLISTS.md` — pre-publish
  and layout-change checklists.

## Parked / phase 2

- **ATproto/Bluesky mirroring** (Joe uses Sequoia) — deferred; revisit if
  Arbian wants posts as portable records on the open social web.
