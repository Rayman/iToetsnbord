//The log is from mootools more
//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>, Valerio Proietti <http://mad4milk.net> & the MooTools team <http://mootools.net/developers>, MIT Style License.
var log = function(){
  if (console.log){
    try {
      console.log.apply(console, arguments);
    } catch(e) {
      console.log(Array.slice(arguments));
    }
  } else {
    Log.logged.push(arguments);
  }
  return this;
};

function $extend(original, extended){
	for (var key in (extended || {})) original[key] = extended[key];
	return original;
};

function $try(){
	for (var i = 0, l = arguments.length; i < l; i++){
		try {
			return arguments[i]();
		} catch(e){}
	}
	return null;
};

Function.prototype.bind = function(obj){
  var that = this;
  return function(){
    that.apply(obj, arguments);
  };
};

function $empty(){};

function Class(obj){
  var klass = obj && obj.initialize ? obj.initialize : $empty;
  klass.prototype = obj;
  return klass;
};

var Request = new Class({

  initialize: function(options){
    log(this);
    this.xhr = new this.request();
    this.options = $extend(this.options, options);
  },
  
  options: {
    onSuccess: $empty,
    onFailure: $empty,
    url: ""
  },

  request: function(){
    return $try(function(){
      return new XMLHttpRequest();
    }, function(){
      return new ActiveXObject('MSXML2.XMLHTTP');
    }, function(){
      return new ActiveXObject('Microsoft.XMLHTTP');
    });
  },
  
  get: function(url){
    this.xhr.open('GET', url || this.options.url, true);
    this.xhr.onreadystatechange = function(){
      if(this.xhr.readyState == 4) {
        if(this.xhr.status == 200) {
          this.options.onSuccess();
        } else {
          this.options.onFailure();
        }
      }
    }.bind(this);
    this.xhr.send();
  }
});