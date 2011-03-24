/**
 * Copyright (c) <2010> <Ramon Wijnands>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
*/

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

/**
 * Copy all propperties from the extended object to the original
 * @param {object} original The object to copy the properties TO
 * @param {object} extended The object to copy the properties FROM
 */
function $extend(original, extended) {
	for (var key in (extended || {})) {
    original[key] = extended[key];
  }
	return original;
}

/**
 * Try each argument (as a function) until one succeeds
 */
function $try() {
	for (var i = 0, l = arguments.length; i < l; i++) {
		try {
			return arguments[i]();
		} catch (e) {}
	}
	return null;
}

/**
 * Determine the type of the object
 * @return A string with the type of the object
 */
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

/**
 * Convert the iterable object to a new array
 * @param {object} iterable An object that is iterable such as a NodeList or an array
 */
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

/**
 * Bind the 'this' variable of the function to the desired object
 */
Function.prototype.bind = function (obj) {
  var that = this;
  return function () {
    return that.apply(obj, arguments);
  };
};

/**
 * Call the function fn on each object in the array
 * @param {object=} bind An optional object to bind the function to
 */
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

/**
 * Replace all multiple white space in the string to one space
 */
String.prototype.clean = function () {
  return this.replace(/\s+/g, ' ').trim();
};

/**
 * An empty function
 */
function $empty() { }

/**
 * Removes all whitespace at the beginning and at the end of the string
 */
String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, '');
};

/**
 * Checks if the element has a class
 */
function hasClass(element, className) {
  return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
}

/**
 * Add a class to an element
 */
function addClass(element, className) {
  if (!hasClass(element, className)) {
    element.className = (element.className + ' ' + className).clean();
  }
}

/**
 * Remove a class from an element
 */
function removeClass(element, className) {
  element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
}

/**
 * If toggle a class on an element
 */
function toggleClass(element, className) {
  hasClass(element, className) ? removeClass(element, className) : addClass(element, className);
}

/**
 * Remove all childNodes from an element
 */
function empty(element) {
  $each($A(element.childNodes), function (node) {
    empty(node);
    element.removeChild(node);
  });
}

/**
 * Get an array with all the childNodes from an element
 */
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
 * A simple XMLHttpRequest implementation
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

/**
 * Convert a json string to an object
 */
function json_parse(jsonText) {
  //cast to string
  var text = String(jsonText);
  return eval('(' + text + ')');
}

/**
 * URLDecode a string
 * I got this function from: www.albionresearch.com
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

/**
 * URLEncode a string
 */
function URLEncode(text) {
	// The Javascript escape and unescape functions do not correspond
	// with what browsers actually do...
	var SAFECHARS = "0123456789" +					// Numeric
					"ABCDEFGHIJKLMNOPQRSTUVWXYZ" +	// Alphabetic
					"abcdefghijklmnopqrstuvwxyz" +
					"-_.!~*'()";					// RFC2396 Mark characters
	var HEX = "0123456789ABCDEF";

	var plaintext = text;
	var encoded = "";
	for (var i = 0; i < plaintext.length; i++ ) {
		var ch = plaintext.charAt(i);
    if (ch == " ") {
      encoded += "+";				// x-www-urlencoded, rather than %20
		} else if (SAFECHARS.indexOf(ch) != -1) {
      encoded += ch;
		} else {
      var charCode = ch.charCodeAt(0);
			if (charCode > 255) {
        alert('Error, invalid Unicode Character');
        encoded += "+";
			} else {
				encoded += "%";
				encoded += HEX.charAt((charCode >> 4) & 0xF);
				encoded += HEX.charAt(charCode & 0xF);
			}
		}
	} // for

	return encoded;
};

/**
 * Asset provides methods to dynamically load JavaScript, CSS, and Image files into the document.
 * license: MIT-style license
 * author: Valerio Proietti
 *
 * The script has been heavily modified
 */
var Asset = {

	javascript: function (source) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = source;
    document.head.appendChild(script);
    return script;
	},

	css: function (source) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
	  link.media = 'screen';
		link.type = 'text/css';
		link.href = source;
		document.head.appendChild(link);
		return link;
	},

	image: function (source) {
		var image = new Image();
		image.src = source;
		return image;
	},

	images: function (sources) {
	  var images = [];
		sources.each(function (source) {
      images.push(Asset.image(source));
    });
    return images;
	}
};