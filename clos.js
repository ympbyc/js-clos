/* JavaScript "CLOS", v.0.1 (alpha)
 * (c) Дмитрий Пинский <demetrius@neverblued.info>
 * Допускаю использование и распространение согласно
 * LLGPL -> http://opensource.franz.com/preamble.html
 */

if ( ! Array.prototype.forEach)
    Array.prototype.forEach = function (f) {
        var i = 0, l = this.length;
        for (; i < l; ++i)
            f(this[i], i);
    };

if ( ! Array.prototype.reduce)
    Array.prototype.reduce = function (f, init) {
        var last = init,
            i = 0, l = this.length;;
        for (; i < l; ++i)
            last = f(last, init);
        return last;
    };

module.exports = (function () {
    'use strict';

    var CLOS = {}; //exported namespace

    var _slice = Array.prototype.slice;

    CLOS.options = {};
    CLOS.options.dispatchBasedOnSpecificity = true;

    //JS class

    /* constructor for generic-function object */
    /* Generic functions support memoization.
     * Because the user needs to wrap their function declaration,
     * they deserve a sweet treat ;)  */
    function Generic (memoize) {

        var self = memoize
          ? function () {
              var args = _slice.call(arguments);
              return self.memo[args]
                  || (self.memo[args] = _call(self, args)); }
          : function () {
              return _call(self, _slice.call(arguments)); };

        if (memoize) self.memo = {};

        self.defMethod = function (parameters, body) {
            self.methods.push(new Method(parameters, body));
            if (CLOS.options.dispatchBasedOnSpecificity)
                self.methods.sort(specificity);
        };

        self.methods = [];
        return self;             //this is valid
    };

    //sort function
    function specificity (a, b) {
        var aWin = 0, bWin = 0, i = 0, l = a.clause.length;
        for (; i < l; ++i) {
            if (CLOS.isA(a.clause[i], b.clause[i])) ++bWin;
            if (CLOS.isA(b.clause[i], a.clause[i])) ++aWin;
        }
        return aWin - bWin;
    };

    /* constructor for actual method generic functions delegates to */
    function Method (clause, body){
        this.clause = clause;
        this.body = body;
    };

    Method.prototype.check = function(parameters){
        var i, self = this;
        for (i in this.clause) {
            if (CLOS.isA(parameters[i], this.clause[i]))
                continue;
            return false;
        }
        return true;
    };

    /* -- /Method -- */

    /* classes are constructor functions  */
    /* The constructor may take a predicate function that ensures its instances
     * to have specific properties */
    CLOS.defClass = function (parents, pred, name) {
        parents = parents || [];
        pred = pred || function () {return true;};
        var cl = function (obj) {
            var key;
            if ( ! pred(obj)) throw "Initialization error";
            parents.forEach(function (p) { return p._pred(obj); }); //check for exception
            for (key in obj)
                if (obj.hasOwnProperty(key))
                    this[key] = obj[key];
        };
        var flatParents = parents.reduce(function (acc, cur) {
            return acc.concat(cur._parents);  }, parents);
        var uniqId =  uuid();
        cl._pred = pred;
        cl.prototype.constructor = cl;
        cl._parents = flatParents;
        cl.prototype._parents = flatParents;
        cl.prototype.toString = function () { return name || "[object "+ uniqId  +"]";  };
        cl.prototype.isA = function (standard) { return CLOS.isA(this, standard); };
        return cl;
    };

    //procedures

    //more like a pattern-matching
    /**
     * passes when:
     * example === standard
     * standard === undefined
     * typeof(example) == standard
     * example instanceof standard
     * member(example._parent, standard)
     */
    CLOS.isA = function (example, standard) {
        if (example === standard) return true;
        if (example === undefined) return false;
        switch(typeof(standard)) {
            case "undefined":
              return true;
            case "string":
              return (typeof(example) == standard);
            case "function":
            case "object":
              return (example instanceof standard)
                  || hasParent(example._parents, standard);
            default:
              return false;
        }
    };

    function hasParent (parents, standard) {
        if ( ! parents) return false;
        return parents.indexOf(standard) > -1;
    };


    /* (define-generic)  */
    CLOS.defGeneric = function (memoize) {
        return new Generic(memoize || false);
    };

    //alias
    //this function is expensive
    CLOS.defMethod = function (generic, params, body) {
        generic.defMethod(params, body);
    };

    //allow classes to have multiple constructors
    //this is a monkey patch
    CLOS.defConstructor = function (clas, f) {
        var ctor = function () {
            var val = f ? f.apply({}, _slice.call(arguments))
                        : CLOS.make(clas);
            val._parents.unshift(ctor);
            return val;
        };
        return ctor;
    };

    //Call what is appropriate
    var _call = function (generic, parameters) {
        var method, i;
        //iterate over methods defined on the generic
        for(i in generic.methods){
            method = generic.methods[i];

            //checks whether the given parameter matches the declared type
            if (method.check(parameters))
                //call the body
                return method.body.apply({}, parameters);

            //curry if the number of arguments is too short
            else if (method.clause.length > parameters.length)
                return function () {
                    return _call(generic, parameters.concat(_slice.call(arguments)));
                };
        }
        throw 'CLOS error: The method is not defined between ' + parameters.slice(0, -1) + ' and ' + parameters[parameters.length-1];
    };

   //helper
   function uuid () {
       var sf = function() {
           return (((Math.random() + 1) * 0x10000) | 0).toString(16).substring(1);
       };
       return (sf()+sf()+"-"+sf()+"-"+sf()+"-"+sf()+"-"+sf()+sf()+sf());
   }


    //for schemer
    CLOS.define_method = CLOS.defMethod;
    CLOS.define_generic = CLOS.defGeneric;
    CLOS.define_class = CLOS.defClass;
    CLOS.define_constructor = CLOS.defConstructor;
    CLOS.is_a = CLOS.isA;

    CLOS.slot_exists = function (obj, slot, cls) {
        return (obj[slot] !== undefined)
            && cls ? CLOS.isA(obj[slot], cls) : true;
    };

    //alias to `new`
    CLOS.make = function (cls, obj) {
        return new cls(obj || {});
    };

    return CLOS;

}());
