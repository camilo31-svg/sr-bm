const CACHE_NAME = "sr-bm-static-v2.3";
const OFFLINE_PAGE = "./index.html";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=2.3",
  "./icons.js?v=2.3",
  "./data.js?v=2.3",
  "./audio-map.js?v=2.3",
  "./app.js?v=2.3",
  "./audio-player.js?v=2.3",
  "./manifest.webmanifest?v=2.3",
  "./sr-bm-icon.svg",
  "./sr-bm-icon-180.png",
  "./sr-bm-icon-192.png",
  "./sr-bm-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_PAGE)));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
