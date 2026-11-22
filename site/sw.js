// One cache a build. The page is asked to the network first, what it loads is named by its content.
const CACHE = "strainworks-__BUILD__";
const FONTS = "strainworks-fonts";
const FILES = ["__FILES__"];
const PAGE_WAIT = 4000;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES.map((file) => new Request(file, { cache: "no-cache" })))));
});

// No skipWaiting: an open game keeps the files it was started with until it is closed.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("strainworks-") && key !== CACHE && key !== FONTS).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function page(request) {
  try {
    const fresh = await fetch(request, { signal: AbortSignal.timeout(PAGE_WAIT) });
    if (fresh.ok) return fresh;
  } catch {
    // Offline or too slow: the page of this build.
  }
  return (await (await caches.open(CACHE)).match("./index.html")) ?? fetch(request);
}

async function kept(request) {
  return (await caches.match(request, { ignoreVary: true })) ?? fetch(request);
}

async function font(request) {
  const cache = await caches.open(FONTS);
  const held = await cache.match(request, { ignoreVary: true });
  if (held) return held;
  try {
    const fresh = await fetch(request);
    if (fresh.ok || fresh.type === "opaque") await cache.put(request, fresh.clone());
    return fresh;
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") event.respondWith(font(request));
  else if (url.origin !== self.location.origin || url.pathname.endsWith("/version.json")) return;
  else if (request.mode === "navigate") event.respondWith(page(request));
  else event.respondWith(kept(request));
});
