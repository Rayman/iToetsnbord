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

			//set the albumart to the loading image
			$('currentAlbumArt').setProperty('src', 'images/loading.gif');
		},
		onUpdate: function(responseJSON){

			//Backup the reponse
			currentSongPlaying = responseJSON;

			//Set the title of the div
			var title = $('currentTitle').set('html', "Title: " + responseJSON.title);

			//Set the current artist
			$('currentArtist').set('html', "Artist: " + responseJSON.artist);

			//Set the album, if there is no album, hide it
			if(responseJSON.album=='')
			{
				//Hide the album li
				$('currentAlbum').getParent().setStyle('display', 'none');
			}
			else
			{
				var album = $('currentAlbum').set('html', "Album: " + responseJSON.album);
				album.getParent().setStyle('display', 'block');
			}

			//Set the 'info'
			$('currentInfo').set(
				'html',
				"Info: " +
				responseJSON.length + ", " +
				responseJSON.bitrate + "kbps, " +
				responseJSON.samplerate + "kHz " +
				responseJSON.channels
			);

			//If the albumart is not found, hide the ul, else display it
			var albumArt = $('currentAlbumArt').setProperty('src', responseJSON.albumart);
			albumArt.getParent().setStyle('display', responseJSON.albumart == 'images/question.png' ? 'none' : 'block');

			//hide the loading...
			$('currentLoading').setStyle('display', 'none');

			//Unhide the ul with all the info
			title.getParent().setStyle('display', 'block');
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

	//Helper function, it formats a song to a html element
	//It creates a li element with inside it a anchor
	//When the anchor is clicked, it shows two options
	//	Play
	//	Enqueue
	var formatSearchResult = function(song){
		var link = new Element('a',{
			'href': 'javascript:void(0)',
			'html': song.title,
			'events':{
				'click': function(){
					//If it has two li items, dont create them plx
					if(this.getElements('li').length==2)
						return;

					//Create the 'Play' link
					new Element('a',{
						'href': '#current',
						'html': 'Play',
						'events':{
							'click': function(){
								currentSongManager.update('?file='+song.filename);
							}
						}
					}).inject(
						new Element('li').inject(this) //this refers to 'ul > li > a'
					);

					//Create the 'Enqueue' link
					new Element('a',{
						'href': 'javascript:void(0)',
						'html': 'Enqueue',
						'events':{
							'click': function(e){
								e.stopPropagation();
								currentSongManager.update('?add='+song.filename+'&playaddedifnotplaying');
								this.getParent().getParent().getElements('li').dispose();
							}
						}
					}).inject(
						new Element('li').inject(this) //this refers to 'ul > li > a'
					);
				}
			}
		});
		var listItem = new Element('li');
		link.inject(listItem);
		return listItem;
	};

	//Init the searcher
	searcher = new MusicSearcher({
		//The url for the searches by query
		getSearchResultsUrl: 'json/getsearchresults.html?query=',
		//The url for searches by keyword
		getSearchByKeyUrl:   'json/getsearchresults.html?search_ml=',

		onSearchStart: function(query){
			//Empty the old search
			$('searchList').empty();

			//Set the title
			$('searchQuery').set('html','"'+query+'"');

			// Make a loading image inside a list
			// ul > li > img
			new Element('img',{
				src: 'images/loading.gif',
				width: '24'
			})
			.inject(new Element('li')
				.inject('searchList')
			);
		},

		//When the search request is complete
		onSearchComplete: function(responseJSON, responseText){

			//Empty the list (it has a spinner)
			$('searchList').empty();

			//When the response has no songs in it
			if(responseJSON==null||responseJSON.length==null||responseJSON.length==0)
			{
				//Maybe the responseText has some info ?
				new Element('li',{
					html: 'No Results: ' + responseText
				}).inject('searchList');
				return;
			}

			//When clicked on this link, it loads 30 more items in the list
			//After that, it moves itself to the end of the list
			//It as the todo-items in the element's storage space (el.store(key,value))
			new Element('a',{
				'href': 'javascript:void(0)',
				'html': 'Load more...',
				'events':{
					'click': function(){
						//Get the todo Items
						var todo = this.retrieve('todoItems');
						//Inject the first 30
						todo.splice(0,30).each(function(item){
							formatSearchResult(item).inject('searchList');
						});

						//Remove the link
						var removedElement = this.getParent().dispose();
						if(todo.length>0)
						{
							//And inject it back in
							removedElement.inject('searchList');
							//Store the todo items in the element's space :p
							this.store('todoItems',todo);
						}
					}
				}
			})
			.inject(new Element('li').inject('searchList'))
			.store('todoItems',responseJSON) //All items are todo items
			.fireEvent('click'); //Load the first 30 NOW!
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
});

//End of file!