// PWA Previsao de Fechamento - service worker v3 (mes 2026-11).
// index: pede a rede revalidando (ETag); se passar de 2,5 s e houver copia guardada, abre a copia e termina a atualizacao em segundo plano.
// Sem copia guardada, espera a rede (1a visita). Icones e manifest: cache primeiro. status.json e meses.json: sempre rede (a pagina cuida do prazo).
const V='pfc-2026-11-s3',PRAZO=2500;
const ARQ=['./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon-32.png'];
const prazo=ms=>new Promise(r=>setTimeout(()=>r(null),ms));
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ARQ)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('pfc-')&&(k.startsWith('pfc-2026-11-')?k!==V:!/^pfc-\d{4}-\d{2}-/.test(k))).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
async function abrir(e){
 const c=await caches.open(V);const guardada=await c.match(e.request);
 /* os cabecalhos chegam logo; o prazo vale ate o corpo inteiro chegar (por isso le o corpo antes de responder) */
 const rede=fetch(e.request,{cache:'no-cache'}).then(async n=>{if(!n||!n.ok)return n;const b=await n.blob();const h=new Headers(n.headers);h.delete('content-encoding');h.delete('content-length');
  const nova=()=>new Response(b,{status:n.status,statusText:n.statusText,headers:h});e.waitUntil(c.put(e.request,nova()));return nova();});
 e.waitUntil(rede.catch(()=>{}));
 if(!guardada)return rede;
 const r=await Promise.race([rede.catch(()=>null),prazo(PRAZO)]);
 return r&&r.ok?r:guardada;
}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
 if(e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html')){e.respondWith(abrir(e));return;}
 if(ARQ.some(a=>u.pathname.endsWith(a.slice(1)))){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n&&n.ok){const k=n.clone();caches.open(V).then(c=>c.put(e.request,k));}return n;})));}});
