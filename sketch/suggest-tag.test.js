(function() {
    var url = 'http://labs.orezdnu.org/js/extract-content/'; // for test
    var libs = [
        [ 'lib.js', [
            'ExtractContentJS.Lib.Util',
            'ExtractContentJS.Lib.A',
            'ExtractContentJS.Lib.DOM'
        ] ],
        [ 'extract-content.js', 'ExtractContentJS.LayeredExtractor' ],
        [ 'scoring-words.js', 'ExtractContentJS.RelativeWords' ]
    ];
    var testFunc = function(l) {
        var Util = ExtractContentJS.Lib.Util;
        var A = ExtractContentJS.Lib.A;
        var DOM = ExtractContentJS.Lib.DOM;

        if (typeof l.SuggestTagTest == 'undefined') {
            var SuggestTagTest = {};
        }
        var debug = l.SuggestTagTest.debug;

        l.SuggestTagTest.suggestTags = function(d, tags) {
            if (!d.body) return null;

            var ex = new ExtractContentJS.LayeredExtractor;
//             ex.addHandler( ex.factory.getHandler('Description') );
//             ex.addHandler( ex.factory.getHandler('Scraper'));
//             ex.addHandler( ex.factory.getHandler('GoogleAdsence') );
            ex.addHandler( ex.factory.getHandler('Heuristics') );
            var res = ex.extract(d);

            if (!res.isSuccess) return null;

            var sc = new ExtractContentJS.RelativeWords();
            sc.addEngine( sc.factory.getEngine('TfIdf') );
            /* FIXME: other engines */

            return sc.top(res, tags);
        };

        l.SuggestTagTest.doTest = function() {
            var limit = l.SuggestTagTest.limit || 5;
            var tags = l.SuggestTagTest.data || {
                '2008': 1,
                '2009': 5,
                'algorithm': 5,
                'anime': 2,
                'art': 2,
                'book': 9,
                'browser': 1,
                'color': 1,
                'comic': 4,
                'communication': 1,
                'compiler': 2,
                'conference': 1,
                'continuation': 1,
                'copyright': 2,
                'coq': 2,
                'cpan': 2,
                'cpp': 20,
                'css': 2,
                'cv': 1,
                'ddns': 4,
                'debian': 10,
                'debug': 6,
                'design': 2,
                'diy': 2,
                'dom': 3,
                'education': 7,
                'emacs': 15,
                'english': 4,
                'firefox': 14,
                'flash': 4,
                'font': 10,
                'gadget': 1,
                'git': 4,
                'gnuplot': 1,
                'graph': 1,
                'gui': 1,
                'hardware': 3,
                'haskell': 1,
                'hatena': 23,
                'haxe': 1,
                'html': 1,
                'ie': 1,
                'illusion': 1,
                'illustrator': 2,
                'image': 4,
                'javascript': 33,
                'javascrpit': 1,
                'keyboard': 1,
                'kurobox': 10,
                'language': 18,
                'lecture': 1,
                'library': 3,
                'life': 14,
                'linux': 25,
                'lisp': 2,
                'local': 1,
                'logic': 3,
                'mail': 2,
                'math': 6,
                'mobile': 1,
                'monad': 1,
                'music': 4,
                'mywork': 7,
                'neta': 66,
                'network': 8,
                'nlp': 3,
                'ocaml': 3,
                'paper': 6,
                'pdf': 8,
                'perl': 23,
                'photo': 2,
                'photoshop': 1,
                'plugin': 1,
                'postfix': 1,
                'presentation': 6,
                'programming': 22,
                'proof': 2,
                'puzzle': 1,
                'reference': 15,
                'research': 13,
                'rfc': 3,
                'ruby': 14,
                'science': 3,
                'security': 4,
                'sed': 1,
                'server': 3,
                'sf': 2,
                'shop': 3,
                'skk': 4,
                'smb': 2,
                'sound': 2,
                'ssh': 7,
                'ssl': 1,
                'standard': 3,
                'stl': 1,
                'template': 2,
                'test': 3,
                'tex': 7,
                'thrift': 1,
                'tips': 9,
                'tutorial': 6,
                'twist': 1,
                'typeset': 1,
                'ugomemo': 2,
                'ui': 2,
                'unicode': 4,
                'vfx': 4,
                'vim': 5,
                'vimperator': 7,
                'viper': 1,
                'virus': 2,
                'vpn': 1,
                'web': 16,
                'windows': 14,
                'workshop': 4,
                'xml': 3,
                'zsh': 5
            };
            var suggested = l.SuggestTagTest.suggestTags(document, tags);
            if (!suggested) return;

            var d = document;
            var ul = d.createElement('ul');
            var len = suggested.length;
            if (len > limit) len = limit;
            for (var i=0; i<len; i++) {
                var li = d.createElement('li');
                var t = suggested[i];
                li.appendChild(d.createTextNode(t.word+' ('+t.score+')'));
                ul.appendChild(li);
            }
            d.body.appendChild(ul);
        };

        if (l.SuggestTagTest.auto) {
            l.SuggestTagTest.doTest();
        }
    };

    /* library loader */

    var A = {
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
        }
    };

    var Libs = function(/*[url,] context*/) {
        var i = 0;
        var self = {
            url: (typeof arguments[i]=='string' && arguments[i++]) || '',
            l: arguments[i] || (function(){return this;}).apply(null)
        };

        self.load = function(src/*, cache*/) {
            tag = document.createElement('script');
            tag.type = 'text/javascript';
            var del = src.match(/\?/) ? '&' : '?';
            tag.src = arguments[1] ? src : src + del + encodeURI(new Date());
            document.getElementsByTagName('head')[0].appendChild(tag);
        };

        self.loadEach = function(/*[dir,] arr, callback, cache*/) {
            var i=0;
            var dir = (typeof arguments[i]=='string' && arguments[i++])
                || self.url;
            var arr = arguments[i++];
            var f = arguments[i++] || function(){};
            if (!arr.length) { f(self.l); return; }
            var cache = arguments[i++];
            var [script, cond] = arr.shift();
            self.load(dir + script, cache);
            self.wait(cond instanceof Array ? cond : [cond],
                      function(){self.loadEach(dir,arr,f,cache)});
        };

        self.wait = function(conds, callback/*, timeout*/) {
            var t = arguments[2] || 100;
            self._wait(conds, callback, self.l, t, 0);
        };

        self._wait = function(conds, callback, l, tt, t) {
            var f = function(v) {
                var r = function(p,c){return p && p[c];};
                return typeof v=='function'
                    ? v(l) : A.reduce(v.split('.'), r,l);
            };
            if (conds.every(f)) {
                callback(l);
            } else if (t++ < tt) {
                var next = function(){self._wait(conds,callback,l,tt,t);};
                window.setTimeout(next, 100);
            } else {
                var reason = A.filter(conds, function(item){return !f(item);});
                throw('Libs.wait: timeout - ' + reason.toString() + ' failed');
            }
        };

        return self;
    };

    new Libs(url, null).loadEach(libs, testFunc);
})();
