#!/bin/bash
# CameraBoss publish — applies the handoff facelift, verifies, pushes, lets Vercel deploy.
# Safe by construction: backup branch first; stops before pushing if check/test fail; no DNS/CRM.
set -uo pipefail
say(){ echo ""; echo "==== $* ===="; }
cd "$HOME/cameraboss-website" || { echo "FATAL: repo not found"; exit 1; }

export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
nvm use 22 >/dev/null 2>&1 || nvm use --lts >/dev/null 2>&1 || nvm use default >/dev/null 2>&1 || true
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
say "node/npm"; node -v || { echo "FATAL: node not found"; exit 1; }; npm -v

say "clear stale git locks"; rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock 2>/dev/null; echo ok
say "safety backup branch"; BK="backup/pre-facelift-$(date +%Y%m%d-%H%M%S)"; git branch "$BK" && echo "backup: $BK"

say "locate handoff zip"
ZIP="$(ls -t "$HOME/Downloads/CameraBoss-Claude-Handoff.zip" "$HOME/Desktop/CameraBoss-Claude-Handoff.zip" 2>/dev/null | head -1)"
[ -z "$ZIP" ] && ZIP="$(find "$HOME" -maxdepth 4 -iname 'CameraBoss-Claude-Handoff.zip' 2>/dev/null | head -1)"
[ -z "$ZIP" ] && { echo "FATAL: handoff zip not found in Downloads/Desktop/home"; exit 1; }
echo "zip: $ZIP"
rm -rf /tmp/cb-handoff; mkdir -p /tmp/cb-handoff; unzip -q "$ZIP" -d /tmp/cb-handoff || { echo "FATAL: unzip failed"; exit 1; }
SNAP="/tmp/cb-handoff/CameraBoss-Claude-Handoff/website"
[ -d "$SNAP/src" ] || { echo "FATAL: snapshot src missing"; exit 1; }

say "apply snapshot (preserving .env/.git/.vercel/node_modules)"
rsync -a --delete "$SNAP/src/"   ./src/   || exit 1
rsync -a --delete "$SNAP/audit/" ./audit/ || exit 1
rsync -a --delete "$SNAP/tests/" ./tests/ || exit 1
rsync -a          "$SNAP/public/" ./public/ || exit 1
cp "$SNAP/astro.config.mjs" "$SNAP/package.json" "$SNAP/package-lock.json" "$SNAP/tsconfig.json" "$SNAP/.gitignore" "$SNAP/.env.example" ./ || exit 1
git rm -f --ignore-unmatch src/lib/galleries.ts src/pages/client-area/index.ts "src/pages/galleries/[slug].astro" src/pages/galleries/index.astro >/dev/null 2>&1
echo "applied"

say "install (npm ci)"; npm ci || { echo "FATAL: npm ci failed"; exit 1; }
say "astro check"; npm run check || { echo "FATAL: astro check failed — NOT pushing"; exit 1; }
say "build + migration tests"; npm test || { echo "FATAL: build/tests failed — NOT pushing"; exit 1; }

say "keep helper files out of the commit"
for f in "PUBLISH.md" "GO-LIVE.md" "publish.sh" "Publish Cameraboss.command" "publish.log"; do
  grep -qxF "$f" .git/info/exclude 2>/dev/null || echo "$f" >> .git/info/exclude
done

say "commit + push"
git add -A
git commit -m "Publish facelift: dock hero with two side cameras, Pixieset-redirect galleries, 9-photo portfolio grid, experience photo slideshow" || echo "(nothing new to commit)"
git push origin main || { echo "FATAL: git push failed (credentials?) — nothing deployed"; exit 1; }

say "PUBLISH SUCCESS"; git log --oneline -1; echo "Vercel will now build from this push. You can close this window."
