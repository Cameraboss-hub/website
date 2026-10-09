/**
 * The Cameraboss CRM that receives enquiries from this site.
 *
 * The form itself lives in the CRM, not here: it branches by service, validates,
 * rate-limits, and starts the right workflow. Embeds and full-page links both
 * use the same published form, so question changes need no website deploy.
 *
 * Change this one constant if the CRM moves to its own domain.
 */
export const CRM_ORIGIN = "https://cameraboss-crm.vercel.app";

/** The published public form and its decoration-free embedded view. */
export const ENQUIRY_PAGE_URL = `${CRM_ORIGIN}/book/cameraboss/general-enquiry`;
export const ENQUIRY_EMBED_URL = `${ENQUIRY_PAGE_URL}?embed=1`;

/**
 * The direct form link, as a raw HTML string.
 *
 * The twelve migrated pages carry their markup as data in pages.json, so their
 * copy of the enquiry form has to be built as text rather than rendered as a
 * component. Keep its markup aligned with EnquiryEmbed.astro.
 */
export function enquiryEmbedHtml(): string {
  return (
    `<div class="cameraboss-enquiry">` +
    `<iframe class="cameraboss-enquiry-frame" src="${ENQUIRY_EMBED_URL}" title="CameraBoss enquiry form" loading="lazy"></iframe>` +
    `<p>Prefer more space? <a href="${ENQUIRY_PAGE_URL}">Open the form in a full page</a>.</p>` +
    `</div>`
  );
}
