self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("fetch", e => {
});
const CACHE_NAME = "tenkihub-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install",e=>{
e.waitUntil(
caches.open(CACHE_NAME).then(cache=>{
return cache.addAll(ASSETS);
})
);
});

self.addEventListener("fetch",e=>{
e.respondWith(
caches.match(e.request).then(res=>{
return res || fetch(e.request);
})
);
});