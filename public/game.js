// All creatures, sprites, clues, and field notes are original to this game.
export const CRITTERS=[
 {id:'mossbun',name:'Mossbun',zone:'Fernwood',color:'#91b06a',glows:false,curiosity:2,clues:{habitat:'A fern-filled woodland',body:'A round moss-green body with two leaf ears',light:'No visible glow',behavior:'Hops directly toward the scanner and taps it with a leaf'},note:'It collects tiny twigs, then forgets why. A new friend is always more interesting.',sprite:['...gg...gg...','..gggg.gggg..','..gGGggGGg...','...GGGGG....','..GGGGGGG...','.GGGGGGGGG..','.GGKGGGKGG..','.GGGGnGGGG..','..GGGGGGG...','...gg.gg....','..gg...gg...']},
 {id:'glimslug',name:'Glimslug',zone:'Dewdrop Marsh',color:'#a99ac7',glows:true,curiosity:0,clues:{habitat:'A misty marsh beside a pond',body:'A lavender slug with a spiral shell and two little antennae',light:'Its antennae emit a soft violet glow',behavior:'Retreats into its shell when the scanner approaches'},note:'Its tiny lanterns light the way home. It prefers introductions from a respectful distance.',sprite:['..L.....L...','..l.....l...','...pppp.....','..pPPPPp....','.pPppPPPPp..','.pPPpPPPPp..','.pPPppPPPp..','..pPPPPPp...','.PPPPPPPPP..','PPKPPKPPPPP.','.PPPPPPPPP..','..pppppppp..']},
 {id:'pebblepuff',name:'Pebblepuff',zone:'Pebble Ridge',color:'#c99c77',glows:false,curiosity:1,clues:{habitat:'A dry ridge covered in smooth stones',body:'A sandy round stone creature with a tuft of copper fuzz',light:'No visible glow',behavior:'Stays put and watches the scanner from a distance'},note:'A patient little rock with an unexpectedly fluffy haircut. It takes excellent naps.',sprite:['....rrr.....','...rrrrr....','..rRRRRRr...','.rRRRRRRRr..','rRRRRRRRRRr.','rRRKRRKRRRr.','rRRRRnRRRRr.','.rRRRRRRRr..','..rrrrrrr...','..rr...rr...']},
 {id:'sunsprig',name:'Sunsprig',zone:'Fernwood',color:'#e4c36c',glows:false,curiosity:2,clues:{habitat:'A sunny clearing near the woodland',body:'A small golden plant with five broad petals and a green stem',light:'The petals reflect sunlight but do not emit light',behavior:'Leans forward to poke the scanner with a petal'},note:'It turns to face anyone who says hello. Sunlight is nice, but attention is even nicer.',sprite:['....yyy.....','..yyyYyyy...','..yYYYYYy...','.yYYYYYYYy..','yyYKYYKYYyy.','.yYYYYYYYy..','..yyyYyyy...','....gGg.....','..gggGggg...','...ggGgg....','....ggg.....','...gg.gg....']},
 {id:'dewfin',name:'Dewfin',zone:'Dewdrop Marsh',color:'#83b3bc',glows:false,curiosity:1,clues:{habitat:'A pond among reeds',body:'A floating turquoise droplet with leaf-shaped fins',light:'No visible glow',behavior:'Circles quietly without getting closer or fleeing'},note:'A drop of pond water that decided to see the world. It never lets its fins get dry.',sprite:['.....bb.....','....bBBb....','...bBBBBb...','..bBBBBBBb..','.bBBBBBBBBb.','bbBBKBBKBBbb','bBBBBBBBBBBb','.bBBBBBBBBb.','..bBBBBBBb..','...bbbbbb...','....b..b....']},
 {id:'embermoth',name:'Embermoth',zone:'Moonlit Grove',color:'#dc9171',glows:true,curiosity:2,clues:{habitat:'A shaded grove at dusk',body:'A tiny moth with wide coral wings and a charcoal body',light:'The edges of its wings emit a warm orange glow',behavior:'Flutters directly onto the scanner handle'},note:'It carries the warm glow of sunset wherever it goes. A terrible guest at a surprise party.',sprite:['.LL......LL.','lRRl....lRRl','lRRRl..lRRRl','.lRRRlKRrrl.','..lRRKKRrl..','...rrKKrr...','..lRRKKRRl..','.lRRr..rRRl.','..lll..lll..','....k..k....']},
 {id:'cloudlet',name:'Cloudlet',zone:'Pebble Ridge',color:'#dedfcf',glows:false,curiosity:0,clues:{habitat:'A breezy high ridge',body:'A fluffy off-white puff with dangling blue feet',light:'No visible glow',behavior:'Drifts behind a rock to hide as soon as it notices the scanner'},note:'Technically a cloud. Emotionally a very small pillow. It is still practising being brave.',sprite:['....www.....','..wwwWwww...','.wWWWWWWWw..','wWWWWWWWWWw.','wWWKWWWKWWw.','wWWWWnWWWWw.','.wWWWWWWWw..','..wwwwwww...','...b...b....','..bb...bb...']},
 {id:'mooncap',name:'Mooncap',zone:'Moonlit Grove',color:'#b5a2c4',glows:true,curiosity:1,clues:{habitat:'A quiet shaded grove',body:'A violet mushroom cap over a little cream body',light:'Small spots on its cap emit a pale blue glow',behavior:'Watches calmly from its patch of moss without approaching'},note:'Nobody knows what it dreams about. The softly glowing spots suggest something wonderful.',sprite:['....pppp....','...pPPPpp...','..pPPLPPPp..','.pPLPPPLPPp.','pPPPPPPPPPPp','.pppppppppp.','....wWw.....','...wWWWw....','...wKWKw....','...wWnWw....','....www.....','...ww.ww....']}
];
export const WORLD={cols:24,rows:14,tile:32};
export function validEncounter(s){return s&&typeof s==='object'&&!Array.isArray(s)&&Object.keys(s).length===1&&Number.isInteger(s.encounter)&&s.encounter>=0&&s.encounter<CRITTERS.length;}
export function newGame(){return {phase:'title',x:12,y:8,steps:0,screen:'world',encounter:null,collection:{},scans:0,searches:0,notice:'A whole little world is waiting.'};}
export function startGame(s){if(s.phase==='title')s.phase='playing';}
export function terrain(x,y){
 if(x<1||x>22||y<2||y>12)return 'trees';
 if(x>=2&&x<=6&&y>=8&&y<=11)return 'water';
 if(y===7||x===11||x===12)return 'path';
 if(x>=17&&y>=9)return 'stone';
 return 'grass';
}
export function zone(x,y){return x<12?(y<7?'Fernwood':'Dewdrop Marsh'):(y<7?'Moonlit Grove':'Pebble Ridge');}
export function move(s,dx,dy){
 if(s.phase!=='playing'||s.screen!=='world'||Math.abs(dx)+Math.abs(dy)!==1)return false;
 const x=s.x+dx,y=s.y+dy;
 if(['trees','water'].includes(terrain(x,y))){s.notice=terrain(x,y)==='water'?'The pond is for fins. Try the grass nearby.':'The trees are too thick. Find a clearing.';return false;}
 s.x=x;s.y=y;s.steps++;s.notice=`${zone(x,y)} · Search the grass for a new friend.`;return true;
}
export function search(s){
 if(s.phase!=='playing'||s.screen!=='world')return false;
 const local=CRITTERS.map((c,i)=>({c,i})).filter(({c})=>c.zone===zone(s.x,s.y)&&!s.collection[c.id]);
 const unseen=CRITTERS.map((c,i)=>({c,i})).filter(({c})=>!s.collection[c.id]);
 const pool=local.length?local:unseen.length?unseen:CRITTERS.map((c,i)=>({c,i}));
 // First two scans come from your local region, then discoveries rotate globally.
 const candidate=pool[s.searches%pool.length];s.searches++;s.encounter=candidate.i;s.screen='encounter';s.notice='A curious rustle… Observe the clues, then scan!';return true;
}
export function logDiscovery(s,response){
 if(s.phase!=='playing'||s.screen!=='encounter')return false;
 const answer=response?.answers?.find(a=>a.name==='species'&&a.type==='choice');
 const critter=CRITTERS.find(c=>c.id===answer?.choice);
 if(!critter)return false;
 const fresh=!s.collection[critter.id];s.collection[critter.id]={id:critter.id,response:structuredClone(response)};s.scans++;s.screen='world';s.encounter=null;s.notice=fresh?`${critter.name} added to your field guide!`:`${critter.name} is already in your field guide.`;
 if(Object.keys(s.collection).length===CRITTERS.length)s.phase='complete';
 return {fresh,critter};
}
export function leaveEncounter(s){if(s.screen==='encounter'){s.screen='world';s.encounter=null;s.notice='You leave a little space. There are more critters to discover.';}}
