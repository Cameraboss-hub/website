# CameraBoss content editor — owner activation

Prepared on 2 October 2026. **Not yet activated. No agency accounts or shared
password have been created.**

## What is ready

The repository contains a Pages CMS configuration, 292 SEO records, a
new-article editor, upload storage and build-time validation. A local
publication test proved that an article reaches its fixed URL, blog list,
sitemap and rendered metadata. It was removed before deployment.

The website entry link is /admin/. The actual editor is
https://app.pagescms.org/. Pages CMS collaborators can edit configured content
and media, but cannot manage the configuration or invite other collaborators.
Use email collaborators, not GitHub repository write access.

## Agreed access — 3 October 2026

John chose the recommendation to retain hosted Pages CMS and invite agency
members using their **own individual email addresses**. A shared
social@cameraboss.co.uk mailbox and a replacement password-based CMS are no
longer part of this setup. No new mailbox, password or agency account has been
created.

The owner signs in with Cameraboss-hub on GitHub to connect the website once.
Agency members use email sign-in and receive a six-digit code in their own
inbox. They do not need a GitHub account or any owner credentials. The current
upstream authentication configuration expires each code after five minutes.

Publication requires no owner content approval: saving SEO, or saving a new
article with Published enabled, triggers the existing GitHub/Vercel build.
The update appears after that build succeeds. Git history and eligible Vercel
rollback targets retain the recovery path.

Activation remains pending: owner service-terms consent and GitHub connection,
the agency email list, invitations, and an end-to-end hosted publication test.
Continue testing on codex/site-prep-20260929 until production launch is
approved separately. Do not merge main or change DNS merely to activate CMS.

Sources: [sign-in implementation](https://github.com/pagescms/pagescms/blob/main/components/sign-in.tsx),
[authentication configuration](https://github.com/pagescms/pagescms/blob/main/lib/auth.ts).

## One-time owner steps

1. Open https://app.pagescms.org/ and sign in using the CameraBoss GitHub
   owner account, Cameraboss-hub. Review the service terms and permissions.
   Install its GitHub App for **Cameraboss-hub/website only**, rather than all
   repositories. The app needs repository content write access to save edits;
   the agency itself does not receive the installation token.
2. Select the website repository and **codex/site-prep-20260929** while testing.
   Configuration currently exists on this branch. Verify the two collections:
   “Blog posts — new articles” and “Existing pages & articles — SEO”.
3. In Pages CMS collaborator management, invite each agency member’s email.
   The email list is still required. Do not give them the owner login or add
   them as repository/hosting administrators. Ask them to use the email
   sign-in flow.
4. With an invited collaborator, make a reversible description edit on this
   preview branch. Save it. Check the resulting GitHub commit and Vercel
   deployment, then check the actual preview meta description. Restore it.
   Also confirm the collaborator cannot open configuration/collaborator
   management and cannot rename/delete an SEO record.
5. Test a real draft/new post in the editor on the preview branch: the draft
   must remain absent; publishing must create its route and sitemap entry.
   Restore the test content before launch. This hosted-editor test remains
   outstanding even though the local content/build test passed.
6. Once launch blockers in LAUNCH-READINESS.md are resolved, merge the reviewed
   site-preparation PR into main using a normal merge. Let Vercel build main.
   Switch the editor to **main** for production content. Verify a harmless
   collaborator SEO save deploys production automatically. There is no owner
   content-approval stage. Do not change DNS as part of these steps.
7. Give the agency SEO-AGENCY-GUIDE.md only after this test passes. The future
   domain link is https://www.cameraboss.co.uk/admin/; until DNS cutover use
   the verified Vercel preview’s /admin/ link.

## Identity, permissions and limitations

The GitHub App is the configured commit identity. This avoids attributing
commits to email collaborators who have no GitHub account. Verify that Vercel
accepts those bot commits; do not assume a successful Save means publication.

Pages CMS controls content operations; the owner-managed registry additionally
makes existing route changes fail the build. This is content-focused access,
not custom enterprise field-level RBAC. Collaborators share the two configured
collections and upload media. They can edit archived SEO, and create/update
new articles. Imported article bodies, design, prices and layout are outside
their editor. Requests to edit those should come back to the site maintainer.

The GitHub repository is public. Uploaded photographs and saved article text,
including drafts, may therefore be visible in GitHub before appearing on the
website. Use only public-approved material. Keep client originals, PINs and
private delivery files outside the editor.

No new Supabase service key or Vercel token is needed in the CMS or browser.
No deploy hook is needed: the existing GitHub integration builds content
commits. No paid plan or subscription was purchased during preparation.

## Recovery

For a single mistake, edit the record back and save; it will rebuild
automatically. GitHub history retains content versions. A maintainer can use
git revert on the offending content commit, with a normal push, to restore
source truth. Never force-push.

For an urgent site-wide problem, the owner uses Vercel’s Instant Rollback to
restore an eligible previous production deployment. Then revert/fix the bad
Git content before the next build. Rollback changes the deployed build, not
the current repository head or external CRM/data. The available rollback
targets depend on the hosting plan and deployment retention.

## Sources

- [Pages CMS quick start](https://pagescms.org/docs/quick-start/)
- [Email collaborators and their scope](https://pagescms.org/docs/configuration/collaborators/)
- [Commit identity](https://pagescms.org/docs/configuration/settings/)
- [Vercel collaboration and bot commits](https://vercel.com/docs/deployments/troubleshoot-project-collaboration)
- [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback)
