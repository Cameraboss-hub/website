# CameraBoss — publish the facelift to production

**For Claude Code on John's Mac. Written 9 September 2026.**
Goal: publish the integrated facelift design (the CameraBoss handoff snapshot) to production via GitHub → Vercel, verified on the `*.vercel.app` URL.

**Hard rules — do not break these:**
- Preserve the repo's existing `.env` (Supabase keys). Never overwrite or print it.
- Do NOT change DNS. `cameraboss.co.uk` stays pointed at Pixieset. This publish only updates the Vercel deployment.
- Do NOT touch the CRM, and do NOT submit a real enquiry through the contact form.
- Never force-push. Never delete anything on Pixieset.
- If `npm run check` or `npm test` fail, STOP and report — do not push.

---

## 1. Preconditions

```bash
cd ~/cameraboss-website
git remote -v                      # must be github.com/Cameraboss-hub/website
# Clear stale lock files left by an earlier sandbox session:
rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock
git status                          # should run cleanly now; repo is ~3 commits ahead of origin (gallery-mirror work) — that is expected
# Safety net: snapshot the current state so it is recoverable
git branch backup/pre-facelift-$(date +%Y%m%d-%H%M)
```

Confirm you can push (`git fetch origin` should succeed). If auth fails, run `gh auth login` (GitHub.com → HTTPS) as the Cameraboss-hub account before continuing.

## 2. Get the authoritative snapshot

The source of truth is the handoff John attached: **CameraBoss-Claude-Handoff.zip** (frozen, MANIFEST-verified).

```bash
ZIP=$(ls -t ~/Downloads/CameraBoss-Claude-Handoff.zip ~/Desktop/CameraBoss-Claude-Handoff.zip 2>/dev/null | head -1)
[ -z "$ZIP" ] && ZIP=$(find ~ -maxdepth 3 -iname 'CameraBoss-Claude-Handoff.zip' 2>/dev/null | head -1)
echo "Using: $ZIP"
rm -rf /tmp/cb-handoff && mkdir -p /tmp/cb-handoff
unzip -q "$ZIP" -d /tmp/cb-handoff
SNAP="/tmp/cb-handoff/CameraBoss-Claude-Handoff/website"
ls "$SNAP"                          # sanity: package.json, src/, public/, astro.config.mjs
```

If the zip genuinely cannot be found, the snapshot was packaged from `~/cameraboss-website-codex` — you may use `SNAP=~/cameraboss-website-codex` as a fallback, but the zip is preferred because it is frozen and verified.

## 3. Apply the snapshot onto an integration branch

Work on a branch, not straight on main.

```bash
cd ~/cameraboss-website
git checkout -b integrate/facelift

# Mirror the snapshot-owned source trees (removes the 4 superseded gallery files automatically):
rsync -a --delete "$SNAP/src/"   ./src/
rsync -a --delete "$SNAP/audit/" ./audit/
rsync -a --delete "$SNAP/tests/" ./tests/
# Overlay public assets (add/update; no --delete so nothing existing is lost):
rsync -a "$SNAP/public/" ./public/
# Root config + lockfile (authoritative in the snapshot):
cp "$SNAP/astro.config.mjs" "$SNAP/package.json" "$SNAP/package-lock.json" "$SNAP/tsconfig.json" "$SNAP/.gitignore" "$SNAP/.env.example" ./
```

`.env` is untouched by the above — good. Now confirm the four superseded route files are gone (they are on REMOVED-FILES.txt and must not coexist with the replacements):

```bash
for f in src/lib/galleries.ts src/pages/client-area/index.ts "src/pages/galleries/[slug].astro" src/pages/galleries/index.astro; do
  [ -e "$f" ] && echo "STILL PRESENT (remove): $f"
done
git rm -f --ignore-unmatch src/lib/galleries.ts src/pages/client-area/index.ts "src/pages/galleries/[slug].astro" src/pages/galleries/index.astro 2>/dev/null
```

The replacements that must exist after this: `src/pages/galleries/index.ts`, `src/pages/galleries/[slug].ts`, `src/pages/client-area/index.astro`, `src/lib/gallery-links.ts`.

## 4. Install and verify — must pass before you push

```bash
node -v                 # must be >= 22.12.0
npm ci
npm run check           # expect: 0 errors, 0 warnings, ~11 hints
npm test                # production build + 9 migration tests — all must pass
```

Optional local look on a free port (avoid 3000/3100/3200 which John uses):
`npm run dev -- --host 127.0.0.1 --port 3400` then open http://127.0.0.1:3400/ — confirm the homepage shows the full-screen four-photo wedding slideshow with the two side cameras (no centred camera), then stop the server. Do not stop any unrelated process.

## 5. Commit, merge to main, push

```bash
git add -A
git commit -m "Publish facelift: dock hero with two side cameras, Pixieset-redirect galleries, 9-photo portfolio grid, experience photo slideshow

Integrates the CameraBoss handoff snapshot. Galleries stay on Pixieset
(/galleries/* redirect out; index at /client-area/). Blog, pages, all
existing URLs, redirects, canonical/SEO and the Studio Ninja enquiry embed
preserved. Removes the 4 superseded gallery/client-area route files."
git checkout main
git merge --no-ff integrate/facelift
git push origin main
```

## 6. Vercel deploys automatically

The `website` project auto-builds on push to `main`. The build needs no secrets (the new design references Supabase only as image URLs, not API calls), so no environment variables are required for it to succeed. Watch the deployment to READY in the Vercel dashboard.

## 7. Verify on the production Vercel URL (not the domain)

Open the project's `*.vercel.app` production URL and confirm:
- Homepage: full-screen four-photo wedding slideshow, two small side cameras that reveal photos on hover, NO centred camera. Check on a real phone too (single-column portfolio grid, working menu).
- `/galleries/` redirects to `/client-area/`; `/client-area/` lists the galleries.
- A `/galleries/<slug>` (e.g. `/galleries/joandjonny`) redirects to `gallery.cameraboss.co.uk`.
- `/blog/` loads; open two posts. `/contact/` shows the Studio Ninja form (do not submit).
- A couple of legacy redirects (`/joandjonny`, `/gallery`, `/home`) and a 404 on a bad URL.

## 8. Stop here and report

Report the `*.vercel.app` URL to John and stop. The domain cutover (pointing cameraboss.co.uk at Vercel) is a separate, deliberate step John will decide on — do not do it now. Two things gate that later step: the Vercel team is on the Hobby plan (non-commercial use), and the registrar/nameservers need confirming. None of that blocks this Vercel deployment.

## Rollback

If anything is wrong: in Vercel, open the previous deployment and **Promote to Production** (instant). In Git, `git revert -m 1 <merge-commit>` on main and push, or reset to the `backup/pre-facelift-*` branch.
