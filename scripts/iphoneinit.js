/*
 * This file init's all the classes, and adds the event handlers
 */

//Hold the JSON object with current song
var currentSongPlaying = null;

window.addEvent('domready', function() {

	//Init the song manager
	currentSongManager = new SongManager({
		getCurrentSongUrl: 'json/getcurrent.html',
		onUpdateStart: function(){
			//Hide all
			$('currentTitle').getParent().setStyle('display', 'none');
			//Unhide the loading
			$('currentLoading').setStyle('display', 'block');
		},
		onUpdate: function(responseJSON){
			//Back it up
			currentSongPlaying = responseJSON;

			//Unhide the ul
			$('currentTitle').getParent().setStyle('display', 'block');

			//Update the html

			$('currentArtist').set('html', "Artist: " + responseJSON.artist);
			$('currentTitle').set('html', "Title: " + responseJSON.title);

			if(responseJSON.album=='')
			{
				//Hide the album li
				$('currentAlbum').getParent().setStyle('display', 'none');
			}
			else
			{
				$('currentAlbum').set('html', "Album: " + responseJSON.album);
				$('currentAlbum').getParent().setStyle('display', 'block');
			}

			$('currentInfo').set(
				'html',
				"Info: " +
				responseJSON.length + ", " +
				responseJSON.bitrate + "kbps, " +
				responseJSON.samplerate + "kHz " +
				responseJSON.channels
			);
			if(responseJSON.albumart == 'images/question.png')
				$('currentAlbumArt').getParent().setStyle('display', 'none');
			else
				$('currentAlbumArt').getParent().setStyle('display', 'block');
			$('currentAlbumArt').setProperty('src', responseJSON.albumart);

			//hide the loading...
			$('currentLoading').setStyle('display', 'none');
		},
	});

	//When user clicks the link to currentSong, we do a quick request of the current song
	$('getCurrent').addEvent('click', function(){
		currentSongManager.update();
	});

	//When the play controls are clicked, get the html page and update the current song
	$('playControls').getElements('a').each(function(el){
		el.addEvent('click', function(event){
			event.preventDefault();
			currentSongManager.update(el.get('href'));
		});
	});

	//Add listener for refreshing the current song
	$('currentInfo').addEvent('click',function(){
		currentSongManager.update('?refresh');
	});

	//Init the searcher
	searcher = new MusicSearcher({
		//The url for the searches
		getSearchResultsUrl: 'json/getsearchresults.html?query=',
		getSearchByKeyUrl:   'json/getsearchresults.html?search_ml=',

		onSearchStart: function(query){
			$('searchQuery').set('html',query);
			new Element('img',{
				src: 'images/loading.gif',
				width: '24'
			})
			.inject(new Element('li')
				.inject('searchList')
			);
		},

		//When the request is complete
		onSearchComplete: function(responseJSON, responseText){
			//Empty the list (it has a spinner)
			$('searchList').empty();

			if(responseJSON==null||responseJSON.length==null||responseJSON.length==0)
			{
				new Element('li',{
					html: 'No Results: ' + responseText
				}).inject('searchList');
				return;
			}

			//Get a reference to this (searcher)
			var searcherRef = this;

			//When clicked on this link, it loads 30 more items in the list
			//After that, it moved itself to the end of the list
			new Element('a',{
				'href': 'javascript:void(0)',
				'html': 'Load more...',
				'events':{
					'click': function(){
						//Get the todo Items
						var todo = this.retrieve('todoItems');
						//Inject the first 20
						todo.splice(0,30).each(function(item){
							searcherRef.formatSearchResult(item).inject('searchList');
						});

						//Remove the link
						var removedElement = this.getParent().dispose();
						if(todo.length>0)
						{
							//And inject it back in
							removedElement.inject('searchList');
							this.store('todoItems',todo);
						}
					}
				}
			})
			.inject(new Element('li').inject('searchList'))
			.store('todoItems',responseJSON)
			.fireEvent('click');
		}
	});

	//Add listener for album searching
	$('currentAlbum').addEvent('click',function(){
		searcher.search('ALBUM HAS "'+currentSongPlaying.album+'"');
	});

	//Add listener for artist searching
	$('currentArtist').addEvent('click',function(){
		searcher.search('ARTIST HAS "'+currentSongPlaying.artist+'"');
	});

	//Add listener for search form submit
	$('searchForm').addEvent('submit',function(e){
		var artist = this.getElement('input[name=artist]').value.trim();
		var song   = this.getElement('input[name=song]').value.trim();
		artist = artist == '' ? '' : 'ARTIST HAS "' + artist +'"';
		song   = song   == '' ? '' : 'TITLE HAS  "' + song   +'"';
		query = (song != '' && artist != '') ? song + ' && ' + artist : song + artist;

		//Query valid?
		if(!searcher.search(query))
			searcher.fireEvent('searchComplete', [{}, "Empty Query"]);
	});

	//Add listener for search by query
	$('searchByQuery').addEvent('submit',function(e){
		if(!searcher.search(this.getElement('input[name=query]').value.trim()))
			searcher.fireEvent('searchComplete', [{}, "Empty Query"]);
	});

	//Add listener for search by keyword
	$('searchByKeyword').addEvent('submit',function(e){
		if(!searcher.searchByKey(this.getElement('input[name=key]').value.trim()))
			searcher.fireEvent('searchComplete', [{}, "No Key Specified"]);
	});
});

//End of file!