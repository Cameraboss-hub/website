# CameraBoss

Astro rebuild of the [CameraBoss](https://www.cameraboss.co.uk/) marketing site, from the
[Figma storyboard](https://www.figma.com/design/Wr17cgmaXpIFRDFTHxWSHq/Arvo-%E2%80%94-Ranking-%E2%80%94-Storyboard).

## Stack

- **Astro** in `server` output mode with the `@astrojs/vercel` adapter, so future
  API routes (contact form, auth, CMS webhooks) can live under `src/pages/api/**`
  without reconfiguring rendering.
- Marketing pages opt into static prerendering individually via
  `export const prerender = true;` (see `src/pages/index.astro`) — the frontend
  ships as fast, cacheable HTML today even though the project is server-capable.
- **Tailwind CSS v4** (CSS-first config in `src/styles/global.css`).
- **Fraunces** stands in for the Figma file's licensed **Quincy CF** display font
  until real webfont files are supplied — swap it in `src/styles/global.css`.

## Structure

```
src/
  layouts/BaseLayout.astro    HTML shell, fonts, meta
  components/
    Header.astro              Nav overlay for the hero
    Footer.astro               Instagram grid, nav, socials
    sections/                 One component per homepage section
  pages/
    index.astro                Homepage (prerendered)
    api/health.ts              Placeholder proving the server skeleton works
public/images/                 Assets pulled from Figma, organized by section
```

## Roadmap (backend)

Per the current plan, these land in later passes on top of this frontend skeleton:

1. Contact / booking inquiry form → email + stored lead (replaces the
   `BookingCta` placeholder and the "Enquire" links).
2. Blog / recent posts via a headless CMS or content collections.
3. Dynamic gallery & portfolio management (replaces the hardcoded
   `PortfolioGrid` data).
4. Admin/auth area for managing leads, bookings, and content.

Deploys to **Vercel**; the domain is currently on Go54 (formerly WhoGoHost) and
will be pointed at Vercel once the site is ready to go live.

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # production build (Vercel-ready output in dist/ and .vercel/)
```
