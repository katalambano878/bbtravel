// Self-unregistering service worker.
// A previous deployment may have registered a service worker on user devices.
// This file replaces it with a no-op SW that immediately unregisters itself
// and clears all caches. Served from /service-worker.js.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (e) {
        // ignore
      }
      try {
        await self.registration.unregister();
      } catch (e) {
        // ignore
      }
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => {
        try {
          client.navigate(client.url);
        } catch (e) {
          // ignore
        }
      });
    })()
  );
});
