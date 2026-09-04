import type { APIRoute } from "astro";

// Placeholder proving the server-output skeleton works end-to-end on Vercel.
// Real endpoints (contact form, auth, CMS webhooks, booking, etc.) land
// alongside this file under src/pages/api/** in later passes.
export const GET: APIRoute = () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
