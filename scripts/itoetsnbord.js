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
		urlSearchByQuery: '',
		urlSearchByKey:   ''
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
		this.update(this.options.urlSearchByQuery+query);
		return true;
	},

	//Search in the media library for this key
	searchByKey: function(key){
		this.fireEvent('searchStart', 'Search for: ' + key);
		if(!$chk(key)) return false;
		this.update(this.options.urlSearchByKey+key);
		return true;
	}
});

//Add native events for touch
Element.NativeEvents.touchstart = 2;
Element.NativeEvents.touchmove = 2;
Element.NativeEvents.touchend = 2;

//For the volume slider
function startDrag(e) {

	if (e.type === 'touchstart') {
		this.removeEvent('mousedown', startDrag);

		var touchEnd = function () {
			this.removeEvent('touchmove', moveDrag);
			this.removeEvent('touchend', touchEnd);
		}

		this.addEvent('touchmove', moveDrag);
		this.addEvent('touchend', touchEnd);

	} else {

		var onMouseUp = function () {
			document.removeEvent('mousemove', moveDrag);
			document.removeEvent('mouseup', onMouseUp);
		};

		document.addEvent('mousemove', moveDrag);
		document.addEvent('mouseup', onMouseUp);
	}

	var pos = [this.offsetLeft,this.offsetTop];
	var that = this;

	var origin = getCoors(e);

  e.preventDefault(); // cancels scrolling on iphone

	function moveDrag (e) {
		var currentPos = getCoors(e);
		var deltaX = currentPos[0] - origin[0];
		//var deltaY = currentPos[1] - origin[1];

		that.setStyle('left', (pos[0] + deltaX) + 'px');
		//that.setStyle('top', (pos[1] + deltaY) + 'px'); // no y move is wanted
	}

	function getCoors(e) {
		var coors = [];

		//for iPhone
		var touches = e.touches || e.event.touches;
		if (touches && touches.length) { 	// iPhone
			var thisTouch;
			for (var i=0;i<touches.length;i+=1) {
				if (touches[i].target === that || touches[i].target.parentNode === that){ //sometimes, target is a textnode,
					thisTouch = touches[i];
					break;
				}
			}

			coors[0] = thisTouch.clientX;
			coors[1] = thisTouch.clientY;
		} else { // all others
			coors[0] = e.page.x;
			coors[1] = e.page.y;
		}
		return coors;
	}
}

var iPhoneSlider = new Class({

  Extends: Slider,

  Binds: Slider.prototype.Binds.extend(['onTouchStart', 'onTouchEnd', 'onTouchMove']),
  //Binds: ['onTouchStart', 'onTouchEnd', 'onTouchMove'],
  //doens't work, i filled a bug

  initialize: function(element, knob, options){
    this.parent.run(arguments, this);
    this.knob.addEvent('touchstart', this.onTouchStart);
  },

  onTouchStart: function(e){
    //from now on, only the ontouchstart is needed
    this.drag.detach();

    //disable scrolling
    e.preventDefault();

    this.knob.addEvent('touchmove', this.onTouchMove);
    this.knob.addEvent('touchend', this.onTouchEnd);

    //get x and y of touch
    e.page = this.getCoors(e);

    //start the drag
    this.drag.start.run(e, this.drag);
  },

  onTouchEnd: function (){
    this.knob.removeEvent('touchmove', this.onTouchMove);
    this.knob.removeEvent('touchend', this.onTouchEnd);
    this.drag.stop(true);
  },

  onTouchMove: function(e){
    e.page = this.getCoors(e);
    this.drag.drag.run(e, this.drag);
  },

  getCoors: function(e){
    return {
      x: e.event.touches[0].clientX,
      y: e.event.touches[0].clientY
    };
  }
});