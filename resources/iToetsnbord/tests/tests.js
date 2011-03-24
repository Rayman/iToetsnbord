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

describe('$A function', {
        'should return an array of a nodelist': function() {
                var div = document.createElement('div');
                div.appendChild(document.createElement('p'));
                div.appendChild(document.createElement('a'));
                div.appendChild(document.createElement('div'));
                
                var list = div.getElementsByTagName('*');
                var arr  = $A(list);
        
                value_of(list).should_have(3, 'items');
                value_of($type(arr)).should_be('array');
                value_of(arr).should_have(3, 'items');
        },
        'should return a copy of an array': function() {
          var obj1 = {a:3, b:4};
          var obj2 = {b:5, c:6};
          var arr1 = [9, obj1, obj2, 8];
          var arr2 = $A(arr1);
          
          value_of(arr1).should_be(arr2);
          value_of(arr1 == arr2).should_be_false();
          value_of(arr1[1] == arr2[1]).should_be_true();
          value_of(arr1[2] == arr2[2]).should_be_true();
        }        
});

(function (){

function Rules() {
  return this + ' rules';
}


describe('bind function', {
        'should return the function bound to an object': function() {
            var fnc = Rules.bind('MooTools');
            value_of(fnc()).should_be('MooTools rules');
        }
});

})();