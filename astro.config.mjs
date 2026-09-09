// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import legacyAliases from './src/data/legacy-aliases.json' with { type: 'json' };

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  // Server output so future API routes (contact form, auth, CMS webhooks, etc.)
  // can be added under src/pages/api/** without reconfiguring rendering mode.
  // Marketing pages opt into static prerendering individually via
  // `export const prerender = true;` so the frontend still ships as fast,
  // cacheable static HTML today.
  output: 'server',
  adapter: vercel(),

  site: 'https://www.cameraboss.co.uk',

  // Permanent redirects so links indexed under the old Pixieset structure
  // (and the gallery.cameraboss.co.uk subdomain) keep their ranking.
  // Keys are the exact paths Pixieset served (no trailing slash), which is the
  // form Google has indexed.
  redirects: Object.fromEntries(
    Object.entries({
      ...legacyAliases,
      "/joandjonny": "https://gallery.cameraboss.co.uk/joandjonny/",
      "/africanachieversawards": "https://gallery.cameraboss.co.uk/africanachieversawards/",
      "/cynthiaandoswaldo": "https://gallery.cameraboss.co.uk/cynthiaandoswaldo/",
      "/temiandfiyin": "https://gallery.cameraboss.co.uk/temiandfiyin/",
      "/captainpaulboxing": "https://gallery.cameraboss.co.uk/captainpaulboxing/",
      "/mrandmrsjideprewedding": "https://gallery.cameraboss.co.uk/mrandmrsjideprewedding/",
      "/bafaexhibition": "https://gallery.cameraboss.co.uk/bafaexhibition/",
      "/marieblissbirthday": "https://gallery.cameraboss.co.uk/marieblissbirthday/",
      "/kachyandoge": "https://gallery.cameraboss.co.uk/kachyandoge/",
      "/jideandvivian": "https://gallery.cameraboss.co.uk/jideandvivian/",
      "/opeyemiweddingportrait": "https://gallery.cameraboss.co.uk/opeyemiweddingportrait/",
      "/stephenwedding": "https://gallery.cameraboss.co.uk/stephenwedding/",
      "/faithandjack": "https://gallery.cameraboss.co.uk/faithandjack/",
      "/koredeprewedding": "https://gallery.cameraboss.co.uk/koredeprewedding/",
      "/amayomi30": "https://gallery.cameraboss.co.uk/amayomi30/",
      "/leicesterproposal": "https://gallery.cameraboss.co.uk/leicesterproposal/",
      "/ubannaprewedding": "https://gallery.cameraboss.co.uk/ubannaprewedding/",
      "/rbsaexhibition": "https://gallery.cameraboss.co.uk/rbsaexhibition/",
      "/nat3": "https://gallery.cameraboss.co.uk/nat3/",
      "/babyphotoss": "https://gallery.cameraboss.co.uk/babyphotoss/",
      "/oloriphotos": "https://gallery.cameraboss.co.uk/oloriphotos/",
      "/familyshoot-1": "https://gallery.cameraboss.co.uk/familyshoot-1/",
      "/bamawards": "https://gallery.cameraboss.co.uk/bamawards/",
      "/stablegalleryexhibition": "https://gallery.cameraboss.co.uk/stablegalleryexhibition/",
      "/home": "/",
      "/gallery": "/client-area/",
      "/pricing-UK": "/pricing/",
    }).map(([from, to]) => [from, { status: 301, destination: to }]),
  ),
});
