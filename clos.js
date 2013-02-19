/* JavaScript "CLOS", v.0.1 (alpha)
 * (c) Дмитрий Пинский <demetrius@neverblued.info>
 * Допускаю использование и распространение согласно
 * LLGPL -> http://opensource.franz.com/preamble.html
 */

module.exports = (function () {
    var CLOS = {}; //exported namespace

    var generics = {};

    var _slice = Array.prototype.slice;

    //JS class

    /* constructor for generic-function object */
    function Generic () {

        var self = function () {
            _call.call(self, _slice.call(arguments));
        };

        self.defMethod = function (parameters, body) {
            self.methods.push(new Method(parameters, body));
        };

        self.methods = [];
        return self;             //this is valid
    };

    /* constructor for actual method generic functions delegates to */
    function Method (clause, body){
        this.clause = clause;
        this.body = body;
    };

    Method.prototype.check = function(parameters){
        var i;
        for(i in this.clause){
            if (CLOS.isA(parameters[i], this.clause[i]))
                continue;
            return false;
        }
        return true;
    };

    /* -- /Method -- */

    /* classes are plain constructor function  */
    CLOS.defClass = function (name, supr) {
        var cl = function () {};
        supr = supr || function () {};
        cl.prototype = new supr;
        cl.prototype.toString = function () { return name;  };
        cl.prototype.isA = function (standard) { return CLOS.isA(this, standard);  };
        return cl;
    };

    //procedures

    CLOS.isA = function(example, standard){
        if(standard === undefined){
            return true;
        }
        if(example instanceof standard){
            return true;
        }
        if(typeof(example) == standard){
            return true;
        }
        return false;
    };

    /* (define-generic)  */
    CLOS.defGeneric = function () {
        return new Generic();
    };

    //alias
    CLOS.defMethod = function (generic, params, body) {
        generic.defMethod(params, body);
    };

    var _call = function (parameters) {
        var method, i;
        //iterate over methods defined on the generic
        for(i in this.methods){
            method = this.methods[i];
            //checks if the given parameter matches the declared type
            if(method.check(parameters)){
                return method.body.apply({}, parameters);
            }
        }
        throw 'CLOS error: cannot find specified method for ' + parameters;
    };

    return CLOS;

}());
