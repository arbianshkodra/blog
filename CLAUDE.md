# arbianshkodra.com — Project Notes

Terminal-aesthetic personal blog. This file is the playbook for anyone —
human or agent — working on the site. Read it before editing.

- **Repo:** `github.com/arbianshkodra/blog` (public)
- **Live site:** https://arbianshkodra.com
- **Stack:** Astro 5 (Astro Micro base), Tailwind v4, MDX. Zero framework JS.
- **Hosting:** Cloudflare Pages. Builds on push to `main`.
- **Package manager:** npm (single static site).

## Positioning

Builder and experimenter at the edge of AI agents and infrastructure.
AI/agents/LLM-tooling lead; systems and infrastructure alongside. Keep all
copy consistent (see `BRAND.md`).

## Writing guardrails

- **Draft locally, publish when ready.** The repo is public — draft commits
  land in git history. Keep working notes in a `*.notes.md` file (excluded
  from the build) rather than committing half-baked prose.
- **Topics:** own open-source work (accelero), AI-agent/LLM experiments,
  general engineering craft, and distributed-systems / messaging lessons
  framed in the abstract as reusable principles.
- **No invented facts or URLs.** Don't fabricate repo links, benchmarks, or
  quotes. Only original work goes on the projects page — not forks.
- Write in the first person, from real experience. The value is the concrete
  detail (a real bug, a real decision, a real tradeoff), not generic prose.

## Writing a post (discipline)

- Pick a one-line **spine**: the post's central claim or question. Every
  section serves it. A section serving a different thread is a different post.
- **Verify every factual claim** against a primary source before it ships.
  Flag unverifiable claims; never fabricate.
- **Bias to cut.** Length is the enemy of retention. The open earns two short
  paragraphs before the first real idea. If a paragraph can be deleted without
  loss, delete it.
- **No em/en-dashes. Run an AI-tell / banned-word pass** so it reads human.
- One idea per section, one analogy per point.

## Commands

- `npm install` — restore deps (node_modules is gitignored).
- `npm run dev` — local dev server at :4321.
- `npm run build` — production build to `./dist/` (also generates sitemap,
  RSS, and the Pagefind search index). Must pass before push.

## Structure

- `src/consts.ts` — site metadata and socials (canonical config).
- `src/pages/index.astro` — the terminal hero + homepage sections.
- `src/content/blog/<slug>/index.md(x)` — posts. Frontmatter: title,
  description, date, tags, optional draft.
- `src/content/projects/<slug>/index.md` — projects (same shape + demoURL,
  repoURL). `draft: true` hides an entry from the site.
- `src/components/Giscus.astro` — comments, backed by GitHub Discussions.
- `BRAND.md` — design tokens (source of truth). `CHECKLISTS.md` — pre-publish
  and layout-change checklists.

## Parked / phase 2

- ATproto/Bluesky mirroring — deferred; revisit to publish posts as portable
  records on the open social web.
