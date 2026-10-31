import {CRITTERS,terrain,WORLD} from './game.js';
const PALETTE={g:'#608749',G:'#93b65f',K:'#34483e',n:'#d88b7c',L:'#faf0b1',l:'#d5c4e1',p:'#806a9c',P:'#ac94c1',r:'#98754f',R:'#c5a078',y:'#b69743',Y:'#e9c970',b:'#527f8a',B:'#8bbbc0',w:'#a7b49b',W:'#e2e6ca',k:'#494952'};
export function drawSprite(ctx,c,x,y,scale=4,silhouette=false){
 ctx.imageSmoothingEnabled=false;
 c.sprite.forEach((row,dy)=>[...row].forEach((pixel,dx)=>{if(pixel==='.')return;ctx.fillStyle=silhouette?'#7d9371':PALETTE[pixel]||'#334d3a';ctx.fillRect(Math.round(x+dx*scale),Math.round(y+dy*scale),scale,scale);}));
}
export function drawThumbnail(canvas,c,locked=false){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,128,128);ctx.fillStyle=locked?'#dedfcd':'#d8e2b6';ctx.fillRect(0,0,128,128);ctx.fillStyle='#9da97d33';ctx.fillRect(22,103,88,7);drawSprite(ctx,c,16,14,8,locked);}
export function makeRenderer(canvas){
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
 const text=(s,x,y,size=12,c='#486342',align='left')=>{ctx.font=`900 ${size}px monospace`;ctx.fillStyle=c;ctx.textAlign=align;ctx.fillText(s,Math.round(x),Math.round(y));};
 function tree(x,y,variant=0){const green=variant?'#66765f':'#65874e';rect(x+12,y+27,9,13,'#8b7951');rect(x+4,y+14,26,16,'#466e45');rect(x,y+8,32,17,green);rect(x+5,y,23,19,variant?'#809275':'#7c9d5e');rect(x+10,y-5,13,13,variant?'#96a383':'#93af70');rect(x+6,y+19,5,5,'#a1b67944');}
 function grass(x,y,variant=0){rect(x+3,y+15,3,6,'#7d9c5d');rect(x+6,y+18,3,7,'#6d8d51');rect(x+10,y+13,3,9,'#8aa963');if(variant){rect(x+23,y+7,4,4,'#d5d49a');rect(x+24,y+11,2,7,'#779b59');}}
 function explorer(x,y){rect(x-10,y+17,22,6,'#51664044');rect(x-7,y+9,6,10,'#4c6157');rect(x+3,y+9,6,10,'#4c6157');rect(x-9,y-3,20,15,'#e2b36c');rect(x-12,y-1,5,12,'#bf8656');rect(x+10,y-2,5,13,'#bf8656');rect(x-7,y-18,18,16,'#ecc795');rect(x-12,y-23,28,10,'#bd6f54');rect(x-6,y-29,18,10,'#d29368');rect(x-8,y-14,19,4,'#7d6a4d');rect(x+3,y-8,3,3,'#435447');rect(x-10,y,8,10,'#9e6c51');}
 function sign(x,y,label){rect(x+34,y+25,6,20,'#927e53');rect(x,y,76,29,'#7a7951');rect(x+3,y+3,70,23,'#e2d89d');text(label,x+38,y+18,9,'#73774f','center');}
 return function draw(s,time=0,reduced=false){
  const t=reduced?0:time;
  if(s.screen==='encounter'){
   const c=CRITTERS[s.encounter],dusk=c.zone==='Moonlit Grove';
   rect(0,0,768,448,dusk?'#a4ad9b':'#c0d19c');
   for(let i=0;i<12;i++){tree(i*74-25,45+(i%3)*18,dusk?1:0);tree(i*74+10,13+(i%2)*12,dusk?1:0);}
   rect(0,135,768,313,dusk?'#a8b68b':'#b3ca8a');
   for(let i=0;i<120;i++)grass((i*97)%768,150+(i*43)%298,i%9===0);
   for(let i=0;i<6;i++){tree(-25+i*155,350+(i%2)*50,dusk?1:0);}
   rect(245,300,280,12,'#80966044');rect(264,291,242,9,'#80966033');
   const bob=Math.sin(t*2)*5;
   if(c.glows){rect(310,150+bob,150,145,'#eef0af22');rect(328,134+bob,115,176,'#eef0af22');}
   drawSprite(ctx,c,324,174+bob,10);
   text('WILD ENCOUNTER',384,49,13,'#4e6849','center');
   text('◈  '+c.zone.toUpperCase()+'  ◈',384,75,10,'#687b58','center');
   // Original scanner corner marks frame the encounter.
   for(const [x,y,dx,dy] of [[280,132,1,1],[490,132,-1,1],[280,325,1,-1],[490,325,-1,-1]]){rect(x,y,18*dx,3,'#5a7650');rect(x,y,3,18*dy,'#5a7650');}
   text('OBSERVE  →  SCAN  →  LOG',384,403,10,'#6c8155','center');return;
  }
  rect(0,0,768,448,'#b2c68a');
  for(let y=0;y<WORLD.rows;y++)for(let x=0;x<WORLD.cols;x++){
   const tile=terrain(x,y),px=x*32,py=y*32;
   if(tile==='path'){rect(px,py,32,32,'#d9ce95');if((x+y)%3===0){rect(px+8,py+8,7,3,'#c3bc82');rect(px+21,py+23,4,3,'#c3bc82');}}
   else if(tile==='water'){rect(px,py,32,32,'#80a8a0');rect(px,py+29,32,3,'#91b9ac');const offset=Math.floor(t*2)%2;rect(px+4+(offset*5),py+12,12,2,'#c1d3b0');if((x+y)%2===0)rect(px+10,py+21,9,2,'#6d9992');}
   else if(tile==='stone'){rect(px,py,32,32,'#b8be91');if((x+y)%3===0){rect(px+6,py+12,15,10,'#929e7d');rect(px+8,py+9,11,5,'#cbd0a4');}}
   else if(tile==='grass'){rect(px,py,32,32,x>=12&&y<7?'#a5bc89':'#b2c98a');if((x*7+y*11)%4===0)grass(px,py,(x+y)%5===0);}
   else{rect(px,py,32,32,'#809d65');tree(px,py,x>=12?1:0);}
  }
  // Original tiny field station, bridge, trail signs, flowers, camp kit.
  rect(316,16,148,80,'#8f7752');rect(323,25,135,63,'#ddd099');rect(308,8,164,19,'#a96f56');rect(316,0,148,11,'#c48b66');rect(368,48,38,48,'#657e5a');rect(375,54,23,25,'#b4c28a');rect(333,38,23,25,'#88a79a');rect(421,38,23,25,'#88a79a');text('FIELD STATION',390,39,9,'#7b7755','center');
  sign(118,148,'FERNWOOD');sign(530,145,'MOONLIT');sign(83,373,'DEWDROP');sign(565,356,'RIDGE');
  rect(154,302,103,29,'#9a8354');for(let i=0;i<7;i++)rect(156+i*14,305,11,24,'#c3aa71');
  for(const [x,y] of [[73,220],[235,160],[510,180],[655,212],[473,341],[300,360]]){rect(x+3,y+7,3,9,'#728c52');rect(x,y,9,8,'#dbc897');rect(x+3,y+2,3,4,'#ad8e5c');}
  // A few collectible-looking sparkles encourage roaming.
  const sparkle=Math.floor(t*2)%2;for(const [x,y] of [[192,190],[608,183],[294,338],[547,385]]){rect(x,y,4,4,sparkle?'#eef0b6':'#c8d79d');if(sparkle){rect(x-3,y+1,10,2,'#e3e7b1');rect(x+1,y-3,2,10,'#e3e7b1');}}
  const px=s.x*32+16,py=s.y*32+16;explorer(px,py);
  rect(277,419,216,20,'#526b48bb');text('A: SEARCH    ▤: FIELD GUIDE',385,433,9,'#e7ecc5','center');
 };
}
