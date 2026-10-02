# CameraBoss — SEO and blog publishing

**Owner: complete CMS-OWNER-SETUP.md before forwarding this guide.
Access is prepared, but invitations and the hosted publication test are still pending.**

## Sign in

Editor: https://app.pagescms.org/

Use the individual email address invited by CameraBoss and follow the email
sign-in prompt. There is no shared CameraBoss password. You do not need the
owner’s Pixieset, GitHub, Vercel or Supabase login.

Select Cameraboss-hub / website and the branch agreed with CameraBoss:
main is the production content branch after launch activation. Use the
preview branch only during setup/testing. The website’s /admin/ page provides
a convenient link to the same editor.

## Edit a page or an existing article’s SEO

1. Open **Existing pages & articles — SEO**.
2. Find the record by its page address, for example /pricing/ or /blog/…/.
3. Edit SEO title and meta description. The page address is protected.
4. Save. On the production branch, a successful website build publishes the
   change automatically. CameraBoss does not need to approve the content.
5. Check the published page’s title/description after the build completes.

Write a clear, specific description of the page. Around 150–160 characters is
a useful editorial target, not a fixed Google display guarantee. Do not paste
keyword lists, QA notes or hero-image instructions into meta descriptions.

## Write a new blog post

1. Open **Blog posts — new articles** and create a new entry.
2. Choose a concise lowercase URL filename with hyphens, for example
   leicester-wedding-photography-guide.json. It becomes
   /blog/leicester-wedding-photography-guide/. Choose it carefully; renaming
   an existing published URL is disabled.
3. Enter the title, date, SEO title, description and article. Use headings,
   paragraphs, lists and internal links in the visual editor.
4. Upload an approved web-size featured photograph and article images.
   Add useful alt text to article images. Use the Media picker/upload folder;
   do not link files from your computer.
5. Keep **Published** off while drafting. When ready, switch it on and Save.
   No owner approval is required. The article appears in the journal and
   sitemap after the build succeeds.
6. Visit the actual public article and check its text, image and links.

For now, imported article bodies are preserved outside this editor to protect
their existing image/layout markup. You can edit all their SEO records.
Contact the site maintainer if an older article’s body needs revision.

## Publication and corrections

Save → Git content commit → Vercel build → live website.

Publication takes a build; it is not instantaneous at the moment of Save.
A failed build leaves the previously deployed site serving. Check the site
after saving. If a change does not appear, provide CameraBoss the article/page
address and save time so the build can be checked.

Correct a typo by editing and saving again. If an urgent rollback is needed,
notify CameraBoss with the page address and what changed. CameraBoss retains
Git version history and owner access to Vercel rollback.

Do not delete images already used by published posts. Do not change existing
URLs, invent prices, or upload private client originals. Repository drafts
are public on GitHub even while unpublished on the website.
