import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {plan, run} from './client.mjs';
const config = {text:'hola', model:'eleven_multilingual_v2', maxCredits:4, commercialRightsConfirmed:true, standardRateConfirmed:true, voices:[{name:'Alma',id:'fake_voice'}]};
function fixture() {return fs.mkdtempSync(path.join(os.tmpdir(),'browns-tests-'));}
test('budget and commercial gates prevent network', async () => {
  assert.throws(() => plan({...config,maxCredits:3}));
  await assert.rejects(run({...config,commercialRightsConfirmed:false},'FAKE',fixture(),()=>{throw Error('network must not run');}));
  await assert.rejects(run({...config,standardRateConfirmed:false},'FAKE',fixture(),()=>{throw Error('network must not run');}));
});
test('completed audio reused; uncertain response never retried', async () => {
  const dir = fixture(); let posts = 0;
  const fake = async (url, options) => {
    if (options.method === 'POST') {posts++; return new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'audio/mpeg'}});}
    return Response.json({tier:'starter',character_limit:1000,character_count:0});
  };
  await run(config,'FAKE',dir,fake); await run(config,'FAKE',dir,fake); assert.equal(posts,1);
  const uncertain = fixture(); let failures = 0;
  const timeout = async (url,options) => {if(options.method === 'POST'){failures++;throw Error('timeout');}return Response.json({tier:'starter',character_limit:1000,character_count:0});};
  await assert.rejects(run(config,'FAKE',uncertain,timeout));
  await assert.rejects(run(config,'FAKE',uncertain,timeout)); assert.equal(failures,1);
});
test('free tier and insufficient credit stop before synthesis', async () => {
  for (const subscription of [{tier:'free',character_limit:1000,character_count:0},{tier:'starter',character_limit:4,character_count:0}]) {
    let posts = 0;
    await assert.rejects(run(config,'FAKE',fixture(),async (url,options)=>{if(options.method==='POST')posts++;return Response.json(subscription);}));
    assert.equal(posts,0);
  }
});
