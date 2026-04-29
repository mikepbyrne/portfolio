# Mike Byrne — Portfolio

Senior Producer specializing in commercial production for video and stills.

**Live site:** https://mikepbyrne.github.io/portfolio/

## Contents

- `site/` — Astro source for the portfolio site
- `Selects/` *(gitignored)* — source images and videos, organized by client
- `_meta/` *(gitignored)* — Vimeo catalog and working notes

## Local development

```bash
cd site
npm install
npm run optimize   # only when /Selects/ contents change
npm run dev        # http://localhost:4321
```

## Build & deploy

GitHub Actions deploys `site/dist/` to GitHub Pages on every push to `main`.

The optimization step runs locally — optimized media is committed to `site/public/media/` so the CI build is fast and doesn't need raw assets.

## Adding a new project

1. Drop files into `Selects/<ClientName>/`
2. Add an entry to `site/src/data/projects.ts` (slug, client, year, etc., Vimeo IDs)
3. `npm run optimize && git add site/public/media site/src/data/manifest.json`
4. Commit, push.

## Contact

Mike Byrne · [mikepbyrne@icloud.com](mailto:mikepbyrne@icloud.com) · (415) 797-9915
