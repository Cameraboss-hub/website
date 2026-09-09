# CameraBoss — archive migration and go-live prep

**Runbook for Claude Code. Written 7 September 2026, from the verified state of the project on that date.**

This replaces the earlier `DEPLOY.md`, which was written before the site was pushed and deployed. That work is done. This run does the two things left: move the remaining 234 client galleries off Pixieset, and get the site ready for the DNS cutover **without performing it**.

---

## How John runs this

```bash
cd ~/cameraboss-website
claude
```

Then paste:

```
Read GO-LIVE.md in this project and follow it start to finish. Run Track A only — I am not paying for anything yet, so the Supabase migration and the DNS cutover are parked. Getting my originals into Google Drive is the priority.
```

---

## Where things actually stand (verified 7 Sep 2026, do not assume — re-check)

| Thing | State |
|---|---|
| Repo | `Cameraboss-hub/website`, `main` = `origin/main` = `deca822`, working tree clean, nothing uncommitted |
| Live URL | Vercel project **`website`** (`prj_a51nL2YT0r23dztCqyxtpXIr2L3n`), team `Cameraboss`. Both `https://website-cameraboss.vercel.app` and `https://website-one-delta-b1wxgucjmo.vercel.app` are aliases of the **same** deployment — byte-identical output, 252-URL sitemap, 27 internal gallery links and 234 still pointing at Pixieset. `/`, `/blog/`, `/galleries/`, `/contact/` all return 200. |
| Vercel plan | Team `Cameraboss` is on **Hobby**, which Vercel restricts to non-commercial personal use. See Phase 7. |
| Sitemap | 252 URLs — 184 blog posts, 25 gallery URLs, the rest static pages |
| Contact form | Studio Ninja embed. `/api/contact` and Resend are no longer on the critical path |
| Images | Supabase project `htwwyqfattodfaybqgev`, buckets `photos`, `thumbnails`, `blog` |
| Supabase storage | ~754 MB used of the 1 GB free tier |
| Galleries hosted | **24** of 258, 1,952 photos |
| Galleries still on Pixieset | **234**, linked to `https://gallery.cameraboss.co.uk/<slug>/` |
| DNS | `cameraboss.co.uk`, `www`, and `gallery` all resolve to Cloudflare IPs — still Pixieset. Untouched. |
| Originals | **Not backed up anywhere.** A Google Drive folder `CAMERABOSS CLIENT GALLERIES` (`19tyfZfOnHvpYFnALr7FU1TWPwiH2UZhe`) was created on 4 Sep and is still empty. |
| Google Drive | 4 TB plan, roughly 1 TB free. Drive for Desktop is installed and mounted on the Mac as **My Drive**, so originals can be written straight into the filesystem. |

### Data model you will be working with

`src/data/client-area.json` — `{ hero[3], tags[2], items[258] }`. Each item:

```json
{
  "slug": "faithandjack",
  "title": "Faith and Jack",
  "date": "31st August, 2026",
  "iso": "2026-08-31",
  "cover": "https://htwwyqfattodfaybqgev.supabase.co/storage/v1/object/public/blog/…-cover-large.webp",
  "pos": "55% 37%",
  "tags": [],
  "href": "/galleries/faithandjack/",
  "hosted": true,
  "photos": 24
}
```

The 234 unmigrated ones carry `"hosted": false`, `"photos": 0`, and an absolute `href` to `gallery.cameraboss.co.uk`.

`src/data/galleries.json` — 24 rows of `{ collection_id, slug, name, event_date, photo_count }`. **`collection_id` is the Pixieset collection ID.** There are no collection IDs recorded for the other 234; recovering them is Phase 1.

Supabase tables: `galleries(id, name, pin)` and `photos(id, gallery_id, url, thumbnail_url, date, resolution)`.

Gallery spread by year across all 258: 2023 × 27, 2024 × 36, 2025 × 115, 2026 × 55, undated × 25.

---

## Two tracks — John is not spending money yet

As of 7 September John has decided not to pay for anything for now. That is workable, and most of this runbook still runs. Split the work:

**Track A — runs today, costs nothing. Do all of it.**

- Phase 1, the two data-loss bug fixes
- Phase 2, recovering the Pixieset collection IDs
- **Phase 3a, pulling the originals into Google Drive** — this is the important one. It uses the 4 TB Drive plan John already has, needs no new spend, and it is the step that actually removes risk. Right now every original he owns exists only on Pixieset's servers.
- Phase 6, verification of the site as it stands
- Phase 8, the housekeeping
- The robots/sitemap fix in Phase 6 item 4

**Track B — needs a decision, but not necessarily money.**

- Phase 3b, the remaining 234 galleries. Measured on 7 September the three Supabase buckets hold 790 MB (blog 420 MB, photos 287 MB, thumbnails 47 MB) against a 1 GB free ceiling — roughly 200–280 MB left, about 1,200 photos at the observed 179 KB per photo-plus-thumbnail. The 234 need around 4 GB, so **into Supabase Storage it does not fit**. It does fit elsewhere for free — see the image storage section below. Do not start until John has picked a destination.
- Phase 7, the domain cutover.

**Do the originals first regardless.** It is free, it is the highest-value work in this document, and it is what makes cancelling Pixieset possible later. Everything else can wait behind it.

## Phase 0 — Preconditions. Stop and ask before spending anything.

Three things must be settled with John before a single photo moves. Present them together, with your own recalculated numbers, and wait.

1. **Supabase storage.** Recompute from the real data rather than trusting this estimate: the 24 hosted galleries hold 1,952 photos in ~754 MB across the three buckets. If the remaining 234 average similarly, expect roughly 19,000 more photos and about 3.2 GB, landing near 4 GB total. The free tier is 1 GB. Pro is around $25/month with 100 GB. The org is `Cameraboss Org` (`gnqvisjcqxcwnkcmwxjg`), on the free plan. **John is not upgrading for now, so the Supabase half of the migration is parked** — see the two-track section above. Do not begin it, do not part-migrate "just a few galleries to get started", and do not ask him again to upgrade unless he raises it. Report the storage position when you report anything else, and leave the decision to him.

2. **Pixieset access.** You need to read his collections. **Do not ask John for his Pixieset password and do not type credentials anywhere.** Ask him to sign in himself, then either paste the collection list, export it, or point you at the already-authenticated browser session. If none of that is workable, say so and stop rather than improvising.

3. **The originals go to Google Drive.** What sits in Supabase are 1600×2400 web versions, not the full-resolution files. The originals are to be pulled out of Pixieset into Google Drive, into the existing folder `CAMERABOSS CLIENT GALLERIES` (`19tyfZfOnHvpYFnALr7FU1TWPwiH2UZhe`), which was created on 4 September and is empty. Before starting, check and report:

   - **Drive capacity.** John is on a 4 TB Google plan with roughly 1 TB free. That is very likely enough, but confirm it rather than assuming: pull one full gallery of originals, take the real average file size, multiply by the total photo count you established in Phase 2, and report the projected total against the actual free space. Full-resolution delivered JPEGs at 10–25 MB each across ~21,000 photos lands somewhere between 200 GB and 550 GB, so the margin is comfortable but not unlimited. Do not start a transfer that cannot finish.
   - **Write into the mounted Drive, not the API.** Google Drive for Desktop is installed and mounted as **My Drive**. Writing files into that folder is far faster and simpler than uploading through the Drive API, so use it. Find the real path rather than guessing — normally `~/Library/CloudStorage/GoogleDrive-<account>/My Drive`, or `/Volumes/GoogleDrive/My Drive` on older installs — and confirm `CAMERABOSS CLIENT GALLERIES` is visible inside it before writing anything.
   - **Two gotchas with the mounted Drive.** First, a file appearing in the folder means it was written locally, not that it reached Google. Sync lags, and it can fail silently. Verify server-side through the Drive API or the web UI before marking any gallery complete in the manifest. Second, check whether Drive for Desktop is in *stream* or *mirror* mode: in mirror mode every file also consumes local disk, and several hundred gigabytes will fill his Mac. If it is mirroring, report the free disk space and stop for a decision before starting.

   Migrating the web versions does not make Pixieset safe to cancel. Only verified originals in Drive do. Say this to John plainly before the run starts.

---

## Phase 1 — Fix the two silent data-loss bugs in `src/lib/galleries.ts` FIRST

Both of these work fine at 24 galleries and fail quietly at 258. Fix them before migrating, or the migration will look successful and be wrong.

**Bug 1 — the gallery query is capped at 200 rows.**

```ts
const gRes = await fetch(`${URL}/rest/v1/galleries?select=id,name,pin&limit=200`, { headers: h });
```

258 galleries will truncate to 200. Page it the same way the photos query is paged, and assert the row count matches what the database reports.

**Bug 2 — the photo loop has a hard 20,000 ceiling.**

```ts
for (let offset = 0; offset < 20000; offset += 1000) {
```

The full archive is around 21,000 photos. Photos past 20,000 vanish with no error. Remove the fixed ceiling and loop until a batch comes back short, with a sanity assertion against a `count` query.

**Third thing to change:**

```ts
.filter((g) => g.photos.length > 0)
```

Today this hides empty galleries. After migration an empty gallery means a failed migration, so it must be *reported loudly*, not filtered away. Keep the filter if you like, but log every gallery it drops and fail the build if any dropped gallery is marked `hosted: true` in `client-area.json`.

Commit these fixes on their own, before Phase 2, and confirm the site still builds and deploys clean with the existing 24.

---

## Phase 2 — Recover the Pixieset collection IDs for the 234

Match each `client-area.json` item to its Pixieset collection. Slug and title are your keys; `iso` is the tiebreaker.

Write the result to `src/data/galleries-pending.json` in the same shape as `galleries.json`. Then, before migrating anything, show John:

- how many of the 234 you matched confidently
- any you could not match, by name and date
- any Pixieset collection that has no corresponding card in `client-area.json` — those are galleries the client area never listed, and he needs to decide whether they come across

Do not guess at an ambiguous match. List it and ask.

---

## Phase 3 — Migrate in batches, newest first

Work in batches of about 20 galleries. Newest first, so that if anything stops the run the galleries clients are actually opening this month are already across.

**Track A runs step 1 only. Steps 2–5 are Track B and are parked.** Enumerate Pixieset once, take the originals to Drive, and record everything you learn about photo counts so the Supabase half can run later without repeating the discovery work.

Each gallery has **two** destinations, though only the first runs for now:

- **Originals → Google Drive**, for safekeeping
- **Web versions → Supabase**, for the site

For each gallery:

1. **Originals to Drive.** Inside the mounted `My Drive`, create a subfolder under `CAMERABOSS CLIENT GALLERIES` named `<iso date> — <gallery name>` so it sorts chronologically, and write the full-resolution files straight into it. Then wait for sync and **verify server-side** — query the Drive API for that folder and check the file count matches Pixieset's count for the collection. A local file count proves nothing. Record the total bytes. If Pixieset will not serve originals for a collection, note it and carry on — do not silently substitute web versions.
2. Create the Supabase `galleries` row — `name` exactly as Pixieset has it, and carry the **PIN across unchanged**. Clients have these.
3. Upload each photo to the `photos` bucket and its thumbnail to `thumbnails`, matching the naming pattern the existing 1,952 already use. Read one of them first and follow it exactly.
4. Insert `photos` rows with `url`, `thumbnail_url`, `date`, `resolution` populated the same way the existing rows are.
5. Verify the Supabase row count equals Pixieset's photo count for that collection before moving on.

Keep a running manifest at `src/data/archive-manifest.json` — one line per gallery with the collection ID, name, Pixieset count, Drive folder ID, Drive file count and bytes, Supabase photo count, and a status. This is the record that says whether Pixieset can be cancelled, so it must be written as you go and not reconstructed afterwards.

After each batch: report galleries done, originals in Drive, photos in Supabase, storage used against **both** limits, and anything skipped. Never continue past a batch that came out short — stop and say so.

**Slug parity is the trap here.** `galleries.ts` derives its slug with `slugify(name)`, which lowercases and strips *every* non-alphanumeric character. The URL a card points at comes from `client-area.json`. If `slugify(gallery.name) !== item.slug`, the card leads to a 404. Check this for all 258 as you go, and reconcile by fixing the `client-area.json` slug rather than renaming the gallery.

---

## Phase 4 — Wire up the client area

For every migrated gallery, update its `client-area.json` item: `hosted` to `true`, `href` to `/galleries/<slug>/`, `photos` to the real count.

Then confirm, on a real build:

- all 258 items resolve — no card still pointing at `gallery.cameraboss.co.uk` unless John knowingly left it there
- every `/galleries/<slug>/` route exists
- the cover images still load, since those live in the `blog` bucket and are unaffected by this migration
- PIN gating still behaves as it does now: open viewing, PIN required only for downloads

---

## Phase 5 — The old client links

234 galleries were shared with clients as `https://gallery.cameraboss.co.uk/<slug>/` — in emails, WhatsApp messages, and invoices going back to 2023. Migrating the photos does not fix those links.

Do not decide this alone. Put the options to John and record his answer in this file:

- keep `gallery.cameraboss.co.uk` on Pixieset's cheapest plan indefinitely, or
- repoint that subdomain at the new site with path-preserving redirects to `/galleries/<slug>/`, or
- accept that old links break once Pixieset is cancelled

If he chooses redirects, build and test the mapping for all 234 slugs before anything is cancelled.

---

## Phase 6 — Full-site verification

Build clean, deploy to a Vercel preview, then verify against the preview URL, not localhost:

1. Page count matches expectations and the build log reports every gallery and photo.
2. Every one of the 184 blog URLs returns 200 with its original Pixieset path intact. Check the full list, not a sample.
3. The 27 existing 301 redirects still resolve.
4. **Resolve the robots/sitemap/meta contradiction before adding 234 more gallery URLs.** Right now the three disagree with each other:
   - `src/pages/robots.txt.ts` emits `Disallow: /galleries/`
   - `sitemap.xml` lists 25 gallery URLs, inviting Google to crawl them
   - each gallery page emits `<meta name="robots" content="index, follow, max-image-preview:large…">`

   So the site simultaneously asks Google to index the galleries and forbids it from fetching them. At 25 URLs this is untidy; at 258 it becomes a visible Search Console problem. Put the choice to John — client galleries out of search entirely (robots disallow, drop them from the sitemap, `noindex` on the pages), or fully indexable (remove the disallow, keep the sitemap entries and the index meta) — and make all three agree either way. Note that robots.txt also hardcodes `https://www.cameraboss.co.uk/sitemap.xml`, which is correct only after cutover.
5. Spot-check 10 galleries across all four years: photos load, thumbnails load, download works with the PIN, open viewing works without it.
6. `/contact/` renders the Studio Ninja form and a real test enquiry arrives.
7. Mobile drawer at 390×844: no sideways scroll, targets 44px or larger, Esc and scrim both close it.
8. Build time and output size — with roughly 21,000 photos baked in at build time, report both. If the build is getting close to Vercel's limits, say so now rather than at cutover.
9. Reconcile `archive-manifest.json` against Drive itself — re-read the folder listing rather than trusting what you wrote during the run — and confirm every gallery's original count matches Pixieset. Open three or four of the Drive files to confirm they are full-resolution and not web versions.

---

## Phase 7 — Domain preparation, then stop

**This whole phase is Track B and does not run while John is holding off on spending.** When it does run, start here:

0. **The Vercel plan question is a cutover-time decision, not an earlier one.** The `Cameraboss` team is on Hobby, which Vercel's documentation restricts to "non-commercial, personal use only", with deployments liable to be paused for policy violations. While the site sits on a `*.vercel.app` URL and is not the trading address, the exposure is low. Attaching `cameraboss.co.uk` is what makes it a commercial site in plain view. Pro is $20 per developer seat per month. Put it to John at that point, not before.

1. Add `cameraboss.co.uk` and `www.cameraboss.co.uk` as domains on the Vercel project `website` (`prj_a51nL2YT0r23dztCqyxtpXIr2L3n`) — not to `cameraboss-gallery`, `cameraboss-crm` or `cameraboss-crm-probe`. This is safe: nothing changes for visitors until DNS moves.
2. Read back the exact records Vercel asks for.
3. **Establish where the domain actually lives before writing any DNS instructions.** The sources disagree: `README.md` says the domain is on **Go54 (formerly WhoGoHost)**, John had a **GoDaddy** transfer page open recently, and `cameraboss.co.uk` currently resolves to Cloudflare IPs because that is Pixieset's edge. Confirm the registrar, confirm where nameservers are actually managed, and confirm whether a transfer is in flight — changing nameservers mid-transfer can fail or stall. Do not write the cutover steps against a guess.
4. Write the cutover checklist to `DNS-CUTOVER.md`: exact records, TTL guidance, the order of operations, how to verify, and how to roll back to Pixieset.
5. **Stop. Do not change DNS.** John does that himself, on a different day, when he is not tired.

---

## Phase 8 — Housekeeping that will otherwise mislead the next session

Small jobs, but each one is a trap left for whoever works on this next.

1. **`README.md` is badly out of date and actively wrong.** It describes the project as a "frontend skeleton" and lists a backend "Roadmap" of things to come — contact form, blog via a CMS, dynamic galleries — all of which have been built. It also names Go54 as the registrar. Any future Claude Code session that reads it will believe the site is half-finished. Rewrite it to describe what actually exists: 183 blog posts, 45 migrated pages, the client galleries, Supabase-backed images, Studio Ninja contact, deployed on Vercel.

2. **`DEPLOY.md` is superseded by this file** but still opens with "Everything Claude Code needs". Add a line at its top pointing to `GO-LIVE.md` so nobody runs the old sequence.

3. **The second gallery app is already deployed, not just sitting on the Desktop.** `~/Desktop/gallery-app`, a React and Vite build called `cameraboss-gallery`, points at the *same* Supabase project and queries the *same* `photos` table. It exists as its own Vercel project (`prj_yR4TI7R2EO4qFAU5KPGwloPGzDoG`) with a **READY production deployment**. As of 7 September that deployment sits behind Vercel Authentication, so it is not publicly reachable — but it is live, it reads live client photo data, and it will mislead the next session that goes looking for gallery code. It has been superseded by `/galleries/` in this site. Confirm with John that it is dead, then delete the Vercel project or leave it protected and clearly marked retired. Verify the protection is still on before leaving it in place. The team also carries an unlinked scratch project, `cameraboss-crm-probe` — worth clearing out at the same time.

4. **Analytics is wired but dormant.** `src/components/Analytics.astro` switches itself on the moment `PUBLIC_GA_ID` or `PUBLIC_PLAUSIBLE_DOMAIN` is set, and emits nothing otherwise. No code change is needed — just ask John whether he wants Google Analytics, Plausible, or neither at launch, and set the variable in Vercel if he does.

5. **Merge `galleries-pending.json` back into `galleries.json`** once the migration is complete, so there is one source of truth for collection IDs rather than two files that will drift.

## Image storage — the database is not the problem

Two things are easy to conflate. Supabase's free tier gives **500 MB of Postgres** and **1 GB of file storage** as separate allowances. The `galleries` and `photos` tables are a few megabytes of short metadata even at 258 galleries and ~21,000 rows, and they are read only at build time. The database side stays comfortably free forever. **It is only the image files that don't fit.**

That matters because `photos.url` and `photos.thumbnail_url` are plain strings, and `src/lib/galleries.ts` passes them straight through to the page. The code does not care which host serves an image. So new galleries can be written to a different storage provider with **no code change and no rewriting of existing URLs** — the 24 migrated galleries and the 420 MB `blog` bucket stay exactly where they are. This is additive, not a migration, which is what makes it different from the Cloudinary question below.

Two providers hold the whole archive inside their free tier:

| | Free allowance | Egress | Beyond free | Catch |
|---|---|---|---|---|
| **Backblaze B2** | 10 GB storage, always | Free up to 3× average stored (~12 GB/month at 4 GB stored), then $0.01/GB | $6.95/TB/month | None that blocks today — serves from its own production URLs |
| **Cloudflare R2** | 10 GB-month, 1M Class A + 10M Class B ops | **Free, always, no cap** | $0.015/GB-month | Production use wants the domain on Cloudflare; the `r2.dev` URL is rate-limited and documented as development-only |

**Recommendation: Backblaze B2 now, Cloudflare R2 later.** B2 needs no DNS change, which is the deciding factor while the domain question is still open, and if gallery downloads push past the free egress the overage is cents rather than a wall — unlike Cloudinary's free tier, which stops. R2 is the better long-term home once `cameraboss.co.uk` is on Cloudflare, since its egress is free without limit; B2 also delivers free through Cloudflare's CDN, so the two combine rather than compete.

Whichever is chosen, keep Supabase Postgres as the index. Do not move the database.

## A note on Cloudinary — considered, not used

There is a Cloudinary account on the free plan (`c-7997d07f6d1b6ec7aa4a21fe97ecec`). As of 7 Sep it holds 60 assets, all of them Cloudinary's own sample images from when the account was created, and 0.17 of its 25 monthly credits. Nothing of John's is in it.

Do not move image storage to Cloudinary during this run. The reasons, so nobody relitigates it mid-migration:

- **It cannot hold the originals.** This plan caps uploads at 10 MB and 25 megapixels per image. Full-resolution wedding files routinely exceed that. Originals go to Drive.
- **Bandwidth is the constraint, not storage.** Cloudinary's free tier is 25 credits a month covering storage *and* bandwidth *and* transformations together. The ~4 GB library would take about 4 credits, leaving roughly 21 GB of monthly delivery. One client downloading a 900-photo gallery is around 280 MB, so that is roughly 75 gallery downloads a month before the account stops. Supabase Pro is $25/month with 100 GB storage and far more bandwidth headroom; the comparable Cloudinary tier is several times that.
- **The switching cost lands in the worst week.** Supabase URLs are already baked into `posts.json` (4.4 MB), `pages.json` (4.6 MB), `client-area.json`, and every row of the `photos` table. Re-pointing all of it days before a cutover is risk without reward.

If image weight becomes a problem after launch, the low-risk version is Cloudinary's **fetch** delivery type pointed at the existing Supabase URLs — it adds `f_auto`/`q_auto` and on-the-fly resizing with no re-upload and no data migration, and it can be reverted by changing the URL prefix back. Treat that as a post-launch experiment, not part of this run.

## Report at the end

- what moved: galleries, originals into Drive, photos into Supabase, and the gigabytes into each — reported against the real ceilings in gigabytes, never as percentages. The ceilings are **roughly 1 TB free on Google Drive** and **1 GB on the Supabase free plan**, which is what the project is on today; Pro raises that to 100 GB. Say how much headroom is left on each after every batch.
- the manifest reconciliation: how many of the 258 have originals safely in Drive with counts matching Pixieset, and the exact list of any that do not
- what did not, and why
- every decision you had to ask about and what he chose
- anything you changed in the code beyond the Phase 1 fixes
- the honest risk list before cutover

## Rules

- Never force-push. `main` is deployed.
- **Be the only agent in this folder.** John also runs Cowork sessions with `~/cameraboss-website` connected, and one of them was live on 7 September. Two agents editing this folder at once will corrupt the run. Confirm with him that nothing else is working here before you start.
- `npm run build` on his Mac ends with an `EACCES` from the Vercel adapter copying into `.vercel/output/_functions/`. The Astro build itself completes and Vercel runs that step on its own side. Ignore it, clean up any half-written `.vercel/output`, and do not "fix" it.
- Never print or commit the Supabase keys. `.env` holds `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`; read them, do not echo them.
- Never delete anything on Pixieset, and never suggest cancelling it, until `archive-manifest.json` shows every gallery's originals in Drive with counts matching. Until then Pixieset is the only copy.
- Never delete anything from Google Drive.
- Stop and ask on any ambiguity rather than picking the reasonable-looking option. A wrong guess across 234 galleries is expensive to unpick.
- Do not touch DNS, and do not cancel any Pixieset plan.
