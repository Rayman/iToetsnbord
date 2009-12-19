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
	var optionsList 	= optionsShuffle.getParent('ul');
	var optionsLoading  = $('optionsLoading');

	var loadingImage = new Element('img',{
		src: 'images/loading.gif'
	});

	//Init the song manager
	currentSongManager = new SongManager({
		baseUrl: 'json/getcurrent.html',
		onUpdateStart: function(){

			//Show loading, hide results
			optionsLoading.show();
			optionsList.hide();

			//Empty all li's
			$$(currentTitle,
				currentArtist,
				currentAlbum,
				currentInfo,

				optionsShuffle,
				optionsRepeat,
				optionsLock
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

			optionsShuffle .set('html',responseJSON.shuffle);
			optionsRepeat  .set('html',responseJSON.repeat);
			optionsLock	   .set('html',responseJSON.lock);

			optionsLoading.hide();
			optionsList.show();
		}
	});

	//When the play controls are clicked, get the html page and update the current song
	$('playControls').getElements('a').each(function(el){
			el.addEvent('click', function(event){
			event.preventDefault();
			currentSongManager.update(el.get('href'));
		});
	});

	//The filename for the song that's about to be played
	var fileName = '';

	//play/enqueue link
	var playLink = new Element('ul');
	new Element('li').grab(
		new Element('a',{
			'html': 'Play',
			'href': '#home',
			'events':{
				'click': function(){
					currentSongManager.update('?file='+fileName);

					//Dirty hack for removing the playlink from the DOM
					(function(){
						playLink.dispose();
					}).delay(1);
				}
			}
		})
	).inject(playLink);

	new Element('li').grab(
		new Element('a',{
			'html': 'Enqueue',
			'href': 'javascript:void(0)',
			'events':{
				'click': function(){
					currentSongManager.update('?add='+fileName+'&playaddedifnotplaying');

					//Dirty hack for removing the playlink from the DOM
					(function(){
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

		onSearchStart: function(query){
			//Empty the old search
			var searchList = $('searchList').empty();

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
		onSearchComplete: function(responseJSON, responseText){
			var searchList = $('searchList').empty();

			//When the response has no songs in it
			if(!responseJSON || !responseJSON.length)
			{
				//Maybe the responseText has some info ?
				new Element('li',{
					html: 'No Results: ' + responseText
				}).inject('searchList');
				return;
			}
			responseJSON.each(function(item){
				new Element('a',{
					'html': item.title,
					'events':{
						'click': function(){
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
	currentAlbum.addEvent('click',function(){
		searcher.searchByQuery('ALBUM HAS "'+currentSongPlaying.album+'"');
	});

	//Add listener for artist searching
	currentArtist.addEvent('click',function(){
		searcher.searchByQuery('ARTIST HAS "'+currentSongPlaying.artist+'"');
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
		if(!searcher.searchByQuery(query))
			searcher.fireEvent('searchComplete', [{}, "Empty Query"]);
	});

	//Add listener for search by query
	$('searchByQuery').addEvent('submit',function(e){
		//query valid?
		if(!searcher.searchByQuery(this.getElement('input[name=query]').value.trim()))
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