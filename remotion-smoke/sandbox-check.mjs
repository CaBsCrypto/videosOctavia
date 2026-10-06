import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';

// This pinned renderer hardcodes unsafe launch flags. Fail before downloading
// or launching a browser; do not patch vendor files or remove browser sandboxing.
export const assertSandboxedLauncher = async () => {
  const require = createRequire(import.meta.url);
  const launcher = join(dirname(require.resolve('@remotion/renderer')), 'open-browser.js');
  const source = await readFile(launcher, 'utf8');
  if (source.includes("'--no-sandbox'") || source.includes("'--disable-setuid-sandbox'")) {
    throw new Error('Render blocked: pinned Remotion launcher disables Chromium sandboxing. Use an environment and supported renderer launch path that preserve sandboxing.');
  }
};
