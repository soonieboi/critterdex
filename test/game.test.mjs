import test from 'node:test';
import assert from 'node:assert/strict';
import {CRITTERS,WORLD,SITES,newGame,startGame,move,search,zone,terrain,walkable,cameraFor,mapPosition,nearestSite,logDiscovery,leaveEncounter,validEncounter} from '../public/game.js';
import {demoResponse} from '../lib/decisions.mjs';
const directions=[[1,0],[-1,0],[0,1],[0,-1]],key=(x,y)=>`${x},${y}`;
function graph(from){const q=[[from.x,from.y]],previous=new Map([[key(from.x,from.y),null]]);for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of directions){const a=x+dx,b=y+dy,k=key(a,b);if(walkable(a,b)&&!previous.has(k)){previous.set(k,[x,y]);q.push([a,b]);}}}return {q,previous};}
function travel(s,target){const {previous}=graph(s),route=[];let p=[target.x,target.y];assert.ok(previous.has(key(...p)));while(previous.get(key(...p))){const prev=previous.get(key(...p));route.push([p[0]-prev[0],p[1]-prev[1]]);p=prev;}for(const [dx,dy]of route.reverse())assert.equal(move(s,dx,dy),true);assert.equal(s.x,target.x);assert.equal(s.y,target.y);}
function discover(s,site){travel(s,site);assert.equal(search(s),true);const response=demoResponse({encounter:s.encounter});return logDiscovery(s,response);}
test('all walkable tiles, regions, bridges and twelve encounter sites are reachable without softlocks',()=>{
 const {q,previous}=graph(newGame());let walkableCount=0;for(let y=0;y<WORLD.rows;y++)for(let x=0;x<WORLD.cols;x++)if(walkable(x,y))walkableCount++;
 assert.equal(q.length,walkableCount);assert.ok(q.length>2800);assert.equal(SITES.length,12);assert.equal(new Set(SITES.map(s=>s.name)).size,12);
 assert.deepEqual(new Set(q.map(([x,y])=>zone(x,y))),new Set(['Field Station','Fernwood','Moonlit Grove','Dewdrop Marsh','Pebble Ridge']));
 for(const site of SITES){assert.ok(previous.has(key(site.x,site.y)),site.name);assert.equal(zone(site.x,site.y),site.region);assert.equal(CRITTERS.find(c=>c.id===site.species).zone,site.region);assert.equal(nearestSite(site).name,site.name);}
 assert.ok(q.some(([x,y])=>terrain(x,y)==='bridge'));
});
test('every tile movement respects collisions and world bounds; invalid and non-world actions are blocked',()=>{
 for(let y=0;y<WORLD.rows;y++)for(let x=0;x<WORLD.cols;x++)if(walkable(x,y))for(const [dx,dy]of directions){const s={...newGame(),phase:'playing',x,y};const allowed=walkable(x+dx,y+dy);assert.equal(move(s,dx,dy),allowed);assert.deepEqual([s.x,s.y],allowed?[x+dx,y+dy]:[x,y]);}
 const s=newGame();assert.equal(move(s,1,0),false);startGame(s);for(const d of [[2,0],[1,1],[.5,.5],[NaN,0]])assert.equal(move(s,...d),false);
 travel(s,SITES[0]);search(s);const old=[s.x,s.y];assert.equal(move(s,1,0),false);assert.deepEqual([s.x,s.y],old);
});
test('camera follows player and clamps to all edges and viewport sizes; minimap uses identical world coordinates',()=>{
 for(const width of [320,768,3000])for(const height of [320,448,2000])for(const s of [{x:1,y:1},{x:70,y:46},{x:36,y:25},{x:1,y:46},{x:70,y:1}]){
  const c=cameraFor(s,width,height);assert.ok(c.x>=0&&c.y>=0);assert.ok(c.x<=Math.max(0,WORLD.cols*32-width));assert.ok(c.y<=Math.max(0,WORLD.rows*32-height));assert.ok(s.x*32+16-c.x>=0&&s.x*32+16-c.x<=width);assert.ok(s.y*32+16-c.y>=0&&s.y*32+16-c.y<=height);
  const p=mapPosition(s,144,96);assert.equal(p.x,(s.x+.5)/WORLD.cols*144);assert.equal(p.y,(s.y+.5)/WORLD.rows*96);assert.ok(p.x>0&&p.x<144&&p.y>0&&p.y<96);
 }
 assert.deepEqual(cameraFor({x:0,y:0}),{x:0,y:0});assert.deepEqual(cameraFor({x:71,y:47}),{x:1536,y:1088});
});
test('all eight regional discoveries complete the guide; exploration and encounters continue afterwards',()=>{
 const s=newGame();startGame(s);assert.equal(search(s),false,'station is a safe hub');
 for(let i=0;i<8;i++){const c=CRITTERS[i],result=discover(s,SITES.find(site=>site.species===c.id));assert.ok(result.fresh);assert.equal(result.critter.id,c.id);assert.equal(Object.keys(s.collection).length,i+1);}
 assert.equal(s.phase,'complete');assert.equal(s.scans,8);const snapshot=structuredClone(s.collection);const result=discover(s,SITES[0]);assert.equal(result.fresh,false);assert.equal(s.phase,'complete');assert.deepEqual(s.collection,snapshot);
});
test('encounters are local, landmarks feature their species, repeated scans update without duplicates',()=>{
 const s=newGame();startGame(s);
 for(const site of SITES){travel(s,site);search(s);assert.equal(CRITTERS[s.encounter].id,site.species);leaveEncounter(s);}
 const first=discover(s,SITES[0]);assert.ok(first.fresh);assert.equal(discover(s,SITES[0]).fresh,false);assert.equal(Object.keys(s.collection).length,1);
 // Away from a landmark, both possible species still belong to the current region.
 travel(s,{x:5,y:15});assert.equal(nearestSite(s),null);search(s);assert.equal(CRITTERS[s.encounter].zone,'Fernwood');
});
test('refusal and unknown classification do not log; leaving and travel preserve collection, position and trace',()=>{
 const s=newGame();startGame(s);discover(s,SITES[0]);s.collection.mossbun.trace={mode:'demo',marker:'saved'};const snapshot=structuredClone(s.collection);travel(s,SITES[4]);const position=[s.x,s.y];search(s);
 assert.equal(logDiscovery(s,{answers:[{type:'refusal',name:'species'}]}),false);assert.equal(logDiscovery(s,{answers:[{type:'choice',name:'species',choice:'invented'}]}),false);leaveEncounter(s);assert.deepEqual(s.collection,snapshot);assert.deepEqual([s.x,s.y],position);
});
test('reset is independent and returns to safe station spawn',()=>{const s=newGame();startGame(s);discover(s,SITES[0]);const fresh=newGame();assert.deepEqual(fresh.collection,{});assert.equal(fresh.phase,'title');assert.equal(zone(fresh.x,fresh.y),'Field Station');assert.ok(walkable(fresh.x,fresh.y));});
test('encounter input remains one bounded integer; creature/API evidence is unchanged by map expansion',()=>{
 for(const s of [null,{},[],{encounter:-1},{encounter:8},{encounter:.2},{encounter:NaN},{encounter:0,key:'x'}])assert.ok(!validEncounter(s));assert.equal(validEncounter({encounter:0}),true);assert.equal(new Set(CRITTERS.map(c=>c.id)).size,8);for(const c of CRITTERS){assert.ok(c.sprite.length>0);assert.deepEqual(Object.keys(c.clues),['habitat','body','light','behavior']);}
});
