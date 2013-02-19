/* JavaScript "CLOS", v.0.1 (alpha)
 * (c) Дмитрий Пинский <demetrius@neverblued.info>
 * Допускаю использование и распространение согласно
 * LLGPL -> http://opensource.franz.com/preamble.html
 */

var CLOS = {};
CLOS.generics = {};

//JS class

/* constructor for generic-function object */
CLOS.generic = function(name){
    this.name = name;
    this.methods = [];
};

/* constructor for actual method generic functions delegates to */
CLOS.method = function(clause, body){
    this.clause = clause;
    this.body = body;
};

CLOS.method.prototype.check = function(parameters){
    var i;
    for(i in this.clause){
        if (CLOS.isA(parameters[i], this.clause[i]))
            continue;
        return false;
    }
    return true;
};

/* -- /CLOS.method -- */

/* classes are plain constructor function  */
CLOS.defClass = function (name,  /*optional*/ fn) {
  var cl = fn || function () {};
  cl.prototype.toString = function () { return name;  };
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

/* (define-generic `name`)  */
CLOS.defGeneric = function(name){
    CLOS.generics[name] = new CLOS.generic(name);
};

/* used internally  */
CLOS.getGeneric = function(name){
    if(!CLOS.generics[name]){
        throw 'CLOS error: generic ' + name + ' is not defined';
    }
    return CLOS.generics[name];
};

/* (define-method name ((arg1 <class1>) (arg2 <class2>)) ...)  */
/* CLOS.defMethod("name", [class1, class2], function (arg1, arg2) { ... }) */
CLOS.defMethod = function(name, parameters, body){
    var generic = CLOS.getGeneric(name);
    generic.methods.push(new CLOS.method(parameters, body));
};

//call a generic function
//current implementation does not include dispatch precedence so it may call multiple methods
CLOS.call = function(name){
    var generic = CLOS.getGeneric(name),
        parameters = Array.prototype.slice.call(arguments, 1),
        method, i;
    //iterate over methods defined on the generic
    for(i in generic.methods){
        method = generic.methods[i];
        //checks if the given parameter matches the declared type
        if(method.check(parameters)){
            return method.body.apply({}, parameters);
        }
    }
    throw 'CLOS error: cannot find method ' + name + ' for ' + parameters;
};


module.exports = CLOS;
