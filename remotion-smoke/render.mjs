import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {fileURLToPath} from 'node:url';
import {assertSandboxedLauncher} from './sandbox-check.mjs';

// Independent diagnostic composition; no imported Library package, media or API.
await assertSandboxedLauncher();
const serveUrl = await bundle({entryPoint: fileURLToPath(new URL('./src/index.jsx', import.meta.url))});
const composition = await selectComposition({serveUrl, id: 'Smoke'});
await renderMedia({
  serveUrl,
  composition,
  codec: 'h264',
  concurrency: 1,
  outputLocation: fileURLToPath(new URL('./output/smoke.mp4', import.meta.url)),
});
console.log('Rendered output/smoke.mp4');
