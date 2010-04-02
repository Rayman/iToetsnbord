$ = function(id){
  return document.getElementById(id);
}

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

Array.prototype.forEach = function(fn, bind){
  for (var i = 0, l = this.length; i < l; i++) fn.call(bind, this[i], i, this);
};

String.prototype.clean = function(){
  return this.replace(/\s+/g, ' ').trim();
}

function $empty(){};

String.prototype.contains = function(string, separator){
  return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
};

String.prototype.trim = function(){
		return this.replace(/^\s+|\s+$/g, '');
};

function hasClass(element, className){
  return element.className.contains(className, ' ');
};

function addClass(element, className){
  if (!hasClass(element, className)) element.className = (element.className + ' ' + className).clean();
}

function removeClass(element, className){
  element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
}

function toggleClass(element, className){
  return hasClass(element, className) ? removeClass(element, className) : addClass(element, className);
}

function Class(obj){
  if(!obj) return $empty;
  var klass = obj.initialize ? obj.initialize : $empty;
  var impl = obj.Implements || [];
  impl.forEach(function(el){
    $extend(klass.prototype,new el);
  });
  $extend(klass.prototype,obj);
  return klass;
};

var Options = new Class({

	setOptions: function(options){
		$extend(this.options, options);
	}

});

function getChildren(element){
  var el = element['firstChild'];
	var elements = [];
	while (el){
		if (el.nodeType == 1){
			elements.push(el);
		}
		el = el['nextSibling'];
	}
	return elements;
};

var Request = new Class({

  initialize: function(options){
    this.xhr = new this.request();
    $extend(this.options, options);
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