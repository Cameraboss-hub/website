/**
 * The Cameraboss CRM that receives enquiries from this site.
 *
 * The form itself lives in the CRM, not here: it branches by service, validates,
 * rate-limits, and starts the right workflow. This site only loads it, so a
 * change to the questions never needs a website deploy.
 *
 * Change this one constant if the CRM moves to its own domain.
 */
export const CRM_ORIGIN = "https://cameraboss-crm.vercel.app";

/** The CRM's own injector: it builds the iframe and resizes it as the form
 *  reveals questions. Give it data-brand and data-form. */
export const ENQUIRY_EMBED_SCRIPT = `${CRM_ORIGIN}/embed.js`;

/** The same form as a full page — for Pixieset, email signatures, link-in-bio. */
export const ENQUIRY_PAGE_URL = `${CRM_ORIGIN}/book/cameraboss/general-enquiry`;

export const ENQUIRY_BRAND = "cameraboss";
export const ENQUIRY_FORM = "general-enquiry";
