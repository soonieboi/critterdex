import {CRITTERS,newGame,startGame,move,search,zone,logDiscovery,leaveEncounter,WORLD,SITES,nearestSite} from './game.js';
import {makeRenderer,drawThumbnail,drawWorldOverview} from './pixel.js';
const $=id=>document.getElementById(id),canvas=$('world'),draw=makeRenderer(canvas);
let game=newGame(),scanState='unscanned',trace=null,labTrace=null,mode='demo',ready=false,configured=false,error='',menuPanel=null,detail=null,confirmReset=false,previousFocus=null,tab='request',controller=null,generation=0;
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,sceneTime=0,lastFrame=0;
const count=()=>Object.keys(game.collection).length;
const species=()=>trace?.response.answers.find(a=>a.name==='species'&&a.type==='choice');
const namedCritter=()=>CRITTERS.find(c=>c.id===species()?.choice);
function announce(text){$('announcement').textContent=text;}
function update(){
 $('title-screen').hidden=game.phase!=='title';
 $('location').textContent=game.screen==='encounter'?'SCANNER / OBSERVING':zone(game.x,game.y).toUpperCase();
 canvas.setAttribute('aria-label',`Scrolling creature world. ${zone(game.x,game.y)}, X ${game.x}, Y ${game.y}. ${nearestSite(game)?.name||'Follow a trail or open M for the world map.'}`);
 $('discovery-count').textContent=`FOUND ${String(count()).padStart(2,'0')} / 08`;$('dex-count').textContent=`${count()}/8`;
 $('mode').textContent=configured?(mode==='live'?'LIVE · BILLABLE SCANS':'DEMO · LOCAL RULES'):'SCANNER CONNECTING';$('mode').classList.toggle('live',mode==='live');
 $('mode-explanation').textContent=mode==='live'?'Only pressing SCAN sends a billable OpenAI request. Exploration and logging are local.':'Demo scans use local rules. No OpenAI calls or charges.';
 $('motion').textContent=reduced?'✦ MOTION OFF':'✦ MOTION ON';$('motion').setAttribute('aria-pressed',String(reduced));
 $('scan-results').hidden=true;$('dialogue-text').classList.remove('error-text');
 let title='YOUR NEXT LITTLE ADVENTURE',text=game.notice,label='SEARCH',aria='Search nearby';
 if(game.phase==='title'){text='A pocket scanner. A winding trail. Something wonderful in the grass.';label='START';aria='Start exploring';}
 else if(game.phase==='complete'&&game.screen==='world'){title='FIELD GUIDE COMPLETE / KEEP EXPLORING';text=game.notice;}
 else if(game.screen==='encounter'){
  const c=CRITTERS[game.encounter];
  if(scanState==='scanning'){title='SCANNING OBSERVATIONS…';text=mode==='live'?'Sending three questions to OpenAI Decisions. Your scanner is waiting for typed answers.':'Matching clues with local demo rules. This is a synthetic scan, not model output.';label='WAIT';aria='Scan in progress';}
  else if(scanState==='scanned'){
   const found=namedCritter();title=found?`DISCOVERED: ${found.name.toUpperCase()}!`:'CLASSIFICATION UNAVAILABLE';
   text=found?found.note:'The species question was refused. Other typed answers remain inspectable in Help → API Lab. You can scan again or leave.';
   label=found?'LOG IT!':mode==='live'?'RESCAN · PAID':'RESCAN';aria=found?'Log discovery':mode==='live'?'Rescan with OpenAI — one billable request':'Rescan creature';
   const luminous=trace.response.answers.find(a=>a.name==='luminous'),curiosity=trace.response.answers.find(a=>a.name==='curiosity');
   $('scan-results').innerHTML=`<span>${luminous.type==='predicate'?(luminous.probability>=.5?'✦ LUMINOUS':'○ NO GLOW'):'GLOW: REFUSED'}</span><span>${curiosity.type==='score'?`CURIOSITY ${curiosity.score.toFixed(2)} / 2`:'CURIOSITY: REFUSED'}</span><span>${trace.mode==='demo'?'DEMO SCAN':'OPENAI DECISIONS'}</span>`;$('scan-results').hidden=false;
  }else{
   title='UNKNOWN CRITTER / OBSERVED CLUES';
   text=`${c.clues.body}. ${c.clues.light}. ${c.clues.behavior}.`;
   if(mode==='live')text+=' Live scan: 1 billable API request. Press A to send.';
   label=mode==='live'?'SCAN · PAID':'SCAN';aria=mode==='live'?'Scan with OpenAI — one billable request':'Scan creature with local demo rules';
  }
  if(error){text=error;$('dialogue-text').classList.add('error-text');}
 }
 $('dialogue-title').textContent=title;$('dialogue-text').textContent=text;$('action-label').textContent=label;$('action').setAttribute('aria-label',aria);$('action').disabled=scanState==='scanning'||(game.screen==='encounter'&&!ready);
 $('back').disabled=scanState==='scanning';
}
function begin(){startGame(game);game.notice='Four trails leave the station. Follow a sparkle, or press M to open the world map.';update();canvas.focus({preventScroll:true});}
function invalidate(){controller?.abort();generation++;scanState='unscanned';error='';}
function goBack(){
 if(menuPanel){closeMenu();return;}
 if(game.screen==='encounter'){invalidate();leaveEncounter(game);update();announce(game.notice);}else openMenu('help');
}
function action(){
 if(menuPanel||scanState==='scanning')return;
 if(game.phase==='title'){begin();return;}
 if(game.screen==='world'){const found=search(game);if(found){scanState='unscanned';trace=null;error='';}update();announce(found?'Wild encounter. Read the observed clues, then scan.':game.notice);return;}
 if(scanState==='scanned'&&namedCritter()){
  const result=logDiscovery(game,trace.response);if(result){game.collection[result.critter.id].trace=structuredClone(trace);scanState='unscanned';update();announce(game.notice);if(result.fresh&&game.phase==='complete')openMenu('collection');}
 }else if(ready)scan();
}
async function scan(){
 if(!ready||scanState==='scanning'||game.screen!=='encounter')return;
 const version=++generation,payload={encounter:game.encounter};controller=new AbortController();scanState='scanning';error='';update();
 try{
  const res=await fetch('/api/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});const data=await res.json();
  if(version!==generation)return;
  if(!res.ok)throw new Error(data.error||'The scanner could not complete this scan.');
  trace=data;labTrace=null;scanState='scanned';update();announce(namedCritter()?`Discovered ${namedCritter().name}. Press A to log it.`:'Species classification was refused.');
 }catch(e){if(version!==generation)return;scanState='error';error=e.name==='AbortError'?'Scan cancelled.':e.message;update();announce(error);}
}
function step(dx,dy){if(menuPanel||!['playing','complete'].includes(game.phase))return;if(move(game,dx,dy)){update();}else if(game.screen==='world')update();}
function openMenu(panel){
 if(!menuPanel)previousFocus=document.activeElement;
 menuPanel=panel;confirmReset=false;detail=null;$('menu').hidden=false;$('paused-label').hidden=false;renderMenu();$('close-menu').focus();
}
function closeMenu(){menuPanel=null;$('menu').hidden=true;$('paused-label').hidden=true;previousFocus?.focus();}
function thumbnail(c,locked=false){const el=document.createElement('canvas');el.width=128;el.height=128;el.setAttribute('aria-hidden','true');drawThumbnail(el,c,locked);return el;}
function renderMenu(){
 document.querySelectorAll('[data-panel]').forEach(b=>b.classList.toggle('selected',b.dataset.panel===menuPanel));
 $('menu-title').textContent=menuPanel==='collection'?'Your little discoveries':menuPanel==='api'?'Under the scanner':menuPanel==='map'?'A bigger little world':'A field explorer’s handbook';
 const body=$('menu-body');body.replaceChildren();
 if(menuPanel==='map'){
  body.innerHTML=`<p class="collection-intro">72 × 48 tiles · four connected regions · twelve encounter landmarks.<br>You are in ${zone(game.x,game.y)} at X ${game.x}, Y ${game.y}. The orange dot is you; the white frame is your camera.</p><canvas id="world-overview" width="576" height="384" aria-label="World map. Fernwood northwest, Moonlit Grove northeast, Dewdrop Marsh southwest, Pebble Ridge southeast. Player at X ${game.x}, Y ${game.y}."></canvas><div class="map-legend"><span>◆ YOU</span><span>□ CAMERA</span><span>✦ ENCOUNTER SITE</span><span>■ SCANNED SPECIES</span></div><div class="map-regions"><p><b>↖ FERNWOOD</b>Hollow Oak · Sunpetal Clearing · Fern Hollow</p><p><b>↗ MOONLIT GROVE</b>Moonstone Circle · Lantern Thicket · Quiet Glade</p><p><b>↙ DEWDROP MARSH</b>Reedwater Bridge · Lantern Reeds · Dewdrop Banks</p><p><b>↘ PEBBLE RIDGE</b>Cloudwatch Lookout · Copper Arch · Whistling Stones</p></div><p class="collection-intro map-tip">The station marks the crossroads. Pale paths connect every region; wooden bridges cross deep water. Search beside a sparkling landmark to meet its local critter. Your discoveries stay with you as you travel.</p>`;
  drawWorldOverview($('world-overview'),game);
 }else if(menuPanel==='collection'){
  const intro=document.createElement('p');intro.className='collection-intro';intro.textContent=count()===8?'FIELD GUIDE COMPLETE! Eight original critters, eight new friends. Select a discovery to read its field notes.':`${count()} of 8 critters discovered. Search each region, scan the clues, then press LOG IT. Your guide lives in this session; reloading clears it.`;body.append(intro);
  if(detail){
   const c=CRITTERS.find(c=>c.id===detail),entry=game.collection[c.id],wrap=document.createElement('div');wrap.className='collection-detail';wrap.append(thumbnail(c));const text=document.createElement('div');text.innerHTML=`<h3>${c.name}</h3><p>${c.note}</p><p>${c.zone} · ${entry.trace?.mode==='live'?'OpenAI scan':'Synthetic demo scan'}</p><button class="tiny-button" id="inspect-entry">INSPECT THIS SCAN →</button>`;wrap.append(text);body.append(wrap);$('inspect-entry').addEventListener('click',()=>{labTrace=entry.trace||trace;menuPanel='api';renderMenu();});
  }
  const grid=document.createElement('div');grid.className='collection-grid';
  CRITTERS.forEach((c,i)=>{const unlocked=Boolean(game.collection[c.id]),card=document.createElement('button');card.className='critter-card'+(unlocked?'':' locked');card.setAttribute('aria-label',unlocked?`Read ${c.name} field notes`:`Undiscovered creature ${i+1}`);card.append(thumbnail(c,!unlocked));const name=document.createElement('b');name.textContent=unlocked?c.name:'???';card.append(name);const sub=document.createElement('small');sub.textContent=`NO. ${String(i+1).padStart(2,'0')} · ${unlocked?c.zone:'NOT YET DISCOVERED'}`;card.append(sub);card.addEventListener('click',()=>{if(unlocked){detail=c.id;renderMenu();$('menu-body').scrollTop=0;}});grid.append(card);});body.append(grid);
 }else if(menuPanel==='help'){
  body.innerHTML=`<section class="help-section"><h3>01 / Take the scenic route.</h3><p>You are a field explorer with a pocket scanner. Roam a scrolling 72 × 48 world, explore four distinct regions and twelve encounter landmarks, and collect all eight original creatures. There’s no timer, combat, or penalty for being curious.</p><div class="help-controls"><span>WASD / ARROWS → MOVE</span><span>Z / SPACE / ENTER → ACTION</span><span>B / ESC → BACK</span><span>M → MAP · F → GUIDE · H → HELP</span></div><p>The direction pad and A/B buttons work on touch screens. Press A to search nearby. Read the clues, press A to scan, then press A again to log your discovery. Search beside sparkling landmarks to meet their featured local critter. Elsewhere, search favors unlogged species from the region you are in. Creatures no longer appear in unrelated regions; follow the trails to fill your guide.</p></section><section class="help-section"><h3>02 / Find your way.</h3><p>The minimap follows your orange player dot and shows the camera’s white frame. Press M or WORLD MAP for a larger overview and region landmarks. Fernwood is northwest, Moonlit Grove northeast, Dewdrop Marsh southwest, and Pebble Ridge southeast. The field station sits at the crossroads. Water, rocks, dense trees and the station walls block movement; trails and bridges connect every area.</p><p>Keep exploring after your guide is complete. Opening menus, crossing regions and leaving an encounter preserve your current position and collection.</p></section><section class="help-section"><h3>03 / A field guide full of friends.</h3><p>Your collection records the species returned by the scanner’s choice answer. Open FIELD GUIDE to revisit authored notes and inspect the saved scan. Repeated scans update an existing entry without creating duplicate discoveries.</p><p>Your adventure is <strong>session only</strong>. Reloading or resetting clears the collection. The reset button asks you to confirm first. Menus pause exploration and prevent movement; there are no background scans.</p></section><section class="help-section"><h3>04 / Demo means demo.</h3><p>By default, scans use deterministic local rules, with synthetic typed answers. They do not call OpenAI or produce model output. Real Decisions API integration is available only when live mode is explicitly configured on the server. No API key is needed to play.</p><p>Field notes and creature art are authored game content. The API does not generate the descriptions or explain its reasoning. Open API LAB for the actual request, validated response, and exact mappings.</p></section><section class="help-section"><h3>05 / Make yourself comfortable.</h3><p>Motion is optional; the console’s MOTION button stops water and creature animation. Your system’s reduced-motion preference is respected at startup. Sound is off: this build has no audio or autoplay. Keyboard focus outlines and descriptive action labels are provided.</p><p>All creatures, names, sprites and map art are original. CritterDex is an independent learning project inspired by retro exploration games.</p></section>`;
 }else{
  body.innerHTML=`<section class="help-section"><h3>One scan. Three independent questions.</h3><p>The browser sends an encounter index to the Node server. The server supplies fictional, authored observations as a user-message <code>input_json</code> part and calls <code>POST https://api.openai.com/v1/decisions</code> with <code>model: "gpt-6-luna"</code>. The shared clues contain habitat, body, light and behavior. No private data or browser key is involved.</p><p><strong>choice / species</strong> selects one of eight supplied field-guide IDs. It controls the name, authored field note and collection entry. Choices include descriptions, and the answer includes per-option probabilities and a separate confidence value.</p><p><strong>predicate / luminous</strong> estimates whether the creature emits visible light. A game-specific 0.5 threshold displays LUMINOUS or NO GLOW. Reflected light does not count. This threshold is an illustration, not a calibrated real-world rule.</p><p><strong>score / curiosity</strong> rates approach behavior against ordered levels: Shy (0), Watchful (1), Bold (2). The score is a probability-weighted average of the numeric indices; a value such as 1.3 is valid. It is a 0–2 rubric rating, not a probability.</p></section><section class="help-section"><h3>Inspect the latest scan.</h3><p>The Request tab shows the exact body built by the server. Response shows a validated subset containing <code>model</code> and <code>answers</code>; usage and unknown fields are omitted. The source label distinguishes synthetic local output from OpenAI output.</p><div class="inspector"><div class="inspector-top"><div><button id="request-tab">REQUEST</button><button id="response-tab">RESPONSE SUBSET</button></div><span id="inspector-source"></span></div><pre id="json-output" tabindex="0"></pre></div></section><section class="help-section"><h3>Refusals, errors & honest boundaries.</h3><p>Each named question may independently return a refusal. Valid sibling answers still display. A refused species cannot be logged as a discovery; retry or leave instead. Network failures, missing keys, malformed responses and invalid probabilities show errors without adding a discovery. Live failures never silently turn into demo results.</p><p>Demo uses the encounter’s authored species, glow flag and curiosity level. Its one-hot distributions are synthetic rule outputs, not model confidence. They illustrate the real schema, and are not a prediction of a live answer.</p></section><section class="help-section"><h3>Using the real service.</h3><p>See the repository README to configure <code>DECISIONS_MODE=live</code> and <code>OPENAI_API_KEY</code> in a local, ignored environment file. The key stays on the server and is never returned or logged. Never paste a key into chat or client code.</p><p><strong>Live scanning is billable.</strong> The A button is labelled SCAN · PAID and the clues warn before a request. One scan sends all three questions. Exploration, menus, logging, and reset make no OpenAI calls. There are no automatic retries. Live access and actual model responses have not been tested with a real key in this build.</p><p>This local project binds only to loopback. Public hosting would require authentication, per-user spending limits, and deployment configuration.</p></section><section class="help-section"><h3>Official references</h3><p>Schema checked 31 October 2026. API behavior and model availability can change.</p><p><a href="https://developers.openai.com/api/docs/guides/decisions" target="_blank" rel="noreferrer">OpenAI Decisions guide ↗</a><br><a href="https://developers.openai.com/api/reference/resources/decisions/methods/create" target="_blank" rel="noreferrer">Create a decision reference ↗</a></p></section>`;
  $('request-tab').addEventListener('click',()=>{tab='request';inspect();});$('response-tab').addEventListener('click',()=>{tab='response';inspect();});inspect();
 }
 if(confirmReset){const prompt=document.createElement('div');prompt.className='confirm-reset';prompt.innerHTML='<p>Start a new adventure? Your session’s collection will be cleared.</p><button id="confirm-reset">YES, START FRESH</button><button id="cancel-reset">KEEP EXPLORING</button>';body.prepend(prompt);$('confirm-reset').addEventListener('click',reset);$('cancel-reset').addEventListener('click',()=>{confirmReset=false;renderMenu();});}
}
function inspect(){if(!$('json-output'))return;const inspected=labTrace||trace;$('request-tab').classList.toggle('selected',tab==='request');$('response-tab').classList.toggle('selected',tab==='response');$('inspector-source').textContent=inspected?(inspected.mode==='demo'?'DEMO · SYNTHETIC':'LIVE · OPENAI'):'NO SCAN YET';$('json-output').textContent=inspected?JSON.stringify(inspected[tab],null,2):'Find a creature and scan its clues to inspect the request and answer.';}
function reset(){invalidate();game=newGame();trace=null;labTrace=null;detail=null;confirmReset=false;closeMenu();update();announce('Adventure reset. Your collection is empty.');$('start').focus();}
$('start').addEventListener('click',begin);$('action').addEventListener('click',action);$('back').addEventListener('click',goBack);
$('help').addEventListener('click',()=>openMenu('help'));$('dex').addEventListener('click',()=>openMenu('collection'));$('map').addEventListener('click',()=>openMenu('map'));$('close-menu').addEventListener('click',closeMenu);
$('reset').addEventListener('click',()=>{confirmReset=true;renderMenu();$('menu-body').scrollTop=0;$('confirm-reset').focus();});
$('motion').addEventListener('click',()=>{reduced=!reduced;update();});
for(const b of document.querySelectorAll('[data-move]'))b.addEventListener('click',()=>step(...b.dataset.move.split(',').map(Number)));
for(const b of document.querySelectorAll('[data-panel]'))b.addEventListener('click',()=>{menuPanel=b.dataset.panel;confirmReset=false;detail=null;renderMenu();});
$('menu').addEventListener('click',e=>{if(e.target===$('menu'))closeMenu();});
document.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.altKey||e.metaKey)return;
 if(menuPanel){
  if(e.key==='Escape'){e.preventDefault();closeMenu();}
  if(e.key==='Tab'){const focusable=[...$('menu').querySelectorAll('button:not(:disabled),a[href],pre[tabindex]')].filter(el=>el.getClientRects().length);if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0]?.focus();}}
  return;
 }
 // Preserve native activation when keyboard focus is on a control.
 if(['Enter',' '].includes(e.key)&&document.activeElement?.tagName==='BUTTON')return;
 const key=e.key.toLowerCase(),dirs={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
 if(dirs[key]){e.preventDefault();step(...dirs[key]);}
 else if([' ','enter','z'].includes(key)){e.preventDefault();if(!e.repeat)action();}
 else if(['escape','b','x'].includes(key)){e.preventDefault();if(!e.repeat)goBack();}
 else if(key==='h')openMenu('help');else if(key==='f')openMenu('collection');else if(key==='m')openMenu('map');
});
function frame(now){if(!menuPanel)sceneTime+=Math.min((now-lastFrame)/1000,.05);lastFrame=now;draw(game,sceneTime,reduced);requestAnimationFrame(frame);}
update();requestAnimationFrame(frame);
try{const response=await fetch('/api/config');if(!response.ok)throw new Error();const config=await response.json();mode=config.mode;ready=config.ready;configured=true;update();if(!ready){game.notice='Live mode needs a server-side key. Explore freely; scanning is unavailable.';update();}}catch{configured=true;ready=false;game.notice='Scanner server unavailable. You can still explore the map.';update();}
