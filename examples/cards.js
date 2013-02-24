var c = require('js-clos');

with (c) {

    //ML style typing
    var suit = define_class();
    var Hearts   = define_constructor(suit);
    var Spades   = define_constructor(suit);
    var Diamonds = define_constructor(suit);
    var Clubs    = define_constructor(suit);
    var rank = define_class();
    var Ace   = define_constructor(rank);
    var Jack  = define_constructor(rank);
    var Queen = define_constructor(rank);
    var King  = define_constructor(rank);
    var Num = define_constructor(rank, function (n) { return make(rank, {num: n});  });
    var color = define_generic();
    define_method(color, [Hearts], function () { return "red";  });
    define_method(color, [Diamonds], function () { return "red";  });
    define_method(color, [suit], function () { return "black";  });
    var val = define_generic();
    define_method(val, [Num], function (n) { return n; });
    define_method(val, [Ace], function (_) { return 12; });
    define_method(val, [rank], function (_) { return 11; });
    var card = define_class([], function (x) {
        return slot_exists(x, 'suit', suit)
            && slot_exists(x, 'rank', rank);
    });
    define_method(color, [card], function (c) {
        return color(c.suit);
    });
    define_method(val, [card], function (c) {
        return val(c.rank);
    });

    var hj = make(card, {
        suit: Hearts()
    ,   rank: Jack() });

    console.log(hj);

    console.log(color(hj)); //red
    console.log(val(hj));   //11

}
