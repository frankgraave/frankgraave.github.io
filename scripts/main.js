(function() {
  'use strict';

  // Register the ServiceWorker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then(function(registration) {
        console.log("[MAIN] - SW Registered");
      })
      .catch(function(err) {
        console.log("[MAIN] - Service Worker Failed to Register", err);
      })
  }

  // Cache versioning
  var CACHE_VERSION = 1;
  var CURRENT_CACHE = {
    prefetch: 'fetch-cache-v' + CACHE_VERSION
  };

  // Hide stuff by default
  $('#p2').hide();

  // Prepare vars
  var apiKey = 'e2012b7c792f469aa8222e1a2a9b0531';
  var apiUrl = 'https://api.giphy.com/v1/gifs/search?q=';

  // Prepare constructors
  var src = $('<img>');

  $('.mdl-button').click(function(e) {
    // Disabled for now since it will request images that aren't there.
    // var resultsLimit = $('#sliderValue').val();
    // var randomNr = Math.floor(Math.random() * resultsLimit + 1);

    // Clear the previous searched gif in the container
    $('#img-container').empty();

    // Show the loader until the data arrives
    $('#p2').show();

    // Do the XHR request
    var xhr = $.ajax(
      apiUrl + $('.search-query').val() + '&api_key=' + apiKey + '&limit=0'
    );

    // Set headers
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

    // Some error handling
    window.addEventListener('error', function (e) {
      var error = e.error;
      $('.error').html('Someting went wrong with the request, or you haven\'t filled out any search term.');
      console.log('[MAIN] - ', error);
    });
    xhr.fail(function(){
      $('#p2').fadeOut();
      $('.error').html('Sorry, the server returned an error upon your request. Please try again!');
    })

    // We've got the data
    xhr.done(function(data) {
      // Hide stuff
      $('.error').html('');
      $('#p2').fadeOut();

      // Open the cache because we need to store the data from the XHR request
      caches.open(CURRENT_CACHE).then(function(cache) {
        fetch(apiUrl + $('.search-query').val() + '&api_key=' + apiKey + '&limit=0').then(function(response) {
          return response;
        }).then(function(response) {
          console.log('[MAIN] - New data is cached');
          cache.addAll([data.data[0].images.original.url, response.url]);
        });
      });

      // console.log('Successfully got data: ', data);
      // console.log(data.data[randomNr].slug);
      var img = $('<img />').attr({
          'id': 'gif',
          'class': '.mdl-shadow--2dp',
          'src': data.data[0].images.original.url,
        }).appendTo('#img-container');
      });
  });

})();
