# CameraBoss website

CameraBoss’s Astro marketing site is deployed to Vercel previews. The public
domain still serves Pixieset. **Do not change DNS from this repository.**
See [LAUNCH-READINESS.md](LAUNCH-READINESS.md) for the current launch decision.

As checked on 2 October 2026, the source website has 237 sitemap URLs:
191 blog posts, the blog index and 45 other routes. Their original paths
remain available. The approved redesign adds 55 location pages in total,
five curated wedding stories with 51 display photographs, a searchable
portfolio, wedding films, pricing and enquiry pages. Blog/page images use
Supabase’s existing blog bucket and local assets. Complete client collections
and downloads remain on Pixieset; Google Drive/NAS originals are not yet
verified archives.

## Content management

[Pages CMS](https://app.pagescms.org/) is configured in [.pages.yml](.pages.yml).
It is **prepared but not connected or invited yet**. Follow
[CMS-OWNER-SETUP.md](CMS-OWNER-SETUP.md), then give the agency
[SEO-AGENCY-GUIDE.md](SEO-AGENCY-GUIDE.md).

The agency can edit SEO titles/descriptions for 292 existing routes and write
new articles through a visual editor. Existing imported article bodies remain
unchanged. Saving published content commits it to the selected Git branch.
After activation on main, successful Vercel builds publish automatically,
without an owner approval step. Draft articles are excluded from the site.

Content files live in cms/seo and cms/posts; upload media lives in
public/images/uploads. src/data/cms-routes.json protects existing route
identity. Source snapshots remain in src/data. Validation rejects route
changes, missing SEO records, duplicate archived blog URLs, unsafe article
markup, and broken internal links/local images in new published posts.

The public /admin/ page links to the hosted editor. It is not an authentication
system and does not grant access. Invite individual email collaborators
through Pages CMS; do not share GitHub, Vercel, Supabase or owner passwords.

## Development and verification

```bash
npm install
./node_modules/.bin/astro dev --background
./node_modules/.bin/astro dev status
./node_modules/.bin/astro dev stop
npm run check
npm test
```

npm test runs unit tests, the production build and migration checks against
.vercel/output/static. audits/ are not used; current reports are in audit/.
The current branch preview is
https://website-git-codex-site-prep-20260929-cameraboss.vercel.app/.

The enquiry action opens CameraBoss CRM at
https://cameraboss-crm.vercel.app/book/cameraboss/general-enquiry.
The marketing site cannot confirm inbox delivery itself.

## Hosting and recovery

Vercel’s production branch is main. Work in codex/ branches, never force-push.
Content is captured at build time, so restoring a deployment also restores
the content it rendered. Also revert the offending Git commit before another
deployment, so later builds do not reintroduce it.

Vercel currently reports the Hobby plan; commercial launch needs an eligible
plan or host. No WordPress instance is configured. The CMS workflow supports
the agency’s requested blog/SEO scope without a WordPress rebuild; see
[WORDPRESS-MIGRATION.md](WORDPRESS-MIGRATION.md) if full template/page editing
in WordPress later becomes a requirement.
