// Caches the app on first visit so it opens with no internet afterwards.
const C="light-tracer-test-v1";
const FILES=["./","./index.html","./manifest.json","./icon-180.png","./icon-192.png","./icon-512.png",
 "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{mode:f.startsWith("http")?"no-cors":"same-origin"})).catch(()=>{}))))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k.startsWith("light-tracer-test")).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>{ if(e.request.method!=="GET") return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ const copy=res.clone(); caches.open(C).then(c=>c.put(e.request,copy)).catch(()=>{}); return res; }).catch(()=>caches.match("./index.html")))); });
