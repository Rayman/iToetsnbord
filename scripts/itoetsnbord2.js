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