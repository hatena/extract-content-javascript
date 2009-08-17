extractContent = function(d) {
    if (!d.body) return null;

    var Util = {
        inherit: function(child,parent) {
            var obj = child || {};
            for (var prop in parent) {
                if (typeof(obj[prop] == 'undefined')) {
                    obj[prop] = parent[prop];
                }
            }
            return obj;
        }
    };
    var A = {};
    A.indexOf = Array.indexOf || function(self, elt/*, from*/) {
        var argi = 1;
        var len = self.length;
        var from = Number(arguments[argi++]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) from += len;
        for (; from < len; from++) {
            if (from in self && self[from] === elt) return from;
        }
        return -1;
    };
    A.filter = Array.filter || function(self, fun/*, thisp*/) {
        var argi = 1;
        var len = self.length;
        if (typeof fun != "function") {
            throw new TypeError('Array.prototype.filter: not a function');
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
    };
    A.forEach = Array.forEach ||  function(self, fun/*, thisp*/) {
        var argi = 1;
        var len = self.length;
        if (typeof fun != 'function') {
            throw new TypeError('Array.prototype.forEach: not a function');
        }
        var thisp = arguments[argi++];
        for (var i=0; i < len; i++) {
            if (i in self) fun.call(thisp, self[i], i, self);
        }
    };
    A.every = Array.every || function(self, fun/*, thisp*/) {
        var argi = 1;
        var len = self.length;
        if (typeof fun != 'function') {
            throw new TypeError('Array.prototype.every: not a function');
        }
        var thisp = arguments[argi++];
        for (var i = 0; i < len; i++) {
            if (i in self &&
                !fun.call(thisp, self[i], i, self)) {
                return false;
            }
        }
        return true;
    };
    A.map = Array.map || function(self, fun/*, thisp*/) {
        var argi = 1;
        var len = self.length;
        if (typeof fun != 'function') {
            throw new TypeError('Array.prototype.map: not a function');
        }
        var rv = new Array(len);
        var thisp = arguments[argi++];
        for (var i = 0; i < len; i++) {
            if (i in self) {
                rv[i] = fun.call(thisp, self[i], i, self);
            }
        }
        return rv;
    };
    A.some = Array.some || function(self, fun/*, thisp*/) {
        var argi = 1;
        var len = self.length;
        if (typeof fun != "function") {
            throw new TypeError('Array.prototype.some: not a function');
        }
        var thisp = arguments[argi++];
        for (var i = 0; i < len; i++) {
            if (i in self &&
                fun.call(thisp, self[i], i, self)) {
                return true;
            }
        }
        return false;
    };
    A.reduce = Array.reduce || function(self, fun/*, initial*/) {
        var argi = 1;
        var len = self.length;
        if (typeof fun != 'function') {
            throw TypeError('Array.prototype.reduce: not a function ');
        }
        var i = 0;
        var prev;
        if (arguments.length >= argi+2) {
            var rv = arguments[argi++];
        } else {
            do {
                if (i in self) {
                    rv = self[i++];
                    break;
                }
                if (++i >= len) {
                    throw new TypeError('Array.prototype.reduce: empty array');
                }
            } while (true);
        }
        for (; i < len; i++) {
            if (i in self) rv = fun.call(null, rv, self[i], i, self);
        }
        return rv;
    };
    A.first = function(self) {
        return self ? self[0] : null;
    };
    A.last = function(self) {
        return self ? self[self.length-1] : null;
    };

    var DOM = {
        ancestors: function(e) {
            var body = e.ownerDocument.body;
            var r = [];
            var it = e;
            while (it != body) {
                r.push(it);
                it = it.parentNode;
            }
            r.push(body);
            return r; // [e .. document.body]
        },
        commonAncestor: function(e1, e2) {
            var a1 = Util.ancestors(e1).reverse();
            var a2 = Util.ancestors(e2).reverse();
            var r = null;
            for (var i=0; a1[i] && a2[i] && a1[i] == a2[i]; i++) {
                r = a1[i];
            }
            return r;
        },
    };

    var LayeredExtractor = function() {
    };

    var Heuristics = function(/*opt, pattern*/) {
        var self = {
            opt: Util.inherit(arguments[0], {
                threshold: 60,
                minLength: 30,
                factor: {
                    decay:      0.75,
                    noBody:     0.72,
                    continuous: 1.62
                },
                punctuationWeight: 10,
                minNoLink: 8,
                noListRatio: 0.2,
                debug: 0
            }),
            pat: Util.inherit(arguments[1], {
                sep: [ 'div', 'center', 'td' ],
                waste: /Copyright|All\s*Rights?\s*Reserved?/i,
                affiliate: /amazon[a-z0-9\.\/\-\?&]+-22/i,
                noContent: [ 'frameset' ],
                ignore: [
                    'script',
                    'style',
                    'select',
                    'noscript',
                    [ 'div', {
                        'id': [ 'more', 'menu', 'side', 'navi' ],
                        'class': [ 'more', 'menu', 'side', 'navi' ]
                    } ]
                ],
            })
        };

        var Block = Util.inherit(function(parent, nodes) {
            var block = { parent: parent, nodes: nodes };
            block.isLinkList = function() {
                /* TODO */
            };
            block.score = function(factor, continuous) {
                /* TODO */
            };
            return block;
        }, {
            split: function(node, sep) {
                var r = [];
                var buf = [];
                var flush = function() {
                    if(buf.length) {
                        r.push(new Block(node, buf));
                        buf = [];
                    }
                };
                var children = node.childNodes;
                for (var i=0, len=children.length; i < len; i++) {
                    var c = children[i];
                    if (A.some(sep,function(v){return v==c.tagName;})) {
                        flush();
                        var rec = Block.split(c);
                        if (rec.length) {
                            Array.prototype.push.apply(r, rec);
                        }
                    } else {
                        buf.push(c);
                    }
                }
                flush();
                return r;
            }
        });

        self.extract = function(d) {
            if (A.some(self.pat.noContent, function(v){
                return d.getElementsByTagName(v).length != 0;
            })) {
                return;
            }

            var factor = 1.0;
            var continuous = 1.0;
            var score = 0;
            // eliminate_useless_symbols
            // eliminate_useless_tags

            var result = [];
            var blocks = Block.split(d.body);

            for (var i=0, len=blocks.length; i < len; i++) {
                var block = blocks[i];
                if (body) continuous /= self.opt.factor.continuous; // FIXME

                // ignore link list block
                if (block.isLinklist()) continue;

                // score
                var c = block.score(factor, continuous);
                factor *= self.opt.factor.decay;

                // clustor scoring
                if (block.isContinuous) {
                    // FIXME: flag?
                    var last = A.last(result);
                    if (last) {
                        last.merge(block);
                    } else {
                        result.push(block);
                    }
                    continuous = self.opt.factor.continuous;
                } else if (block.isAccepted()) {
                    // FIXME: flag?
                } else { // rejected
                }
            }
        };

        return self;
    };

    var e1 = d.getElementsByTagName('h1')[0];
    var e2 = d.getElementsByTagName('h1')[0];
    var e = DOM.commonAncestor(e1,e2);
    alert(e);

    // test
//     var e = d.createElement('a');
//     e.href = 'http://orezdnu.org/';
//     var text = d.createTextNode('orezdnu.org');
//     e.appendChild(text);
    return e;
};
