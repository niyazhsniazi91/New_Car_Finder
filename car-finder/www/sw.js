const CACHE = "car-finder-shell-mwwhbs85";
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./cars.json",
  "./cardekho-specs.json",
  "./manifest.webmanifest",
  "./icon.svg",
  "./vendor/pdf.js",
  "./vendor/pdf.worker.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cachedResponse = () => caches.match(event.request, { ignoreSearch: true });
    if (!self.navigator.onLine) {
      const cached = await cachedResponse();
      if (cached) return cached;
      throw new Error("This resource is not available in the offline cache.");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    try {
      const response = await fetch(event.request, { signal: controller.signal });
      if (response.ok) {
        const copy = response.clone();
        await caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    } catch (error) {
      const cached = await cachedResponse();
      if (cached) return cached;
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  })());
});
