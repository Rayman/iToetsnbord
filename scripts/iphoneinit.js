/*
 * This file init's all the classes, and adds the event handlers
 */

 /*global $: false, $$: false, window: false, Element: false, iPhoneSlider: false, SongManager: false */

"use strict";

window.addEventListener('load', function () {
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

  var searchList      = $('searchList');

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
      var responseJSON = JSON.parse(responseText);

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

  /*

  //The filename for the song that's about to be played
  var fileName = '';

  //play/enqueue link
  var playLink = new Element('ul');
  new Element('li').grab(
    new Element('a',{
      html: 'Play',
      href: '#home',
      events:{
        click: function () {
          currentSongManager.update('?file='+fileName);

          //Dirty hack for removing the playlink from the DOM
          (function () {
            playLink.dispose();
          }).delay(1);
        }
      }
    })
  ).inject(playLink);

  new Element('li').grab(
    new Element('a',{
      html: 'Enqueue',
      href: 'javascript:void(0)',
      events:{
        click: function () {
          currentSongManager.update('?add='+fileName+'&playaddedifnotplaying');

          //Dirty hack for removing the playlink from the DOM
          (function () {
            playLink.dispose();
          }).delay(1);
        }
      }
    })
  ).inject(playLink);

  //Init the searcher
  searcher = new MusicSearcher({
    //The baseurl for the request
    baseUrl: 'json/getsearchresults.html?',

    //The url for the searches by query
    urlSearchByQuery: 'query=',

    //The url for searches by keyword
    urlSearchByKey:   'search_ml=',

    onSearchStart: function (query) {
      //Empty the old search
      searchList.empty();

      //Set the title
      $('searchQuery').set('html','"'+query+'"');

      // Make a loading image inside a list
      // ul > li > img
      new Element('img',{
        src: 'images/loading.gif'
      })
      .inject(new Element('li')
        .inject(searchList)
      );
    },

    //When the search request is complete
    onSearchComplete: function (responseJSON, responseText) {
      searchList.empty();

      //When the response has no songs in it
      if (!responseJSON || !responseJSON.length) {
        //Maybe the responseText has some info ?
        new Element('li',{
          html: 'No Results: ' + responseText
        }).inject(searchList);
        return;
      }
      responseJSON.each(function (item) {
        new Element('a',{
          html: item.title,
          events:{
            click: function () {
              fileName = item.filename;
              playLink.inject(this);
            }
          }
        }).inject(
          new Element('li').inject(searchList)
        );
      });
    }
  });

  //Add listener for album searching
  currentAlbum.addEvent('click',function () {
    searcher.searchByQuery('ALBUM HAS "'+currentSongPlaying.album+'"');
  });

  //Add listener for artist searching
  currentArtist.addEvent('click',function () {
    searcher.searchByQuery('ARTIST HAS "'+currentSongPlaying.artist+'"');
  });

  */

  //Listener for clicking at the info link
  infoLink.addEventListener('click',function () {
    currentSongManager.update();
  });

  /*

  //Add listener for search form submit
  $('searchBySong').addEvent('submit',function (e) {
    //Get the artist and song value
    var artist = this.getElement('input[name=artist]').value.trim();
    var song   = this.getElement('input[name=song]').value.trim();

    //Format the query
    artist = artist == '' ? '' : 'ARTIST HAS "' + artist +'"';
    song   = song   == '' ? '' : 'TITLE HAS  "' + song   +'"';
    query = (song != '' && artist != '') ? song + ' && ' + artist : song + artist;

    //Query valid?
    if (!searcher.searchByQuery(query))
      searcher.fireEvent('searchComplete', [{}, "Empty Query"]);
  });

  //Add listener for search by query
  $('searchByQuery').addEvent('submit',function (e) {
    //query valid?
    if (!searcher.searchByQuery(this.getElement('input[name=query]').value.trim()))
      searcher.fireEvent('searchComplete', [{}, "Empty Query"]);
  });

  //Add listener for search by keyword
  $('searchByKeyword').addEvent('submit',function (e) {
    //query valid?
    if (!searcher.searchByKey(this.getElement('input[name=key]').value.trim()))
      searcher.fireEvent('searchComplete', [{}, "No Key Specified"]);
  });

  */

  //When user clicks the link to options, we do a quick request of the variables
  $('getOptions').addEventListener('click', function () {
    currentSongManager.update();
  });

  //Listener for options
  $each($('options').getElementsByTagName('a'), function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      currentSongManager.update(el.getAttribute('href'));
    });
  });

  //UpDATE!!!
  currentSongManager.update();

}, false);

//End of file!