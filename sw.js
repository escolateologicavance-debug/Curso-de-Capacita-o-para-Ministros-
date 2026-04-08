const CACHE_NAME = "gabinete-classe-a-v1";

// Arquivos essenciais do app
const ASSETS = [
  "/",
  "/index.html",
  "/agenda-liturgica.html",
  "/esbocos-elite.html",
  "/governo-eclesiastico.html",
  "/hermeneutica-oratoria.html",
  "/mentoria-gestao.html",
  "/saude-emocional.html",
  "/manifest.json",
  "/logo-192.png",
  "/logo-512.png"
];

// INSTALAÇÃO
self.addEventListener("install", (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache criado com sucesso.");
        return cache.addAll(ASSETS);
      })
  );
});

// ATIVAÇÃO
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// FETCH (Cache First + fallback)
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {

        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((networkResponse) => {

            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
              return networkResponse;
            }

            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });

            return networkResponse;

          });
      })
      .catch(() => {
        return caches.match("/index.html");
      })
  );

});