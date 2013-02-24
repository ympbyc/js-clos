/*
 * Prelude.js
 * 2013 Minori Yamashita
 *
 * Define useful generic functions
 *
 * Assumes a rich Array.prototype
 */

var ex = exports;

with (require('js-clos')) {
    var _hasProp = Object.prototype.hasOwnProperty;

    //function
    var flip = ex.flip = function (f) {
        return function (x, y) { return f(y, x);  };
    };

    //sequence
    var foldl = ex.foldl = define_generic();
    define_method(foldl, ["function", undefined, Array], function (f, init, arr) {
        return Array.prototype.reduce.call(arr, flip(f), init);
    });
    define_method(foldl, ["function", undefined, "object"], function (f, init, obj) {
        var last = init,
            key;
        for (key in obj)
            if (_hasProp.call(obj, key))
                last = f(obj[key], last, key);
        return last;
    });


    var map = ex.map = define_generic();
    define_method(map, ["function", Array], function (f, arr) {
        return Array.prototype.map.call(arr, f);
    });
    define_method(map, ["function", "object"], function (f, obj) {
        return foldl(function (it, acc, key) {
            acc.push(f(it, key));
            return acc;
        }, [], obj);
    });

    var to_array = ex.to_array = define_generic();
    define_method(to_array, ["object", undefined], function (obj, f) {
        sf = is_a(f, "function") ? f : function (a, b) {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            return 0;
        };
        var arr = map(function (it, key) {
            return [key, it];
        }, obj);
        arr.sort(sf);
        return arr;
    });
    define_method(to_array, [Array], function (arr) {
        return arr;
    });

    //number
    var range = ex.range = define_generic();
    define_method(range, ["number", "number", undefined], function (n1, n2, step) {
        var arr = [], i = n1, step = step || 1;
        for (; i <= n2; i += step)
            arr.push(i);
        return arr;
    });
}
