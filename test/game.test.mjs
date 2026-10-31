import test from 'node:test';
import assert from 'node:assert/strict';
import {CRITTERS,newGame,startGame,move,search,zone,terrain,logDiscovery,leaveEncounter,validEncounter} from '../public/game.js';
import {demoResponse} from '../lib/decisions.mjs';
test('exploration bounds and blocked terrain; title/encounter block movement',()=>{
 const s=newGame();assert.equal(move(s,1,0),false);startGame(s);assert.equal(move(s,-1,0),true);assert.equal(s.steps,1);
 for(let i=0;i<100;i++)move(s,-1,0);assert.ok(s.x>=1);assert.notEqual(terrain(s.x,s.y),'water');
 const old={x:s.x,y:s.y};search(s);assert.equal(move(s,1,0),false);assert.deepEqual({x:s.x,y:s.y},old);
 assert.equal(move(s,2,0),false);assert.equal(move(s,1,1),false);assert.equal(zone(5,4),'Fernwood');
});
test('eight search/scan/log discoveries complete the guide without duplicates',()=>{
 const s=newGame();startGame(s);
 for(let i=0;i<8;i++){assert.equal(search(s),true);const response=demoResponse({encounter:s.encounter});const result=logDiscovery(s,response);assert.ok(result.fresh);assert.equal(Object.keys(s.collection).length,i+1);}
 assert.equal(s.phase,'complete');assert.equal(s.scans,8);assert.equal(search(s),false);
});
test('repeat discoveries update entries; refusal and unknown choice do not log',()=>{
 const s=newGame();startGame(s);search(s);const response=demoResponse({encounter:s.encounter});assert.equal(logDiscovery(s,{answers:[{type:'refusal',name:'species'}]}),false);assert.equal(Object.keys(s.collection).length,0);
 assert.equal(logDiscovery(s,{answers:[{type:'choice',name:'species',choice:'invented'}]}),false);logDiscovery(s,response);search(s);assert.equal(logDiscovery(s,response).fresh,false);assert.equal(Object.keys(s.collection).length,1);assert.equal(s.scans,2);
});
test('leaving a creature preserves collection and reset is a fresh independent state',()=>{const s=newGame();startGame(s);search(s);leaveEncounter(s);assert.equal(s.screen,'world');assert.equal(s.encounter,null);const other=newGame();s.collection.a={};assert.deepEqual(other.collection,{});assert.equal(other.phase,'title');});
test('encounter input is exactly one bounded integer and creature data is complete',()=>{
 for(const s of [null,{},[],{encounter:-1},{encounter:8},{encounter:.2},{encounter:NaN},{encounter:0,key:'x'}])assert.ok(!validEncounter(s));
 assert.equal(validEncounter({encounter:0}),true);assert.equal(new Set(CRITTERS.map(c=>c.id)).size,8);for(const c of CRITTERS){assert.ok(c.sprite.length>0);assert.deepEqual(Object.keys(c.clues),['habitat','body','light','behavior']);}
});
