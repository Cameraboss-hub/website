export const prerender = false;
export const GET = () =>
  new Response(null, { status: 301, headers: { Location: "/Wedding-videos/" } });
