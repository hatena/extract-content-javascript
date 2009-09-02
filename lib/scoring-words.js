if (typeof Scoring == 'undefined') {
    var Scoring = {};
}

(function(ns) {
    var Util = {
        inherit: function(child,parent) {
            var obj = child || {};
            for (var prop in parent) {
                if (typeof obj[prop] == 'undefined') {
                    obj[prop] = parent[prop];
                }
            }
            return obj;
        },
        countMatch: function(text, regex) {
            return text.split(regex).length - 1;
            //             var n=0;
            //             for (var i=0;;) {
            //                 i = text.search(regex);
            //                 if (i < 0) break;
            //                 n++;
            //                 text = text.substr(i+1);
            //             }
            //             return n;
        },
        dump: function(obj) {
            if (typeof obj == 'undefined')  return 'undefined';
            if (typeof obj == 'string') return '"' + obj + '"';
            if (typeof obj != 'object') return ''+obj;
            if (obj === null) return 'null';
            if (obj instanceof Array) {
                return '['
                    + obj.map(function(v){return 'obj'/*Util.dump(v)*/;}).join(',')
                    + ']';
            } else {
                var arr = [];
                for (var prop in obj) {
                    arr.push(prop + ':' + 'obj'/*Util.dump(obj[prop])*/);
                }
                return '{' + arr.join(',') + '}';
            }
        }
    };

    var A = {
        indexOf: Array.indexOf || function(self, elt/*, from*/) {
            var argi = 2;
            var len = self.length;
            var from = Number(arguments[argi++]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0) from += len;
            for (; from < len; from++) {
                if (from in self && self[from] === elt) return from;
            }
            return -1;
        },
        filter: Array.filter || function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != "function") {
                throw new TypeError('A.filter: not a function');
            }
            var rv = new Array();
            var thisp = arguments[argi++];
            for (var i = 0; i < len; i++) {
                if (i in self) {
                    var val = self[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, self)) rv.push(val);
                }
            }
            return rv;
        },
        forEach: Array.forEach ||  function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != 'function') {
                throw new TypeError('A.forEach: not a function');
            }
            var thisp = arguments[argi++];
            for (var i=0; i < len; i++) {
                if (i in self) fun.call(thisp, self[i], i, self);
            }
        },
        every: Array.every || function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != 'function') {
                throw new TypeError('A.every: not a function');
            }
            var thisp = arguments[argi++];
            for (var i = 0; i < len; i++) {
                if (i in self &&
                    !fun.call(thisp, self[i], i, self)) {
                    return false;
                }
            }
            return true;
        },
        map: Array.map || function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != 'function') {
                throw new TypeError('A.map: not a function');
            }
            var rv = new Array(len);
            var thisp = arguments[argi++];
            for (var i = 0; i < len; i++) {
                if (i in self) {
                    rv[i] = fun.call(thisp, self[i], i, self);
                }
            }
            return rv;
        },
        some: Array.some || function(self, fun/*, thisp*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != "function") {
                throw new TypeError('A.some: not a function');
            }
            var thisp = arguments[argi++];
            for (var i = 0; i < len; i++) {
                if (i in self &&
                    fun.call(thisp, self[i], i, self)) {
                    return true;
                }
            }
            return false;
        },
        reduce: Array.reduce || function(self, fun/*, initial*/) {
            var argi = 2;
            var len = self.length;
            if (typeof fun != 'function') {
                throw TypeError('A.reduce: not a function ');
            }
            var i = 0;
            var prev;
            if (arguments.length > argi) {
                var rv = arguments[argi++];
            } else {
                do {
                    if (i in self) {
                        rv = self[i++];
                        break;
                    }
                    if (++i >= len) {
                        throw new TypeError('A.reduce: empty array');
                    }
                } while (true);
            }
            for (; i < len; i++) {
                if (i in self) rv = fun.call(null, rv, self[i], i, self);
            }
            return rv;
        },
        zip: function(self) {
            if (self[0] instanceof Array) {
                var l = self[0].length;
                var len = self.length;
                var z = new Array(l);
                for (var i=0; i < l; i++) {
                    z[i] = [];
                    for (var j=0; j < len; j++) {
                        z[i].push(self[j][i]);
                    }
                }
                return z;
            }
            return [];
        },
        first: function(self) {
            return self ? self[0] : null;
        },
        last: function(self) {
            return self ? self[self.length-1] : null;
        },
        push: function(self, other) {
            return Array.prototype.push.apply(self, other);
        }
    };

    ns.RelativeWords = function(/* engines */) {
        var self = { engine: arguments[0] || [] };

        self.factory = {
            getEngine: function(name) {
                if (typeof ns.RelativeWords.Engine != 'undefined') {
                    return new ns.RelativeWords.Engine[name];
                }
            }
        };

        self.addEngine = function(engine) {
            if (typeof engine != 'undefined') {
                self.engine.push(engine);
            }
            return self;
        };

        self.top = function(doc, words) {
            var scores = {};
            for (var t in words) scores[t] = { score: 0, df: words[t] };
            self.engine.forEach(function(e){ e.vote(doc, scores); });

            var result = [];
            for (var t in scores) {
                result.push({ word: t, score: scores[t].score });
            }
            result.sort(function(a,b){ return b.score-a.score; });

            return result;
        };

        return self;
    };

    ns.RelativeWords.Engine = {};

    ns.RelativeWords.Engine.TfIdf = function() {
        var opt = arguments[0] || {};
        var self = { weight: opt.weight || 0.3 };

        self.vote = function(doc, words) {
            var total = 0;
            var max = 0;
            var scores = {};
            for (var t in words) total += words[t].df;
            for (var t in words) {
                var df = words[t].df;
                if (!df) continue;

                var idf = Math.log(total/df);

                var tf = 0;
                var w = t.toLowerCase();
                tf += Util.countMatch(doc.content.asText().toLowerCase(), w);
                if (doc.title) {
                    tf += Util.countMatch(doc.title.toLowerCase(), w);
                }

                scores[t] = tf/idf;
                if (scores[t] > max) max = scores[t];
            }
            if (!max) return;
            for (var t in words) {
                var score = scores[t] / max; // normalize
                words[t].score += score * self.weight;
            }
        };

        return self;
    };
})(Scoring);
