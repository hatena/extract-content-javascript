if (typeof ExtractContentJS == 'undefined') {
    var ExtractContentJS = {};
}
if (typeof ExtractContentJS.Lib == 'undefined') {
    ExtractContentJS.Lib = {};
}

ExtractContentJS.Lib.Util = {
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

ExtractContentJS.Lib.A = (function() {
    var A = {};
    A.indexOf = Array.indexOf || function(self, elt/*, from*/) {
        var argi = 2;
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
    };
    A.forEach = Array.forEach ||  function(self, fun/*, thisp*/) {
        var argi = 2;
        var len = self.length;
        if (typeof fun != 'function') {
            throw new TypeError('A.forEach: not a function');
        }
        var thisp = arguments[argi++];
        for (var i=0; i < len; i++) {
            if (i in self) fun.call(thisp, self[i], i, self);
        }
    };
    A.every = Array.every || function(self, fun/*, thisp*/) {
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
    };
    A.map = Array.map || function(self, fun/*, thisp*/) {
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
    };
    A.some = Array.some || function(self, fun/*, thisp*/) {
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
    };
    A.reduce = Array.reduce || function(self, fun/*, initial*/) {
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
    return A;
})();

ExtractContentJS.Lib.DOM = (function() {
    var A = ExtractContentJS.Lib.A;
    var DOM = {};
    DOM.getElementStyle = function(elem, prop) {
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
    };
    DOM.text = function(node) {
        if (typeof node.textContent != 'undefined') {
            return node.textContent;
        } else if (node.nodeName == '#text') {
            return node.nodeValue;
        } else if (typeof node.innerText != 'undefined') {
            return node.innerText; // IE
        }
        return null;
    };
    DOM.ancestors = function(e) {
        var body = e.ownerDocument.body;
        var r = [];
        var it = e;
        while (it != body) {
            r.push(it);
            it = it.parentNode;
        }
        r.push(body);
        return r; // [e .. document.body]
    };
    DOM.commonAncestor = function(e1, e2) {
        var a1 = DOM.ancestors(e1).reverse();
        var a2 = DOM.ancestors(e2).reverse();
        var r = null;
        for (var i=0; a1[i] && a2[i] && a1[i] == a2[i]; i++) {
            r = a1[i];
        }
        return r;
    };
    DOM.countMatchTagAttr = function(node, tag, attr, regexs) {
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
    };
    DOM.matchTag = function(node, pat) {
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
    };
    DOM.matchAttr = function(node, pat) {
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
    };
    DOM.matchStyle = function(node, pat) {
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
    };
    return DOM;
})();

