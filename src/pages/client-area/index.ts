// The Pixieset galleries URL. Indexed as /client-area/ — 301 it to the new route
// so the accumulated links and ranking transfer.
export const prerender = false;
export const GET = () =>
  new Response(null, { status: 301, headers: { Location: "/galleries/" } });
