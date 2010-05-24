/**
 * Gets an element by its id from the document
 * @param {string} id The id of the element
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * The log is from mootools more
 * MooTools More, <http://mootools.net/more>.
 * Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>,
 * Valerio Proietti <http://mad4milk.net> &
 * the MooTools team <http://mootools.net/developers>, 
 * MIT Style License.
 */
var log = function () {
  if (console.log) {
    try {
      console.log.apply(console, arguments);
    } catch (e) {
      console.log(Array.slice(arguments));
    }
  }
};


function $extend(original, extended) {
	for (var key in (extended || {})) {
    original[key] = extended[key];
  }
	return original;
}

function $try() {
	for (var i = 0, l = arguments.length; i < l; i++) {
		try {
			return arguments[i]();
		} catch (e) {}
	}
	return null;
}

function $type(obj) {
	if (obj == undefined) {
    return false;
  }
  var t = typeof obj;
	if (t !== 'object') {
    if (t === 'number' && !isFinite(obj)) {
      return false;
    }
    return t;
  }

	if (obj.nodeName) {
		switch (obj.nodeType) {
    case 1:
      return 'element';
    case 3:
      return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	} else if (typeof obj.length === 'number') {
		if (obj.callee) {
      return 'arguments';
    } else if (obj.item) {
      return 'collection';
    }	else {
      return 'array';
    }
	}

	return t;
}

//Make array
function $A(iterable) {
	if (iterable.item) {
		var l = iterable.length, array = new Array(l);
		while (l--) {
      array[l] = iterable[l];
    }
		return array;
	}
	return Array.prototype.slice.call(iterable);
}

Function.prototype.bind = function (obj) {
  var that = this;
  return function () {
    that.apply(obj, arguments);
  };
};

Array.prototype.each = function (fn, bind) {
  for (var i = 0, l = this.length; i < l; i++) {
    fn.call(bind, this[i], i, this);
  }
};

/**
 * Iterates over all properties in obj and calls the function fn
 * @param {Object} obj The object to iterate over
 * @param {Function} fn The object to iterate over
 * @param {Object=} bind The object to bind the function to (optional)
 */
function $each(obj, fn, bind) {
  for (var i = 0, l = obj.length; i < l; i++) {
    fn.call(bind, obj[i], i, obj);
  }
}

String.prototype.clean = function () {
  return this.replace(/\s+/g, ' ').trim();
};

function $empty() { }

String.prototype.contains = function (string, separator) {
  return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
};

String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, '');
};

function hasClass(element, className) {
  return element.className.contains(className, ' ');
}

function addClass(element, className) {
  if (!hasClass(element, className)) {
    element.className = (element.className + ' ' + className).clean();
  }
}

function removeClass(element, className) {
  element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
}

function toggleClass(element, className) {
  return hasClass(element, className) ? removeClass(element, className) : addClass(element, className);
}

function dispose(element) {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function destroy(element) {
  empty(element);
  dispose(element);
  // clean(element, true);
}

function empty(element) {
  $each($A(element.childNodes), function (node) {
    destroy(node);
  });
}

function getChildren(element) {
  var el = element.firstChild;
	var elements = [];
	while (el) {
		if (el.nodeType === 1) {
			elements.push(el);
		}
		el = el.nextSibling;
	}
	return elements;
}

/**
 * A request implementation
 * @constructor
 */
function Request(options) {
  this.xhr = this.request();
  this.options = {
    // onSuccess: $empty,
    onFailure: $empty,
    url: ""
  };
  $extend(this.options, options);
}

Request.prototype = {

  request: function () {
    return $try(function () {
      return new XMLHttpRequest();
    }, function () {
      return new ActiveXObject('MSXML2.XMLHTTP');
    }, function () {
      return new ActiveXObject('Microsoft.XMLHTTP');
    });
  },

  get: function (url) {
    this.xhr.open('GET', url || this.options.url, true);
    this.xhr.onreadystatechange = function () {
      if (this.xhr.readyState === 4) {
        if (this.xhr.status === 200) {
          this.options.onSuccess.call(this, this.xhr.responseText, this.xhr.responseXML);
        } else {
          this.options.onFailure();
        }
      }
    }.bind(this);
    this.xhr.send();
  }
};


function json_parse(jsonText) {
  //cast to string
  var text = String(jsonText);
  return eval('(' + text + ')');
}

/*
* I got this function from //www.albionresearch.com/
* Their copyright notice is too long to include here :P
*/
function URLDecode(text) {
  // Replace + with ' '
  // Replace %xx with equivalent character
  // Put [ERROR] in output if %xx is invalid.

  var HEXCHARS = "0123456789ABCDEFabcdef";
  var encoded = text;
  var plaintext = "";
  var i = 0;
  while (i < encoded.length) {
    var ch = encoded.charAt(i);
    if (ch === "+") {
      plaintext += " ";
      i++;
    } else if (ch === "%") {
      if (
        i < (encoded.length - 2) &&
        HEXCHARS.indexOf(encoded.charAt(i + 1)) !== -1 &&
        HEXCHARS.indexOf(encoded.charAt(i + 2)) !== -1
      ) {
        plaintext += unescape(encoded.substr(i, 3));
        i += 3;
      } else {
        plaintext += "%[ERROR]";
        i++;
      }
    } else {
      plaintext += ch;
      i++;
    }
  } // while
  return plaintext;
}