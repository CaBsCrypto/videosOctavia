# Independent Remotion smoke diagnostic

New code created independently of the unavailable Library ZIP. It uses no
external resources, media, audio, secrets or APIs. The composition is 640 × 360,
60 frames at 30 fps (expected duration 2 seconds), with text and a moving circle.

## Install and check

From this directory, use Node.js 20+:

```sh
npm ci --cache /workspace/npm-cache --no-audit --no-fund
npm test
npm run render
```

The cache path is inside the permitted workspace. All Remotion packages are
pinned to 4.0.532 in the package and lockfile. Output is ignored by Git.

## Actual result on 2026-10-06

- Installation from `registry.npmjs.org` succeeded: 179 packages.
- The composition bundled successfully before the original render attempt.
- Automatic Chrome Headless Shell download failed with `getaddrinfo EAI_AGAIN
  remotion.media`, requesting the official
  `chromium-headless-shell-linux-x64-149.0.7790.0.zip` file. This is a DNS failure;
  it does not establish that this domain is explicitly denied. The environment
  administrator must check approved DNS/network access to `remotion.media`.
  No proxy, DNS or allowlist settings were changed.
- Installed Chromium 151.0.7922.173 was checked directly with `--headless`, a
  workspace `--user-data-dir`, and `--dump-dom about:blank`. It aborted with exit
  134: the SUID sandbox helper is not configured correctly; Chromium requires
  `/usr/lib/chromium/chrome-sandbox` owned by root with mode 4755. This requires
  an administrator-supported sandbox configuration; it was not changed here.
- Inspection of installed Remotion 4.0.532 found hardcoded `--no-sandbox` and
  `--disable-setuid-sandbox` launcher flags. No Remotion browser was launched.
  The script now stops before download or launch when those flags are present.
  Fixing DNS alone is insufficient under the requirement to preserve sandboxing.
  A supported sandbox-preserving renderer launch path is also required.

No MP4 exists. Frame count, actual duration and successful Chromium rendering
remain unverified. Once a supported secure launch path is available, render and
verify with `ffprobe -v error -count_frames -show_streams -show_format
output/smoke.mp4`; expect 60 decoded video frames, 30 fps, 640 × 360, 2 seconds
and no audio stream. Do not use security-disabling flags to make this pass.

Official renderer documentation:
https://www.remotion.dev/docs/renderer/render-media

## Manual GitHub Actions preparation

`.github/workflows/remotion-smoke.yml` is manual-only (`workflow_dispatch`),
uses standard `ubuntu-24.04`, checks that the repo is public and limits the job
to 10 minutes. It uses read-only repository permissions, no secrets, no Actions
cache, no schedules and no push trigger. It preserves the sandbox preflight.
It has not been dispatched: the pinned launcher remains blocked by that check.
This is workflow preparation, not a successful remote render.

Public repository status was confirmed through the authorized GitHub app.
Standard hosted runner usage is free for public repositories; larger runners
are charged. Artifact storage has separate quota rules. No artifact upload is
configured because the available storage allowance and zero-charge guarantee
were not verified. If a secure launch path is approved and implemented, resolve
artifact billing before adding an upload (maximum intended retention: 1 day).
`verify.mjs` checks a real ffprobe result; there is no generated MP4 yet.

GitHub requires manual workflows to be registered on the default branch before
dispatch. This workflow remains on `work`; no default-branch merge was performed
and no Actions settings or permissions were changed.

Billing: https://docs.github.com/en/billing/concepts/product-billing/github-actions
