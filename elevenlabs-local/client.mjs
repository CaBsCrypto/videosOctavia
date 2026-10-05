import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export function plan(config) {
  if (config.model !== 'eleven_multilingual_v2') throw Error('Modelo sin estimación aprobada');
  if (!config.text?.trim() || !config.voices?.length) throw Error('Falta texto o voces');
  if (!Number.isInteger(config.maxCredits) || config.maxCredits <= 0) throw Error('Límite inválido');
  const credits = [...config.text].length * config.voices.length;
  if (credits > config.maxCredits) throw Error('Presupuesto excedido');
  return {characters: [...config.text].length, estimatedCredits: credits};
}

export async function run(config, key, directory, request = fetch) {
  const estimate = plan(config);
  if (!config.commercialRightsConfirmed) throw Error('Confirmar derechos comerciales antes de generar');
  if (!config.standardRateConfirmed) throw Error('Confirmar tarifa de 1 crédito por carácter en cada voz');
  for (const voice of config.voices) {
    if (!/^[a-zA-Z0-9_-]+$/.test(voice.id || '') || !/^[a-zA-Z0-9_-]+$/.test(voice.name)) throw Error('Verificar IDs y nombres de voces');
  }
  fs.mkdirSync(directory, {recursive: true});
  const lock = path.join(directory, 'run.lock');
  const handle = fs.openSync(lock, 'wx');
  const ledgerPath = path.join(directory, 'ledger.json');
  const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : {};
  const save = () => { fs.writeFileSync(ledgerPath + '.tmp', JSON.stringify(ledger, null, 2)); fs.renameSync(ledgerPath + '.tmp', ledgerPath); };
  const call = async (url, options = {}) => {
    const response = await request('https://api.elevenlabs.io' + url, {...options, redirect: 'error', signal: AbortSignal.timeout(60000), headers: {'xi-api-key': key, 'Content-Type': 'application/json'}});
    if (!response.ok) throw Error('Petición rechazada; respuesta omitida por seguridad');
    return response;
  };
  try {
    // Recheck before EACH paid request. Never use overage as available budget.
    let reserved = 0;
    for (const voice of config.voices) {
      const payload = {text: config.text, model_id: config.model, voice_settings: {speed: 1, stability: 0.5, similarity_boost: 0.75, style: 0}};
      const fingerprint = crypto.createHash('sha256').update(JSON.stringify({voice: voice.id, payload, format: 'mp3_44100_128'})).digest('hex');
      const destination = path.join(directory, `${voice.name}-${fingerprint.slice(0,12)}.mp3`);
      if (ledger[fingerprint]) {
        if (ledger[fingerprint].state === 'completed' && fs.existsSync(destination) && crypto.createHash('sha256').update(fs.readFileSync(destination)).digest('hex') === ledger[fingerprint].sha256) continue;
        throw Error('Resultado previo incierto o archivo alterado: revisar historial manualmente; no reintentar');
      }
      const subscription = await (await call('/v1/user/subscription')).json();
      if (!['starter','creator','pro','scale','business','enterprise'].includes(subscription.tier)) throw Error('Plan comercial no reconocido');
      const remaining = subscription.character_limit - subscription.character_count;
      const cost = estimate.characters;
      if (!Number.isFinite(remaining) || remaining < cost + reserved + 100 || reserved + cost > config.maxCredits) throw Error('Saldo o presupuesto insuficiente');
      ledger[fingerprint] = {state: 'uncertain', estimatedCredits: cost, voice: voice.name};
      save(); // Persist BEFORE request; interruption must not trigger a duplicate.
      const response = await call(`/v1/text-to-speech/${voice.id}?output_format=mp3_44100_128`, {method: 'POST', body: JSON.stringify(payload)});
      if (!response.headers.get('content-type')?.startsWith('audio/')) throw Error('Contenido inesperado; revisar historial');
      const audio = Buffer.from(await response.arrayBuffer());
      if (!audio.length) throw Error('Audio vacío; revisar historial');
      fs.writeFileSync(destination, audio, {flag: 'wx'});
      ledger[fingerprint] = {...ledger[fingerprint], state: 'completed', file: path.basename(destination), sha256: crypto.createHash('sha256').update(audio).digest('hex')};
      save();
      reserved += cost;
    }
  } finally { fs.closeSync(handle); fs.unlinkSync(lock); }
}

async function hiddenKey() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw Error('Requiere terminal interactiva privada');
  process.stdout.write('Clave API (entrada oculta; solo memoria): ');
  process.stdin.setRawMode(true); process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const done = () => {process.stdin.off('data', receive); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n');};
    function receive(chunk) {
      for (const char of chunk.toString()) {
        if (char === '\u0003') {done(); reject(Error('Cancelado')); return;}
        if (char === '\r' || char === '\n') {done(); resolve(value); return;}
        if (char === '\u007f' || char === '\b') value = value.slice(0,-1);
        else if (char >= ' ' && char <= '~') value += char;
      }
    }
    process.stdin.on('data', receive);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const localConfig = new URL('./config.local.json', import.meta.url);
    const config = JSON.parse(fs.readFileSync(fs.existsSync(localConfig) ? localConfig : new URL('./config.json', import.meta.url), 'utf8'));
    console.log(plan(config));
    if (process.argv.includes('--generate')) {
      const key = await hiddenKey();
      if (!key) throw Error('Clave vacía');
      await run(config, key, fileURLToPath(new URL('./output/', import.meta.url)));
      console.log('Archivos y ledger guardados localmente.');
    } else console.log('Simulación: no se ha llamado a la API.');
  } catch { console.error('Operación detenida. Revisar configuración, saldo o ledger; no reintentar generaciones inciertas.'); process.exitCode = 1; }
}
