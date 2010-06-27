describe('$ function', {
        'should get an element by id': function() {
                value_of($('asdf')).should_be(document.getElementById('asdf'));
        },
        'should add two numbers': function() {
                value_of(1 + 2).should_be(3);
        }
});

describe('log function', {
        'should exist': function() {
                value_of(typeof log).should_be('function');
        }
});

(function (){

var obj1 = {a:2, b:4, c:5};
var obj2 = {b:6, d:7};
var result = {a:2, b:6, c:5, d:7};
$extend(obj1, obj2);

describe('$extend function', {
        'should extend an object': function() {
                value_of(obj1).should_be(result);
        }
});

})();

describe('$try function', {
        'should stop when a function doesnt fail': function() {
                var result = $try(function(){
                  throw "Error";
                  return "fail";
                }, function(){
                  return "good";
                }, function(){
                  return "fail";
                });

                value_of(result).should_be('good');
        }
});

describe('$type function', {
        'should return the correct type for object': function() {
                value_of($type({})).should_be('object');
        },
        'should return the correct type for array': function() {
                value_of($type([])).should_be('array');
        },
        'should return the correct type for string': function() {
                value_of($type('')).should_be('string');
        },
        'should return the correct type for function': function() {
                value_of($type(function(){})).should_be('function');
        },
        'should return the correct type for regexp': function() {
                value_of($type(/_/)).should_be('regexp');
        },


        'should return the correct type for undefined': function() {
                value_of($type(undefined)).should_be(false);
        },
        'should return the correct type for Infinity': function() {
                value_of($type(Infinity)).should_be(false);
        },
        'should return the correct type for NaN': function() {
                value_of($type(NaN)).should_be(false);
        },
        'should return the correct type for 0': function() {
                value_of($type(0)).should_be('number');
        },

        'should return the correct type for boolean': function() {
                value_of($type(false)).should_be('boolean');
                value_of($type(true)).should_be('boolean');
        },

//Elements
        'should return the correct type for document': function() {
                value_of($type(document.body)).should_be('element');
        },
        'should return the correct type for whitespace': function() {
                var node = document.createTextNode('   asdf asda sdfa s    ');
                value_of($type(node)).should_be('textnode');
        },
        'should return the correct type for textnode': function() {
                var node = document.createTextNode('       ');
                value_of($type(node)).should_be('whitespace');
                var node = document.createTextNode('');
                value_of($type(node)).should_be('whitespace');
        },

//misc
        'should return the correct type for arguments': function() {
                var result = (function(){
                  return $type(arguments);
                })();
                value_of(result).should_be('arguments');
        },
        'should return the correct type for collection': function() {
                value_of($type(document.getElementsByTagName('div'))).should_be('collection');
        },
});