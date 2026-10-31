import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {buildRequest,demoResponse,validateResponse,getDecision,ENDPOINT} from '../lib/decisions.mjs';
import {createApp} from '../server.mjs';
const state={encounter:0},req=buildRequest(state),raw=demoResponse(state);
test('request follows documented Decisions subset with shared JSON evidence and three named types',()=>{
 assert.equal(req.model,'gpt-6-luna');assert.deepEqual(Object.keys(req).sort(),['input','model','questions']);assert.equal(req.input[0].role,'user');assert.equal(req.input[0].content[0].type,'input_json');assert.deepEqual(Object.keys(req.input[0].content[0].data),['observations']);assert.equal(req.questions.length,3);assert.deepEqual(req.questions.map(q=>q.type),['choice','predicate','score']);assert.equal(new Set(req.questions.map(q=>q.name)).size,3);assert.equal(req.questions[0].choices.length,8);assert.equal(new Set(req.questions[0].choices.map(c=>c.value)).size,8);assert.equal(req.questions[2].levels.length,3);assert.ok(!JSON.stringify(req.input).includes('mossbun'));
});
test('all demo encounters are repeatable, validated, labelled synthetic, and make zero network calls even with a key',async()=>{for(let encounter=0;encounter<8;encounter++){const s={encounter};const result=await getDecision(s,{key:'test-only-placeholder',fetchImpl:()=>{throw new Error('Network forbidden');}});assert.equal(result.mode,'demo');assert.deepEqual(result.response,demoResponse(s));assert.deepEqual(validateResponse(result.response,result.request),result.response);}});
test('live transport uses exact endpoint and keeps server authorization out of returned data',async()=>{
 let calls=0;const result=await getDecision(state,{mode:'live',key:'test-only-placeholder',fetchImpl:async(url,options)=>{calls++;assert.equal(url,ENDPOINT);assert.equal(url,'https://api.openai.com/v1/decisions');assert.equal(options.method,'POST');assert.equal(options.headers.Authorization,'Bearer test-only-placeholder');assert.deepEqual(JSON.parse(options.body),req);return new Response(JSON.stringify(raw));}});assert.equal(calls,1);assert.equal(result.mode,'live');assert.ok(!JSON.stringify(result).includes('test-only-placeholder'));
});
test('individual refusal preserves valid sibling answers',()=>{const v=structuredClone(raw);v.answers[0]={type:'refusal',name:'species'};const r=validateResponse(v,req);assert.equal(r.answers[0].type,'refusal');assert.equal(r.answers[1].type,'predicate');});
test('rejects malformed/missing/out-of-order answers, invalid distributions and inconsistent scores; accepts fractional score',()=>{
 const cases=[null,{}, {...raw,model:'wrong'},{...raw,answers:[]},{...raw,answers:[raw.answers[1],raw.answers[0],raw.answers[2]]}];
 for(const edit of [v=>v.answers[1].probability=2,v=>v.answers[0].choice='invented',v=>v.answers[0].confidence=NaN,v=>v.answers[0].probabilities[0].value='invented',v=>v.answers[0].probabilities[0].probability=1.5,v=>v.answers[2].score=1.3,v=>v.answers[2].probabilities[0].label='wrong']){const v=structuredClone(raw);edit(v);cases.push(v);}for(const v of cases)assert.throws(()=>validateResponse(v,req));
 const v=structuredClone(raw);v.answers[2]={name:'curiosity',type:'score',score:1.1,confidence:.55,probabilities:[{value:0,label:'Shy',probability:.1},{value:1,label:'Watchful',probability:.7},{value:2,label:'Bold',probability:.2}]};assert.equal(validateResponse(v,req).answers[2].score,1.1);
});
test('failures never retry or silently replace live output with demo',async()=>{
 await assert.rejects(getDecision(state,{mode:'live'}),/server-side/);let calls=0;
 await assert.rejects(getDecision(state,{mode:'live',key:'placeholder',fetchImpl:async()=>{calls++;return new Response('sensitive upstream body',{status:429});}}),/HTTP 429/);assert.equal(calls,1);
 await assert.rejects(getDecision(state,{mode:'live',key:'placeholder',fetchImpl:async()=>new Response('{}')}));await assert.rejects(getDecision(state,{mode:'live',key:'placeholder',fetchImpl:async()=>{throw new Error('timeout');}}));
});
async function withServer(options,fn){const server=createApp(options);await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;try{await fn(base);}finally{await new Promise(r=>server.close(r));}}
const post=(base,payload,headers={})=>fetch(base+'/api/decision',{method:'POST',headers:{'Content-Type':'application/json',Origin:base,...headers},body:JSON.stringify(payload)});
test('HTTP origin, host, payload, static allowlist, CSP and key isolation',async()=>{
 await withServer({key:'test-only-placeholder'},async base=>{
 assert.deepEqual(await fetch(base+'/api/config').then(r=>r.json()),{mode:'demo',ready:true});
 const res=await post(base,state);assert.equal(res.status,200);assert.ok(!(await res.text()).includes('test-only-placeholder'));
 assert.equal((await post(base,{encounter:8})).status,400);assert.equal((await post(base,state,{Origin:'http://evil.example'})).status,403);assert.equal(await new Promise((resolve,reject)=>{http.get(base,{headers:{Host:'evil.example'}},r=>{r.resume();resolve(r.statusCode);}).on('error',reject);}),403);
 for(const path of ['/.env','/server.mjs','/lib/decisions.mjs'])assert.equal((await fetch(base+path)).status,404);
 const page=await fetch(base+'/');assert.equal(page.status,200);assert.match(page.headers.get('content-security-policy'),/connect-src 'self'/);
 assert.equal((await fetch(base+'/api/decision',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'broken'})).status,400);
 assert.equal((await fetch(base+'/api/decision',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'x'.repeat(3000)})).status,413);
 });
 for(const file of ['public/app.js','public/index.html','public/game.js','public/pixel.js']){const content=await readFile(new URL('../'+file,import.meta.url),'utf8');assert.ok(!content.includes('test-only-placeholder'));assert.ok(!content.includes('Bearer '));}
});
test('HTTP upstream error content is redacted; missing live key remains an explicit failure',async()=>{
 await withServer({mode:'live',key:'test-only-placeholder',fetchImpl:async()=>{throw new Error('test-only-placeholder');}},async base=>{const r=await post(base,state);assert.equal(r.status,502);assert.ok(!(await r.text()).includes('test-only-placeholder'));});
 await withServer({mode:'live'},async base=>{assert.equal((await post(base,state)).status,502);});
});
test('one in-flight request at a time and per-minute request cap',async()=>{
 let release,calls=0;
 await withServer({mode:'live',key:'placeholder',fetchImpl:async()=>{calls++;await new Promise(r=>release=r);return new Response(JSON.stringify(raw));}},async base=>{const first=post(base,state);for(let i=0;i<50&&!release;i++)await new Promise(r=>setTimeout(r,5));assert.equal((await post(base,state)).status,429);release();assert.equal((await first).status,200);assert.equal(calls,1);});
 await withServer({},async base=>{for(let i=0;i<20;i++)assert.equal((await post(base,state)).status,200);assert.equal((await post(base,state)).status,429);});
});
