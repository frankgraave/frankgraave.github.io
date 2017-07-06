(function() {
  'use strict';
  //
  // // Check to make sure service workers are supported in the current browser,
  // // and that the current page is accessed from a secure origin. Using a
  // // service worker from an insecure origin will trigger JS console errors. See
  // // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  // var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
  //     // [::1] is the IPv6 localhost address.
  //     window.location.hostname === '[::1]' ||
  //     // 127.0.0.1/8 is considered localhost for IPv4.
  //     window.location.hostname.match(
  //       /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  //     )
  //   );
  //
  // if ('serviceWorker' in navigator &&
  //     (window.location.protocol === 'https:' || isLocalhost)) {
  //       console.log('Registering ServiceWorker...');
  //   navigator.serviceWorker.register('sw.js')
  //   .then(function(registration) {
  //     // updatefound is fired if service-worker.js changes.
  //     registration.onupdatefound = function() {
  //       // updatefound is also fired the very first time the SW is installed,
  //       // and there's no need to prompt for a reload at that point.
  //       // So check here to see if the page is already controlled,
  //       // i.e. whether there's an existing service worker.
  //       if (navigator.serviceWorker.controller) {
  //         // The updatefound event implies that registration.installing is set:
  //         // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
  //         var installingWorker = registration.installing;
  //
  //         installingWorker.onstatechange = function() {
  //           switch (installingWorker.state) {
  //             case 'installed':
  //               // At this point, the old content will have been purged and the
  //               // fresh content will have been added to the cache.
  //               // It's the perfect time to display a "New content is
  //               // available; please refresh." message in the page's interface.
  //               break;
  //
  //             case 'redundant':
  //               throw new Error('The installing ' +
  //                               'service worker became redundant.');
  //
  //             default:
  //               // Ignore
  //           }
  //         };
  //       }
  //     };
  //   }).catch(function(e) {
  //     console.error('Error during service worker registration:', e);
  //   });
  // }

  if ('serviceWorker' in navigator) {

    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then(function(registration) {
        console.log("[ServiceWorker] Registered");
      })
      .catch(function(err) {
        console.log("Service Worker Failed to Register", err);
      })

  }

  // Hide stuff by default
  $('#p2').hide();

  // Prepare vars
  var apiKey = 'e2012b7c792f469aa8222e1a2a9b0531';
  var apiUrl = 'https://api.giphy.com/v1/gifs/search?q=';

  // Prepare constructors
  var src = $('<img>');

  function beast(){
    console.log('test');
  };

  $('.mdl-button').click(function(e) {
    e.preventDefault();

    // Take this actual value upon clicking the button
    var resultsLimit = $('#sliderValue').val();
    var randomNr = Math.floor(Math.random() * resultsLimit + 1);
    // Clear the previous searched gif
    $('#img-container').empty();
    // Show the loader until the data arrives
    $('#p2').show();
    var xhr = $.ajax(
      apiUrl + $('.search-query').val() + '&api_key=' + apiKey + '&limit=' + resultsLimit
    );
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    // Some error handling
    window.addEventListener('error', function (e) {
      var error = e.error;
      $('.error').html('Someting went wrong with the request, or you haven\'t filled out any search term.');
      console.log(error);
    });
    xhr.done(function(data) {
      caches.open('v1').then(function(cache) {
        fetch(apiUrl + $('.search-query').val() + '&api_key=' + apiKey + '&limit=' + resultsLimit).then(function(response) {
          // /get-article-urls returns a JSON-encoded array of
          // resource URLs that a given article depends on
          console.log(response.url);
          return response;
        }).then(function(response) {
          console.log('Caching...', data.data[randomNr-1].images.original.url);
          cache.addAll([data.data[randomNr-1].images.original.url, response.url]);
          console.log('Caching Successfully Done');
        });
      });
      $('.error').html('');
      $('#p2').fadeOut();
      // console.log('Successfully got data: ', data);
      // console.log(data.data[randomNr].slug);
      var img = $('<img />').attr({
          'id': 'gif',
          'class': '.mdl-shadow--2dp',
          'src': data.data[randomNr-1].images.original.url,
          // 'alt': data.data[randomNr++].slug,
          // 'title': data.data[randomNr++].slug,
        }).appendTo('#img-container, #img-container-history');
      });
  });

})();
