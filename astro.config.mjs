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
  adapter: vercel()
});