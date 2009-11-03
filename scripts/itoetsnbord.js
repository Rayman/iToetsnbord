var SongManager = new Class({

	Implements: [Options,Events],

	options: {
		// onUpdateStart: $empty,
		// onUpdate: $empty,
		getCurrentSongUrl: ''
	},

	initialize: function(options) {
		//set options
		this.setOptions(options);

		//The request instance
		this.xhr = new Request.JSON({
			method: "get",
			onSuccess: function(responseJSON){
				this.fireEvent('update', responseJSON);
			}.bind(this),
			onFailure: function(){
				alert('Error getting current song');
			}
		});
	},

	//Get the current song with an ajax request and fire the update event
	update: function(data){
		this.fireEvent('onUpdateStart');
		requestUrl = this.options.getCurrentSongUrl;
		if(data)
			requestUrl += data;
		this.xhr.send({
			url: requestUrl
		});
	},
});

var MusicSearcher = new Class({

	Implements: [Options,Events],

	options: {
		//getSearchResultsUrl: '',
		// getSearchByKeyUrl: '',
		// onSearchComplete: $empty
	},

	initialize: function(options) {
		//set options
		this.setOptions(options);

		//The request instance
		this.xhr = new Request.JSON({
			method: "get",
			onSuccess: function(responseJSON, responseText){
				this.fireEvent('searchComplete', [responseJSON, responseText]);
			}.bind(this),
			onFailure: function(){
				alert('Error getting search results');
			}
		});
	},

	//Query the media library with ajax request and fire the event
	search: function(query){
		this.fireEvent('searchStart', query);
		if(!$chk(query))
			return false;
		requestUrl = this.options.getSearchResultsUrl + query;
		this.xhr.send({
			url: requestUrl
		});
		return true;
	},
	
	//Search in the media library for this key
	searchByKey: function(key){
		this.fireEvent('searchStart', 'Search for: ' + key);
		if(!$chk(key))
			return false;
		requestUrl = this.options.getSearchByKeyUrl + key;
		this.xhr.send({
			url: requestUrl,
		});

		return true;
	},

	//Helper function, it formats a song to a html element
	//It creates a li element with inside it a anchor
	//When the anchor is clicked, it shows two options
	//	Play
	//	Enqueue
	formatSearchResult: function(song){
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
	}
});