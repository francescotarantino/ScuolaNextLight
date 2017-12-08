if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: "./" })
  .then(function(registration) {
    console.info('Service worker is registered!');
    checkForPageUpdate(registration);
  })
  .catch(function(error) {
    console.error('Service worker failed ', error);
  });
}

function checkForPageUpdate(registration) {
  registration.addEventListener("updatefound", function() {
    if (navigator.serviceWorker.controller) {
      var installingSW = registration.installing;
      installingSW.onstatechange = function() {
        console.info("Service Worker State :", installingSW.state);
        switch(installingSW.state) {
          case 'installed':
            var notification = $('.mdl-js-snackbar')[0];
            notification.MaterialSnackbar.showSnackbar({
              message: 'Aggiornamento completato.',
              timeout: 10000,
              actionHandler: function (event) {
                window.location.reload();
              },
              actionText: 'Ricarica'
            });
            break;
          case 'redundant':
            throw new Error('The installing service worker became redundant.');
        }
      }
    }
  });
}
