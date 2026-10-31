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
export const WORLD=Object.freeze({cols:72,rows:48,tile:32,viewWidth:768,viewHeight:448});
export const SITES=Object.freeze([
 {x:12,y:10,name:'Hollow Oak',region:'Fernwood',species:'mossbun'},
 {x:24,y:16,name:'Sunpetal Clearing',region:'Fernwood',species:'sunsprig'},
 {x:7,y:18,name:'Fern Hollow',region:'Fernwood',species:'mossbun'},
 {x:59,y:10,name:'Moonstone Circle',region:'Moonlit Grove',species:'mooncap'},
 {x:61,y:17,name:'Lantern Thicket',region:'Moonlit Grove',species:'embermoth'},
 {x:49,y:18,name:'Quiet Glade',region:'Moonlit Grove',species:'mooncap'},
 {x:12,y:36,name:'Reedwater Bridge',region:'Dewdrop Marsh',species:'dewfin'},
 {x:24,y:36,name:'Lantern Reeds',region:'Dewdrop Marsh',species:'glimslug'},
 {x:9,y:27,name:'Dewdrop Banks',region:'Dewdrop Marsh',species:'dewfin'},
 {x:59,y:36,name:'Cloudwatch Lookout',region:'Pebble Ridge',species:'cloudlet'},
 {x:49,y:30,name:'Copper Arch',region:'Pebble Ridge',species:'pebblepuff'},
 {x:66,y:28,name:'Whistling Stones',region:'Pebble Ridge',species:'cloudlet'}
]);
export function validEncounter(s){return s&&typeof s==='object'&&!Array.isArray(s)&&Object.keys(s).length===1&&Number.isInteger(s.encounter)&&s.encounter>=0&&s.encounter<CRITTERS.length;}
export function newGame(){return {phase:'title',x:36,y:25,steps:0,screen:'world',encounter:null,collection:{},scans:0,searches:0,notice:'Four regions, winding trails, and a world of little discoveries.'};}
export function startGame(s){if(s.phase==='title')s.phase='playing';}
const between=(v,a,b)=>v>=a&&v<=b;
function lake(x,y){return ((x-11)/7)**2+((y-35)/5)**2<=1||((x-25)/5)**2+((y-41)/3)**2<=1||((x-48)/5)**2+((y-8)/3)**2<=1;}
function trail(x,y){return between(x,35,36)||between(y,23,24)
 ||y===11&&between(x,12,59)||x===12&&between(y,11,36)||x===59&&between(y,11,36)
 ||y===36&&between(x,12,59)||y===17&&between(x,24,36)||x===24&&between(y,17,24)
 ||y===18&&between(x,36,61)||x===61&&between(y,18,24)||y===31&&between(x,36,49)||x===49&&between(y,24,36);}
export function terrain(x,y){
 if(!Number.isInteger(x)||!Number.isInteger(y)||x<1||x>=WORLD.cols-1||y<1||y>=WORLD.rows-1)return 'trees';
 if(between(x,33,39)&&between(y,19,21))return 'station';
 if(trail(x,y))return lake(x,y)?'bridge':'path';
 if(lake(x,y))return 'water';
 if([[4,8,4,8],[19,22,7,10],[27,29,16,20],[43,45,14,17],[62,67,3,6],[55,57,17,19]].some(([a,b,c,d])=>between(x,a,b)&&between(y,c,d)))return 'trees';
 if([[51,54,32,34],[63,66,40,42],[43,45,39,41]].some(([a,b,c,d])=>between(x,a,b)&&between(y,c,d)))return 'rock';
 return x>=36&&y>=24?'stone':'grass';
}
export function walkable(x,y){return !['trees','water','station','rock'].includes(terrain(x,y));}
export function zone(x,y){return between(x,33,39)&&between(y,22,26)?'Field Station':x<36?(y<24?'Fernwood':'Dewdrop Marsh'):(y<24?'Moonlit Grove':'Pebble Ridge');}
export function cameraFor(s,width=WORLD.viewWidth,height=WORLD.viewHeight){
 return {x:Math.round(Math.max(0,Math.min(s.x*WORLD.tile+WORLD.tile/2-width/2,WORLD.cols*WORLD.tile-width))),y:Math.round(Math.max(0,Math.min(s.y*WORLD.tile+WORLD.tile/2-height/2,WORLD.rows*WORLD.tile-height)))};
}
export function mapPosition(s,width=144,height=96){return {x:(s.x+.5)/WORLD.cols*width,y:(s.y+.5)/WORLD.rows*height};}
export function nearestSite(s,distance=3){return SITES.map(site=>({...site,distance:Math.abs(site.x-s.x)+Math.abs(site.y-s.y)})).filter(site=>site.distance<=distance).sort((a,b)=>a.distance-b.distance)[0]||null;}
export function move(s,dx,dy){
 if(!['playing','complete'].includes(s.phase)||s.screen!=='world'||!Number.isInteger(dx)||!Number.isInteger(dy)||Math.abs(dx)+Math.abs(dy)!==1)return false;
 const x=s.x+dx,y=s.y+dy;
 if(!walkable(x,y)){s.notice=terrain(x,y)==='water'?'Deep water. Follow the boardwalk or look for a bridge.':terrain(x,y)==='station'?'The field station is closed. The trails outside are open!':'That way is blocked. Follow a trail around it.';return false;}
 s.x=x;s.y=y;s.steps++;const site=nearestSite(s);
 s.notice=site?`${site.name} · A sparkle nearby! Press A to search.`:`${zone(x,y)} · Follow the trails and watch the minimap.`;return true;
}
export function search(s){
 if(!['playing','complete'].includes(s.phase)||s.screen!=='world')return false;
 const site=nearestSite(s),region=zone(s.x,s.y);
 if(region==='Field Station'&&!site){s.notice='Follow a trail away from the station. Search beside a sparkle to meet a local critter.';return false;}
 const local=CRITTERS.map((c,i)=>({c,i})).filter(({c})=>c.zone===region);
 if(!local.length)return false;
 const featured=site&&local.find(({c})=>c.id===site.species);
 const unseen=local.filter(({c})=>!s.collection[c.id]);
 const pool=featured?[featured]:unseen.length?unseen:local;
 const candidate=pool[s.searches%pool.length];s.searches++;s.encounter=candidate.i;s.screen='encounter';s.notice=`A curious rustle at ${site?.name||region}… Observe the clues, then scan!`;return true;
}
export function logDiscovery(s,response){
 if(!['playing','complete'].includes(s.phase)||s.screen!=='encounter')return false;
 const answer=response?.answers?.find(a=>a.name==='species'&&a.type==='choice');
 const critter=CRITTERS.find(c=>c.id===answer?.choice);if(!critter)return false;
 const fresh=!s.collection[critter.id];s.collection[critter.id]={id:critter.id,response:structuredClone(response)};s.scans++;s.screen='world';s.encounter=null;s.notice=fresh?`${critter.name} added to your field guide!`:`${critter.name} is already in your field guide.`;
 if(Object.keys(s.collection).length===CRITTERS.length)s.phase='complete';return {fresh,critter};
}
export function leaveEncounter(s){if(s.screen==='encounter'){s.screen='world';s.encounter=null;s.notice='Back on the trail. Your field guide stays with you.';}}
