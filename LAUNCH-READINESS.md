# CameraBoss launch readiness — 2 October 2026

**Decision: NO-GO for the public-domain launch at present.** The refreshed
website passes its technical checks. Hosting eligibility and agency account
activation remain outstanding; confirm the business items below before cutover.
No DNS or production-branch change was made.

## Current website comparison

- Crawled all 237 paths in the current Pixieset sitemap: all returned 200.
  All 191 blog posts remain at their original URLs. No new source pages or
  articles were found.
- Copied 41 metadata updates and the new wedding-film introduction. The
  approved homepage, pricing, contact and location designs remain in place.
- Retained five descriptions deliberately: three source blog descriptions
  contain keyword/QA/hero-alt instructions, and the redesigned portfolio and
  location index need their approved descriptions. See
  audit/live-refresh-applied-2026-10-02.json.
- Removed an unconfirmed £219 starting-price claim from Liverpool SEO copy,
  without inventing a replacement price.
- The source client-area snapshot lists the same first 24 collection links
  as the existing directory. The full 277-collection directory was imported
  on 29 September. A new browser attempt at full source pagination encountered
  Cloudflare verification, so a fresh complete directory comparison is not
  claimed.

## Technical verification

- The build generates 294 HTML files, including the 404 and noindex /admin/
  entry page, with about 108 MB of static output.
- Astro check passes with zero errors/warnings and existing advisory hints.
  All 12 unit tests and 16 migration tests pass. Dependency audit reports
  zero known vulnerabilities after compatible dependency updates.
- Preview HTTP checks passed for all 293 recorded/generated page paths and
  all 43 historical redirects. Original case-sensitive blog URLs are intact.
- All 224 local display/social-image variants exist. Vercel-hosted checks
  verified all 3,558 remote image URLs currently rendered by the site.
  Initial rate-limit/server errors cleared on a slower recheck.
- Three old Pixieset covers remained unavailable with 403 responses. Moses
  Bliss and Marie now uses an existing verified photograph of that same
  wedding. Bridal inspo 2 and Adesewa Wedding use typographic archive cards
  until their original covers are available. Their names, dates and full
  collection links are retained. No unrelated photograph was substituted.
- Repaired a malformed social-sharing image URL on Testimonials.
- Checked 391 non-map outbound links: no confirmed 404/410; 125 responded
  successfully, 254 returned access blocks and 12 had transport errors.
  Those 266 targets remain unverified, including protected Pixieset links.
- Browser checks confirmed the homepage/archived article imagery, no
  horizontal overflow at 390 × 844, a 52px floating enquiry action and a
  44px menu toggle. Escape closed the mobile drawer.
- Submitted one clearly labelled “CameraBoss website QA test” using public
  business contact details, with no booking/date/purchase requested. The CRM
  accepted it and returned an enquiry reference. Searches of both connected
  CameraBoss business inboxes found no matching notification. CRM acceptance
  is proved; notification delivery is not.
- The temporary diagnostic build override has been removed. It does not run
  thousands of image checks on ordinary agency saves. An empty temporary
  Vercel diagnostic project was removed and its absence verified.

Stable preview:
https://website-git-codex-site-prep-20260929-cameraboss.vercel.app/

## Agency publishing

Pages CMS is configured for 292 route-specific SEO records and new blog
posts. A local publication test proved the fixed URL, journal listing,
sitemap, photograph, sanitization and SEO override, then was removed.

After owner activation and the reviewed code reaching main, agency saves
publish automatically after a successful Vercel build. No owner content
approval is required. Content is captured in each deployment; Git history
and Vercel rollback support restoration.

**The hosted editor is not yet connected or invited.** /admin/ is an entry
link, not a provisioned account. No shared password or agency login has been
created. Follow CMS-OWNER-SETUP.md, supply individual agency emails and verify
one collaborator save reaches the deployed site. Then forward
SEO-AGENCY-GUIDE.md. Existing imported article bodies remain protected;
their SEO is editable and new articles have a visual editor.

## Outstanding launch items

1. **Commercial hosting:** the authenticated Vercel API still reports Hobby
   for Cameraboss. Vercel restricts it to personal, non-commercial use.
   Choose an eligible plan or host before the business launch. No subscription
   was purchased.
2. **Agency activation:** connect Pages CMS to Cameraboss-hub/website, invite
   the supplied agency emails, and verify an actual collaborator publication.
   The owner must accept the service terms and authorise the GitHub App.
   The agency does not need owner hosting/database credentials.
3. **Prices and promotion:** /pricing/ advertises wedding coverage from
   £2,500; /London-Wedding-Photography-Packages/ advertises from £1,900 and a
   50% photography/video combo offer. Confirm their scope/validity or provide
   the corrected copy. The Liverpool £219 metadata claim has been removed.
4. **Operational enquiry receipt:** confirm the marked test is visible to the
   staff who handle enquiries, and establish the notification route. The
   public form acknowledged acceptance; neither checked business inbox
   supplied notification evidence.
5. **Cutover authority:** Nominet reports registrar 101domain GRS Ltd and
   WhoGoHost nameservers. Confirm the actual DNS account/portal and any
   pending transfer in the owner's account before the later cutover.
   DNS-CUTOVER.md records the exact current recommendations and rollback
   values; it is a blocked draft, not authority to execute.

## Gallery continuity and recovery

Keep gallery.cameraboss.co.uk on Pixieset and retain the Pixieset plan for
existing client links and downloads. Original photos have not been reconciled
against Google Drive/NAS; Pixieset remains their only verified archive.
This prevents cancellation, but a marketing-site cutover can proceed while
Pixieset client delivery remains available.

For a content error, correct/save or revert the content commit with a normal
push. For an urgent site-wide problem, the owner can restore an eligible
previous Vercel production deployment. Also fix/revert repository content
before the next build. Rollback does not restore repository head or undo
external CRM changes. Never force-push.

## Evidence

- audit/live-refresh-2026-10-02.json
- audit/live-refresh-applied-2026-10-02.json
- audit/preview-crawl-2026-10-02.json
- audit/rendered-images-2026-10-02.json
- audit/hosted-image-recheck-2026-10-02.json
- audit/archive-cover-repairs-2026-10-02.json
- audit/outbound-link-check-2026-10-02.json
- audit/dns-preflight-2026-10-02.json

[Vercel Hobby restrictions](https://vercel.com/docs/plans/hobby),
[Pages CMS collaborator scope](https://pagescms.org/docs/configuration/collaborators/),
[Vercel Instant Rollback](https://vercel.com/docs/instant-rollback),
[Nominet registry record](https://rdap.nominet.uk/uk/domain/cameraboss.co.uk).

No DNS, Pixieset collection, Google Drive original or NAS file was modified.
