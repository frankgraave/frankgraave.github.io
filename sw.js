self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/inbox.html',
        '/styles.css',
        '/images/android-desktop.png',
        '/images/dog.png',
        '/images/favicon.png',
        '/images/ios-desktop.png',
        '/images/user.jpg',
        '/images/space.jpg',
      ])
      .then(() => self.skipWaiting());
    })
  )
});

self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
