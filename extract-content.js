var extractContent = function(d) {
    if (!d.body) return null;

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
    A.zip = function(self) {
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
        getElementStyle: function(elem, prop) {
            var style = elem.style ? elem.style[prop] : null;
            if (!style) {
                var dv = document.defaultView;
                if (dv && dv.getComputedStyle) {
                    try {
                        var styles = dv.getComputedStyle(elem, null);
                    } catch(e) {
                        return null;
                    }
                    prop = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                    style = styles ? styles.getPropertyValue(prop) : null;
                } else if (elem.currentStyle) {
                    style = elem.currentStyle[prop];
                }
            }
            return style;
         },
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
        countMatchTagAttr: function(node, tag, attr, regexs) {
            var test = function(v){ return v.test(node[attr]); };
            if ((node.tagName||'').toLowerCase()==tag && A.some(regexs,test)) {
                return 1;
            }
            var n=0;
            var children = node.childNodes;
            for (var i=0, len=children.length; i < len; i++) {
                n += DOM.countMatchTagAttr(children[i], tag, attr, regexs);
            }
            return n;
        },
        matchTag: function(node, pat) {
            return A.some(pat, function(v){
                if (typeof v == 'string') {
                    return v == (node.tagName||'').toLowerCase();
                } else if (v instanceof Array) {
                    return v[0] == (node.tagName||'').toLowerCase()
                        && DOM.matchAttr(node, v[1]);
                } else {
                    return false;
                }
            });
        },
        matchAttr: function(node, pat) {
            var test = function(pat, val) {
                if (typeof pat == 'string') {
                    return pat == val;
                } else if (pat instanceof RegExp) {
                    return pat.test(val);
                } else if (pat instanceof Array) {
                    return A.some(pat,function(v){return test(v,val);});
                } else if (pat instanceof Object) {
                    for (var prop in pat) {
                        var n = node[prop];
                        if (n && DOM.matchAttr(n, pat[prop])) {
                            return true;
                        }
                    }
                }
                return false;
            };
            for (var prop in pat) {
                var attr = node[prop];
                var ar = pat[prop];
                if (attr) {
                    return test(ar, attr);
                }
            }
            return false;
        },
        matchStyle: function(node, pat) {
            var test = function(pat, val) {
                if (typeof pat == 'string') {
                    return pat == val;
                } else if (pat instanceof RegExp) {
                    return pat.test(val);
                } else if (pat instanceof Array) {
                    return A.some(pat,function(v){return test(v,val);});
                }
                return false;
            };
            for (var prop in pat) {
                if (test(pat[prop], DOM.getElementStyle(node, prop))) {
                    return true;
                }
            }
            return false;
        }
    };

    var Leaf = Util.inherit(function(node, depth, inside) {
        var leaf = { node: node, depth: depth, inside: inside };

        leaf.statistics = function() {
            var t = (node.textContent || '').replace(/\s+/g, ' ');
            var l = t.length;
            return {
                text: t,
                noLinkText: (inside.link || inside.form) ? '' : t,
                listTextLength: inside.list ? l : 0,
                noListTextLength: inside.list ? 0 : l,
                linkCount: inside.link ? 1 : 0,
                listCount: inside.li ? 1 : 0,
                linkListCount: (inside.li && inside.link) ? 1 : 0
            };
        };

        return leaf;
    }, {
        commonAncestor: function(/* leaves */) {
            var ar = A.map(arguments, function(v){ return v.node; });
            if (ar.length < 2) {
                return ar[0];
            }
            return A.reduce(ar, function(prev, curr) {
                return DOM.commonAncestor(prev, curr);
            });
        },
        mergeStatistics: function(a, b) {
            var r = {};
            for (var prop in a) {
                r[prop] = a[prop] + b[prop];
            }
            return r;
        }
    });

    var Content = function(c) {
        var self = { _content: c };

        self.asLeaves = function(){ return self._content; };
        self.asNode = function() {
            alert('asNode1');
            if (self._node) return self._node;
            alert('asNode2');
            self._node = Leaf.commonAncestor.apply(null, self._content);
            alert('asNode3');
            return self._node;
        };
        self.asText = function() {
            if (self._text) return self._text;
            if (self._content.length < 1) return '';
            self._text = A.reduce(self._content, function(prev,curr) {
                var s = curr.node.textContent;
                s = s.replace(/^\s+/g,'').replace(/\s+$/g,'');
                s = s.replace(/\s+/g,' ');
                return prev + s;
            }, '');
            return self._text;
        };

        return self;
    };

    var LayeredExtractor = function(/* handler, filter */) {
        var self = { handler: arguments[0] || [], filter: arguments[1] || {} };

        self.addHandler = function(handler) {
            self.handler.push(handler);
            return self;
        };

        self.filterFor = function(url) {
            // TODO
        };

        self.extract = function(d) {
            var url = d.location.href;
            var res = { title: d.title };
            for (var i=0, len=self.handler.length; i < len; i++) {
                var content = self.handler[i].extract(d, url, res);
                if (!content) continue;

                var f = self.filterFor(url);
                if (f) {
                    content = f.filter(content);
                }

                content = new Content(content);
                if (!content.asText().length) continue;
                res.content = content;
                res.isSuccess = true;
                res.engine = res.engine || self.handler[i];
                break;
            }
            return res;
        };

        return self;
    };

    var Heuristics = function(/*option, pattern*/) {
        var self = {
            content: [],
            opt: Util.inherit(arguments[0], {
                threshold: 60,
                minLength: 30,
                factor: {
                    decay:      0.90,
                    noBody:     0.72,
                    continuous: 1.62
                },
                punctuationWeight: 10,
                minNoLink: 8,
                noListRatio: 0.2,
                debug: false
            }),
            pat: Util.inherit(arguments[1], {
                sep: [
                    'div', 'center', 'td',
                    'h1', 'h2'
                     ],
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
                    'iframe',
                    'img',
                    'script',
                    'style',
                    'select',
                    'noscript',
                    [ 'div', {
                        id: [ /more/, /menu/, /side/, /navi/ ],
                        className: [ /more/, /menu/, /side/, /navi/ ]
                    } ]
                ],
                ignoreStyle: {
                    display: 'none',
                    visibility: 'hidden'
                },
                punctuations: /[。、．，！？]|\.[^A-Za-z0-9]|,[^0-9]|!|\?/
            })
        };

        var Block = Util.inherit(function(leaves) {
            leaves = A.filter(leaves, function(v) {
                var s = v.node.textContent || '';
                s = s.replace(/\s+/g, '');
                return s.length != 0;
            });
            var n = leaves.length;
            var block = { leaves: leaves };

            block.eliminateLinks = function() {
                var st = A.map(block.leaves, function(v){
                    return v.statistics();
                });
                if (!st.length) return '';
                if (st.length == 1) {
                    st = st[0];
                } else {
                    st = A.reduce(st, function(prev, curr) {
                        return Leaf.mergeStatistics(prev, curr);
                    });
                }

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
                var val = 0;
                if (block.leaves.length > 0) {
                    val += A.reduce(block.leaves, function(prev, curr) {
                        return prev
                            + DOM.countMatchTagAttr(curr.node, 'a', 'href',
                                                    self.pat.affiliate);
                    }, 0);
                }
                val /= 2.0;
                val += A.reduce(self.pat.waste, function(prev,curr) {
                    return prev + Util.countMatch(block._nolink, curr);
                }, 0);
                return val;
            };

            block.calcScore = function(factor, continuous) {
                // ignore link list block
                block._nolink = block.eliminateLinks();

                var c = Util.countMatch(block._nolink, self.pat.punctuations);
                c *= self.opt.punctuationWeight;
                c += block._nolink.length;
                c *= factor;

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
                block.depth = Math.min(block.depth, other.depth);
                A.push(block.leaves, other.leaves);
                return block;
            };

            block.commonAncestor = function() {
                return Leaf.commonAncestor.apply(null, block.leaves);
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

                var rec = function(node, depth, inside) {
                    // depth-first recursion
                    if (node instanceof Comment) return r;
                    if (DOM.matchTag(node, self.pat.ignore)) return r;
                    if (DOM.matchStyle(node, self.pat.ignoreStyle)) return r;
                    var children = node.childNodes;
                    var sep = self.pat.sep;
                    var len = children.length;
                    var flags = {
                        form: inside.form || DOM.matchTag(node, self.pat.form),
                        link: inside.link || DOM.matchTag(node, self.pat.a),
                        list: inside.list || DOM.matchTag(node, self.pat.list),
                        li: inside.li || DOM.matchTag(node, self.pat.li)
                    };
                    for (var i=0; i < len; i++) {
                        var c = children[i];
                        var f = DOM.matchTag(c, sep);
                        flush(f);
                        rec(c, depth+1, flags);
                        flush(f);
                    }
                    if (!len) buf.push(new Leaf(node, depth, flags));
                    return r;
                };

                rec(node, 0, {});
                flush(true);

                return r;
            }
        });

        self.extract = function(d/*, url, res*/) {
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

            self.blocks = res.sort(function(a,b){return b.score-a.score;});
            var best = A.first(self.blocks);
            if (best) {
                self.content = best.leaves;
            }

            return self.content;
        };

        return self;
    };

    var debug = false;
    var res = new LayeredExtractor([
        new Heuristics({debug: debug})
    ]).extract(d);

    if (!res.isSuccess) {
        return d.createTextNode('failed');
    } else if (!debug) {
        var node = res.content.asNode();
        if (node != d.body) {
            return node.cloneNode(true);
        }
        return d.createTextNode(res.content.asText());
    } else { // debug
        var blocks = res.engine.blocks || [ res.content.asLeaves() ];
        var div = d.createElement('div');
        var ul = d.createElement('ul');
        A.forEach(blocks, function(b) {
            var li = d.createElement('li');
            li.appendChild(d.createTextNode(b.score));
            var ul2 = d.createElement('ul');
            A.forEach(b.leaves, function(v){
                v = v.node;
                var s = v.tagName || v.textContent || Util.dump(v);
                s = s.replace(/\s+/g, '');
                var li2 = d.createElement('li');
                s = v.nodeName + ': ' + (s.length ? s : '<empty>');
                li2.appendChild(d.createTextNode(s));
                ul2.appendChild(li2);
            });
            li.appendChild(ul2);
            ul.appendChild(li);
        });
        div.appendChild(ul);
        return div;
    }
};

(function(){
    var e = extractContent(document);
    var b = document.body;
    while (b.firstChild) {
        b.removeChild(b.firstChild);
    }
    b.appendChild(e);
})();
