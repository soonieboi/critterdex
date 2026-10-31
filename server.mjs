import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {getDecision} from './lib/decisions.mjs';
import {validEncounter} from './public/game.js';
const files={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/game.js':['game.js','text/javascript'],'/pixel.js':['pixel.js','text/javascript'],'/style.css':['style.css','text/css'],'/favicon.svg':['favicon.svg','image/svg+xml']};
export function createApp({mode='demo',key='',fetchImpl=fetch}={}){
 let busy=false,requests=[];
 return http.createServer(async(req,res)=>{
  const host=req.headers.host;
  if(!host||!/^127\.0\.0\.1:\d+$/.test(host)){res.writeHead(403).end();return;}
  const origin=`http://${host}`;
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"};
  const json=(status,data)=>{res.writeHead(status,{...headers,'Content-Type':'application/json'});res.end(JSON.stringify(data));};
  try{
   if(req.method==='GET'&&req.url==='/api/config'){json(200,{mode,ready:mode!=='live'||Boolean(key)});return;}
   if(req.method==='POST'&&req.url==='/api/decision'){
    if(req.headers.origin!==origin){json(403,{error:'Open this game from its local preview URL.'});return;}
    if(!req.headers['content-type']?.startsWith('application/json')){json(415,{error:'Expected JSON'});return;}
    let body='';
    for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>2048){json(413,{error:'Request too large'});return;}}
    let state;try{state=JSON.parse(body);}catch{json(400,{error:'Invalid JSON'});return;}
    if(!validEncounter(state)){json(400,{error:'Invalid game state'});return;}
    requests=requests.filter(t=>Date.now()-t<60000);
    if(busy||requests.length>=20){json(429,{error:'The scanner needs a moment. Try again shortly.'});return;}
    requests.push(Date.now());busy=true;
    try{json(200,await getDecision(state,{mode,key,fetchImpl}));}catch(err){const msg=/^OpenAI returned HTTP \d+/.test(err.message)||err.message.startsWith('Live mode needs')?err.message:'The scanner could not provide a valid answer. Try again, or restart the server in demo mode.';json(502,{error:msg});}finally{busy=false;}
    return;
   }
   if(req.method==='GET'&&files[req.url]){const [name,type]=files[req.url];res.writeHead(200,{...headers,'Content-Type':type});res.end(await readFile(new URL(`public/${name}`,import.meta.url)));return;}
   json(404,{error:'Not found'});
  }catch{if(!res.headersSent)json(500,{error:'Something went wrong. Please try again.'});else res.end();}
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const mode=process.env.DECISIONS_MODE||'demo';
 if(!['demo','live'].includes(mode))throw new Error('DECISIONS_MODE must be demo or live');
 const port=Number(process.env.PORT||4317);
 const server=createApp({mode,key:process.env.OPENAI_API_KEY||''});
 server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is busy. Choose another PORT; existing processes were left running.`:'Unable to start local server.');process.exitCode=1;});
 server.listen(port,'127.0.0.1',()=>console.log(`CritterDex · ${mode} · http://127.0.0.1:${server.address().port}`));
}
