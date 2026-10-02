# CameraBoss launch readiness — 2 October 2026

**Decision: NO-GO for the public-domain launch today until the blockers below
are resolved.** The updated site is a tested deployment candidate. DNS and the
current Pixieset site have not been changed.

## Fresh live-source comparison

- Crawled all 237 URLs in the current Pixieset sitemap: all returned 200.
  It still contains 191 blog posts; no new source paths or articles were found.
- Copied 41 substantive metadata updates into the rebuilt site and seeded them
  into the content editor. Updated the wedding-film introduction. Existing
  redesigned location/portfolio pages remain intact.
- Retained five metadata records deliberately: three source blog descriptions
  contain keyword/QA/hero-alt instructions, and the redesigned portfolio and
  location index need their approved descriptions. Exact paths and reasons:
  audit/live-refresh-applied-2026-10-02.json.
- No newly added blog article body was found. The final crawl and source-image
  comparison are recorded in audit/live-refresh-2026-10-02.json.

## Website and content preparation

- Local build generates 294 HTML files, including the 404 and new noindex
  /admin/ page; static output is 108,167,964 bytes (about 108 MB).
- Astro check passes with zero errors/warnings and existing advisory hints.
  All 12 unit tests and 16 migration tests pass. These cover original routes,
  sitemap, metadata, internal links, local images, enquiry links and gallery
  credentials. Dependency audit reports zero known vulnerabilities after
  compatible dependency fixes.
- 55 location pages, five selected-photo stories with 51 public display copies,
  and the approved home/pricing/contact/portfolio designs remain in place.
  Full client collections still open on Pixieset.
- Pages CMS is configured for 292 route-specific SEO records and new blog posts.
  A temporary local published article proved the fixed URL, journal listing,
  sitemap, photograph, sanitization and metadata override. It was removed.
- Agency edits are intended to publish automatically after a successful Git/
  Vercel build, with no owner approval stage. The content is captured in each
  deployment and Git history supports restoration.
- Owner activation/invitations and a hosted-editor publication test remain
  outstanding. The /admin/ page is a link to the editor, not a working account.
  See CMS-OWNER-SETUP.md and the forwardable SEO-AGENCY-GUIDE.md.
- The stable preview link is
  https://website-git-codex-site-prep-20260929-cameraboss.vercel.app/.
  Final preview crawl/image reports must be checked for this revision before
  promotion; the local tests do not replace those HTTP checks.

## Launch blockers

1. **Commercial hosting:** Vercel currently reports Cameraboss on Hobby.
   Vercel restricts Hobby to personal, non-commercial use. Choose an eligible
   hosting plan (normally Vercel Pro) or a different host before business
   launch. No subscription was purchased.
2. **Agency activation:** the owner needs to connect Pages CMS to the website
   repository, supply agency emails, invite them and verify their Save triggers
   a deployment. After the reviewed branch reaches main, use main for direct
   production publishing. There is no working shared password to send.
3. **Prices and promotion:** /pricing/ advertises wedding coverage from
   £2,500; /London-Wedding-Photography-Packages/ advertises from £1,900 and a
   50% photography/video combo offer. The live Liverpool meta description
   advertises £219. Confirm which offers remain valid before launch. No
   business price was guessed or silently replaced.
4. **Enquiry delivery:** the site’s links point to the CameraBoss CRM public
   enquiry form. Receipt of a real test enquiry in the CRM/inbox has not been
   proved in this run. A successful page load does not establish delivery.
5. **Production/cutover:** merge/promote only the verified candidate after
   blockers clear. Confirm the registrar account and any transfer status,
   save existing DNS/TTL values and use Vercel’s current domain instructions.
   Nameservers alone do not prove the registrar. No DNS changes are authorised
   in this preparation.

## Domains, gallery continuity and rollback

Vercel already has cameraboss.co.uk and www.cameraboss.co.uk assigned and marked
verified; apex redirects to www. That does not mean traffic has moved.
Current DNS still points to Pixieset: www and gallery use domain.pixieset.com;
nameservers are nsa.whogohost.com and nsb.whogohost.com.

Keep gallery.cameraboss.co.uk on Pixieset and retain the Pixieset plan for
existing client links/downloads. Originals have not been reconciled against
Google Drive/NAS; Pixieset remains their only verified archive. That prevents
cancellation, but does not itself prevent a marketing-site cutover while
Pixieset client delivery remains available.

For a content error, correct/save or revert the Git content commit and push
normally. For an urgent site-wide problem, the owner can restore an eligible
previous Vercel production deployment. Also fix/revert repository content
before the next build. Rollback does not undo external CRM changes or restore
the repository head. Never force-push.

## Evidence and references

- audit/live-refresh-2026-10-02.json
- audit/live-refresh-applied-2026-10-02.json
- tests/test_migration.py and tests/cms.test.mjs
- [Vercel Hobby restrictions](https://vercel.com/docs/plans/hobby)
- [Pages CMS collaborator scope](https://pagescms.org/docs/configuration/collaborators/)
- [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback)

No DNS, Pixieset collection, Google Drive original or NAS file was modified.
