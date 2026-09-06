// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

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
      "/joandjonny": "/galleries/joandjonny/",
      "/africanachieversawards": "/galleries/africanachieversawards/",
      "/cynthiaandoswaldo": "/galleries/cynthiaandoswaldo/",
      "/temiandfiyin": "/galleries/temiandfiyin/",
      "/captainpaulboxing": "/galleries/captainpaulboxing/",
      "/mrandmrsjideprewedding": "/galleries/mrandmrsjideprewedding/",
      "/bafaexhibition": "/galleries/bafaexhibition/",
      "/marieblissbirthday": "/galleries/marieblissbirthday/",
      "/kachyandoge": "/galleries/kachyoge/",
      "/jideandvivian": "/galleries/jideandvivian/",
      "/opeyemiweddingportrait": "/galleries/opeyemiweddingportrait/",
      "/stephenwedding": "/galleries/stephenwedding/",
      "/faithandjack": "/galleries/faithandjack/",
      "/koredeprewedding": "/galleries/koredeprewedding/",
      "/amayomi30": "/galleries/amayomi30/",
      "/leicesterproposal": "/galleries/leicesterproposal/",
      "/ubannaprewedding": "/galleries/ubannaprewedding/",
      "/rbsaexhibition": "/galleries/rbsaexhibition/",
      "/nat3": "/galleries/nat3/",
      "/babyphotoss": "/galleries/babyphotoss/",
      "/oloriphotos": "/galleries/oloriphotos/",
      "/familyshoot-1": "/galleries/familyshoot/",
      "/bamawards": "/galleries/bamawards/",
      "/stablegalleryexhibition": "/galleries/stablegalleryexhibition/",
      "/home": "/",
      "/gallery": "/galleries/",
      "/pricing-UK": "/pricing/",
    }).map(([from, to]) => [from, { status: 301, destination: to }]),
  ),
});
