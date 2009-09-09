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
        if (typeof l.SuggestTagTest == 'undefined') {
            var SuggestTagTest = {};
        }
        var debug = l.SuggestTagTest.debug;

        var taraoTags = {
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
        var grapefruitTags = {
            '2006': 6,
            '2007': 2,
            '2008エイプリルフール': 14,
            '2009': 3,
            '2ch': 1329,
            'aaa': 1,
            'accounting': 2,
            'Amazon': 16,
            'au': 8,
            'avast': 1,
            'blog': 200,
            'bookmark': 1,
            'business': 48,
            'CGM': 15,
            'chumby': 6,
            'CSS': 28,
            'D60': 1,
            'design': 105,
            'EMONSTER': 30,
            'Eye-Fi': 11,
            'Firefox': 40,
            'fixdap': 5,
            'Flash': 5,
            'flickr': 2,
            'foo bar': 2,
            'FriendFeed': 5,
            'git': 1,
            'Gmail': 21,
            'Google': 161,
            'GTD': 7,
            'handicapped': 2,
            'hatena': 4,
            'help': 1,
            'hoge': 1,
            'HTML': 6,
            'iKnow': 2,
            'iPod': 84,
            'iTunes': 12,
            'life': 474,
            'Life-X': 1,
            'lifehack': 1,
            'lifehacks': 158,
            'livedoor': 137,
            'Mac': 8,
            'mixi': 118,
            'Office': 30,
            'OpenID': 2,
            'Opera': 2,
            'orz': 9,
            'PC': 40,
            'PDF': 2,
            'perl': 1,
            'Plurk': 2,
            'R10': 3,
            'RSS': 41,
            'SBM': 19,
            'SEM': 52,
            'SEO': 116,
            'skype': 2,
            'sleipnir': 7,
            'SNS': 46,
            'test': 6,
            'Tips': 41,
            'tumblr': 10,
            'twitter': 114,
            'typography': 1,
            'V6': 9,
            'visualization': 1,
            'VOX': 6,
            'W-ZERO3': 104,
            'web': 473,
            'Web2.0': 24,
            'web制作': 55,
            'wiki': 1,
            'Wikipedia': 85,
            'XML': 1,
            'Yahoo!': 11,
            'YouTube': 188,
            '……': 21,
            'あ': 1,
            'あ　あああ': 1,
            'ああ': 2,
            'あああ': 1,
            'ああああ': 1,
            'ああああああああああ': 2,
            'あしか': 4,
            'いい話': 35,
            'うごメモ': 20,
            'お前が言うな': 1,
            'お店': 99,
            'お絵かき': 1,
            'お菓子': 14,
            'これはかわいい': 7,
            'これはすごい': 73,
            'これはひどい': 45,
            'これはひどくない': 2,
            'これはドバい': 3,
            'これは名案': 2,
            'これは怖い': 2,
            'これは欲しい': 3,
            'こんにゃく': 6,
            'さだまさし': 2,
            'しなもん': 27,
            'じゃがいも': 16,
            'はてな': 498,
            'はてなアイデア': 4,
            'はてなアンテナ': 12,
            'はてなキーワード': 1,
            'はてなグループ': 35,
            'はてなスター': 32,
            'はてなダイアリー': 86,
            'はてなハイク': 18,
            'はてなフォトライフ': 16,
            'はてなブックマーク': 144,
            'はてなメッセージ': 2,
            'はてなロクロ': 1,
            'はてな匿名ダイアリー': 10,
            'ぷはー': 5,
            'まとめ': 82,
            'やる夫': 8,
            'わさお': 15,
            'わっふるわっふる': 1,
            'わんわん': 62,
            'アニメ': 45,
            'アフィリエイト': 1,
            'イベント': 90,
            'イラスト': 11,
            'ウクレレ': 9,
            'ウンナン': 19,
            'エヴァ': 29,
            'カメラ': 2,
            'カレンダー': 7,
            'カーリング': 11,
            'ガジェット': 23,
            'キャンペーン': 3,
            'クイズ': 35,
            'ゲーム': 152,
            'ココロ社': 16,
            'コミュニケーション': 98,
            'ストレージ': 1,
            'スポット': 1,
            'スポーツ': 92,
            'スロークッカー': 12,
            'セキュリティ': 24,
            'ソフト': 87,
            'ダンス': 1,
            'ダーツ': 2,
            'ツール': 58,
            'テキストサイト': 14,
            'テレビ': 165,
            'トイカメラ': 15,
            'トラブル': 1,
            'ナタリー': 4,
            'ニコニコ動画': 69,
            'ネタ': 421,
            'ネットショップ': 7,
            'パズル': 6,
            'ファッション': 71,
            'ブラウザ': 11,
            'プレゼン': 19,
            'プログラミング': 11,
            'プーペガール': 2,
            'ポッドキャスト': 2,
            'マスコミ': 177,
            'マネー': 3,
            'マーケティング': 118,
            'ミニブログ': 2,
            'メディア': 9,
            'モバイル': 98,
            'ユーザビリティ': 24,
            'ラジオ': 8,
            'リサーチ': 1,
            'ロザン': 1,
            'ロボコン': 1,
            '一時的なメモ': 13,
            '事件': 48,
            '交通': 21,
            '京都': 37,
            '人事': 1,
            '人力検索': 38,
            '人吉': 1,
            '仕事': 354,
            '任天堂': 6,
            '便利': 40,
            '個人的': 4,
            '健康': 159,
            '児玉清': 10,
            '写真': 270,
            '出版': 11,
            '初音ミク': 60,
            '労働': 121,
            '動物': 50,
            '動画': 107,
            '北海道': 4,
            '医療': 128,
            '占い': 2,
            '占い・診断': 5,
            '原付': 1,
            '古典': 1,
            '合唱': 30,
            '和': 4,
            '図書館': 67,
            '国際': 43,
            '地図': 30,
            '地理': 21,
            '大阪': 192,
            '天気': 1,
            '奈良': 11,
            '女性': 159,
            '学問': 35,
            '学習': 1,
            '宗教': 48,
            '家事': 7,
            '家具': 7,
            '寺社': 2,
            '広告': 68,
            '広報': 3,
            '建築': 21,
            '思考': 18,
            '性': 120,
            '感想': 5,
            '技術': 4,
            '折り紙': 3,
            '携帯百景': 1,
            '政治': 50,
            '教育': 96,
            '文具': 39,
            '文化': 44,
            '文学': 2,
            '文章': 65,
            '料理': 319,
            '斜め上': 3,
            '旅行': 67,
            '日本ハム': 21,
            '映画': 22,
            '有馬温泉': 1,
            '本': 223,
            '東京': 7,
            '検索': 71,
            '横浜': 8,
            '正規表現': 9,
            '歴史': 59,
            '気になる': 13,
            '気持ち': 57,
            '法律': 23,
            '漢字': 20,
            '漫画': 43,
            '災害': 1,
            '無線LAN': 14,
            '無駄にエロい': 3,
            '物欲': 37,
            '特撮': 22,
            '犯罪': 90,
            '狂言': 17,
            '猫': 227,
            '生活': 295,
            '男女': 316,
            '画像': 66,
            '病院': 1,
            '発言小町': 68,
            '社会': 406,
            '神奈川': 2,
            '科学': 6,
            '競馬': 93,
            '簿記': 1,
            '経済': 49,
            '編集': 3,
            '美容': 28,
            '美術': 19,
            '能': 10,
            '自転車': 1,
            '芸能': 144,
            '英語': 53,
            '落語': 5,
            '著作権': 72,
            '行政': 33,
            '言葉': 136,
            '読み物': 313,
            '豆本': 15,
            '資料': 66,
            '質問ある？': 120,
            '辞書': 1,
            '遅延': 1,
            '野球': 28,
            '鉄道': 90,
            '鎌倉': 14,
            '鏡音リン・レン': 5,
            '雑学': 202,
            '雑誌': 10,
            '雑貨': 16,
            '青森': 7,
            '非モテ': 33,
            '音楽': 194,
            '頭痛': 10,
            '食': 270,
            '駅': 3,
            '（･∀･）': 3
        };
        var tags = l.SuggestTagTest.data || grapefruitTags;

        var d = document;

        var Util = ExtractContentJS.Lib.Util;
        var A = ExtractContentJS.Lib.A;
        var DOM = ExtractContentJS.Lib.DOM;

        l.SuggestTagTest.doTest = function() {
            var limit = l.SuggestTagTest.limit || 5;

            var timer = new ExtractContentJS.Lib.Util.BenchmarkTimer();

            var suggestTagsForDocument = function(d, tags) {
                if (!d.body) return null;
                var ns = ExtractContentJS;

                var ex = new ns.LayeredExtractor();
//                 ex.addHandler( ex.factory.getHandler('Description') );
//                 ex.addHandler( ex.factory.getHandler('Scraper'));
//                 ex.addHandler( ex.factory.getHandler('GoogleAdSection') );
                ex.addHandler( ex.factory.getHandler('Heuristics') );
                timer.start('extract');
                var res = ex.extract(d);
                timer.stop('extract');

                if (!res.isSuccess) return null;

                timer.start('suggest');
                var s = ns.suggestTags(res.url, res.title, res.content, tags);
                timer.stop('suggest');

                return s;
            };

            var suggested = suggestTagsForDocument(d, tags);

            if (!suggested) return;

            {
                var dlTimer = d.createElement('dl');

                var dtExtract = d.createElement('dt');
                dtExtract.appendChild(d.createTextNode('extract'));
                var ddExtract = d.createElement('dd');
                var timeExtract = timer.get('extract').elapsed;
                ddExtract.appendChild(d.createTextNode(timeExtract+'msec'));
                dlTimer.appendChild(dtExtract);
                dlTimer.appendChild(ddExtract);

                var dtSuggest = d.createElement('dt');
                dtSuggest.appendChild(d.createTextNode('suggest'));
                var ddSuggest = d.createElement('dd');
                var timeSuggest = timer.get('suggest').elapsed;
                ddSuggest.appendChild(d.createTextNode(timeSuggest+'msec'));
                dlTimer.appendChild(dtSuggest);
                dlTimer.appendChild(ddSuggest);

                d.body.appendChild(dlTimer);
            }

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
            tag.charset = 'UTF-8';
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
            var head = arr.shift();
            var script = head[0];
            var cond = head[1];
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
            if (A.every(conds, f)) {
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
