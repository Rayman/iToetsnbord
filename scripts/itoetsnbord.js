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
		if(!$chk(query)) return false;
		this.xhr.send({
			url: this.options.getSearchResultsUrl + query
		});
		return true;
	},

	//Search in the media library for this key
	searchByKey: function(key){
		this.fireEvent('searchStart', 'Search for: ' + key);
		if(!$chk(key)) return false;
		this.xhr.send({
			url: this.options.getSearchByKeyUrl + key
		});
		return true;
	}
});