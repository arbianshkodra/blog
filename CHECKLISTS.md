# Checklists

Operational checklists for arbianshkodra.com. Referenced from `CLAUDE.md`.
Two flows: **publishing a post** and **changing layout / templates / CSS**.

---

## Publishing a post

Before a post goes live (pushed to `main` / deployed):

- [ ] **Frontmatter complete** — `title`, `date`, `description`, `tags`.
      Set `draft: true` while writing; remove it to publish.
- [ ] **Date = publish day** — posts are often drafted over several days; set
      `date` to the actual ship date before deploying.
- [ ] **Spine check** — the post has one clear central claim; every section
      serves it. (See `CLAUDE.md` → Writing a post.)
- [ ] **Claims verified** — every factual claim checked against a primary
      source. Nothing fabricated. No invented URLs, benchmarks, or quotes.
- [ ] **Guardrails** — no [redacted] internals / incidents / customer data.
      Framed as "what I learned," not "what happened at work."
- [ ] **Cut pass** — bias to cut; preamble killed; no paragraph that can be
      deleted without loss.
- [ ] **AI-tell pass** — no em/en-dashes; run banned-word / humanizer check.
      The concrete detail only Arbian has is what makes it his.
- [ ] **Links use descriptive text** — never a raw URL as link text.
- [ ] **Images have alt text** — describe the image for a no-vision reader.
- [ ] **Build passes** — `npm run build` (clean, sitemap + RSS + Pagefind ok).
- [ ] **Right gh account** — `gh auth switch --user arbianshkodra` before
      push; switch back to `work-account` after.

---

## Layout / template / CSS changes

Whenever you touch `src/layouts/`, `src/components/`, or `src/styles/`:

- [ ] **Mobile check** — view at 375px and 320px. No horizontal overflow;
      the terminal window and ASCII/prompt lines reflow sensibly.
- [ ] **Light AND dark mode** both checked — the terminal palette and the
      scanline overlay must both hold; verify contrast ≥ 4.5:1 for text.
- [ ] **Brand value changed?** Update `BRAND.md` FIRST, then propagate to
      `src/styles/global.css`. `BRAND.md` is the source of truth.
- [ ] **Build passes** — `npm run build`.
- [ ] **Visual verify** — screenshot the affected page(s) before pushing.

---

## Enabling comments (Giscus) — one-time

- [ ] Enable **Discussions** on `arbianshkodra/blog` (Settings → General →
      Features → Discussions).
- [ ] Run setup at https://giscus.app for `arbianshkodra/blog`, pick a
      category (Announcements recommended).
- [ ] Replace the `TODO_REPO_ID` / `TODO_CATEGORY_ID` placeholders in
      `src/components/Giscus.astro` with the generated values.
- [ ] `npm run build`, verify the widget renders, push.
