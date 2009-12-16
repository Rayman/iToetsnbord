/*
 * This file init's all the classes, and adds the event handlers
 */

//Hold the JSON object with current song
var currentSongPlaying = null;

//Public vars
var currentSongManager;
var searcher;

window.addEvent('domready', function() {
	//Some vars
	var currentTitle 	= $('currentTitle');
	var currentArtist 	= $('currentArtist');
	var artistLink 		= currentArtist.getParent();
	var currentAlbum 	= $('currentAlbum');
	var albumLink 		= currentAlbum.getParent();
	var currentAlbumArt = $('currentAlbumArt');
	var currentInfo 	= $('currentInfo');
	var infoLink 	 	= currentInfo.getParent();

	var optionsShuffle 	= $('optionsShuffle');
	var optionsRepeat 	= $('optionsRepeat');
	var optionsLock 	= $('optionsLock');

	var loadingImage = new Element('img',{
		src: 'images/loading.gif'
	});

	//Init the song manager
	currentSongManager = new SongManager({
		baseUrl: 'json/getcurrent.html',
		onUpdateStart: function(){
			$$(currentTitle,
				currentArtist,
				currentAlbum,
				currentInfo
			).each(function(el){
				el.empty();
				loadingImage.clone().inject(el);
			});
		},
		onUpdate: function(responseJSON){
			currentSongPlaying = responseJSON;

			currentTitle.set('html',responseJSON.title);
			currentArtist.set('html',responseJSON.artist);
			currentAlbum.set('html',responseJSON.album);
			var currentWidth = currentAlbumArt
				.set('width')
				.set('src',responseJSON.albumart)
				.get('width');
			if(currentWidth > 200)
				currentAlbumArt.set('width',200);

			currentInfo.set('html',
				responseJSON.length + ", " +
				responseJSON.bitrate + "kbps, " +
				responseJSON.samplerate + "kHz " +
				responseJSON.channels
			);
		}
	});

	//When the play controls are clicked, get the html page and update the current song
	$('playControls').getElements('a').each(function(el){
			el.addEvent('click', function(event){
			event.preventDefault();
			currentSongManager.update(el.get('href'));
		});
	});

	//Init the searcher
	searcher = new MusicSearcher({
		//The url for the searches by query
		getSearchResultsUrl: 'json/getsearchresults.html?query=',

		//The url for searches by keyword
		getSearchByKeyUrl:   'json/getsearchresults.html?search_ml=',

		onSearchStart: function(query){
			Log.log('query: ',query);
		},

		//When the search request is complete
		onSearchComplete: function(responseJSON, responseText){
			Log.log('Searchcomplete: ',responseJSON);
		}
	});

	//Add listener for album searching
	currentAlbum.addEvent('click',function(){
		searcher.search('ALBUM HAS "'+currentSongPlaying.album+'"');
	});

	//Add listener for artist searching
	currentArtist.addEvent('click',function(){
		searcher.search('ARTIST HAS "'+currentSongPlaying.artist+'"');
	});

	//Listener for clicking at the info link
	infoLink.addEvent('click',function(){
		currentSongManager.update();
	});

	//Add listener for search form submit
	$('searchBySong').addEvent('submit',function(e){
		//Get the artist and song value
		var artist = this.getElement('input[name=artist]').value.trim();
		var song   = this.getElement('input[name=song]').value.trim();

		//Format the query
		artist = artist == '' ? '' : 'ARTIST HAS "' + artist +'"';
		song   = song   == '' ? '' : 'TITLE HAS  "' + song   +'"';
		query = (song != '' && artist != '') ? song + ' && ' + artist : song + artist;

		//Query valid?
		if(!searcher.search(query))
			searcher.fireEvent('searchComplete', [{}, "Empty Query"]);
	});

	//Add listener for search by query
	$('searchByQuery').addEvent('submit',function(e){
		//query valid?
		if(!searcher.search(this.getElement('input[name=query]').value.trim()))
			searcher.fireEvent('searchComplete', [{}, "Empty Query"]);
	});

	//Add listener for search by keyword
	$('searchByKeyword').addEvent('submit',function(e){
		//query valid?
		if(!searcher.searchByKey(this.getElement('input[name=key]').value.trim()))
			searcher.fireEvent('searchComplete', [{}, "No Key Specified"]);
	});

	//When user clicks the link to options, we do a quick request of the variables
	$('getOptions').addEvent('click', function(){
		currentSongManager.update();
	});

	//Listener for options
	$('options').getElements('a').each(function(el){
		el.addEvent('click', function(event){
			event.preventDefault();
			currentSongManager.update(el.get('href'));
		});
	});

	//UpDATE!!!
	currentSongManager.update();
});

//End of file!