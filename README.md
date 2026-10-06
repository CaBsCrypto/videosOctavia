# videosOctavia

Initial code-only setup for a video project using Remotion and ElevenLabs.

## Current status

- Local ElevenLabs prototype, placeholder configuration and offline tests are prepared in `elevenlabs-local/`.
- The ElevenLabs API is not connected. No API key or account configuration is included.
- Remotion package import and video rendering are still pending. This repository does not yet contain a working Remotion composition or renderer.

## Saved environment setup

The saved `videosOctavia` environment is intended for a voice-free Remotion smoke render. The code package is `videosOctavia-Remotion-setup-code.zip` (59,828 bytes), with expected SHA-256 `b7df252670b3008c11150de60e09dac995a68deae65684b26f18fe38d9884896`. Verify the downloaded bytes before importing; the expected hash alone is not verification.

On 2026-10-06, Library preparation succeeded but the supported local download failed with `library file transfer failed: download failed`. A separate HTTPS connectivity check returned `Tunnel connection failed: 403 Forbidden`. No package bytes were imported, dependencies installed, or Chromium render attempted. Chromium capability, MP4 frame count and duration remain unverified. The existing three offline prototype tests passed under Node.js 24.19.0.

Once supported Library delivery works, preserve existing files, inspect the package, install its locked dependencies, run its tests and render a minimal composition without audio or API requests. Verify the actual MP4 frame count and duration. Keep all rendered media out of Git. Do not bypass network or Chromium security restrictions.

## Network secret for a future ElevenLabs integration

In the saved environment UI, the user should add a **Network secret** named `ELEVENLABS_API_KEY`, stored in **Personal Vault**, with its permitted host limited to `api.elevenlabs.io`. Enter its value only through that UI. Do not put the value in chat, repository files, commands, logs or public artifacts.

This is a setup instruction, not confirmation that the secret exists or that the API is connected. No supported presence-only check was performed. The current local prototype still prompts privately for a key during an explicitly approved live run; it has not been adapted to a Network secret. A future integration must first confirm the environment's supported injection mechanism without reading or printing the secret. Creating the secret does not authorize API calls, speech generation or spending credits.

## Check the setup

Requires Node.js 20 or later. No package installation is needed for the current prototype.

```sh
node --test elevenlabs-local/test.mjs
node elevenlabs-local/client.mjs
```

Tests use simulated responses; the default client command only estimates the placeholder text without network access or credit usage. See `elevenlabs-local/README.md` before considering live generation.

## Public repository boundaries

Commit code and placeholder configuration only. Keep keys, real campaign configuration, audio, video, renders and other private data out of commits. `.gitignore` excludes common local outputs and secret-file locations; review every staged change before publishing.
