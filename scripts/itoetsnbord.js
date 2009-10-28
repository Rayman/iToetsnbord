var SongManager = new Class({
	
	Implements: [Options,Events],

	options: {
		// onRequestComplete: $empty,
		getCurrentSongUrl: ''
	},
	
	initialize: function(options) {
		//set options
		this.setOptions(options);
	},
	
	//Get the current song with an ajax request and fire the update event
	update: function(data){
		requestUrl = this.options.getCurrentSongUrl;
		if(data)
			requestUrl += data;
		var myRequest = new Request.JSON({
			method: "get",
			url: requestUrl,
			onSuccess: this.onRequestSuccess.bind(this),
			onFailure: function(){
				alert('Error getting current song');
			}
		});
		myRequest.send();
	}, 
	
	onRequestSuccess: function(responseJSON){
		this.fireEvent('update', responseJSON);
	}
});

var MusicSearcher = new Class({
	
	Implements: [Options,Events],
	
	options: {
		//getSearchResultsUrl: '',
		// onSearchComplete: $empty
	},
	
	initialize: function(options) {
		//set options
		this.setOptions(options);
	},
	
	// Query the media library with ajax request and fire the event
	search: function(query){
		if(!$chk)
		{
			alert('Error, no search query');
			return false;
		}
		requestUrl = this.options.getSearchResultsUrl + query;
		var myRequest = new Request.JSON({
			method: "get",
			url: requestUrl,
			onSuccess: function(responseJSON, responseText){
				this.fireEvent('searchComplete', [responseJSON, responseText]);
			}.bind(this),
			onFailure: function(){
				alert('Error getting search results');
			}
		});
		myRequest.send();
		return true;
	}, 
	
	onRequestSuccess: function(responseJSON){
		alert(responseJSON);
		
	}
});