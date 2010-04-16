/*
 * This file init's all the classes, and adds the event handlers
 */

 var MusicSearcher, currentSongManager;

window.addEventListener('DOMContentLoaded', function () {
  //Hold the JSON object with current song
  var currentSongPlaying = null;

  //Some vars
  var currentTitle    = $('currentTitle');
  var currentArtist   = $('currentArtist');
  var currentAlbum    = $('currentAlbum');
  var currentAlbumArt = $('currentAlbumArt');
  var currentInfo     = $('currentInfo');
  var infoLink        = $('infoLink');
  // var currentVolume   = $('currentVolume');

  var artistLink      = $('artistLink');
  var albumLink       = $('albumLink');

  var optionsShuffle  = $('optionsShuffle');
  var optionsRepeat   = $('optionsRepeat');
  var optionsLock     = $('optionsLock');
  var optionsList     = $('optionsList');
  var optionsLoading  = $('optionsLoading');

  var searchDiv       = getChildren($('searchResults'));
  var searchLoading   = getChildren(searchDiv[0])[1]; //the loading image
  var searchList      = searchDiv[1]; //the ul for the search list

  function getLoadingImage(){
    var img = document.createElement('img');
    img.src = 'images/loading.gif';
    return img;
  }

  var loadingImage = getLoadingImage();

/*  //The volume slider
  var knob = $('knob');
  var handle = $('handle');*/

  //Init the song manager
  currentSongManager = {

    baseUrl: 'json/getcurrent.html',

    initialize: function () {
      //The request instance
      this.xhr = new Request({
        method: "get",
        onSuccess: this.onSuccess,
        onFailure: function () {
          alert('Error getting xhr request');
        }
      });
    },

    //Get the url
    update: function (data) {
      this.xhr.get(data ? this.baseUrl + data : this.baseUrl);

      //Show loading, hide results
      optionsLoading.style.display = "";
      optionsList.style.display = "none";

      //Empty all li's
      $each([
        currentTitle,
        currentArtist,
        currentAlbum,
        currentInfo,
        //currentVolume,

        optionsShuffle,
        optionsRepeat,
        optionsLock
      ], function (el) {
        empty(el);
        el.appendChild(getLoadingImage());
      });
    },

    onSuccess: function (responseText) {
      var responseJSON = json_parse(responseText);

      for(var prop in responseJSON) {
        responseJSON[prop] = URLDecode(responseJSON[prop]);
      }

      //back the current song up, so it can be used again
      currentSongPlaying = responseJSON;

      currentTitle.innerHTML = responseJSON.title;
      currentArtist.innerHTML = responseJSON.artist;
      currentAlbum.innerHTML = responseJSON.album;

      currentAlbumArt.style.backgroundImage = 'url(\''+ responseJSON.albumart + '\')';


      //mySlider.set(responseJSON.volume);

      currentInfo.innerHTML =
        responseJSON.length + ", " +
        responseJSON.bitrate + "kbps, " +
        responseJSON.samplerate + "kHz " +
        responseJSON.channels;

      optionsShuffle.innerHTML = responseJSON.shuffle;
      optionsRepeat.innerHTML = responseJSON.repeat;
      optionsLock.innerHTML = responseJSON.lock;

      optionsLoading.style.display = 'none';
      optionsList.style.display = '';
    }
  };

  currentSongManager.initialize();

  //When the play controls are clicked, get the html page and update the current song
  $each($('playControls').getElementsByTagName('a'), function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      currentSongManager.update(el.getAttribute('href'));
    });
  });



  MusicSearcher = {

    baseUrl: 'json/getsearchresults.html?',

    //The url for the searches by query
    urlSearchByQuery: 'query=',

    //The url for searches by keyword
    urlSearchByKey:   'search_ml=',

    initialize: function () {

      //The request instance
      this.xhr = new Request({
        onSuccess: function (responseText) {
          var responseJSON = json_parse(responseText);
          this.onSearchComplete(responseJSON);
        }.bind(this),
        onFailure: function () {
          alert('Error getting xhr request');
        }
      });
    },

    update: function (data) {
      this.xhr.get(data ? this.baseUrl + data : this.baseUrl);
    },

    //Query the media library with ajax request and fire the event
    searchByQuery: function (query) {
      this.onSearchStart(query);
      if (!query) {
        return false;
      }
      this.update(this.urlSearchByQuery + query);
      return true;
    },

    //Search in the media library for this key
    searchByKey: function (key) {
      this.onSearchStart('Search for: ' + key);
      if (!key) {
        return false;
      }
      this.update(this.urlSearchByKey + key);
      return true;
    },

    onSearchStart: function (query) {
      //Show the loading...
      searchLoading.style.display = "";
      searchList.style.display = "hidden";

      //Set the title
      $('searchQuery').innerHTML = '"'+query+'"';
    },

    checkJSON: function(json) {
      if($type(json) !== 'array') {
        return false;
      }

      function convertObject(el) {
        for(var prop in el) {
          el[prop] = URLDecode(el[prop]);
        }
        return el;
      }

      var result = [];

      json.each(function(el){
        var obj = convertObject(el);
        if(obj) {
          result.push(el);
        }
      });

      return result.length === 0 ? false : result;
    },

    //When the search request is complete
    onSearchComplete: function (responseJSON) {

      empty(searchList);

      responseJSON = this.checkJSON(responseJSON);

      //When the response has no songs in it
      if (!responseJSON) {
        //Maybe the responseText has some info ?
        var errorItem = document.createElement('li');
        errorItem.innerHTML = 'No Results: ';
        searchList.appendChild(errorItem);
      } else {

        //Sort per artist
        var artists = {};
        responseJSON.each(function (item) {
          if(artists[item.artist]) {
            artists[item.artist].push(item);
          } else {
            artists[item.artist] = [item];
          }
        });

        /* Make list items like this
        <li class="title">Music</li>

        <li>
          <a href="">
            <span class="name">One Love</span>
            <span class="arrow"></span>
          </a>
        </li>

        */
        for(var artist in artists) {
          songs = artists[artist];

          /*
          * Make list items like this
          * <li class="title">Music</li>
          */

          var title = document.createElement('li');
          title.className = 'title';
          title.innerHTML = artist;
          searchList.appendChild(title);

          songs.each(function(item) {
            var link = document.createElement('a');
            link.href='#home';
            link.addEventListener('click', function(e){
              currentSongManager.update('?file='+item.filename);
            });

            var spanName = document.createElement('span');
            spanName.className = 'name';
            spanName.innerHTML = item.title;
            link.appendChild(spanName);

            var arrow = document.createElement('span');
            arrow.className = 'arrow';
            link.appendChild(arrow);

            var listItem = document.createElement('li');
            listItem.appendChild(link);

            searchList.appendChild(listItem);
          });
        }

        searchLoading.style.display = 'none';
        searchList.style.display = '';
      }
    }
  };

  MusicSearcher.initialize();

  //Add listener for album searching
  currentAlbum.parentNode.addEventListener('click',function () {
    MusicSearcher.searchByQuery('ALBUM HAS "'+currentSongPlaying.album+'"');
  });
  $('albumLink').addEventListener('click',function () {
    MusicSearcher.searchByQuery('ARTIST HAS "'+currentSongPlaying.artist+'"');
  });

  //Add listener for artist searching
  $('artistLink').addEventListener('click',function () {
    MusicSearcher.searchByQuery('ARTIST HAS "'+currentSongPlaying.artist+'"');
  });

  //Listener for clicking at the info link
  infoLink.addEventListener('click',function () {
    currentSongManager.update();
  });

  //Add listener for search by query
  $('searchByQuery').addEventListener('submit',function (e) {
    //query valid?
    if (!MusicSearcher.searchByQuery(this.getElementsByTagName('input')[0].value.trim()))
      MusicSearcher.fireEvent('searchComplete', [{}, "Empty Query"]);
  });

  //Add listener for search by keyword
  $('searchByKey').addEventListener('submit',function (e) {
    log('Catch!', this);

    //query valid?
    if (!MusicSearcher.searchByKey($('searchInput').value.trim()))
      MusicSearcher.fireEvent('searchComplete', [{}, "No Key Specified"]);
  });

  //When user clicks the link to options, we do a quick request of the variables
  $('getOptions').addEventListener('click', function () {
    currentSongManager.update();
  });

  //Listener for options
  $each($('optionsList').getElementsByTagName('a'), function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      currentSongManager.update(el.getAttribute('href'));
    });
  });

  $each($('advancedOptions').getElementsByTagName('a'), function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      if(confirm('Are you sure you want to do that?')){
        currentSongManager.update(el.getAttribute('href'));
      }
    });
  });

  //UpDATE!!!
  currentSongManager.update();

}, false);

//End of file!