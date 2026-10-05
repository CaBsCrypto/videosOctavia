# Local ElevenLabs prototype

Code only. No credentials, account data, campaign text or media are included. This is a local prototype, not an active cloud integration or production pipeline.

Requires Node.js with built-in fetch (Node 20+). No third-party packages are needed.

From this directory run `node client.mjs` for an offline estimate, or `node --test test.mjs` for simulated tests. Neither command contacts ElevenLabs.

Before a live run, copy config.json to config.local.json (ignored by Git) and privately configure approved text, exact verified voice IDs, the credit budget and current commercial rights there. The client uses this local file when present. Confirm every chosen voice costs one credit per character for Multilingual v2 before enabling standardRateConfirmed. Other rates require updating the calculation. The API tier check alone does not establish commercial rights. Keep real project configuration outside public commits; never store the key in either configuration file.

Only after explicit approval to generate, the user can run `node client.mjs --generate` in their own private terminal. The API key is entered without echo; never send it through chat, command arguments, environment variables or files. The client sends it only to the fixed official HTTPS API host and does not store or log it. JavaScript does not guarantee secure memory erasure. Revoke a temporary key when finished.

The client checks subscription before each generation, reserves a credit margin, rejects unsupported plans, writes a ledger before requesting audio and stores MP3 plus checksum locally. It never automatically retries a failed generation. An uncertain ledger entry or stale lock requires manually reviewing the official generation history before recovery. Deduplication only covers this output directory, not earlier browser generations or another computer. Concurrent account activity can change the balance.

Audio, output, ledger, local environment files and dependencies are ignored by Git. Review staged files before every public commit; .gitignore is not a secret scanner.

Official references:
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- https://elevenlabs.io/docs/api-reference/user/subscription/get
