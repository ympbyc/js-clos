JS-CLOS
=======

A CLOS-like framework sketch on JavaScript.


Usage
-----

```javascript
//define a bunch of classes
var floor  = CLOS.defClass("floor");
var carpet = CLOS.defClass("carpet");
var ball   = CLOS.defClass("ball");
var glass  = CLOS.defClass("glass");
var stick  = CLOS.defClass("stick");

//function to display the result
var bumpOutput = function(x, y, result){
    console.log(x + ' + ' + y + ' bump = ' + result);
};

//define a generic function `bump`
var bump = CLOS.defGeneric('bump');

//define methods
CLOS.defMethod('bump', [ball, floor], function(x, y){
    bumpOutput(x, y, 'bounce');
});
CLOS.defMethod('bump', [glass, floor], function(x, y){
    bumpOutput(x, y, 'crash');
});
CLOS.defMethod('bump', [stick, floor], function(x, y){
    bumpOutput(x, y, 'knock');
});
CLOS.defMethod('bump', [undefined, carpet], function(x, y){
    bumpOutput(x, y, 'silence');
});

//call the methods
bump(new ball, new floor); //should bounce
bump(new glass, new floor); //should crash
bump(new stick, new carpet); //shold silince

bump(new floor, new stick); // undefined method
bump(new glass, new floor); // undefined generic
```
