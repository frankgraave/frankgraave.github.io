// // Set a name for the current cache
// var cacheName = 'v1';
//
// // Default files to always cache
// var cacheFiles = [
// 	'./',
// 	'./?#',
//   'index.html',
// 	'styles/material-indigo-pink-min.css',
//   'styles/main.css',
//   // 'scripts/main.js',
//   'scripts/main.min.js',
// 	'scripts/material.min.js',
// 	'scripts/jquery-3.2.1.min.js',
//   'images/touch/apple-touch-icon.png',
//   'images/touch/chrome-touch-icon-192x192.png',
//   'images/touch/icon-128x128.png',
//   'images/touch/ms-touch-icon-144x144-precomposed.png',
//   'images/hamburger.svg',
// ];
//
// self.addEventListener('install', function(event) {
//   console.log('[ServiceWorker] Installed');
//   // event.waitUntil Delays the event until the Promise is resolved
//   event.waitUntil(
//   	// Open the cache
//     caches.open(cacheName).then(function(cache) {
//     // Add all the default files to the cache
// 		console.log('[ServiceWorker] Caching cacheFiles', cacheFiles);
// 		return cache.addAll(cacheFiles);
//     })
// 	); // end event.waitUntil
// 	console.log('[ServiceWorker] Done Caching Files');
// });
//
//
// self.addEventListener('activate', function(event) {
// 	self.clients.claim();
//     console.log('[ServiceWorker] Activated');
//     event.waitUntil(
//   	// Get all the cache keys (cacheName)
// 		caches.keys().then(function(cacheNames) {
// 			return Promise.all(cacheNames.map(function(thisCacheName) {
// 				// If a cached item is saved under a previous cacheName
// 				if (thisCacheName !== cacheName) {
// 					// Delete that cached file
// 					console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
// 					return caches.delete(thisCacheName);
// 				}
// 			}));
// 		})
// 	); // end event.waitUntil
// });
//
// self.addEventListener('fetch', function(event) {
// 	console.log('[ServiceWorker] Fetching', event.request.url);
// 	// event.respondWidth Responds to the fetch event
// 	event.respondWith(
// 		// Check in cache for the request being made
// 		caches.match(event.request).then(function(response) {
// 			// If the request is in the cache
// 			if ( response ) {
// 				// console.log("[ServiceWorker] Request found in Cache", event.request.url, response);
// 				// Return the cached version
// 				return response;
// 			}
// 			// If the request is NOT in the cache, fetch and cache
// 			var requestClone = event.request.clone();
// 			fetch(requestClone).then(function(response) {
// 					if ( !response ) {
// 						console.log("[ServiceWorker] No response from fetch")
// 						return response;
// 					}
// 					var responseClone = response.clone();
// 					//  Open the cache
// 					console.log('[ServiceWorker] Opening the cache...');
// 					caches.open(cacheName).then(function(cache) {
// 						// Put the fetched response in the cache
// 						cache.put(event.request, responseClone);
// 						console.log('[ServiceWorker] New Data Cached', event.request.url);
// 						// Return the response
// 						return response;
// 	        }); // end caches.open
// 				}).catch(function(err) {
// 					console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
// 				});
// 			}) // end caches.match(event.request)
// 	); // end event.respondWith
// });


var CACHE_VERSION = 1;
var CURRENT_CACHE = {
  prefetch: 'prefetch-cache-v' + CACHE_VERSION
};

self.addEventListener('install', function(event) {
  var now = Date.now();

  var urlsToPrefetch = [
		'./',
	  'index.html',
		'styles/material-indigo-pink-min.css',
	  'styles/main.css',
	  'scripts/main.js',
	  'scripts/main.min.js',
		'scripts/material.min.js',
		'scripts/jquery-3.2.1.min.js',
	  'images/touch/apple-touch-icon.png',
	  'images/touch/chrome-touch-icon-192x192.png',
	  'images/touch/icon-128x128.png',
	  'images/touch/ms-touch-icon-144x144-precomposed.png',
	  'images/hamburger.svg',
  ];

  console.log('[SW] - Handling install event. Resources to prefetch:', urlsToPrefetch);

  event.waitUntil(
    caches.open(CURRENT_CACHE.prefetch).then(function(cache) {
      var cachePromises = urlsToPrefetch.map(function(urlToPrefetch) {
        // This constructs a new URL object using the service worker's script location as the base
        // for relative URLs.
        var url = new URL(urlToPrefetch, location.href);
        // IMPORTANT: Append a cache-bust=TIMESTAMP URL parameter to each URL's query string.
        // This is particularly important when precaching resources that are later used in the
        // fetch handler as responses directly, without consulting the network (i.e. cache-first).
        url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;

        var request = new Request(url, {mode: 'no-cors'});
        return fetch(request).then(function(response) {
          if (response.status >= 400) {
            throw new Error('[SW] - Request for ' + urlToPrefetch +
              ' failed with status ' + response.statusText);
          }

          // Use the original URL without the cache-busting parameter as the key for cache.put().
          return cache.put(urlToPrefetch, response);
        }).catch(function(error) {
          console.error('[SW] - Not caching ' + urlToPrefetch + ' due to ' + error);
        });
      });

      return Promise.all(cachePromises).then(function() {
        console.log('[SW] - Pre-fetching complete.');
      });
    }).catch(function(error) {
      console.error('[SW] - Pre-fetching failed:', error);
    })
  );
});

self.addEventListener('activate', function(event) {
  // Delete all caches that aren't named in CURRENT_CACHE.
  var expectedCacheNames = Object.keys(CURRENT_CACHE).map(function(key) {
    return CURRENT_CACHE[key];
  });

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it.
            console.log('[SW] - Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('[SW] - Handling fetch event for', event.request.url);

  event.respondWith(
    // caches.match() will look for a cache entry in all of the caches available to the service worker.
    // It's an alternative to first opening a specific named cache and then matching on that.
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('[SW] - Found response in cache:', response);

        return response;
      }

      console.log('[SW] - No response found in cache. About to fetch from network...');

      // event.request will always have the proper mode set ('cors, 'no-cors', etc.) so we don't
      // have to hardcode 'no-cors' like we do when fetch()ing in the install handler.
      return fetch(event.request).then(function(response) {
        console.log('[SW] - Response from network is:', response);

        return response;
      }).catch(function(error) {
        // This catch() will handle exceptions thrown from the fetch() operation.
        // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
        // It will return a normal response object that has the appropriate error code set.
        console.error('[SW] - Fetching failed:', error);

        throw error;
      });
    })
  );
});
