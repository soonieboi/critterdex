import {CRITTERS,terrain,WORLD,SITES,zone,cameraFor,mapPosition} from './game.js';
const PALETTE={g:'#608749',G:'#93b65f',K:'#34483e',n:'#d88b7c',L:'#faf0b1',l:'#d5c4e1',p:'#806a9c',P:'#ac94c1',r:'#98754f',R:'#c5a078',y:'#b69743',Y:'#e9c970',b:'#527f8a',B:'#8bbbc0',w:'#a7b49b',W:'#e2e6ca',k:'#494952'};
export function drawSprite(ctx,c,x,y,scale=4,silhouette=false){
 ctx.imageSmoothingEnabled=false;
 c.sprite.forEach((row,dy)=>[...row].forEach((pixel,dx)=>{if(pixel==='.')return;ctx.fillStyle=silhouette?'#7d9371':PALETTE[pixel]||'#334d3a';ctx.fillRect(Math.round(x+dx*scale),Math.round(y+dy*scale),scale,scale);}));
}
export function drawThumbnail(canvas,c,locked=false){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,128,128);ctx.fillStyle=locked?'#dedfcd':'#d8e2b6';ctx.fillRect(0,0,128,128);ctx.fillStyle='#9da97d33';ctx.fillRect(22,103,88,7);drawSprite(ctx,c,16,14,8,locked);}
const BIOMES={
 'Fernwood':{ground:'#adc88a',tree:0,ink:'#4d6f47',water:'#84a9a0'},
 'Moonlit Grove':{ground:'#b3b5c6',tree:1,ink:'#66667e',water:'#8d9caf'},
 'Dewdrop Marsh':{ground:'#a3c6ac',tree:2,ink:'#4f7e70',water:'#78a5a3'},
 'Pebble Ridge':{ground:'#cfbf98',tree:3,ink:'#8b7958',water:'#8ca7a3'},
 'Field Station':{ground:'#c4ce9e',tree:0,ink:'#687d50',water:'#84a9a0'}
};
function tileColor(x,y){const tile=terrain(x,y),b=BIOMES[zone(x,y)];return tile==='water'?b.water:tile==='trees'?['#66884f','#7c8096','#608e7d','#a19a75'][b.tree]:tile==='rock'?'#a7997f':tile==='path'||tile==='bridge'?'#e0d1a1':tile==='station'?'#b0795d':b.ground;}
export function drawWorldOverview(canvas,s){
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const width=canvas.width,height=canvas.height,sx=width/WORLD.cols,sy=height/WORLD.rows;
 let base=canvas.terrainCache;
 if(!base||base.width!==width||base.height!==height){base=document.createElement('canvas');base.width=width;base.height=height;const map=base.getContext('2d');for(let y=0;y<WORLD.rows;y++)for(let x=0;x<WORLD.cols;x++){map.fillStyle=tileColor(x,y);map.fillRect(x*sx,y*sy,Math.ceil(sx),Math.ceil(sy));}canvas.terrainCache=base;}
 ctx.drawImage(base,0,0);
 for(const site of SITES){ctx.fillStyle=s.collection[site.species]?'#496c43':'#fff0af';ctx.fillRect((site.x+.5)*sx-2,(site.y+.5)*sy-2,4,4);}
 const c=cameraFor(s);ctx.strokeStyle='#fff8d5';ctx.lineWidth=1;ctx.strokeRect(c.x/(WORLD.cols*32)*width,c.y/(WORLD.rows*32)*height,WORLD.viewWidth/(WORLD.cols*32)*width,WORLD.viewHeight/(WORLD.rows*32)*height);
 const p=mapPosition(s,width,height);ctx.fillStyle='#3c4b43';ctx.fillRect(Math.round(p.x)-3,Math.round(p.y)-3,7,7);ctx.fillStyle='#ec926f';ctx.fillRect(Math.round(p.x)-2,Math.round(p.y)-2,5,5);
 return p;
}
export function makeRenderer(canvas){
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
 const text=(s,x,y,size=12,c='#486342',align='left')=>{ctx.font=`900 ${size}px monospace`;ctx.fillStyle=c;ctx.textAlign=align;ctx.fillText(s,Math.round(x),Math.round(y));};
 function tree(x,y,variant=0){const green=['#65874e','#73788f','#5d8d79','#95916d'][variant];rect(x+12,y+27,9,13,'#8b7951');rect(x+4,y+14,26,16,'#466e45');rect(x,y+8,32,17,green);rect(x+5,y,23,19,['#7c9d5e','#9296a9','#7ba78f','#b0aa80'][variant]);rect(x+10,y-5,13,13,['#93af70','#a9adc0','#96bc9e','#c9c19b'][variant]);rect(x+6,y+19,5,5,'#a1b67944');}
 function grass(x,y,variant=0){rect(x+3,y+15,3,6,'#7d9c5d');rect(x+6,y+18,3,7,'#6d8d51');rect(x+10,y+13,3,9,'#8aa963');if(variant){rect(x+23,y+7,4,4,'#d5d49a');rect(x+24,y+11,2,7,'#779b59');}}
 function explorer(x,y){rect(x-10,y+17,22,6,'#51664044');rect(x-7,y+9,6,10,'#4c6157');rect(x+3,y+9,6,10,'#4c6157');rect(x-9,y-3,20,15,'#e2b36c');rect(x-12,y-1,5,12,'#bf8656');rect(x+10,y-2,5,13,'#bf8656');rect(x-7,y-18,18,16,'#ecc795');rect(x-12,y-23,28,10,'#bd6f54');rect(x-6,y-29,18,10,'#d29368');rect(x-8,y-14,19,4,'#7d6a4d');rect(x+3,y-8,3,3,'#435447');rect(x-10,y,8,10,'#9e6c51');}
 function sign(x,y,label){rect(x+34,y+25,6,20,'#927e53');rect(x,y,76,29,'#7a7951');rect(x+3,y+3,70,23,'#e2d89d');text(label,x+38,y+18,9,'#73774f','center');}
 return function draw(s,time=0,reduced=false){
  const t=reduced?0:time;
  if(s.screen==='encounter'){
   const c=CRITTERS[s.encounter],biome=BIOMES[c.zone],dusk=c.zone==='Moonlit Grove';
   rect(0,0,768,448,biome.ground);
   for(let i=0;i<12;i++){tree(i*74-25,45+(i%3)*18,biome.tree);tree(i*74+10,13+(i%2)*12,biome.tree);}
   rect(0,135,768,313,biome.ground);
   for(let i=0;i<120;i++)grass((i*97)%768,150+(i*43)%298,i%9===0);
   for(let i=0;i<6;i++){tree(-25+i*155,350+(i%2)*50,biome.tree);}
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
  const camera=cameraFor(s);canvas.dataset.cameraX=camera.x;canvas.dataset.cameraY=camera.y;canvas.dataset.worldX=s.x;canvas.dataset.worldY=s.y;
  const mini=mapPosition(s);canvas.dataset.minimapX=mini.x;canvas.dataset.minimapY=mini.y;
  rect(0,0,768,448,'#91a976');ctx.save();ctx.translate(-camera.x,-camera.y);
  const firstX=Math.max(0,Math.floor(camera.x/32)-1),lastX=Math.min(WORLD.cols-1,Math.ceil((camera.x+768)/32)+1);
  const firstY=Math.max(0,Math.floor(camera.y/32)-2),lastY=Math.min(WORLD.rows-1,Math.ceil((camera.y+448)/32)+1);
  for(let y=firstY;y<=lastY;y++)for(let x=firstX;x<=lastX;x++){
   const tile=terrain(x,y),px=x*32,py=y*32,b=BIOMES[zone(x,y)];rect(px,py,32,32,b.ground);
   if(tile==='path'){rect(px,py,32,32,'#ddcfa0');if((x+y)%3===0){rect(px+8,py+8,7,3,'#c2b784');rect(px+21,py+23,4,3,'#c2b784');}}
   else if(tile==='bridge'){rect(px,py,32,32,'#7da8a0');rect(px,py+2,32,28,'#9a8157');for(let i=0;i<4;i++)rect(px+2+i*8,py+4,6,24,'#d2b781');}
   else if(tile==='water'){rect(px,py,32,32,b.water);const offset=Math.floor(t*2)%2;rect(px+4+offset*5,py+12,12,2,'#c1d3bb');if((x+y)%2===0)rect(px+10,py+23,9,2,'#628f8e');if((x*3+y)%7===0){rect(px+18,py+5,11,7,'#799d73');rect(px+22,py+5,3,3,'#bed19a');}}
   else if(tile==='stone'||tile==='rock'){if(tile==='rock'){rect(px+1,py+9,30,23,'#988c76');rect(px+5,py+2,23,12,'#b4a78b');rect(px+8,py+3,16,4,'#d9c9a5');}else if((x+y)%3===0){rect(px+6,py+12,15,10,'#ac9f7d');rect(px+8,py+9,11,5,'#e0d0a7');}}
   else if(tile==='grass'&&(x*7+y*11)%4===0){grass(px,py,(x+y)%5===0);if(b.tree===1&&(x+y)%6===0){rect(px+20,py+17,7,4,'#d9c1df');rect(px+23,py+21,2,5,'#9d97ad');}if(b.tree===2&&(x+y)%5===0){rect(px+23,py+8,2,17,'#6f9777');rect(px+21,py+5,5,7,'#9b9570');}}
   else if(tile==='trees')tree(px,py,b.tree);
   // Region-specific ground details make exploration visually distinct without hiding collisions.
   if(tile==='grass'&&(x*13+y*7)%11===0){
    if(b.tree===0){rect(px+19,py+18,3,9,'#729556');rect(px+14,py+16,13,4,'#d9d994');rect(px+18,py+12,5,12,'#ece3aa');rect(px+19,py+17,3,3,'#c49c59');}
    if(b.tree===1){rect(px+17,py+18,4,9,'#d9d5bf');rect(px+12,py+12,14,9,'#9d83b1');rect(px+15,py+9,8,5,'#bda6cd');rect(px+16,py+13,3,3,'#e4dfbd');}
    if(b.tree===2){for(let i=0;i<3;i++){rect(px+10+i*6,py+8-i*2,2,19+i*2,'#648e73');rect(px+8+i*6,py+7-i*2,6,8,'#a29a71');}}
   }
   if(tile==='stone'&&(x*3+y*11)%13===0){rect(px+9,py+18,17,6,'#ae9b79');rect(px+12,py+13,10,8,'#e1d0a6');rect(px+15,py+10,5,7,'#ebe0ba');}

  }
  // The station footprint is blocked; its front door opens onto the central trail.
  const hx=33*32,hy=19*32;rect(hx,hy,224,96,'#9c7955');rect(hx+8,hy+20,208,68,'#dcca94');rect(hx-4,hy,232,23,'#a87057');rect(hx+8,hy-7,208,10,'#c38e69');rect(hx+88,hy+48,48,48,'#657e5a');rect(hx+96,hy+54,31,28,'#b9c99c');rect(hx+25,hy+37,34,29,'#86a59a');rect(hx+165,hy+37,34,29,'#86a59a');text('FIELD STATION',hx+112,hy+37,11,'#7c7051','center');
  // Connected routes have visible crossroads and named encounter landmarks.
  for(const [x,y,label] of [[30,24,'FERNWOOD ↖'],[39,24,'MOONLIT ↗'],[30,27,'DEWDROP ↙'],[39,27,'RIDGE ↘']])sign(x*32,y*32,label);
  for(const site of SITES){
   if(site.x*32<camera.x-100||site.x*32>camera.x+850||site.y*32<camera.y-100||site.y*32>camera.y+530)continue;
   const x=site.x*32+16,y=site.y*32+16,found=Boolean(s.collection[site.species]);
   rect(x-21,y+13,43,9,'#53694722');rect(x-17,y+4,35,5,found?'#9ebd7d':'#dae0a5');
   const shimmer=reduced?1:Math.floor(t*2)%2;
   rect(x-2,y-7,5,18,shimmer?'#fff3b3':'#d5dda4');rect(x-8,y-1,17,5,shimmer?'#fff3b3':'#d5dda4');
   text(found?'✓ SCANNED':'? SEARCH',x,y+32,8,BIOMES[site.region].ink,'center');
   text(site.name.toUpperCase(),x,y-43,9,BIOMES[site.region].ink,'center');
   if(site.name==='Moonstone Circle'){for(let i=0;i<6;i++){const angle=i*Math.PI/3;rect(x+Math.cos(angle)*48-5,y+Math.sin(angle)*39-5,11,13,'#9295a7');rect(x+Math.cos(angle)*48-3,y+Math.sin(angle)*39-8,7,4,'#d1d0d4');}}
   if(site.name==='Cloudwatch Lookout'){rect(x-38,y+45,76,8,'#96846a');rect(x-38,y+29,5,24,'#b39e7b');rect(x+33,y+29,5,24,'#b39e7b');}
  }
  explorer(s.x*32+16,s.y*32+16);ctx.restore();
  // The minimap uses the same world coordinates and camera as the main viewport.
  let mapCanvas=draw.minimapCanvas;if(!mapCanvas){mapCanvas=document.createElement('canvas');mapCanvas.width=144;mapCanvas.height=96;draw.minimapCanvas=mapCanvas;}drawWorldOverview(mapCanvas,s);
  rect(602,8,158,120,'#344e43');rect(605,11,152,114,'#e5e8c4');ctx.drawImage(mapCanvas,609,24);text('N ↑     WORLD MAP',681,20,8,'#536e4d','center');
  rect(8,419,278,20,'#405d47cc');text(`X ${String(s.x).padStart(2,'0')}  Y ${String(s.y).padStart(2,'0')}   M: MAP  •  A: SEARCH`,18,433,9,'#e7ecc5');
 };
}
