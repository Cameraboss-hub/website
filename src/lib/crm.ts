/**
 * The Cameraboss CRM that receives enquiries from this site.
 *
 * The form itself lives in the CRM, not here: it branches by service, validates,
 * rate-limits, and starts the right workflow. This site links to it, so a
 * change to the questions never needs a website deploy.
 *
 * Change this one constant if the CRM moves to its own domain.
 */
export const CRM_ORIGIN = "https://cameraboss-crm.vercel.app";

/** The live public form. The CRM refuses iframe embedding from this site. */
export const ENQUIRY_PAGE_URL = `${CRM_ORIGIN}/book/cameraboss/general-enquiry`;

/**
 * The direct form link, as a raw HTML string.
 *
 * The twelve migrated pages carry their markup as data in pages.json, so their
 * copy of the enquiry action has to be built as text rather than rendered as a
 * component. Keep its markup aligned with EnquiryEmbed.astro.
 */
export function enquiryEmbedHtml(): string {
  return (
    `<div class="cameraboss-enquiry-action">` +
    `<p>Tell us about your date and plans using the CameraBoss enquiry form.</p>` +
    `<a href="${ENQUIRY_PAGE_URL}">Open the enquiry form</a>` +
    `</div>`
  );
}
