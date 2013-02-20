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


module.exports = (function () {
    var CLOS = {}; //exported namespace

    var _slice = Array.prototype.slice;

    CLOS.options = {};
    CLOS.options.dispatchBasedOnSpecificity = true;
    CLOS.options.deepLookupParent = true;

    //JS class

    /* constructor for generic-function object */
    function Generic () {

        var self = function () {
            return _call.call(self, _slice.call(arguments));
        };

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
        for(i in this.clause){
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
        pred = pred || function () {return true;};
        var cl = function (obj) {
            var key;
            parents.forEach(function (p) { return p._pred(obj); }); //check for exception
            if ( ! pred(obj)) throw "Initialization error";
            for (key in obj)
                if (obj.hasOwnProperty(key))
                    this[key] = obj[key];
        };
        cl._pred = pred;
        cl._parents = parents;
        cl.prototype._parents = parents;
        cl.prototype.toString = function () { return name || JSON.stringify(this);  };
        cl.prototype.isA = function (standard) { return CLOS.isA(this, standard); };
        return cl;
    };

    //procedures

    CLOS.isA = function(example, standard){
        if (!example) return false;
        if (typeof(standard) == "string")
            return (typeof(example) == standard);
        return (standard === undefined)
            || (example instanceof standard)
            || hasParent(example._parents, standard);
    };

    var hasParent;
    if (CLOS.options.deepLookupParent)
        //recursive function to see if the list of parents include the class
        hasParent = function (parents, standard) {
            if ( ! parents || !parents[0]) return false;
            if (parents[0] === standard) return true;
            return hasParent(parents[0]._parents, standard) || hasParent(parents.slice(1), standard);
        };
    else
        //shallow lookup
        hasParent = function (parents, standard) {
            return parents.indexOf(standard) > -1;
        };


    /* (define-generic)  */
    CLOS.defGeneric = function () {
        return new Generic();
    };

    //alias
    //this function is expensive
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

    //for schemer
    CLOS.define_method = CLOS.defMethod;
    CLOS.define_generic = CLOS.defGeneric;
    CLOS.define_class = CLOS.defClass;
    CLOS.is_a = CLOS.isA;

    CLOS.slot_exists = function (obj, slot, cls) {
        return (obj[slot] !== undefined)
            && cls ? CLOS.isA(obj[slot], cls) : true;
    };

    //alias to `new`
    CLOS.make = function (cls, obj) {
        return new cls(obj);
    };

    return CLOS;

}());
