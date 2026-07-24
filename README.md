# arbianshkodra.com

Source for [arbianshkodra.com](https://arbianshkodra.com) — the personal blog
of Arbian Shkodra. Builder and experimenter working at the edge of AI agents
and infrastructure.

A terminal-aesthetic site: monospace, green-on-dark, shell prompts. Writing
about AI agents, LLM tooling, distributed systems, GitOps, and the messaging
infrastructure I work on at scale.

## Stack

- [Astro](https://astro.build) static site generator (built on the Astro
  Micro theme, heavily customized into a terminal aesthetic)
- [Tailwind CSS](https://tailwindcss.com) v4
- MDX, with sitemap, RSS, and [Pagefind](https://pagefind.app) search
- Zero client-side framework JS
- Deployed via [Cloudflare Pages](https://pages.cloudflare.com)

## Development

```sh
npm install      # restore dependencies
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build to ./dist (also builds sitemap + RSS + search index)
```

## Project docs

- [`CLAUDE.md`](CLAUDE.md) — the working playbook: positioning, publishing
  guardrails, writing discipline, structure, and the deploy setup.
- [`BRAND.md`](BRAND.md) — canonical design tokens (palette, type, microcopy).
- [`CHECKLISTS.md`](CHECKLISTS.md) — pre-publish and layout-change checklists.

## Licenses

- **Code / infrastructure** (Astro config, layouts, components, styles,
  scripts): [CC0 1.0](LICENSE) — public domain, use freely.
- **Content** (`src/content/`): [CC BY-NC-ND 4.0](src/content/LICENSE) — share
  with attribution, no commercial use, no derivatives.

Built on [Astro Micro](https://github.com/trevortylerlee/astro-micro) by Trevor
Lee (MIT), a fork of [Astro Nano](https://github.com/markhorn-dev/astro-nano)
by Mark Horn.
