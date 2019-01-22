let CACHE_NAME = 'v1';

let urlstocache = [
  '/',
  'index.html',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css',
  'https://cdn.jsdelivr.net/npm/pouchdb@6.3.4/dist/pouchdb.min.js',
  'https://cdn.jsdelivr.net/npm/pouchdb@6.3.4/dist/pouchdb.find.min.js',
  'shoppinglist.css',
  'shoppinglist.js',
  'shoppinglist.model.js'
];

let fromnetwork = function(request, cache) {
  return fetch(request).then(function(response) {
    if (reuest.url.indexOf('https://fonts.gstatic.com') === 0) {
      //cache fonts
      if (response.status < 400) {
        cache.put(request, response.clone());
      }
    }
    return response;
  });
};

//install/cache page assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('cache opened');
      return cache.addAll(urlstocache);
    })
  );
});

//intercept page requests
self.addEventListener('activate', function(event) {
  console.log('worker activated');
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) {
            //filter old versioned keys
            return key !== CACHE_NAME;
          })
          .map(function(key) {
            return caches.delete(key);
          })
      );
    })
  );
});

// service worker activated, remove outdated cache
self.addEventListener('activate', function(event) {
  console.log('worker activated');
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) {
            //filter old versioned keys
            return key !== CACHE_NAME;
          })
          .map(function(key) {
            return caches.delete(key);
          })
      );
    })
  );
});