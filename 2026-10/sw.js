// network-first para index/status (pega a emissao nova na mesma abertura); cache-first para icones; versao = run_id
const V='pfc-20261026_191403_eb7106';const FILES=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);const nf=u.pathname.endsWith('/')||u.pathname.endsWith('index.html')||u.pathname.endsWith('status.json');
 if(nf){e.respondWith(fetch(e.request,{cache:'no-store'}).then(n=>{if(n&&n.ok&&!u.pathname.endsWith('status.json')){caches.open(V).then(c=>c.put(e.request,n.clone()));}return n;}).catch(()=>caches.match(e.request)));}
 else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n&&n.ok){caches.open(V).then(c=>c.put(e.request,n.clone()));}return n;})));}});
