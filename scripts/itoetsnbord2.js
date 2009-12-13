var DataManager = new Class({

	Implements: [Options,Events],

	options: {
		// onUpdateStart: $empty,
		// onUpdate: $empty,
		baseUrl: ''
	},

	initialize: function(options) {
		//set options
		this.setOptions(options);

		//The request instance
		this.xhr = new Request.JSON({
			method: "get",
			onSuccess: function(responseJSON, responseText){
				this.fireEvent('update', [responseJSON, responseText]);
			}.bind(this),
			onFailure: function(){
				alert('Error getting xhr request');
			}
		});
	},

	//Get the url
	update: function(data){
		this.xhr.send({
			url: data ? this.options.baseUrl + data : this.options.baseUrl
		});
		this.fireEvent('onUpdateStart');
	}
});

var SongManager = new Class({

	Extends: DataManager,

	options: {
		// onUpdateStart: $empty,
		// onUpdate: $empty,
		// baseUrl: ''
	},

	initialize: function(options) {
		this.parent(options);
	},

	//Get the current song with an ajax request and fire the update event
	update: function(data){
		this.parent(data);
	}
});

var MusicSearcher = new Class({

	Extends: DataManager,

	options: {
		// onUpdateStart: $empty,
		// onUpdate: $empty,
		// baseUrl: ''
	},

	initialize: function(options) {
		//set options
		this.parent(options);

		//Set some options on the request instance
		this.xhr.setOptions({
			onSuccess: function(responseJSON, responseText){
				this.fireEvent('searchComplete', [responseJSON, responseText]);
			}.bind(this)
		});
	},

	//Query the media library with ajax request and fire the event
	searchByQuery: function(query){
		this.fireEvent('searchStart', query);
		if(!$chk(query)) return false;
		this.parent(query);
		return true;
	},

	//Search in the media library for this key
	searchByKey: function(key){
		this.fireEvent('searchStart', 'Search for: ' + key);
		if(!$chk(key)) return false;
		this.parent(key);
		return true;
	}
});