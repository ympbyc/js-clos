var CLOS = require('./clos');

// our domain

var floor  = CLOS.defClass([], undefined, "floor");
var carpet = CLOS.defClass([], undefined, "carpet");
var ball   = CLOS.defClass([], undefined, "ball");
var glass  = CLOS.defClass([], undefined, "glass");
var stick  = CLOS.defClass([], undefined, "stick");

var bumpOutput = function(x, y, result){
    console.log(x + ' + ' + y + ' bump = ' + result);
};
var errorOutput = function(error){
    console.log('[error] ' + error);
};

// definitions

var bump = CLOS.defGeneric();

CLOS.defMethod(bump, [ball, floor], function(x, y){
    bumpOutput(x, y, 'bounce');
});
CLOS.defMethod(bump, [glass, floor], function(x, y){
    bumpOutput(x, y, 'crash');
});
CLOS.defMethod(bump, [stick, floor], function(x, y){
    bumpOutput(x, y, 'knock');
});
CLOS.defMethod(bump, [undefined, carpet], function(x, y){
    bumpOutput(x, y, 'silence');
});

/* //equiv to <top>
CLOS.defMethod(bump, [undefined, undefined], function (x, y) {
    bumpOutput(x, y, '<top>');
});
*/

var Book = CLOS.defClass([], function (x) {
  return CLOS.slot_exists(x, 'title', 'string')
      && CLOS.slot_exists(x, 'author', 'string');
});
var Flammable = CLOS.defClass([], function (x) {
  return CLOS.slot_exists(x, 'burnTime', 'number');
});
var Magazine = CLOS.defClass([Book, Flammable]);

var show = CLOS.defGeneric();

CLOS.defMethod(show, [Book], function (b) {
    console.log(b.title + " by " + b.author);
});

var burn = CLOS.defGeneric();

CLOS.defMethod(burn, [Magazine], function (m) {
    console.log(m.title + " burnt in " + m.burnTime + " seconds.");
});
CLOS.defMethod(burn, [Flammable], function (f) {
    console.log(f + " burnt in " + f.burnTime + " seconds.");
});

// test

var tests = [
    function () {
        bump(new ball, new floor); //bounce
    },
    function(){
        bump(new glass, new floor); // crash
    },
    function(){
        bump(new stick, new carpet); // silence
    },
    function(){
        bump(new floor, new stick); // undefined method
    },
    function () {
        bump(new ball, new floor); //bounce
    },

    function () {
        show(CLOS.make(Book, {title:'Permutation City', author:'Greg Egan'}));
        //Permutation City by Greg Egan
    },
    function () {
        CLOS.make(Book, {}); //Initialization error
    },
    function () {
        show(CLOS.make(Magazine, {title:'Foo', author:'Bar', burnTime:5000}));
        //Foo by Bar
    },
    function () {
        burn(CLOS.make(Flammable, {burnTime: 5, name: "gas tank"}));
        burn(CLOS.make(Magazine, {burnTime: 20, title:"Foo", author:"Bar"}));
    }
];
for(var i in tests){
    var test = tests[i];
    try{
        test();
    }
    catch(error){
        errorOutput(error);
    }
}
