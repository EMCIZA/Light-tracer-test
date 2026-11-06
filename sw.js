// Keeps a copy of the app so it opens with no internet.
// With internet, the app's own files always come fresh from the website (so updates show straight away);
// the saved copy is only used when there's no connection, or the connection is too slow to answer in 4 seconds.
const C="light-tracer-test-v7";
const FILES=["./","./index.html","./manifest.json","./icon-180.png","./icon-192.png","./icon-512.png",
 "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"];
self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:"reload",mode:f.startsWith("http")?"no-cors":"same-origin"})).catch(()=>{})))));
});
self.addEventListener("activate",e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k.startsWith("light-tracer-test")).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const save=(req,res)=>{ if(res&&(res.ok||res.type==="opaque")){ const copy=res.clone(); caches.open(C).then(c=>c.put(req,copy)).catch(()=>{}); } return res; };
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET") return;
  const url=new URL(req.url);
  if(url.origin!==location.origin){ // fonts and the QR reader: saved copy first, they never change
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>save(req,res))));
    return;
  }
  // the app itself: fresh from the website, saved copy if offline or slow
  e.respondWith(new Promise(resolve=>{
    let done=false; const fallback=()=>caches.match(req).then(r=>r||caches.match("./index.html"));
    const timer=setTimeout(()=>fallback().then(r=>{ if(r&&!done){ done=true; resolve(r); } }),4000);
    fetch(req,{cache:"no-cache"}).then(res=>{ save(req,res); if(!done){ done=true; clearTimeout(timer); resolve(res); } })
      .catch(()=>fallback().then(r=>{ if(!done){ done=true; clearTimeout(timer); resolve(r||Response.error()); } }));
  }));
});
