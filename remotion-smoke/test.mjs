import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bundle} from '@remotion/bundler';
import {access, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {assertSandboxedLauncher} from './sandbox-check.mjs';

test('independent composition bundles without a browser or API', async () => {
  const directory = await bundle({entryPoint: fileURLToPath(new URL('./src/index.jsx', import.meta.url))});
  try {
    await access(join(directory, 'index.html'));
  } finally {
    await rm(directory, {recursive: true, force: true});
  }
});

test('pinned renderer cannot launch with its hardcoded sandbox-disabling flags', async () => {
  await assert.rejects(assertSandboxedLauncher(), /Render blocked/);
});
