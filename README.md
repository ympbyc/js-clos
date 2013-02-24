JS-CLOS
=======

A CLOS-like object system in JavaScript.

+ Multiple inheritance
+ Multiple dispatch
+ Type checking on construction
+ ML (or Haskell) style datatype
+ Guarded functions (simple patternmatching)
+ Memoization (optional)
+ Partial application

Examples use cases are shown in:
+ [example in coffeescript](https://gist.github.com/ympbyc/4996968)
+ [ML style datatype example](https://gist.github.com/ympbyc/5010424)
+ [Introduction in Japanese](http://qiita.com/items/5877294b97aaeaee5ae1)

Usage
-----

### Guarded Functions and Memoization ###

```javascript
var fib = define_generic(true); //pass true to enable memoization
define_method(fib, [0], function () { return 0; });
define_method(fib, [1], function () { return 1; });
define_method(fib, ["number"], function (n) {
  return fib(n-1) + fib(n-2);
});
```

### Partial Application ###

```javascript
p = require('./examples/prelude');
var add = define_generic();
define_method(add, ["number", "number"], function (a, b) { return a + b; });
define_method(add, ["string", "string"], function (a, b) { return a + b; });

p.map(add(2), [1,2,3,4,5]); //=> [3,4,5,6,7]
p.map(p.flip(add)("!!!"), ["lisp", "alien", "rocks"]); //=> ["lisp!!!", "alien!!!", "rocks!!!"]
```

### Simple Data Class ###

```javascript
//class, when `make`d, retruns a hash of values
var book = define_class([], function (x) {
    return slot_exists(x, 'title', "string")
        && slot_exists(x, 'author', "string");
});

//generic function show
var show = define_generic();

//show an instance of book
define_method(show, [book], function (b) {
    return b.title + " by " + b.author;
});

var p_city = make(book, {title:'Permutation City', author:'Greg Egan'});

show(p_city);
```


### Multimethod ###

```javascript
//define a bunch of classes
//the name is optional
var floor  = define_class([], undefined, "floor");
var carpet = define_class([], undefined, "carpet");
var ball   = define_class([], undefined, "ball");
var glass  = define_class([], undefined, "glass");
var stick  = define_class([], undefined, "stick");

//function to display the result
var bumpOutput = function(x, y, result){
    console.log(x + ' + ' + y + ' bump = ' + result);
};

//define a generic function `bump`
var bump = define_generic();

//define methods
define_method(bump, [ball, floor], function(x, y){
    bumpOutput(x, y, 'bounce');
});
define_method(bump, [glass, floor], function(x, y){
    bumpOutput(x, y, 'crash');
});
define_method(bump, [stick, floor], function(x, y){
    bumpOutput(x, y, 'knock');
});

//if you prefer, the following works, too
bump.defMethod([undefined, carpet], function(x, y){
    bumpOutput(x, y, 'silence');
});

//call the methods
bump(new ball, new floor); //should bounce
bump(new glass, new floor); //should crash
bump(new stick, new carpet); //shold silince

bump(new floor, new stick); // undefined method
```

API
---

### define_class ###

Takes:
+ an arrey of classes to inherit from. *(required)*
+ a validator function called upon instance construction. *(optional)*
+ a name string which is used as the string representation of its instances *(optional)*

Returns a constructor function (called **class**) that can be `new`ed or get applied to `make`

#### Syntax ####
**define_class**([ *parent classes* ], function (x) { *protocol* }, *name*);

#### Example ###

```javascript
var x = define_class([]);
var y = define_class([x]);
var z = define_class([x, y], funciton (a) {
  return slot_exists(a, 'name', 'string');
});
```

### define_generic ###

Takes nothing.

Returns **a generic function**.

#### Syntax ####
**define_generic**();

#### Example ####

```javascript
var show = define_generic();
```

### define_method ###

Takes:
+ **a generic function** *(required)*
+ an array of **patterns** that specifies the type of arguments given to the method *(required)*
+ a function that is the body of the method *(required)*

A **pattern** is either
+ a class (compared with `instanceof`)
+ a value (compared with `===`)
+ a constructor (that is defined with `define_constructor`)
+ a string returned by `typeof` operator ("number", "function", etc)
+ undefined for wildcard

Returns void.

#### Syntax ####
**define_method**( *generic function* , [ *patternA* , *...* ], function ( *a* , *...* ) { *body* });

#### Example ####

```javascript
define_method(show, [z], function (a) {
  console.log(a.name);
});

define_method(show, [x], function (a) {
  console.log("an instance of x");
});
```

### define_constructor ###

`define_constructor` allows a class to have multiple constructors.

Takes:
+ a class *(required)*
+ an initialization function *(optional)*

Returns a constructor function.

#### Syntax ####

**define_constructor**( *class* , function (...) { return make(class, {...}); });

#### Example ####

```javascript
var rank = define_class();
var Ace = define_constructor(rank);
var Jack = define_constructor(rank);
var Queen = define_constructor(rank);
var King = define_constructor(rank);
var Num = define_constructor(rank, function (n) { return make(rank, {number: n});  });

isA(Jack(), rank); //true
```


### make ###

Takes:
+ **a class** *(required)*
+ a hash object specifying the initial values of each slot *(optional)*

Returns an instance of the class.

#### Syntax ####

**make**( *class*, { *slot_name*: *initial_value*, *...*});

#### Example ####

```javascript
make(x);
make(z, {name: "foo"});
make(z); //ERROR
```

#### Note ####

The hash object given as the second argument is matched with the function given as the second argument to `define_class`. If the result is false, an exception gets thrown.

### is_a ###

Takes:
+ an instance *(required)*
+ a class or a string *(required)*

Returns boolean

### slot_exists ###

Takes:
+ an instance *(required)*
+ a slot identifier *(required)*
+ a class or a string  to specify the type *(optional)*

Returns a boolean. True if the instance has the slot of the specified type. False otherwise.

### defClass, defGeneric, defMethod, isA ###

Aliaces.
