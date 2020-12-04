//console.log("Hello from service worker!")

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// install
self.addEventListener("install", function (evt) {
  // pre cache all static assets
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  // tell the browser to activate this service worker immediately once it
  // has finished installing
  self.skipWaiting();
});

//activate
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", function(evt) {
  console.log(evt)
    console.log('fetch reached')
  if (evt.request.url.includes("/api/transaction/bulk") || evt.request.url.includes("/api/transaction")) {
      console.log('if statement reaced')
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
          
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            console.log('cache response')
            console.log(evt.request.url)
            console.log(response)
              //cache.add(evt.request.url, response.clone());
            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }else{
    console.log('else statement')
  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
}
});
