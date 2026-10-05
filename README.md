# videosOctavia

Initial code-only setup for a video project using Remotion and ElevenLabs.

## Current status

- Local ElevenLabs prototype, placeholder configuration and offline tests are prepared in `elevenlabs-local/`.
- The ElevenLabs API is not connected. No API key or account configuration is included.
- Remotion package import and video rendering are still pending. This repository does not yet contain a working Remotion composition or renderer.

## Check the setup

Requires Node.js 20 or later. No package installation is needed for the current prototype.

```sh
node --test elevenlabs-local/test.mjs
node elevenlabs-local/client.mjs
```

Tests use simulated responses; the default client command only estimates the placeholder text without network access or credit usage. See `elevenlabs-local/README.md` before considering live generation.

## Public repository boundaries

Commit code and placeholder configuration only. Keep keys, real campaign configuration, audio, video, renders and other private data out of commits. `.gitignore` excludes common local outputs and secret-file locations; review every staged change before publishing.
