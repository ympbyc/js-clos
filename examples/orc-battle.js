/****************************************************************
 *                                                              *
 * Implementation of the Orc Battle game from the Land of Lisp  *
 *                                                              *
 ****************************************************************/

var readline = require('readline');

with (require('js-clos')) {
    var p = require('./lib/prelude');

    p.every = function (p, arr) {
        return Array.prototype.every.call(arr, p);
    };
    p.shallow_merge = function (dst, src) {
        var ctor = function () { var k; for (k in src) this[k] = src[k]; };
        ctor.prototype = dst;
        return new ctor();
    };

    (function () {
        'use strict';

        function orc_battle (monsterGens) {
            var monsters = init_monsters(monsterGens, 6);
            var pl   = make(player, { health:  30
                                    , agility: 30
                                    , strength: 30 });
            game_loop(monsters, pl);
        }

        //readline
        var rl = readline.createInterface({
            input:  process.stdin
        ,   output: process.stdout
        });

        //base class for both the player and monsters
        var creature = define_class([], function (x) {
            return slot_exists(x, 'health', "number");
        });

        var player = define_class([creature], function (x) {
            return slot_exists(x, 'agility', "number")
                && slot_exists(x, 'strength', "number");
        });

        var monster = define_class([creature], function (x) {
            return slot_exists(x, 'name', "string");
        });

        var game_loop = define_generic();
        define_method(game_loop, [Array, player], function game_loop (ms, pl) {
            if (dead(pl)) return console.log("you lose");
            if (dead(ms)) return console.log("you win");
            console.log('');
            console.log(show(pl));
            console.log('');
            var attack_count = Math.floor(Math.max(0, pl.agility) / 15) + 1;
            /* ^^^ calculate how many times the player can attack, based on his agility ^^^ */
            return attack(pl, ms, attack_count, function (ms) {
                var pl_new = p.foldl(function (m, pl) {
                    if ( dead(m) ) return pl;
                    return attack(m, pl);
                }, pl, ms);

                return process.nextTick(function () {
                    return game_loop(ms, pl_new);
                });
            });
        });

        var dead = define_generic();
        define_method(dead, [creature], function (p) {
            return p.health <= 0;
        });
        define_method(dead, [Array], function (arr) {
            return p.every(dead, arr);
        });

        var show = define_generic();
        define_method(show, [player], function (pl) {
            var str = "You are valiant knight with a health of "
                    + pl.health
                    + ", an agility of "
                    + pl.agility
                    + ", and a strength of "
                    + pl.strength;
            return str;
        });

        function randval (n) {
            return Math.floor(Math.random()*Math.max(1, n)) + 1;
        }
        function list_random_item (xs) {
            return  xs[Math.floor(Math.random() * xs.length)];
        }
        function random_monster (xs) {
            var m = list_random_item(xs);
            if (dead(m)) return random_monster(xs);
            return m;
        }

        var attack = define_generic();
        //attack player->monster takes a player, monsters, an attack counter, and a continuation.
        //It passes the new monster list to the continuation.
        define_method(attack, [player, Array], function (pl, ms, ctr, cont) {
            if (ctr < 1 || dead(ms)) return cont(ms);
            console.log('==================< ' + ctr +  ' >===================');
            console.log(show(ms));
            rl.question("Attack style: [s]tub [d]ouble swing [r]oundhouse:", interactionHandler(pl, ms, ctr, cont));
            return void 0;
        });

        //this higher order function returning a generic function has a serious performance problem
        //but its way cooler than a switch statement ;X
        var interactionHandler = function (pl, ms, ctr, cont) {
            var dispatch_move = define_generic();
            define_method(dispatch_move, ["s"], function () {
                pick_monster(ms, function (mo) {
                    mo.health = monster_hit(mo, randval(pl.strength >> 1)+2);
                    attack(pl, ms, ctr -1, cont);
                });
            });
            define_method(dispatch_move, ["d"], function () {
                var x = randval(Math.floor(pl.strength / 6));
                console.log("Your double swing has a strength of " + x);
                pick_monster(ms, function (mo1) {
                    mo1.health = monster_hit(mo1, x);
                    if (dead(ms)) return cont(ms);
                    return pick_monster(ms, function (mo2) {
                        mo2.health = monster_hit(mo2, x);
                        return attack(pl, ms, ctr - 1, cont);
                    });
                });
            });
            define_method(dispatch_move, [undefined], function () {
                var f = function (ctr) {
                    if (dead(ms) || ctr < 1) return ;
                    var mo = random_monster(ms);
                    mo.health =  monster_hit(mo, 1);
                    return f(ctr - 1);
                };
                f(1 + randval(Math.floor(pl.strength / 3)));
                return attack(pl, ms, ctr - 1, cont);
            });

            return dispatch_move;
        };


        function pick_monster (ms, cont) {
            rl.question("Monster #:", function (n) {
                var n = parseInt(n);
                if (n < 1 || n > ms.length) {
                    console.log("That is not a valid monster number.");
                    return pick_monster(ms, cont);
                }
                var m = ms[n-1];
                if (dead(m)) {
                    console.log("That monster is already dead.");
                    return pick_monster(ms, cont);
                }
                return cont(m);
            });
        }

        function init_monsters (mgens, n) {
            return p.map(function () { return make(list_random_item(mgens), {health:randval(15)}); }, p.range(0,n));
        }
        define_method(show, [Array], function (ms) {
            var ctr = 1;
            var str = "Your foes:\n";
            p.map(function (mo) {
                if (dead(mo))
                    str += (ctr + ": *dead*\n");
                else {
                    str += (ctr + ": (Health="+mo.health+") " + show(mo) + "\n");
                }
                ctr += 1;
            }, ms);
            return str;
        });
        define_method(show, [monster], function (mo) {
            return "A fierce " + mo.name;
        });

        var monster_hit = define_generic();
        define_method(monster_hit, [monster, "number"], function (mo, dmg) {
            var hp = mo.health - dmg;
            if (hp < 1)
                console.log("You killed the " + mo.name + "!");
            else
                console.log("You hit the " + mo.name + ", knocking off " + dmg + " health points!");
            return hp;
        });

        define_method(attack, [monster, player], function (mo, pl) { return pl; });

        //========== Wicked Orcs ==========//

        var orc = define_class([monster], function (x) {
            x.name = "orc";
            x.club_level = randval(8);
            return true;ne_method(show, [hydra], function () {});
        });

        define_method(show, [orc], function (o) {
            return "    A wicked orc with a level " + o.club_level +" club";
        });
        define_method(attack, [orc, player], function (o, pl) {
            var x = randval(o.club_level);
            console.log("An orc swings his club at you and knocks off " + x + " of your health points.");
            return p.shallow_merge(pl, {health: pl.health - x});
        });

        //========== Malicious Hydras ==========//

        var hydra = define_class([monster], function (x) {
            x.name = "hydra";
            return true;
        });

        define_method(show, [hydra], function (h) {
            return "	A malicious hydra with " + h.health + " heads";
        });

        define_method(monster_hit, [hydra, "number"], function (h, dmg) {
            var hp = h.health - dmg;
            if (hp < 1)
                console.log("The corpse of the fully decapitated and decapacitated hydra falls to the floor");
            else
                console.log("You lop off " + dmg + " of the hydra's heads!");
            return hp;
        });

        define_method(attack, [hydra, player], function (h, pl) {
            var x = randval(h.health >> 1);
            console.log("A hydra attacks you with " + x + " of its heads! It also grows back one more head!");
            h.health += 1;
            return p.shallow_merge(pl, {health: pl.health - x});
        });

        //========== Slime Molds ==========//
        
        var slime_mold = define_class([monster], function (x) {
            x.name = "slime mold";
            x.slimeness = randval(5);
            return true;
        });

        define_method(show, [slime_mold], function (sm) {
            return "	A slime mold with a slimeness of " + sm.slimeness;
        });

        define_method(attack, [slime_mold, player], function (sm, pl) {
            var x = randval(sm.slimeness);
            var h = false;
            console.log("A slime mold wraps around your legs and decreases your agility by " + x + "! ");
            if (Math.floor(Math.random()*2) === 0) {
                console.log("It also squirts in your face, taking away a health point! ");
                h = true;
            }
            return p.shallow_merge(pl, {agility: pl.agility - x, health: h ? pl.health - 1 : pl.health});
        });

        //========== Brigands ==========//
        var brigand = define_class([monster], function (x) {
            x.name = "brigand";
            return true;
        });

        define_method(attack, [brigand, player], function (b, pl) {
            var x = Math.max(pl.health, pl.agility, pl.strength);
            if (x === pl.health) {
                console.log("A brigand hits you with his slingshot, taking off 2 health points!");
                return p.shallow_merge(pl, {health: pl.health - 2});
            }
            if (x === pl.agility) {
                console.log("A brigand catches your leg with his whip, taking off 2 agility points!");
                return p.shallow_merge(pl, {agility: pl.agility - 2});
            }
            if (x === pl.strength) {
                console.log("A brigand cuts your arm with his whip, taking off 2 strength points!");
                return p.shallow_merge(pl, {strength: pl.strength - 2});
            }
            throw "BRIGAND.ATTACK - SHOULD NEVER REACH";
        });

        orc_battle([orc, hydra, slime_mold, brigand]);

    }());
}
