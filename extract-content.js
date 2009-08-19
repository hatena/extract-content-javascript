var extractContent = function(d) {
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
        },
        matchCount: function(text, regex) {
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
        matchCountTagAttr: function(node, tag, attr, regexs) {
            var test = function(v){ return v.test(node[attr]); };
            if ((node.tagName||'').toLowerCase() == tag && regexs.some(test)) {
                return 1;
            }
            var n=0;
            var children = node.childNodes;
            for (var i=0, len=children.length; i < len; i++) {
                n += Util.matchCountTagAttr(children[i], tag, attr, regexs);
            }
            return n;
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
    A.push = function(self, other) {
        return Array.prototype.push.apply(self, other);
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
            var a1 = DOM.ancestors(e1).reverse();
            var a2 = DOM.ancestors(e2).reverse();
            var r = null;
            for (var i=0; a1[i] && a2[i] && a1[i] == a2[i]; i++) {
                r = a1[i];
            }
            return r;
        },
        tagMatch: function(node, regexs) {
            return regexs.some(function(v){
                return v == (node.tagName||'').toLowerCase();
            });
        }
    };

    var LayeredExtractor = function() {
    };

    var Heuristics = function(/*option, pattern*/) {
        var self = {
            content: [],
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
                waste: [
                        /Copyright|All\s*Rights?\s*Reserved?/i
                ],
                affiliate: [
                    /amazon[a-z0-9\.\/\-\?&]+-22/i
                ],
                list: [ 'ul', 'dl', 'ol' ],
                li:   [ 'li', 'dd' ],
                a:    [ 'a' ],
                form: [ 'form' ],
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
                punctuations: /[。、．，！？]|\.[^A-Za-z0-9]|,[^0-9]|!|\?/
            })
        };

        var Block = Util.inherit(function(nodes) {
            var block = { nodes: nodes };

            // TODO: eliminate_useless_symbols
            // TODO: eliminate_useless_tags
            block.eliminateLinks = function() {
                var hasHref = function(node) {
                    if (node.href) return true;
                    var children = node.childNodes;
                    var len = children.length;
                    for (var i=0; i < len; i++) {
                        if (hasHref(children[i])) return true;
                    }
                    return false;
                };
                var st = { // statistics
                    noLinkText: '', // does not contain links and forms
                    listTextLength: 0,
                    noListTextLength: 0,
                    listCount: 0,
                    linkListCount: 0
                };
                var rec = function(node, insideList, insideLink, insideForm) {
                    insideList = insideList||DOM.tagMatch(node, self.pat.list);
                    var listItem = DOM.tagMatch(node, self.pat.li);
                    var linkItem = DOM.tagMatch(node, self.pat.a);
                    var formItem = DOM.tagMatch(node, self.pat.form);
                    insideLink = insideLink||linkItem;
                    insideForm = insideForm||formItem;

                    if (listItem) {
                        st.listCount++;
                        if (hasHref(node)) {
                            st.linkListCount++;
                        }
                    } else if (linkItem) {
                        st.linkCount++;
                    }

                    var children = node.childNodes;
                    var len = children.length;
                    if (!len) { // leaf
                        var t = node.textContent || '';
                        var l = t.length;
                        if (!insideLink && !insideForm) {
                            st.noLinkText += t;
                        }
                        if (insideList) {
                            st.listTextLength += l;
                        } else {
                            st.noListTextLength += l;
                        }
                        return;
                    }

                    for (var i=0; i < len; i++) {
                        rec(children[i], insideList, insideLink, insideForm);
                    }
                };

                block.nodes.forEach(function(v){
                    rec(v, false, false, false);
                });

                    var nolinklen = st.noLinkText.length;
                    var links = st.linkCount;
                    var listlen = st.listTextLength;
                    if (nolinklen < self.opt.minNoLink * links) {
                        return '';
                    }

                    // isLinklist
                    var rate = st.linkListCount / (st.listCount || 1);
                    rate *= rate;
                    var limit = self.opt.noListRatio * rate * listlen;
                    if (nolinklen < limit) {
                        return '';
                    }

                return st.noLinkText;
            };
            block.noBodyRate = function() {
                var val=0;

                val += block.nodes.reduce(function(prev, curr) {
                    return prev + Util.matchCountTagAttr(curr, 'a', 'href',
                                                         self.pat.affiliate);
                }, 0);
                val /= 2.0;

                val += self.pat.waste.reduce(function(prev,curr) {
                    return prev + Util.matchCount(block._nolink, curr);
                }, 0);

                return val;
            };

            block.calcScore = function(factor, continuous) {
                // ignore link list block
                block._nolink = block.eliminateLinks();

                var c = block._nolink.length;
                c += + Util.matchCount(block._nolink, self.pat.punctuations);
                c *= self.opt.punctuationWeight * factor;

                // anti-scoring factors
                var noBodyRate = block.noBodyRate();

                // scores
                c *= Math.pow(self.opt.factor.noBody, noBodyRate);
                block._c = block.score = c;
                block._c1 = c * continuous;
                return c;
            };

            block.isAccepted = function() {
                return block._c > self.opt.threshold;
            };

            block.isContinuous = function() {
                return block._c1 > self.opt.threshold;
            };

            block.merge = function(other) {
                block.score += other._c1;
                A.push(block.nodes, other.nodes);
                return block;
            };

            return block;
        }, {
            split: function(node) {
                var r = [];
                var buf = [];

                var flush = function(flag) {
                    if (flag && buf.length) {
                        r.push(new Block(buf));
                        buf = [];
                    }
                };

                var rec = function(node) { // depth-first recursion
                    var children = node.childNodes;
                    var sep = self.pat.sep;
                    var len = children.length;
                    for (var i=0; i < len; i++) {
                        var c = children[i];
                        var f = DOM.tagMatch(c, sep);
                        flush(f);
                        rec(c, r, buf);
                        flush(f);
                    }
                    if (!len) buf.push(node);
                    return r;
                };

                rec(node);
                flush(true);

                return r;
            }
        });

        self.extract = function(d) {
            var isNoContent = function(v){
                return d.getElementsByTagName(v).length != 0;
            };
            if (A.some(self.pat.noContent, isNoContent)) return self;

            var factor = 1.0;
            var continuous = 1.0;
            var score = 0;

            var res = [];
            var blocks = Block.split(d.body);
            var last;

            alert(blocks.length);
            for (var i=0, len=blocks.length; i < len; i++) {
                var block = blocks[i];
                if (last) {
                    continuous /= self.opt.factor.continuous;
                }

                // score
                block.calcScore(factor, continuous);
                factor *= self.opt.factor.decay;

                // clustor scoring
                if (block.isAccepted()) {
                    if (block.isContinuous() && last) {
                        last.merge(block);
                    } else {
                        last = block;
                        res.push(block);
                    }
                    continuous = self.opt.factor.continuous;
                } else { // rejected
                    if (!last) {
                        // do not decay if no block is pushed
                        factor = 1.0
                    }
                }
            }

            var best=A.first(res.sort(function(a,b){return b.score-a.score;}));
            if (best) self.content = best.nodes;

            return self;
        };

        self.asNode = function() {
            return self.content.reduce(function(prev,curr) {
                return DOM.commonAncestor(prev,curr);
            });
        };

        self.asNodeArray = function() {
            return self.content;
        };

        self.asText = function() {
            return self.content.reduce(function(prev,curr) {
                return prev + curr.textContent;
            }, '');
        };

        return self;
    };

    var extractor = new Heuristics();

//     return d.createTextNode(extractor.extract(d).asText());

//     var node = extractor.extract(d).asNode();
//     alert(node.tagName);
//     return node.cloneNode(true);

    return d.createTextNode(extractor.extract(d).asNodeArray().map(function(v){
        return v.tagName||v.textContent||'';
    }).join(', '));

//     var e1 = d.getElementsByTagName('h1')[0];
//     var e2 = d.getElementsByTagName('h1')[0];
//     var e = DOM.commonAncestor(e1,e2);
//     alert(e);

    // test
//     var e = d.createElement('a');
//     e.href = 'http://orezdnu.org/';
//     var text = d.createTextNode('orezdnu.org');
//     e.appendChild(text);

//     return e;
};
