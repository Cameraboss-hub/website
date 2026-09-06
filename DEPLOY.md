# CameraBoss — deploy to GitHub + Vercel

Everything Claude Code needs to get this repo onto
**github.com/Cameraboss-hub/website** and live on Vercel.

**How to use it**

```bash
cd ~/cameraboss-website
claude
```

Then paste the block below. It is written to be run start-to-finish in one
session, and it stops before DNS on purpose — `cameraboss.co.uk` stays on
Pixieset until you have clicked around the Vercel URL yourself.

---

````
You are deploying my rebuilt photography website. It replaces a Pixieset site
that is still live at cameraboss.co.uk. The rebuild is finished and verified
locally — your job is source control and deployment, not redesign.

PROJECT    ~/cameraboss-website          Astro 7 · Tailwind 4 · @astrojs/vercel
REPO       https://github.com/Cameraboss-hub/website     (remote: origin, branch: main)
TARGET     Vercel, connected to that repo through the GitHub integration
BOUNDARY   Stop once the site is live and tested on its *.vercel.app URL.
           DO NOT touch DNS for cameraboss.co.uk in this run.

────────────────────────────────────────────────────────────────────────
THE STATE YOU ARE STARTING FROM  (verified 6 Sep 2026)
────────────────────────────────────────────────────────────────────────
- origin/main holds ONE commit — the original Figma scaffold, 82 files.
- Local main is 3 commits ahead and carries ~37 more changed or untracked
  files. Everything that makes this a real site lives in that gap: 183 blog
  posts, 45 migrated pages, the galleries, pixieset-blocks.css, the mobile
  navigation. Closing that gap without dropping a file is the whole job.
- .env has never been committed. Keep it that way.
- No Git LFS. Largest tracked file is 6.7 MB. There is no size problem.
- Nothing is linked to Vercel yet — no .vercel/project.json.

RULES
- Never change a blog slug or a page path. They carry years of SEO and the
  capitalisation is part of the URL (/London-wedding-photographer/ is a
  different page from /london-wedding-photographer/).
- Never commit .env or any API key. If you are unsure whether a value is a
  secret, ask me before it goes anywhere near a commit.
- Do not delete or overwrite anything in Supabase.
- Do not edit src/styles/pixieset-blocks.css — it is generated, not written.
- If something needs a decision from me, stop and ask. Do not guess.
- Report what you could not finish. Do not describe the site as live if any
  step below failed.

────────────────────────────────────────────────────────────────────────
STEP 0 — Swap /contact/ to my Studio Ninja booking form
────────────────────────────────────────────────────────────────────────
Booking enquiries go through Studio Ninja, not the hand-built form. Make this
change first so it ships with the deploy.

0a. In src/pages/contact.astro, replace the entire <form id="booking-form">
    … </form> element (inside the "Booking form" section, roughly lines
    82–140) with this embed. Keep the surrounding <section> and its
    max-w-[860px] wrapper so the page rhythm is unchanged:

```astro
<iframe
  id="sn-form-htww3"
  title="CameraBoss booking enquiry form"
  src="https://app.studioninja.co/contactform/parser/0a800fc9-7a7c-1768-817a-a68817ea5956/0a800fc9-7ac4-1365-817b-0817cb5472ce"
  height="641"
  loading="lazy"
  allowfullscreen
  style="min-width: 100%; max-width: 1150px; border: 0;"
></iframe>
<script
  is:inline
  type="text/javascript"
  data-iframe-id="sn-form-htww3"
  src="https://app.studioninja.co/client-assets/form-render/assets/scripts/iframeResizer.js"
></script>
```

    `is:inline` matters — without it Astro tries to bundle the resizer and the
    data-iframe-id attribute it reads at runtime is lost.

0b. In the same file, delete the submit handler at the bottom of the page
    <script> (the block commented "Booking form — posts to the contact API
    route", ~lines 224–248). Leave the gallery-carousel code above it alone.
    Also drop the now-unused `jobTypes` / `sources` arrays and the `cb-label`
    / `cb-input` / `cb-req` styles ONLY if nothing else in the file uses them
    — grep first, do not assume.

0c. Check whether anything still posts to the API route:

```bash
grep -rn "api/contact" src/ --include="*.astro" --include="*.ts" --include="*.js"
```

    If the only hit is the route file itself, delete src/pages/api/contact.ts
    and remove RESEND_API_KEY / BOOKING_INBOX / BOOKING_FROM from
    .env.example. It stays recoverable in Git history. If anything else still
    posts to it, leave the route in place and tell me.

0d. `npm run dev`, open http://localhost:4321/contact/, and confirm the Studio
    Ninja form renders, resizes to its content rather than showing an inner
    scrollbar, and submits. Send one real test enquiry and confirm it lands in
    Studio Ninja before moving on. Stop the dev server afterwards.

────────────────────────────────────────────────────────────────────────
STEP 1 — Pre-flight
────────────────────────────────────────────────────────────────────────
```bash
cd ~/cameraboss-website
git remote -v                      # expect origin → Cameraboss-hub/website
git status --short | wc -l         # expect a large number, that is the point
git log --all --oneline -- .env .env.production .env.local   # MUST be empty
git check-ignore -v .env           # MUST print a .gitignore match
```

Scan for anything secret that has leaked into tracked files:

```bash
grep -rIn -E "re_[A-Za-z0-9_]{20,}|service_role|sk_live_|SUPABASE_SERVICE" \
  src/ public/ astro.config.mjs package.json 2>/dev/null
```

Any hit stops the run — show it to me. `PUBLIC_SUPABASE_ANON_KEY` appearing in
built HTML is expected and fine; it is a publishable key. A `service_role` key
is not, ever.

────────────────────────────────────────────────────────────────────────
STEP 2 — Clean the tree
────────────────────────────────────────────────────────────────────────
```bash
rm -rf _to_delete            # old zip archives, ~1.2 MB, superseded
rm -f .git/*.lock            # a sandbox left some behind in an earlier session
find . -name .DS_Store -not -path "./node_modules/*" -delete
```

Add these to .gitignore if they are not already there — `.env` is covered but
its variants are not:

```
.env*.local
_to_delete/
```

────────────────────────────────────────────────────────────────────────
STEP 3 — Green build before you commit anything
────────────────────────────────────────────────────────────────────────
```bash
npm install
npm run build
```

Expect ~254 prerendered routes: 183 blog posts, 45 static pages, 24 galleries,
plus the homepage, /about/, /contact/, /blog/, /galleries/, /Wedding-videos/
and 404. If the count is materially lower, stop — a data file or route is
missing and pushing now would bake the loss into the repo.

Known non-issue: on some sandboxed shells the build ends with
`EACCES … .vercel/output/_functions/`. That is only the adapter's local copy
step; Astro itself has already finished and Vercel runs that step its own side.
Confirm dist/client/ has the pages and carry on.

────────────────────────────────────────────────────────────────────────
STEP 4 — Commit
────────────────────────────────────────────────────────────────────────
Set the identity if git has none (previous commits are authored
"Cameraboss <lex4john@gmail.com>"):

```bash
git config user.name  || git config user.name  "Cameraboss"
git config user.email || git config user.email "lex4john@gmail.com"
git add -A
git status --short          # expect NOTHING left unstaged
```

Before committing, confirm these specific files are staged. They are the ones
that were untracked, and any one of them missing means a broken clone:

```bash
git diff --cached --name-only | grep -E \
 "src/styles/pixieset-blocks.css|src/data/(client-area|image-dims|videos)\.json|src/lib/nav\.ts|src/components/(MobileNav|Analytics)\.astro|src/pages/404\.astro|src/pages/Wedding-videos\.astro|src/pages/(client-area|videos|wedding-videos)/"
```

All nine patterns must match. Then:

```bash
git commit -m "Complete Pixieset migration: 183 posts, 45 pages, galleries, mobile nav

- 183 blog posts and 45 static pages imported at their original Pixieset
  paths, with pixieset-blocks.css extracted from the source theme
- /galleries/ client area: 258 gallery cards, 24 fully hosted (1,952 photos),
  PIN-gated downloads with open viewing
- /Wedding-videos/: 22 films, click-to-play, VideoObject structured data
- Mobile navigation drawer replaces the cramped details dropdown
- Contact page moved to the Studio Ninja booking form
- Structured data, sitemap (252 URLs), robots.txt, 27 x 301 redirects"
```

────────────────────────────────────────────────────────────────────────
STEP 5 — Push to GitHub
────────────────────────────────────────────────────────────────────────
The remote is HTTPS, so it needs credentials. Use the GitHub CLI if it is
installed (`gh auth login`, choose HTTPS, let it configure git). If `gh` is not
installed, tell me — I will create a fine-grained personal access token with
Contents: read/write on Cameraboss-hub/website and paste it when git prompts;
macOS will store it in the keychain. Do not put a token in a URL, a file, or a
command you echo.

```bash
git push -u origin main
git rev-list --left-right --count origin/main...main    # MUST be "0	0"
git ls-files | wc -l                                    # note this number
```

Open the repo in a browser and confirm the file count and that `.env` is
absent. If GitHub shows a secret-scanning alert, stop and tell me.

────────────────────────────────────────────────────────────────────────
STEP 6 — Prove the repo is actually complete
────────────────────────────────────────────────────────────────────────
This is the step that catches the real failure mode: a file the site needs that
was never tracked, so it builds on my Mac and 404s on Vercel. Build from a
clean clone, exactly as Vercel will:

```bash
cd /tmp && rm -rf website-verify
git clone https://github.com/Cameraboss-hub/website.git website-verify
cd website-verify
cp ~/cameraboss-website/.env .          # gitignored on purpose; Vercel gets these as env vars
npm ci
npm run build
```

The page count must match Step 3. If it is lower, or the build fails on a
missing import or a missing JSON file, the culprit is untracked in the original
working copy — find it, `git add` it, commit, push, and repeat this step until
the clean clone builds identically. Then:

```bash
cd /tmp && rm -rf website-verify
```

Report the two page counts side by side.

────────────────────────────────────────────────────────────────────────
STEP 7 — Connect Vercel  (GitHub integration, not the CLI)
────────────────────────────────────────────────────────────────────────
Walk me through this in the dashboard; do not install the CLI.

1. vercel.com/new → import **Cameraboss-hub/website**
2. Framework preset: **Astro** (should auto-detect)
3. Root directory `./` · Build `npm run build` · Install `npm install`
4. Leave the output directory alone — @astrojs/vercel writes .vercel/output
5. Node.js version: **22.x** (package.json requires >=22.12.0; an older
   default will fail the build)
6. **Do not deploy yet.** Add the environment variables in Step 8 first, or
   the first build ships without Supabase and every image 404s.

────────────────────────────────────────────────────────────────────────
STEP 8 — Environment variables  (Production, Preview and Development)
────────────────────────────────────────────────────────────────────────
Required:

  PUBLIC_SUPABASE_URL        https://htwwyqfattodfaybqgev.supabase.co
  PUBLIC_SUPABASE_ANON_KEY   copy from ~/cameraboss-website/.env

  Read the value out of .env, set it in Vercel, and do not print it into the
  transcript. Anon/publishable key only — never the service_role key.

Optional, ask me before setting either:

  PUBLIC_GA_ID               Google Analytics
  PUBLIC_PLAUSIBLE_DOMAIN    Plausible — the Analytics component stays dormant
                             until one of these exists

Not needed any more, thanks to Step 0: RESEND_API_KEY, BOOKING_INBOX,
BOOKING_FROM. Do not add them.

────────────────────────────────────────────────────────────────────────
STEP 9 — Deploy, then smoke-test the deployed URL
────────────────────────────────────────────────────────────────────────
Trigger the first deploy. If it fails, read the Vercel build log and fix the
cause in the repo — never by hand-editing anything in the Vercel UI. Then check
every item and report each one pass/fail:

  a) /, /about/, /contact/, /blog/, /galleries/, /Wedding-videos/ all 200
  b) five blog posts and three galleries — images actually render from Supabase
  c) /galleries/ — hero slideshow advances, arrows work, the All/portraits/
     wedding tabs filter, search works, pagination reaches page 11
  d) gallery photos visible WITHOUT a PIN; the PIN is asked for only on
     Download (test Faith and Jack, PIN 5376)
  e) /Wedding-videos/ — 22 thumbnails load, one plays inline on click
  f) header "Info" dropdown opens with 8 links, all resolve
  g) /contact/ — the Studio Ninja form renders and resizes; submit a real test
     enquiry and confirm it arrives in Studio Ninja. This is the booking
     funnel. If it does not arrive, stop and say so plainly.
  h) at phone width (390px): the header collapses to a burger; the drawer opens
     with Home/About/Blog/Galleries/Videos/Contact then the eight Info links
     under an "Info" label; it closes on the X, the scrim and Esc; the page
     behind it does not scroll; nothing scrolls sideways on any page
  i) /client-area/ and /videos/ both 301 rather than 404
  j) /sitemap.xml lists 252 URLs; /robots.txt resolves
  k) a nonsense URL returns the styled 404
  l) spot-check the late recoveries: /ipswich-wedding-photographer/,
     /London-wedding-photographer/, /sheffield-wedding-photographer/,
     /weddings/ — 200, images render, layout matches the old site
  m) /locations/ — the map renders with red pins and readable labels, and
     every "LIVE PAGE" badge links somewhere that resolves
  n) Lighthouse on the homepage, one blog post and /galleries/. Report the
     scores; flag anything under 90 on Performance or SEO.

────────────────────────────────────────────────────────────────────────
STEP 10 — Report
────────────────────────────────────────────────────────────────────────
Give me:
- the Vercel URL
- confirmation that origin/main and local main are identical, and the file
  count now on GitHub
- the clean-clone page count from Step 6
- pass/fail for every item in Step 9, Lighthouse scores included
- confirmation the Studio Ninja test enquiry arrived
- anything you could not finish, and what it would take

Then stop. DNS is a separate, deliberate step and I will tell you when.
````

---

## What this run deliberately leaves alone

| Item | Why |
|---|---|
| DNS for cameraboss.co.uk | Pixieset stays live until you have used the Vercel URL yourself. |
| `gallery.cameraboss.co.uk` | 234 of the 258 gallery cards still point at Pixieset. That subdomain must stay up until those galleries are migrated — see `go-live-prompt.md`. |
| Gallery archive migration | 24 of 258 galleries are hosted here. Independent of launch. |
| Gallery originals → Google Drive | Not started. The site serves 1600×2400 web versions. |

## Environment variables at a glance

| Variable | Where | Needed? |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | Vercel, all environments | Yes — every image comes from here |
| `PUBLIC_SUPABASE_ANON_KEY` | Vercel, all environments | Yes — publishable key, safe in the client |
| `PUBLIC_GA_ID` | Vercel | Optional |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Vercel | Optional, alternative to GA |
| `RESEND_API_KEY` · `BOOKING_INBOX` · `BOOKING_FROM` | — | No longer used once /contact/ is on Studio Ninja |

## If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Vercel build fails on Node version | `engines` requires >=22.12.0 | Set Node 22.x in Project Settings → General |
| Build succeeds, every photo is broken | Supabase env vars missing or set only for Production | Add both to Production **and** Preview, redeploy |
| A page 404s on Vercel but works locally | Its file was never committed | Re-run Step 6; the clean clone will fail the same way |
| `EACCES .vercel/output/_functions/` locally | Sandboxed shell, adapter copy step | Ignore — Vercel runs that step itself |
| Push rejected, non-fast-forward | Someone pushed to main | `git fetch origin && git log origin/main` first. Never force-push this repo. |
| GitHub secret-scanning alert | A key reached a tracked file | Stop, rotate the key in Supabase/Resend, purge, push again |

## Rolling back

Vercel keeps every deployment. If a deploy is bad, open the previous one in the
dashboard and **Promote to Production** — it is instant and does not need a
commit. Fix forward in Git afterwards.
