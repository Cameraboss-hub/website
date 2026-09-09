/**
 * Swapping the Studio Ninja embed for the CRM one inside imported page HTML.
 *
 * Twelve migrated pages carry the booking form as raw markup in pages.json: a
 * `<iframe src="…/contactform/parser/…">` and, next to it, Studio Ninja's
 * iframeResizer `<script>`. Rather than hand-editing that data — which is
 * regenerated on every re-import — the block is replaced at build time, so one
 * transform covers all twelve and survives a future Pixieset re-sync.
 *
 * The iframe is matched on the parser URL rather than its id, because the id
 * differs on every page (sn-form-lubat, sn-form-htww3, …). Video embeds and
 * every other iframe are left untouched.
 *
 * The replacement markup is passed in rather than imported, so this stays a
 * pure string transform with no dependencies — which is what lets the tests
 * run it directly.
 */
/** Only Studio Ninja's contact form. */
const SN_PARSER = "app.studioninja.co/contactform/parser/";
const SN_RESIZER = "app.studioninja.co/client-assets/form-render";

const IFRAME = /<iframe\b[^>]*>(?:[\s\S]*?<\/iframe>)?/gi;
const SCRIPT = /<script\b[^>]*>[\s\S]*?<\/script>/gi;

/** True when the markup still contains a Studio Ninja contact-form embed. */
export function hasStudioNinjaEmbed(html: string): boolean {
  return (html || "").includes(SN_PARSER);
}

/**
 * Replace the Studio Ninja block with the CRM embed, in place.
 *
 * The CRM embed takes the position of the iframe, so the form stays exactly
 * where it sat in the page. Studio Ninja's resizer script is dropped outright —
 * the CRM's injector sizes its own iframe. A page carrying more than one embed
 * gets the CRM embed only once; any further Studio Ninja markup is removed, so
 * none can survive into the build.
 */
export function swapStudioNinjaForCrm(html: string, embedHtml: string): string {
  const source = html || "";
  if (!hasStudioNinjaEmbed(source) && !source.includes(SN_RESIZER)) return source;

  let placed = false;
  let out = source.replace(IFRAME, (tag) => {
    if (!tag.includes(SN_PARSER)) return tag;      // a video embed, or any other iframe
    if (placed) return "";
    placed = true;
    return embedHtml;
  });

  // Studio Ninja's resizer, wherever it sits relative to the iframe.
  out = out.replace(SCRIPT, (tag) => (tag.includes(SN_RESIZER) ? "" : tag));

  // A page that somehow carried only the resizer still gets the form.
  if (!placed && source.includes(SN_RESIZER)) out += embedHtml;
  return out;
}
