// Optional dependency-free browser smoke check. Point CHROME_BIN to your installed Chromium.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {demoResponse} from '../lib/decisions.mjs';
import {CRITTERS,WORLD,SITES,walkable,cameraFor,mapPosition} from '../public/game.js';
const chrome=process.env.CHROME_BIN;
if(!chrome)throw new Error('Set CHROME_BIN to an already installed Chromium executable.');
const profile=await mkdtemp(join(tmpdir(),'critterdex-browser-'));
const browser=spawn(chrome,['--headless','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0',`--user-data-dir=${profile}`],{stdio:['ignore','ignore','pipe']});
let ws,server,browserStderr='';
browser.stderr.on('data',c=>browserStderr=(browserStderr+c).slice(-1500));
try{
 const endpoint=await (async()=>{for(let i=0;i<150;i++){const match=browserStderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)return match[1];try{const [port,path]=String(await readFile(join(profile,'DevToolsActivePort'))).trim().split('\n');if(port&&path)return `ws://127.0.0.1:${port}${path}`;}catch{}await new Promise(r=>setTimeout(r,100));}throw new Error('Browser launch timeout: '+browserStderr);})();
 ws=new WebSocket(endpoint);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let seq=0;const awaiting=new Map(),errors=[],external=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=awaiting.get(m.id);awaiting.delete(m.id);if(m.error)p?.reject(new Error(m.error.message));else p?.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.method==='Network.requestWillBeSent'&&!m.params.request.url.startsWith('http://127.0.0.1:'))external.push(m.params.request.url);});
 const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>reject(new Error('CDP timeout: '+method)),10000);awaiting.set(id,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id,method,params,sessionId}));});
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
 const cmd=(method,params)=>send(method,params,sessionId);
 await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Network.enable');
 const evaluate=async expression=>{const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 const until=async expression=>{for(let i=0;i<200;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,25));}throw new Error('Timeout: '+expression);};
 const base=process.env.PREVIEW_URL||'http://127.0.0.1:4317';
 const position=()=>evaluate("({x:Number(document.querySelector('#world').dataset.worldX),y:Number(document.querySelector('#world').dataset.worldY)})");
 const route=(from,to)=>{const q=[[from.x,from.y]],prev=new Map([[`${from.x},${from.y}`,null]]);for(let i=0;i<q.length;i++){const [x,y]=q[i];if(x===to.x&&y===to.y)break;for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,k=`${a},${b}`;if(walkable(a,b)&&!prev.has(k)){prev.set(k,[x,y]);q.push([a,b]);}}}const result=[];let p=[to.x,to.y];assert.ok(prev.has(p.join(',')));while(prev.get(p.join(','))){const old=prev.get(p.join(','));result.push([p[0]-old[0],p[1]-old[1]]);p=old;}return result.reverse();};
 const travel=async target=>{const steps=route(await position(),target);await evaluate(`(()=>{for(const d of ${JSON.stringify(steps)})document.querySelector('[data-move="'+d.join(',')+'"]').click();})()`);await until(`Number(document.querySelector('#world').dataset.worldX)===${target.x}&&Number(document.querySelector('#world').dataset.worldY)===${target.y}`);const dataset=await evaluate("({...document.querySelector('#world').dataset})");const c=cameraFor(target),p=mapPosition(target);assert.equal(Number(dataset.cameraX),c.x);assert.equal(Number(dataset.cameraY),c.y);assert.equal(Number(dataset.minimapX),p.x);assert.equal(Number(dataset.minimapY),p.y);};
 const shot=async path=>{await new Promise(r=>setTimeout(r,120));const screenshot=await cmd('Page.captureScreenshot',{format:'png'});await writeFile(path,Buffer.from(screenshot.data,'base64'));};
 await cmd('Emulation.setDeviceMetricsOverride',{width:1440,height:1150,deviceScaleFactor:1,mobile:false});
 await cmd('Page.navigate',{url:base});await until("document.querySelector('#mode')?.textContent==='DEMO · LOCAL RULES'");
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
 await evaluate("document.querySelector('#start').click();document.querySelector('#motion').click()");
 assert.equal(await evaluate("document.querySelector('#motion').getAttribute('aria-pressed')"),'true');
 // The station is a safe hub, not an encounter farm.
 await evaluate("document.querySelector('#action').click()");assert.match(await evaluate("document.querySelector('#dialogue-text').textContent"),/Follow a trail/);
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft'});await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft'});await until("Number(document.querySelector('#world').dataset.worldX)===35");
 await evaluate("document.querySelector('#map').click()");assert.ok(await evaluate("Boolean(document.querySelector('#world-overview'))"));
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight'});await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight'});
 await evaluate("document.querySelector('#close-menu').click()");assert.equal((await position()).x,35);
 for(let i=0;i<8;i++){
  const site=SITES.find(s=>s.species===CRITTERS[i].id);await travel(site);
  if(i===0){await shot('/tmp/critterdex-expanded-world.png');await evaluate("document.querySelector('#map').click()");assert.match(await evaluate("document.querySelector('#world-overview').getAttribute('aria-label')"),new RegExp(`X ${site.x}, Y ${site.y}`));await shot('/tmp/critterdex-expanded-map.png');await evaluate("document.querySelector('#close-menu').click()");}
  await evaluate("document.querySelector('#action').click()");assert.match(await evaluate("document.querySelector('#dialogue-title').textContent"),/UNKNOWN CRITTER/);
  await evaluate("document.querySelector('#action').click()");await until("document.querySelector('#dialogue-title').textContent.startsWith('DISCOVERED:')");assert.match(await evaluate("document.querySelector('#dialogue-title').textContent"),new RegExp(CRITTERS[i].name.toUpperCase()));
  if(i===0){await evaluate("document.querySelector('#help').click();document.querySelector('[data-panel=api]').click()");assert.match(await evaluate("document.querySelector('#inspector-source').textContent"),/DEMO/);assert.match(await evaluate("document.querySelector('#json-output').textContent"),/input_json/);await evaluate("document.querySelector('#response-tab').click()");assert.match(await evaluate("document.querySelector('#json-output').textContent"),/probabilities/);await evaluate("document.querySelector('#close-menu').click()");}
  await evaluate("document.querySelector('#action').click()");assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),`${i+1}/8`);
 }
 await until("!document.querySelector('#menu').hidden");assert.equal(await evaluate("document.querySelectorAll('.critter-card:not(.locked)').length"),8);
 await evaluate("document.querySelector('.critter-card').click();document.querySelector('#inspect-entry').click()");assert.match(await evaluate("document.querySelector('#inspector-source').textContent"),/DEMO/);await evaluate("document.querySelector('#close-menu').click()");
 // Continue roaming after completion; verify all four camera limits and minimap positions.
 for(const point of [{x:1,y:1},{x:70,y:1},{x:70,y:46},{x:1,y:46}])await travel(point);
 assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'8/8');
 await travel(SITES[0]);await evaluate("document.querySelector('#action').click();document.querySelector('#action').click()");await until("document.querySelector('#dialogue-title').textContent.startsWith('DISCOVERED:')");await evaluate("document.querySelector('#action').click()");assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'8/8');assert.equal(await evaluate("document.querySelector('#menu').hidden"),true);
 await evaluate("document.querySelector('#help').click();document.querySelector('#reset').click();document.querySelector('#cancel-reset').click()");assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'8/8');await evaluate("document.querySelector('#close-menu').click()");
 for(const width of [390,320]){
  const before=await position();await cmd('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:true});assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);assert.deepEqual(await position(),before);
  await evaluate("document.querySelector('#map').click()");assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  await evaluate("document.querySelector('[data-panel=collection]').click();document.querySelector('[data-panel=help]').click()");assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);await evaluate("document.querySelector('[data-panel=api]').click()");assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);await evaluate("document.querySelector('#close-menu').click()");
 }
 await cmd('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await travel(SITES[9]);await shot('/tmp/critterdex-expanded-mobile.png');
 // Real touch events operate the direction pad without changing the guide.
 const tap=async selector=>{await evaluate(`document.querySelector('${selector}').scrollIntoView({block:'center'})`);const r=await evaluate(`(()=>{const r=document.querySelector('${selector}').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await cmd('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y}]});await cmd('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 const beforeTap=await position();await tap('[data-move="-1,0"]');await until(`Number(document.querySelector('#world').dataset.worldX)===${beforeTap.x-1}`);assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'8/8');
 await evaluate("document.querySelector('#help').click();document.querySelector('#reset').click();document.querySelector('#confirm-reset').click()");assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'0/8');await evaluate("document.querySelector('#start').click()");await travel(SITES[0]);await evaluate("document.querySelector('#action').click();document.querySelector('#back').click()");assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'0/8');
 // Mock the live service: never make paid requests or read real credentials.
 let behavior='ok',calls=0,release;
 server=createApp({mode:'live',key:'test-only-placeholder',fetchImpl:async(url,options)=>{calls++;if(behavior==='delay')await new Promise(r=>release=r);if(behavior==='error')return new Response('{}',{status:503});const body=JSON.parse(options.body).input[0].content[0].data.observations.body;const index=CRITTERS.findIndex(c=>c.clues.body===body);const raw=demoResponse({encounter:index});if(behavior==='refusal')raw.answers[0]={type:'refusal',name:'species'};if(behavior==='partial')raw.answers[1]={type:'refusal',name:'luminous'};return new Response(JSON.stringify(raw));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const liveBase=`http://127.0.0.1:${server.address().port}`;
 await cmd('Page.navigate',{url:liveBase});await until("document.querySelector('#mode')?.textContent==='LIVE · BILLABLE SCANS'");assert.equal(calls,0);
 await evaluate("document.querySelector('#start').click()");await travel(SITES[0]);await evaluate("document.querySelector('#action').click()");assert.match(await evaluate("document.querySelector('#action').getAttribute('aria-label')"),/billable/);assert.equal(calls,0);
 await evaluate("document.querySelector('#action').click()");await until("document.querySelector('#dialogue-title').textContent.startsWith('DISCOVERED:')");assert.equal(calls,1);
 await evaluate("document.querySelector('#action').click()");await travel(SITES[1]);await evaluate("document.querySelector('#action').click()");behavior='refusal';
 await evaluate("document.querySelector('#action').click()");await until("document.querySelector('#dialogue-title').textContent==='CLASSIFICATION UNAVAILABLE'");assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'1/8');
 behavior='partial';await evaluate("document.querySelector('#action').click()");await until("document.querySelector('#dialogue-title').textContent.startsWith('DISCOVERED:')");assert.match(await evaluate("document.querySelector('#scan-results').textContent"),/GLOW: REFUSED/);await evaluate("document.querySelector('#action').click()");assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'2/8');
 behavior='error';await evaluate("document.querySelector('#action').click();document.querySelector('#action').click()");await until("document.querySelector('#dialogue-text').classList.contains('error-text')");assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'2/8');
 behavior='delay';await evaluate("document.querySelector('#action').click()");for(let i=0;i<100&&!release;i++)await new Promise(r=>setTimeout(r,10));assert.ok(release);
 await evaluate("document.querySelector('#help').click();document.querySelector('#reset').click();document.querySelector('#confirm-reset').click()");release();await new Promise(r=>setTimeout(r,100));assert.equal(await evaluate("document.querySelector('#dex-count').textContent"),'0/8');assert.equal(await evaluate("document.querySelector('#title-screen').hidden"),false);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('Browser checks passed: keyboard and real touch; paused map/menu; all 8 regional discoveries; four camera edges and minimap consistency; exploration after completion; field-guide notes; inspector request/response; reset confirm/cancel; encounter back; 390px/320px no overflow; reduced motion; live billable labels/no background calls; individual and partial refusal; failure; reset during delayed scan; no JavaScript errors or external page requests.');
 console.log('Screenshots: /tmp/critterdex-expanded-world.png, /tmp/critterdex-expanded-map.png, /tmp/critterdex-expanded-mobile.png');
}finally{if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({id:999999,method:'Browser.close'}));ws?.close();if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}if(browser.exitCode===null){await Promise.race([new Promise(r=>browser.once('exit',r)),new Promise(r=>setTimeout(r,1500))]);if(browser.exitCode===null)browser.kill('SIGKILL');}await rm(profile,{recursive:true,force:true});}
