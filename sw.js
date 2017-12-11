var cacheName = "cache-v0.2beta"; //TODO: Automatic refresh

var files = [
  'index.html',
  'main.html',
  'login.html',
  'css/styles.css',
  'css/material.min.css',
  'js/main.js',
  'js/material.min.js',
  'js/functions.js',
  'js/login.js',
  'js/serviceWorkerRegister.js',
  'images/icon_round.png',
  'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js',
  'https://unpkg.com/dialog-polyfill@latest/dialog-polyfill.js',
  'https://fonts.googleapis.com/css?family=Roboto:regular,bold,italic,thin,light,bolditalic,black,medium&amp;lang=en',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://unpkg.com/dialog-polyfill@latest/dialog-polyfill.css',
  'https://code.jquery.com/jquery-3.2.1.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery-dateFormat/1.0/jquery.dateFormat.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.1.4/js.cookie.min.js'
];

self.addEventListener('install', (event) => {
  console.info('Event: Install');

  event.waitUntil(
    caches.open(cacheName)
    .then((cache) => {
      return cache.addAll(files)
      .then(() => {
        console.info('All files are cached');
        return self.skipWaiting();
      })
      .catch((error) =>  {
        console.error('Failed to cache', error);
      })
    })
  );
});

self.addEventListener('fetch', (event) => {
  var request = event.request;

  event.respondWith(
    caches.match(request).then((response) => {
      if (response && (location.hostname != '127.0.0.1' && location.hostname != 'localhost')) {
        return response;
      }

      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
    .then(function () {
      console.info("Old caches are cleared!");
      return self.clients.claim();
    })
  );
});
