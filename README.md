# Matteo Catalano — Portfolio Spotlight

A bold, kinetic single-page portfolio in the spirit of [landonorris.com](https://landonorris.com).
Dark "forge" aesthetic with molten-ember accents, scroll-driven reveals, animated
count-up stats, an interactive ember-particle hero, and a custom cursor.

**Stack:** [Astro](https://astro.build) (static) · [GSAP + ScrollTrigger](https://gsap.com) · [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll · self-hosted fonts (Anton / Hanken Grotesk / JetBrains Mono).

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to ./dist
npm run preview  # serve the production build locally
```

## Project structure

```
src/
  data/content.ts      # all résumé content (single source of truth — edit here)
  layouts/BaseLayout   # <head>, font imports, global script
  components/          # Nav, Hero, Intro, Stats, Experience, Highlights, Capabilities, Contact
  scripts/main.ts      # Lenis + GSAP orchestration, counters, cursor, ember canvas
  styles/global.css    # design tokens (the "Forge" system)
public/
  .nojekyll            # tells GitHub Pages to skip Jekyll (required for _astro/ folder)
  favicon.svg
```

To update copy, edit **`src/data/content.ts`** — nothing else needs to change.

## Deploy to GitHub Pages (Crstt.github.io)

This is configured for a **user page** served at the root (`https://crstt.github.io`).

1. Create a repo on GitHub named exactly **`Crstt.github.io`**.
2. Push this project to its `main` branch:
   ```bash
   git init
   git add .
   git commit -m "feat: portfolio spotlight"
   git branch -M main
   git remote add origin git@github.com:Crstt/Crstt.github.io.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`.

### Custom domain (optional)
Add your domain under **Settings → Pages → Custom domain** and create a `public/CNAME`
file containing the domain. Keep `site` in `astro.config.mjs` aligned with the final URL.

### Moving to a project page instead
If you ever host this under `username.github.io/<repo>/`, set `base: '/<repo>/'` in
`astro.config.mjs` — all asset paths adjust automatically.

## Accessibility & performance
- Honors `prefers-reduced-motion` (disables Lenis, GSAP timelines, embers, cursor).
- Custom cursor / tilt disabled on touch devices.
- Ember canvas pauses when the hero scrolls out of view.
- Fonts self-hosted and subset; ~52 kB gzipped JS total.
