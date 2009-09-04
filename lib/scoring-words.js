if (typeof ExtractContentJS == 'undefined') {
    var ExtractContentJS = {};
}

(function(ns) {
    var Util = ns.Lib.Util;
    var A = ns.Lib.A;

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
                if (scores[t].score) {
                    result.push({ word: t, score: scores[t].score });
                }
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
                tf += Util.countMatch((doc.content+'').toLowerCase(), w);
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
})(ExtractContentJS);

