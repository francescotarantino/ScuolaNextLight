self.addEventListener('fetch', (event) => {

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response && (location.hostname != '127.0.0.1' && location.hostname != 'localhost')) {
        return response;
      }
      
      return fetch(event.request);
    })
  );
});
