JS-CLOS
=======

A CLOS-like framework sketch on JavaScript.


Usage
-----

### Simple Data Class ###

```javascript
//class, when `make`d, retruns a hash of values
var _book_ = define_class(function (x) {
    return slot_exists(x, 'title', "string")
        && slot_exists(x, 'author', "string");
});

//generic function show
var show = define_generic();

//show an instance of book
define_method(show, [_book_], function (b) {
    return b.title + " by " b.author;
});

var p_city = make(_book_, {title:'Permutation City', author:'Greg Egan'});

show(p_city);
```


### Multimethod ###

```javascript
//define a bunch of classes
//the name is optional
var floor  = define_class(undefined, "floor");
var carpet = define_class(undefined, "carpet");
var ball   = define_class(undefined, "ball");
var glass  = define_class(undefined, "glass");
var stick  = define_class(undefined, "stick");

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
bump(new glass, new floor); // undefined generic
```
