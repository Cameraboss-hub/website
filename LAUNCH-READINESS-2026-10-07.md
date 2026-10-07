# CameraBoss launch readiness — 7 October 2026

**Decision: do not change DNS yet.** This branch improves the preview, but the
business launch still needs a commercially eligible host, confirmed public
prices, a verified enquiry notification path, and a verified DNS account. The
Pixieset gallery subdomain must remain on Pixieset for client delivery.

## What this run checked

- The live Pixieset sitemap contains **237 paths**: 191 articles, 45 other
  pages and the homepage. The new build contains all 237 paths and **292
  sitemap URLs** in total. The build emits 294 HTML files, including its 404
  and noindex admin entry pages. All generated internal links and local image
  paths pass the migration tests. On the deployed Vercel preview, **all 293
  checked page routes return 200 and all 48 legacy aliases return the
  expected 301**. The first concurrent crawl had 72 transport timeouts;
  every one passed on a slower retry. See `audit/preview-crawl-2026-10-07.json`.
- A fresh source crawl returned 200 for **236/237** sitemap paths. Pixieset
  blocked the automated homepage fetch with 403; the homepage was inspected
  successfully in Chrome. Of the 236 fetched pages, 230 saved article/page
  bodies matched the source text exactly. The six differences include the
  deliberately redesigned video and blog index pages and four tiny text/link
  differences. The video page's rendered new template retains the latest
  Pixieset introduction. The source crawl found no newly listed article or
  page. See `audit/live-refresh-2026-10-07.json`.
- Search Console reports **854 clicks and 59.2K impressions over three
  months**, with 238 indexed and 416 not indexed URLs in the property. Its
  existing submitted sitemap was read successfully on 5 October and contains
  the same 237 source URLs. Five malformed or old main-site URLs among its
  nine recorded 404 examples now have path-preserving, relevant 301s. Four
  recorded 404 examples are on `gallery.cameraboss.co.uk` and are outside this
  site's redirect control.
- The client directory has **277** cards, each linking directly to Pixieset.
  An automated check got 200 for 47, 403 challenge responses for 229, and one
  404 for `makeupshoot` that returned 403 on retry. Chrome displayed a
  Cloudflare verification screen on that gallery too. These 230 links are
  **unverified**, not proven broken. Do not call the entire directory checked.
  See `audit/gallery-links-2026-10-07.json`.
- The built image inventory has **3,788 unique URLs**: 230 local, 3,280
  Supabase, 256 Pixieset and 22 YouTube. All local files exist. The 3,558
  remote URLs returned valid images in a fresh 7 October probe. The bulk run
  initially met 63 Supabase 429 rate limits; all 63 passed on a slower retry.
  The six added slides are local copies of the exact current Pixieset
  homepage photographs. See `audit/rendered-image-summary-2026-10-07.json`
  and `audit/remote-images-2026-10-07.json`; regenerate the full URL
  inventory with `python3 audit/check_rendered_images.py --inventory`.
- At 390 × 844, the homepage, client directory, blog, contact and films have
  no horizontal overflow. The hero text sits below the photograph and the
  mobile menu control is 44px. The cookie notice stays out of the hero; its
  choice persists and can be reopened. Optional analytics scripts load only
  after an explicit analytics choice when an analytics provider is configured.
- Production dependencies passed `npm audit fix` with **zero known reported
  vulnerabilities**. `npm test` and `npm run check` pass. This reduces known
  risk; no website can be guaranteed “unhackable.”
- The preview returns `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, a restrictive `Permissions-Policy` and
  `Referrer-Policy`, along with `X-Robots-Tag: noindex` while it is a preview.
  The production sitemap and canonical URLs still target the www domain.
- Nominet still lists registrar `101DOMAIN` and nameservers
  `nsa.whogohost.com` / `nsb.whogohost.com`. Public DNS still has apex A
  `104.16.185.173`; both `www` and `gallery` CNAME to
  `domain.pixieset.com.`. Nothing in DNS was changed.

## Remaining decisions and checks before cutover

1. **Hosting:** The last authenticated Vercel billing check (2 October) found
   Hobby, which Vercel restricts to non-commercial use. This run could list
   the `website` project but could not read the team plan: the connector
   returned 403 and browser sign-in was blocked by automatic approval review.
   Confirm a commercially eligible host or plan before pointing a business
   domain at the preview. No subscription was purchased.
2. **Gallery continuity:** Verify the 230 challenged client links through an
   authorised Pixieset session or a complete owner export. The gallery stays
   on Pixieset; no original-photo archive was verified here and Pixieset must
   not be cancelled.
3. **Public offers:** Reconcile `/pricing/` from £2,500,
   `/London-Wedding-Photography-Packages/` from £1,900 and its 50% combo offer,
   plus the verified Leicester Google Business Profile product listing at
   £850–£2,000. Do not overwrite or publish an unconfirmed price.
4. **Enquiries and agency:** Confirm a real CRM enquiry reaches the working
   inbox and activate/test individual Pages CMS access for the SEO agency.
   The former acceptance test proved form submission but not notification.
5. **DNS access:** Identify the actual WhoGoHost/Go54 customer portal that
   controls the zone, export every existing record, confirm transfer status
   in the registrar account, and read Vercel's *current* requested apex/www
   records. Registry transfer lock alone does not prove no transfer is pending.
6. **Final production check:** Merge the reviewed branch normally, verify
   production is Ready on the eligible host, and rerun the full sitemap,
   redirects, imagery, gallery and enquiry checks before editing apex/www.

Do not change the `gallery` CNAME, nameservers, MX/TXT or Pixieset plan during
the website cutover. `DNS-CUTOVER.md` contains the observed rollback values;
they must be checked again on the actual cutover day.
