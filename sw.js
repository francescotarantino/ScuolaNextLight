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
