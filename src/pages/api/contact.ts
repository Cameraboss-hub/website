import type { APIRoute } from "astro";

/**
 * Booking enquiries. Runs server-side (the site is `output: 'server'`),
 * so a mail provider can be wired in here without touching the page.
 *
 * Until an email key is configured, enquiries are logged in the server
 * output so nothing is silently lost.
 */
export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
  }

  const required = ["name", "email", "phone", "jobtype", "date", "location", "source", "info"];
  const missing = required.filter((f) => !String(data[f] ?? "").trim());
  if (missing.length) {
    return new Response(JSON.stringify({ error: `Missing: ${missing.join(", ")}` }), { status: 400 });
  }

  console.log("[booking enquiry]", JSON.stringify({ ...data, received: new Date().toISOString() }));

  // To deliver by email, set RESEND_API_KEY and uncomment:
  //
  // await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     from: "bookings@cameraboss.co.uk",
  //     to: "camerabossmultimedia@gmail.com",
  //     reply_to: String(data.email),
  //     subject: `New booking enquiry — ${data.name} (${data.jobtype})`,
  //     text: required.map((f) => `${f}: ${data[f]}`).join("\n"),
  //   }),
  // });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
