var CLOS = require('./clos');

// our domain

var floor  = CLOS.defClass("floor");
var carpet = CLOS.defClass("carpet");
var ball   = CLOS.defClass("ball");
var glass  = CLOS.defClass("glass");
var stick  = CLOS.defClass("stick");

var bumpOutput = function(x, y, result){
    console.log(x + ' + ' + y + ' bump = ' + result);
};
var errorOutput = function(error){
    console.log('[error] ' + error);
};

// definitions

CLOS.defGeneric('bump');
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

/* //equiv to <top>
CLOS.defMethod('bump', [undefined, undefined], function (x, y) {
    bumpOutput(x, y, '<top>');
});
*/

// test

var tests = [
    function () {
        CLOS.call('bump', new ball, new floor); //bounce
    },
    function(){
        CLOS.call('bump', new glass, new floor); // crash
    },
    function(){
        CLOS.call('bump', new stick, new carpet); // silence
    },
    function(){
        CLOS.call('bump', new floor, new stick); // undefined method
    },
    function(){
        CLOS.call('put', new glass, new floor); // undefined generic
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
