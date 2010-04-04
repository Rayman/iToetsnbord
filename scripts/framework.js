function $(id){
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

function $type(obj){
	if (obj == undefined) return false;
	if(typeof obj !== 'object') {
    if(typeof obj == 'numer' && !isFinite(obj))
      return false;
    return typeof obj;
  }

	if (obj.nodeName){
		switch (obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	} else if (typeof obj.length == 'number'){
		if (obj.callee) return 'arguments';
		else if (obj.item) return 'collection';
	}

	return typeof obj;
};

//Make array
function $A(iterable){
	if (iterable.item){
		var l = iterable.length, array = new Array(l);
		while (l--) array[l] = iterable[l];
		return array;
	}
	return Array.prototype.slice.call(iterable);
};

Function.prototype.bind = function(obj){
  var that = this;
  return function(){
    that.apply(obj, arguments);
  };
};

Array.prototype.each = function(fn, bind){
  for (var i = 0, l = this.length; i < l; i++) fn.call(bind, this[i], i, this);
};

function $each(obj, fn, bind) {
  for (var i = 0, l = obj.length; i < l; i++) fn.call(bind, obj[i], i, obj);
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

function dispose(element){
  if(element.parentNode)
    element.parentNode.removeChild(element);
}

function destroy(element){
  empty(element);
  dispose(element);
  // clean(element, true);
}

function empty(element){
  $each($A(element.childNodes), function(node){
    destroy(node);
  });
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
          this.options.onSuccess.call(this, this.xhr.responseText, this.xhr.responseXML);
        } else {
          this.options.onFailure();
        }
      }
    }.bind(this);
    this.xhr.send();
  }
});

var JSON = JSON || {};

//JSON.parse is a modified code from http://www.json.org/json2.js
if (typeof JSON.parse !== 'function') {
  JSON.parse = function (text) {
      var j;
      var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

      //cast to string
      text = String(text);

      //some unicode stuff
      cx.lastIndex = 0;
      if (cx.test(text)) {
          text = text.replace(cx, function (a) {
              return '\\u' +
                  ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
      }


      if (/^[\],:{}\s]*$/
        .test(
          text
            .replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
            .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
        )
      ) {
          j = eval('(' + text + ')');
          return j;
      }
      throw new SyntaxError('JSON.parse');
  };
}