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
                return null;
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
            A.forEach(self.engine, function(e){ e.vote(doc, scores); });

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
        var opt = arguments[0] || {
            limit: {
                text: 32768
            }
        };
        var self = { weight: opt.weight || 0.4 };

        self.vote = function(doc, words) {
            var total = 0;
            var max = 0;
            var scores = {};
            var content = (doc.content+'').substr(0, opt.limit.text);
            content = content.toLowerCase();
            var title = (doc.title||'').toLowerCase();
            var url = (doc.url||'').toLowerCase();
            for (var t in words) total += words[t].df;
            for (var t in words) {
                var df = words[t].df;
                if (!df) continue;

                var idf = Math.log(total/df);

                var tf = 0;
                var w = t.toLowerCase();
                tf += Util.countMatchTokenized(content, w);
                tf += Util.countMatchTokenized(title, w);
//                 tf += Util.countMatchTokenized(url, w);

                scores[t] = tf/idf;
                if (scores[t] > max) max = scores[t];
            }
            if (!max) return;
            for (var t in scores) {
                var score = scores[t] / max; // normalize
                words[t].score += score * self.weight;
            }
        };

        return self;
    };

    ns.RelativeWords.Engine.ContentPosition = function() {
        var opt = arguments[0] || {
            limit: {
                text: 32768
            }
        };
        var self = { weight: opt.weight || 0.1 };

        self.vote = function(doc, words) {
            var max = 0;
            var scores = {};
            var content = (doc.content+'').substr(0, opt.limit.text);
            content = content.toLowerCase();
            for (var t in words) {
                var w = t.toLowerCase();
                var index = Util.indexOfTokenized(content, w);
                if (index >= 0) {
                    scores[t] = scores[t] || 0;
                    scores[t] += 1.0 / (index+1);
                    if (max < scores[t]) max = scores[t];
                }
            }
            if (!max) return;
            for (var t in scores) {
                var score = scores[t] / max; // normalize
                words[t].score += score * self.weight;
            }
        };

        return self;
    };

    ns.RelativeWords.Engine.TitlePosition = function() {
        var opt = arguments[0] || {
            limit: {
                text: 32768
            }
        };
        var self = {
            weight: {
                global: (opt.weight && opt.weight.global) || 0.4,
                title: (opt.weight && opt.weight.title) || 0.35
            }
        };

        self.vote = function(doc, words) {
            var max = 0;
            var scores = {};
            var title = (doc.title||'').toLowerCase();
            for (var t in words) {
                var w = t.toLowerCase();
                var index = Util.indexOfTokenized(title, w);
                if (index >= 0) {
                    scores[t] = 1 + self.weight.title / (1+Math.log(index+1));
                    if (max < scores[t]) max = scores[t];
                }
            }
            if (!max) return;
            for (var t in scores) {
                var score = scores[t] / max; // normalize
                words[t].score += score * self.weight.global;
            }
        };

        return self;
    };

    ns.suggestTags = function(url, title, body, tags) {
        var sc = new ns.RelativeWords();
        sc.addEngine( sc.factory.getEngine('TfIdf') );
        sc.addEngine( sc.factory.getEngine('ContentPosition') );
        sc.addEngine( sc.factory.getEngine('TitlePosition') );
        return sc.top({ url: url, title: title, content: body }, tags);
    };

    ns.suggestTagsForDocument = function(d, tags) {
        if (!d.body) return null;

        var ex = new ns.LayeredExtractor();
//         ex.addHandler( ex.factory.getHandler('Description') );
//         ex.addHandler( ex.factory.getHandler('Scraper'));
//         ex.addHandler( ex.factory.getHandler('GoogleAdsence') );
        ex.addHandler( ex.factory.getHandler('Heuristics') );
        var res = ex.extract(d);

        if (!res.isSuccess) return null;

        return ns.suggestTags(res.url, res.title, res.content, tags);
    };
})(ExtractContentJS);

