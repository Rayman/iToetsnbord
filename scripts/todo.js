//These should be implemented

//Add native events for touch
Element.NativeEvents.touchstart = 2;
Element.NativeEvents.touchmove = 2;
Element.NativeEvents.touchend = 2;

//For the volume slider    
function startDrag(e) {
  
  var that, origin, pos;

  function getCoors(e) {
    var coors = [];

    //for iPhone
    var touches = e.touches || e.event.touches;
    if (touches && touches.length) { // iPhone
      var thisTouch;
      for (var i = 0; i < touches.length; i += 1) {
        if (touches[i].target === that || touches[i].target.parentNode === that) { //sometimes, target is a textnode,
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
  
  function moveDrag(e) {
    var currentPos = getCoors(e);
    var deltaX = currentPos[0] - origin[0];
    //var deltaY = currentPos[1] - origin[1];

    that.setStyle('left', (pos[0] + deltaX) + 'px');
    //that.setStyle('top', (pos[1] + deltaY) + 'px'); // no y move is wanted
  }

  if (e.type === 'touchstart') {
    this.removeEvent('mousedown', startDrag);

    var touchEnd = function () {
      this.removeEvent('touchmove', moveDrag);
      this.removeEvent('touchend', touchEnd);
    };

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

  pos = [this.offsetLeft, this.offsetTop];
  that = this;
  origin = getCoors(e);

  e.preventDefault(); // cancels scrolling on iphone
}

var iPhoneSlider = new Class({

  Extends: Slider,

  Binds: Slider.prototype.Binds.extend(['onTouchStart', 'onTouchEnd', 'onTouchMove']),
  //Binds: ['onTouchStart', 'onTouchEnd', 'onTouchMove'],
  //doens't work, i filled a bug

  initialize: function (element, knob, options) {
    this.parent.run(arguments, this);
    this.knob.addEvent('touchstart', this.onTouchStart);
  },

  onTouchStart: function (e) {
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

  onTouchEnd: function () {
    this.knob.removeEvent('touchmove', this.onTouchMove);
    this.knob.removeEvent('touchend', this.onTouchEnd);
    this.drag.stop(true);
  },

  onTouchMove: function (e) {
    e.page = this.getCoors(e);
    this.drag.drag.run(e, this.drag);
  },

  getCoors: function (e) {
    return {
      x: e.event.touches[0].clientX,
      y: e.event.touches[0].clientY
    };
  }
});