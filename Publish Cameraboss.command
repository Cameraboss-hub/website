#!/bin/bash
cd "$HOME/cameraboss-website" || exit 1
echo "Publishing the new CameraBoss website. This takes a few minutes — please leave this window open."
bash "$HOME/cameraboss-website/publish.sh" 2>&1 | tee "$HOME/cameraboss-website/publish.log"
echo ""
echo "================================================================"
echo "If you see 'PUBLISH SUCCESS' above, it worked. You can close this window."
echo "If you see 'FATAL', nothing was published — tell Claude and paste what it says."
echo "================================================================"
