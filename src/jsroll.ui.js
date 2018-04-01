/**
 * @app jsroll.ui.js
 * @category RIA (Rich Internet Application) / SPA (Single-page Application) UI (User Interface)
 *
 * Классы RIA / SPA application framework UI (User Interface)
 * @author Андрей Новиков <andrey@novikov.be>
 * @data 13/02/2018
 * @status beta
 * @version 2.0.11b
 * @revision $Id: jsroll.js 2.0.11b 2018-02-13 21:22:01Z $
 */

(function ( g, undefined ) {
    'suspected';
    'use strict';

    /**
     *  class css - Helper for Cascading Style Sheets properties of HTMLelements
     *
     * @param instance
     * @returns {css}
     */
    var css = function(instance){
        this.instance = this.el(instance).instance;
        return this;
    }; css.prototype = {
        /**
         * css.el setup instance of HTMLelements
         *
         * @param i
         * @returns {css}
         */
        el: function(i) {
            this.instance = typeof i === 'string' ? g.document.querySelector(i) : i ;
            return this;
        },
        /**
         * css.style - setup value of Cascading Style Sheets properties of HTMLelement
         *
         * @param k
         * @param v
         * @returns {css}
         */
        style:function(k,v) {
            this.instance.style[k] = v;
            return this;
        },
        /**
         * css.has return [" <clssname>", ...] | null is exist Cascading Style Sheets class in HTMLelement
         *
         * @param c
         * @returns {Array|{index: number, input: string}}
         */
        has: function(c){
            var cls = this.instance.className;
            if (typeof c !== 'string' && cls) return null;

            var result = []; c .split(' +').forEach(function (e, i, a) {
                if (cls.match(re('(?:^|\\s)' + e + '(?!\\S)'))) result.push(e);
            });
            return result.length ? result : null;
        },
        /**
         * css.add - Add Cascading Style Sheets class to HTMLelement
         * @param c
         * @returns {css}
         */
        add: function (c) {
            if (this.instance && !this.has(c)) this.instance.className += ' ' + c;
            return this;
        },
        /**
         * css.del - Delete Cascading Style Sheets class from HTMLelement
         *
         * @param c
         * @returns {css}
         */
        del: function (c) {
            var h = this.instance;
            if (c && h) c .split(' +').forEach(function (e, i, a) {
                h.className = h.className.replace(re('(?:^|\\s)' + e + '(?!\\S)'), '').trim();
            });
            return this;
        },
        /**
         * css.tgl - Toggle Cascading Style Sheets class of HTMLelement
         *
         * @param c
         * @returns {css}
         */
        tgl: function (c) {
            if (this.instance) {
                if (!this.has(c)) this.instance.className += ' ' + c;
                else this.instance.className = this.instance.className.replace(re('(?:^|\\s)' + c + '(?!\\S)'), '').trim();
            }
            return this;
        }
    }; g.css = new css(g);

    /**
     *  polyfill
     */
    var CustomEvent = ('CustomEvent' in g ? g.CustomEvent : (function () {
        function CustomEvent ( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = g.document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        }
        CustomEvent.prototype = g.Event.prototype;
        return CustomEvent;
    })()); g.ce = CustomEvent;

    Element.matches = Element.matches || Element.matchesSelector || Element.webkitMatchesSelector || Element.msMatchesSelector ||
        function(selector) {
            var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
            while (nodes[++i] && nodes[i] != node);
            return !!nodes[i];
        }

    /**
     * class ui - HTML elements Extention
     *
     * @param instance
     * @returns {*}
     */
    var ui = function(instance) {
        if (instance.hasOwnProperty('ui')) return instance;
        this._parent = null;
        this.instance = instance || g.document;
        if (instance) { this.instance.css = new css(this.instance); this.wrap(this.instance.parentElement); }
        return this;
    }; ui.prototype = {
        wrap:function(el, v){
            if (el instanceof Element && !el.hasOwnProperty('ui')) {
                el.ui = new ui(el); if (typeof v == 'string') g[v]=el;
            }
            return el;
        },
        el: function (s, v) {
            var el = null;
            if (typeof s === 'string') {
                if (!s.match(/^#*/)) el = g.document.getElementById(s.replace(/^#/, ''));
                else el = this.instance.querySelector(s);
            } else if (typeof s === 'object') { el = s }
            if (el) {
                if (!el.hasOwnProperty('ui')) el.ui = new ui(el);
                if (typeof v === 'string') g[v] = el;
                else if (typeof v === 'function') v.call(el, arguments);
            }
            return el;
        },
        els: function (s, fn, v) {
            if (typeof s === 'string') {
                var r = [];
                s.split(',').forEach((function (x) {
                    r.push.apply(r,Array.prototype.slice.call(this.instance.querySelectorAll(x.trim())||{}).map(function (e, i, a) {
                        if (!e.hasOwnProperty('ui')) e.ui = new ui(e);
                        if (typeof fn == 'function') fn.call(e, i, a);
                        return e;
                    }));
                }).bind(this));
                if (typeof fn == 'string') g[fn]=r; else if (typeof v == 'string') g[v]=r;
                return r;
            } else return [];
        },
        attr: function (a, v) {
            if (a == undefined) {
                var attrs = {}, n;
                for (var i in this.instance.attributes)
                    attrs[(n = this.instance.attributes[i].nodeName)] = this.instance.getAttribute(n);
                return attrs;
            } else if (typeof a === 'object' && typeof v === 'undefined') {
                for (var i in a) if (! /\d+/.test(i)) this.instance.setAttribute(i,a[i]);
                return this;
            } else if (typeof a === 'string' && typeof v === 'undefined') {
                var mask = a.indexOf('*') != -1 ? re(a.split('*')[0], 'i') : null;
                if (mask) {
                    var data = {}
                    Array.prototype.slice.call(this.instance.attributes).forEach(function (e, i, a) {
                        var name = e.nodeName.toString();
                        if (mask.test(name) && (name = name.replace(mask, '')))
                            data[name] = e.value; //.e.nodeValue
                    });
                    return data;
                } else {
                    try {
                        return JSON.parse(this.instance.getAttribute(a));
                    } catch (e) {
                        return this.instance.getAttribute(a);
                    }
                }
            } else if (typeof a === 'string' && v) {
                if (! /\d+/.test(a)) {
                    if (typeof v === 'object') this.instance.setAttribute(a, JSON.stringify(v));
                    else this.instance.setAttribute(a, v);
                }
            }
            return this;
        },
        tmpl: function (str, data, cb, opt) {
            tmpl.apply( this.instance, [str, data, cb, opt] );
            return this.instance;
        },
        merge: function () {
            merge.apply(this.instance, arguments);
            return this.instance;
        },
        src: function (e) {
            var el = e ? e : this.instance;
            return new ui(el.srcElement || el.target);
        },
        on: function (event, fn, opt) {
            var self = this;
            event.split(',').forEach( function(e) { self.instance.addEventListener(e.trim(), fn, !!opt)} );
            return this.instance;
        },
        dg: function (s, event, fn, opt) {
            var self = this;
            self.instance.addEventListener(event, function(e) {
                var found, el = (e.target || e.srcElement);
                while (el && el.matches && el !== self && !(found = el.matches(s))) el = el.parentElement;
                if (found) { fn.call(self.wrap(el), e); return el }
                return !!found;
            }, !!opt);
            return this.instance;
        },
        dom: function(d, mime) {
            if ( !d || typeof d !== 'string' ) return null;
            var nodes = g.dom(d, mime).childNodes;
            return nodes.length > 1 ? nodes : nodes[0];
        },
        get active() {
            return this.instance === g.document.activeElement;
        },
        focus: function(s) {
            var el;
            if (s) el = (typeof s == 'string' ? this.el(s) : s); else el = this.instance;
            if (el) g.setTimeout(function() { el.focus(); return false }, 0);
            return el;
        }
    }; g.ui = new ui(document);

    /**
     * TODO: Fix not work in FF
     */
    Object.defineProperty(g, 'selected', {
        get: function selected() {
            return  g.getSelection ? g.getSelection().toString() : g.document.selection.createRange().text;
            // return  g.getSelection ? g.getSelection().toString() : // Not IE, используем метод getSelection
            //     g.document.selection.createRange().text; // IE, используем объект selection
        }
    });

    /**
     * Fix
     */
    function selection() {
        if (g.getSelection) {
            if (g.getSelection().empty) {  // Chrome
                g.getSelection().empty();
            } else if (g.getSelection().removeAllRanges) {  // Firefox
                g.getSelection().removeAllRanges();
            }
        } else if (g.document.selection) {  // IE?
            g.document.selection.empty();
        }
    }; g.selection = selection;

    /**
     * Fader Helper
     *
     * @param s
     * @param opt
     * @returns {boolean}
     */
    function fader(s, opt) {
        if (!s) return false;

        var opt = Object.assign({display:false,timeout:500,context:null},opt),
            init = function (v) {
                if (!v.hasOwnProperty('fade')) {
                    v.faded = v.style.opacity == 0;
                    v.opt = opt;
                    v.opt.context = typeof opt.context === 'string' ? v.el(opt.context) : v;
                    Object.defineProperty(v, 'fade', {
                        get: function() { return v.faded; },
                        set: function(is) {
                            if (is) {
                                v.css.add('fade');
                                if (v.opt.display) setTimeout(function(){ v.style.display = 'none' }, v.opt.timeout);
                                return v.faded = true;
                            } else {
                                if (v.opt.display) v.style.display = v.getAttribute('display') ? v.getAttribute('display') : 'inherit';
                                v.css.del('fade');
                                return v.faded = false;
                            }
                        },
                        enumerable: true,
                        configurable: true
                    });
                }
            }

        if (typeof s === 'string') g.ui.els(s).forEach(function (v,i,a) { init(v) });
        else if (s instanceof HTMLElement) init(s);
        else if (typeof s === 'object') s.forEach(function (v,i,a) { init(v) });
        else return false;
    }; g.fader = fader;

}( window ));

(function ( g, ui, undefined ) {
    'suspected';
    'use strict';

    if ( typeof ui === 'undefined' ) return false;

    var group = function (els, opt) {
        this.__isValid = true;
        this.opt = Object.merge({
            method: 'get',
            url: g.location.href,
            before: function (e) { g.spinner = true; },
            after: function (e) { g.spinner = false; }
            }, opt);
        this.elements = typeof els === 'string' ? ui.els(els) : els;
        var self = this;
        this.elements.forEach(function (e,i,a) { e.group = self; });
    }; group.prototype = {
        events:{},
        on:function (event, fn, opt) {
            var self = this;
            self.events[event] = fn;
            this.elements.forEach(function (e,i,a) { e.ui.on(event, self.events[event], opt); });
        },
        get isValid () {
            this.__isValid = true;
            var self = this;
            this.elements.forEach(function (e,i,a) { self.__isValid  &= input_validator(e) });
            return this.__isValid ;
        },
        __MODEL__: {},
        set MODEL(d) {
            if (d && typeof d === 'object') {
                this.__MODEL__ = d;
                for (var i = 0; i < this.elements.length; i++) if (d.hasOwnProperty(this.elements[i].name)) {
                    this.elements[i].value = d[this.elements[i].name];
                    if (['checkbox', 'radio'].indexOf((this.elements[i].getAttribute('type') || 'text').toLowerCase()) > -1) {
                        this.elements[i].checked = parseInt(d[this.elements[i].name]) !== 0;
                    }
                }
            } else {
                this.__MODEL__ = {};
            }
        },
        get MODEL() {
            this.__MODEL__ = {};
            for (var i = 0; i < this.elements.length; i++) {
                var n = this.elements[i].value.length ? new Number(this.elements[i].value) : NaN;
                this.__MODEL__[this.elements[i].name || i] = ['checkbox', 'radio'].indexOf((this.elements[i].getAttribute('type') || 'text').toLowerCase()) < 0 ? (isNaN(n) ? this.elements[i].value : n) : (this.elements[i].checked ? (this.elements[i].value.indexOf('on') == -1 ? this.elements[i].value : 1) : (this.elements[i].value.indexOf('on') == -1 ? '' : 0));
            }
            return this.__MODEL__;
        },
        data: function() {
            var data = []; for (var i = 0; i < this.elements.length; i++) { data.push(g.InputHTMLElementSerialize(this.elements[i])); }
            return data.join('&');
        },
        fail: function (res) {
            if (res.error) for (var i = 0; i < this.elements.length; i++) {
                if (res.error.hasOwnProperty(this.elements[i].name)) this.elements[i].status = 'error';
                else this.elements[i].status = 'none';
                return true;
            }
            return false;
        },
        send: function () {
            if (this.isValid) {
                var args = arguments, self= this;
                self.opt.before();
                g.xhr(Object.assign({data: self.data(), done: typeof args[0] == 'function' ?
                        function() {
                            var callback = args.shift();
                            var result = callback.apply(self, args);
                            self.opt.after(result);
                            return result;
                        } :
                        function() {
                            var res = {result:'error'};
                            if ([200, 206].indexOf(this.status) < 0)
                                res.message = this.status + ': ' + this.statusText;
                            else try {
                                res = JSON.parse(this.responseText);
                            } catch (e) {
                                res = {result:'error', message: 'Cервер вернул не коректные данные'};
                            }

                            if (res.result == 'error' ) {
                                self.fail(res);
                            } else if (res.result == 'ok') {
                                self.feedback = res ;
                            }

                            self.opt.after(res);
                        }
                }, self.opt));
            }

            return this;
        }
    }; g.group = group;

    g.config = {
        app: {container:'[role="workspace"]'},
        msg: {container:'.alert.alert-danger', tmpl:'alert-box'},
        spinner: '.locker.spinner',
        popup: {wnd:'.b-popup', container:'.b-popup .b-popup-content'}
    };

    /**
     * Application
     * @param instance
     * @returns {app}
     */
    var app = function(instance){
        this.route = router;
        //this.route.cfg({ mode: 'history'})
        this.registry = {};
        this.dim = {};
        this.instance = instance || g;
        //TODO ceteate poll events handlers
        // ui.on("keydown", function (e) { if (e.keyCode == 27 ) g.app.popup(); });
        return this;
    }; app.prototype = {
        bootstrap: function(rt) {
            this.route.set(rt).chk(rt).lsn();
            return this;
        },
        widget: function (cfg, t, d, opt) {
            var self = this, root = typeof cfg.root == 'string' ? g.ui.el(cfg.root) : cfg.root;
            tmpl(t, d, function (c) {
                if (root && c && (root.innerHTML = c)) {
                    self.implement(root, cfg.event || []);
                    self.inject(cfg.root, root, cfg.code || opt && opt.code);
                }
            }, opt);

            return this;
        },
        event: function (s, map) {
            this.registry[s] = map;
            return this;
        },
        implement: function (p, s){
            var self = this;
            (s || []).forEach(function (a, i) {
                for (var b in self.registry[a]) {
                    switch  (typeof self.registry[a][b]) {
                        case 'object': p.ui.els(a, function(){ this.ui.on(self.registry[a][b][0], self.registry[a][b][1]); return this }); break;
                        case 'string': p.ui.els(a, function(){ this.ui.on(self.registry[a][0], self.registry[a][1]); return this }); return;
                        case 'function': self.registry[a][b].call(p.ui.els(a), self.dim[a] || {});
                    }
                };
            });
            return self;
        },
        variable: function (el, id) {
            if (!el) return undefined;
            if (!el.hasOwnProperty('dim')) {
                Object.defineProperty(el, 'dim', {
                    get: function () {
                        try {
                            return g.app.dim[id] || (g.app.dim[id] = Object.assign(JSON.parse(storage.getItem(id)||''), {self:el}));
                        } catch (e) { g.app.dim[id] = {}; g.app.dim[id].self = el; return g.app.dim[id]; }
                    }
                });
                g.app.dim[id] = {}; g.app.dim[id].self = el;
                el.store = function (fields) {
                    var s = {};
                    Object.keys(g.app.dim[id]).forEach(function(k){if(fields.indexOf(k) != -1) s[k] = g.app.dim[id][k];});
                    storage.setItem(id, JSON.stringify(s));
                    return this;
                };
            }
            return el;
        },
        inject: function (root, el, fn) {
            if (typeof fn === 'function') {
                fn.apply(this.variable(el, root), arguments);
            }
            return false;
        },
        elem: ui.el(g.config.msg.container),
        msg: {
            show: function (params, close) {
                tmpl(g.config.msg.tmpl, params, g.app.elem);
                // g.app.elem.css.del('fade');
                g.app.elem.fade = false;
                if (typeof close == 'undefined' || !close) g.app.elem.fade = true; //g.app.elem.css.add('fade');
                return g.app.elem;
            }
        },
        spinner_count: 0,
        spinner_element: ui.el(g.config.spinner),
        set spinner (v) {
            v ? this.spinner_count++ : this.spinner_count--;
            this.spinner_count > 0 ? this.spinner_element.style.display = 'block' : this.spinner_element.style.display = 'none';
        },
        get spinner() {
            if (this.spinner_element.style.display == 'none') return false;
            return true;
        },
        before: function () {
            g.app.spinner = true;
        },
        after: function () {
            g.app.spinner = false;
        },
        list: g,
        popupEvent: function (e) { if (e.keyCode == 27 ) { if (!g.app.elem.css.has('fade')) { clearTimeout(g.app.elem.timer); g.app.elem.fade = true; } else {g.app.popup(); }} },
        popup: function (id, data, opt) {
            //TODO: refactoring code for popup!
            var self = this;
            this.wnd = this.wnd || ui.el(g.config.popup.wnd);
            if (self.wnd.fade) {
                this.container =  this.container || ui.el(g.config.popup.container);
                var  up = false, t = {
                    onTmplError:function () {
                        g.msg.show({message:'Ошибка выполнения приложения!'});
                        console.error(arguments);
                        up = true;
                    }
                };
                tmpl.apply(t, [id, data, this.variable(this.container, 'popupBox'), opt]);
                if (!up) {
                    g.addEventListener('keydown', g.app.popupEvent);
                    self.container.css.del('is-(valid|invalid|warning|spinner)');
                    self.wnd.fade = up = false;
                }
            } else {
                g.removeEventListener('keydown', self.popupEvent);
                if (typeof arguments[0] == 'function') arguments[0].apply(self, obj2array(arguments).slice(1));
                self.container.innerHTML = null;
                self.wnd.fade = true;
                if (self.list) self.list.ui.focus('[role="popup-box"]');
            }
            return this;
        },
        fader: function (s, opt) { g.fader(s, opt); return this },
        download:function(url, opt){
            return g.xhr(Object.assign({responseType: 'arraybuffer', url: url, done: function(e, x) {
                if ([200, 206].indexOf(this.status) < 0) {
                    app.msg.show({message: this.status + ': ' + this.statusText + ' (URL: ' + url + ')'});
                } else {
                    try {
                        var filename = g.uuid();
                        if (opt && opt.hasOwnProperty('filename')) {
                            filename = opt['filename'];
                        } else {
                            var disposition = this.getResponseHeader('Content-Disposition');
                            if (disposition && disposition.indexOf('attachment') !== -1) {
                                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                                var matches = filenameRegex.exec(disposition);
                                if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                            }
                        }
                        var type = this.getResponseHeader('Content-Type');
                        var blob = g.bb(this.response, {type: type});

                        if (typeof g.navigator.msSaveBlob !== 'undefined') {
                            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for
                            // which they were created. These URLs will no longer resolve as the data backing the
                            // URL has been freed."
                            g.navigator.msSaveBlob(blob, filename);
                        } else {
                            var downloadUrl = g.URL.createObjectURL(blob);

                            if (filename) {
                                // use HTML5 a[download] attribute to specify filename
                                var a = document.createElement('a');
                                // safari doesn't support this yet
                                if (typeof a.download === 'undefined') {
                                    //g.location = downloadUrl;
                                    g.open(downloadUrl);
                                } else {
                                    a.href = downloadUrl;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                    setTimeout(function () { document.body.removeChild(a); }, 100); // cleanup
                                }
                            } else {
                                //g.location = downloadUrl;
                                g.open(downloadUrl);
                            }

                            setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                        }
                    } catch (e) {
                        console.error('сервер вернул не коректные данные', e);
                    }
                }
            }},opt));
        }

    }; g.app = new app(g.document);

    /**
     * Paginator List Items View
     *
     * @param args
     * @param model
     */
    g.paginator = function(args, model) {
        var self=this, pg = args.paginator;
        if (pg) this.ui.el('.paginator', function (e) {
            tmpl('paginator-box', {pages: Math.ceil(pg.count / 10), page: pg.page, model: model }, this);
        });
        return pg;
    };

    /**
     *
     * @param els
     * @param v
     * @returns {*}
     */
    var filter = function (els, v) {
        var elements = [], index = 0;
        if (els) {
            if (typeof v === 'object' && v.hasOwnProperty('page')) index = v['page'];
            els.forEach(function (e, i, a) {
                var fe =  ['INPUT','SELECT'].indexOf(e.tagName) > -1 ? e : e.ui.el('input,select');
                if (fe) {
                    elements.push(fe);
                    if (typeof v === 'object' && v.hasOwnProperty(fe.name)) fe.value = v[fe.name];
                    if (fe.tagName === 'INPUT') input_validator(fe);
                }
            });

            return {
                el: elements,
                index: index,
                __valid: true,
                get valid(){
                    var self = this; self.__valid = true;
                    this.el.forEach(function (e,i,a) { self.__valid &= input_validator(e) });
                    return this.__valid ;
                },
                set params(v) {
                    var params = {}, self = this; self.__valid = true;
                    if (typeof v === 'object') params = v; else if (typeof v === 'string') params = location.decoder(v);
                    if (params.hasOwnProperty('page')) this.index = params['page'];
                    this.el.forEach(function (e,i,a) {
                        if (params.hasOwnProperty(e.name)) e.value = params[e.name];
                        else e.value = '';
                        self.__valid &= input_validator(e);
                    });
                },
                get params() {
                    var params = {}, self = this;
                    this.el.forEach(function (e,i,a) {
                        if (e.value) switch (e.tagName) {
                            case 'INPUT': params[e.name] = e.value; input_validator(e);
                                break;
                            case 'SELECT': if (e.value != 0) params[e.name] = e.value;
                                break;
                            }
                    });
                    return params;
                },
                diff: function (b) {
                    var a = this.params;
                    return Object.keys(a).concat(Object.keys(b)).reduce(function(map, k) {
                        if (a[k] !== b[k]) map[k] = b[k];
                        return map;
                    }, {});
                },
                get uri() {
                    var p = this.params;
                    p['page'] = this.index;
                    return location.encoder(p);
                },
                callback: function (res) {
                   var result = true, er = Object.keys(res.error||{}), wr = Object.keys(res.warning||{}), fl = Object.keys(res.filter||{});
                    if (typeof res === 'undefined') return res;

                    if (er.length || wr.length || fl.length) {
                        for (var i in this.el) {
                            if (er.length && er.indexOf(this.el[i].name) >-1) { this.el[i].status='error'; result &= false }
                            else if (wr.length && wr.indexOf(this.el[i].name) >-1) { this.el[i].status='warning'; result &= false }
                            else if (fl.length && fl.indexOf(this.el[i].name) >-1) { result &= input_validator(this.el[i]) }
                        }
                    }
                    return result;
                }
            };
        }
        return null;
    }; g.filter = filter;

    /**
     *
     * @param route
     * @param methods
     * @param opt
     * @returns {*}
     */
    var crud = function (route, methods, opt) {
        if (!route) return undefined;

        var rt =  route.match(/^\/\w+.*/i) ? '//'+location.hostname+route : route;
        var rest = function (self, method, data) {
            var raw = []; if (typeof data == 'object') {for (var i in data) raw.push(i+'='+data[i]); data = raw.join('&') }
            return xhr(Object.assign({method: method, url: self.route, data: data}, self.opt));
        };

        var p = {
            methods: methods ? methods : ['GET','POST','PUT','DELETE'],
            route: route,
            opt: opt,
            rs: {},
            error: {},
            proc: null,
            before: null,
            after: null,
            abort:function () { if (this.proc) this.proc.abort(); this.proc = null },
            done:function (data,  method) { return this.rs[method] = data },
            fail:function (data,  method) { return this.error = data }
        };

        for (var n in methods) {
            var l = methods[n].toLowerCase(), u = l.toUpperCase();
            p.rs[u] = null;
            p[l] = (function(u){ return function(data) { this.rs[u] = null; return this.proc = rest(this,u,data); }}).apply(p,[u]);
            Object.defineProperty(p, u, { get: function() { return this.rs[u]; }});
        }

        if (rt) return p; else console.warn('Can\'t resolve route:' ,route);

        return {};
    }; g.crud = crud;

}( window, window.ui ));

(function ( g, ui, undefined ) {
    'use strict';
    if ( typeof ui === 'undefined' ) return false;

    var msg = {
        elem: ui.el(g.config.msg.container),
        show: function (params, close) {
            tmpl(g.config.msg.tmpl, params, this.elem);
            this.elem.css.del('fade');
            var el = this.elem;
            if (typeof close == 'undefined' || !close) el.timer = setTimeout(function(){el.css.add('fade')}, 3000);
            return this.elem;
        }
    }; g.msg = msg;

    g.spinner_count = 0;
    g.spinner_element = ui.el(g.config.spinner);
    if (g.spinner_element) Object.defineProperty(g, 'spinner', {
        __proto__: null,
        enumerable: false,
        configurable: false,
        set: function (v) {
            v ? g.spinner_count++ : g.spinner_count--;
            g.spinner_count > 0 ? g.spinner_element.style.display = 'block' : g.spinner_element.style.display = 'none';
        },
        get: function () {
            if (g.spinner_element.style.display == 'none') return false;
            return true;
        }
    });

    /**
     * setValueFromObject
     *
     * @param owner
     * @param v
     */
    var setValueFromObject = function(owner, v) {
        if (owner && owner.tagName) {
            if (typeof v === 'object' && v.hasOwnProperty(owner.name)) {
                owner.value = v[owner.name];
            } else {
                owner.value = null;
            }
            return true;
        }
        return false;
    }; g.setValueFromObject = setValueFromObject;

    /**
     * input_validator
     *
     * @param element
     * @returns {boolean}
     */
    var input_validator = function(element, tags) {
        if (element && (tags ? (tags.indexOf(element.tagName) >-1) : (element.tagName === 'INPUT'))) {
            var res = true, validator = null, pattern;
            if (!element.hasOwnProperty('validator') && (validator = element.getAttribute('validator')) !== null) {
                element.validator = func(validator);
            }
            if ((element.getAttribute('required') !== null) && !element.value) res = false;
            else if ((element.getAttribute('required') === null) && !element.value) res = true;
            else if ((pattern = element.getAttribute('pattern')) === null) res = true;
            else { if (!element.hasOwnProperty('testPattern')) {
                    try {
                        var p = /[?\/](.+)(\/([igum]*$))/.exec(pattern) || [];
                        element.regex = new RegExp(p[1]||pattern,p[3]||'');
                        Object.defineProperty(element, 'testPattern', {
                            get: function testPattern() { this.regex.lastIndex=0; return this.regex.test(this.value.trim()) }
                        });
                    } catch(e) { element['testPattern'] = false; console.error(element,pattern,e) }
                }
                res = element.testPattern;
            }
            if (res && element.hasOwnProperty('validator')) res = element.validator.call(element, res);

            var el = element.type != 'hidden' ? element : false;
            if (el) {
                inputer(ui.wrap(el));
                if (!res) {
                    el.status = 'error'
                } else {
                    if (!el.disabled) {
                        if (el.value.length) { el.status = 'success' } else { el.status = 'none' }
                    } else {
                        el.status = 'none'
                    }
                }
            }
            return res;
        }
        return true;
    };  g.input_validator = input_validator;

    /**
     * Set default value for FORM elements
     *
     * @param els
     * @param attr
     * @returns {*}
     */
    var set_default = function (els, attr) {
        if (!els) return null;

        return this.ui.els(els,function () {
            if (['checkbox','radio'].indexOf((this.getAttribute('type') || 'text').toLowerCase()) >-1)
                this.checked = this.ui.attr(attr||'default') || false;
            else switch (this.tagName) {
                case 'SELECT':
                    this.value = this.ui.attr(attr||'default') || 0;
                    break;
                case 'INPUT':
                case 'TEXTAREA':
                default:
                    this.value = this.ui.attr(attr||'default') || '';
            }
            this.status = 'none';
        });
    };  g.set_default = set_default;

    /**
     * inputer
     * //maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/css/bootstrap.min.css
     *
     * @param el
     * @returns {*}
     */
    var inputer = function(el) {
        if (el && !el.hasOwnProperty('status')) {
            Object.defineProperty(el, 'status', {
                set: function status(stat) {
                    this.parentElement.css.del('has-(danger|warning|success|spinner)');
                    // this.css.del('form-control-(danger|warning|success|spinner)');
                    this.css.del('is-(valid|invalid|warinig|spinner)');
                    switch (stat) {
                        case 'error':
                            this._status = 'error';
                            this.css.add('is-invalid');
                            // this.css.add('form-control-danger');
                            this.parentElement.css.add('has-danger');
                            break;
                        case 'warning':
                            this._status = 'warning';
                            this.css.add('is-warning');
                            // this.css.add('form-control-warning');
                            this.parentElement.css.add('has-warning');
                            break;
                        case 'success':
                            this._status = 'success';
                            this.css.add('is-valid');
                            // this.css.add('form-control-success');
                            this.parentElement.css.add('has-success');
                            break;
                        case 'spinner':
                            this._status = 'spinner';
                            this.css.add('is-spinner');
                            // this.css.add('form-control-spinner');
                            this.parentElement.css.add('has-spinner');
                            break;
                        case 'none':
                        default:
                            this._status = 'none';
                    }
                },
                get: function status() {
                    return this._status;
                }
            });
        }
        return el;
    }; g.inputer = inputer;
    
    g.formvalidator = function(res) {
        var result = [];
        for (var i =0; i < this.elements.length; i++) if (!input_validator(this.elements[i],['INPUT','TEXTAREA'])) result.push(this.elements[i].name+': '+(this.elements[i].value||'поле с неверными данными или нет значения!'));

        if (result.length) {
            if (g.spinner) g.spinner = false;
            result.unshift('<b>ФОРМА: неверно заполнены поля формы!</b>');
            msg.show({message: result});
            return false;
        }

        return true;
    };

    /**
     * pattern_validator
     *
     * @param element
     * @param opt
     */
    var pattern_validator = function (element, opt) {
        if (element && element.tagName) {
            inputer(element).ui.on('focus', function (e) {
                if ( typeof this.status === 'undefined' ) input_validator(this);
                return false;
            }).ui.on('input', function(e){
                input_validator(this);
                return false;
            }).ui.on('blur', function(e){
                input_validator(this);
                return false;
            });
        }
    }; g.pattern_validator = pattern_validator;

    /**
     * typeahead
     *
     * @param element
     * @param opt
     * @returns {*}
     */
    var typeahead = function (element, opt) {
    if (element && element.tagName === 'INPUT') {
        var th = {
            index: 0,
            key: null,
            cache: null,
            value: null,
            opt: {},
            delta: 330,
            timer: null,
            request: null,
            __xhr:null,
            stoped: function () {
               // if (!this.timer) clearTimeout(this.timer); this.timer = null;
                if (this.owner.status = 'spinner') {
                    this.owner.status = '';
                    if (this.__xhr) this.__xhr.abort();
                }
            },
            delayed: function () {
                if (!this.timer) {
                    var fn = function fn () {
                            if (this.request == this.owner.value) {  if (this.owner.pannel) this.owner.pannel.css.add('fade'); this.xhr(); }
                            clearTimeout(this.timer); this.timer = null;
                            if (this.request && this.request != 'null' && this.request != this.owner.value ) {
                                this.request = this.owner.value;
                                this.timer = g.setTimeout(fn.bind(this), this.delta);
                            }
                        };
                    this.timer = g.setTimeout(fn.bind(this), this.delta);
                    this.request = this.owner.value;
                } else {
                    this.stoped();
                }

                return this.timer;
            },
            activeItem:function (idx) {
                if (idx && this.cache.hasOwnProperty(idx)) {
                    this.key = idx;
                } else {
                    this.owner.setValue({});
                    return
                }
                var owner = this.owner, ch = this.cache[this.key] || {}, v = {};
                if ( owner.pannel && Object.keys(ch).length ) {
                    owner.pannel.ui.el('.active', function () { this.css.del('active') });
                    var values = Object.keys(ch).map(function(k){return ch[k]});
                    var idx = values.indexOf(owner.value);
                    if (idx != -1) {
                        owner.pannel.ui.el('[value="' + idx + '"]', function () { this.css.add('active') });
                        v = Object.keys(ch)[idx];
                    }
                }
                owner.setValue(v);
                return
            },
            tmpl:function(data){
                var owner = this.owner;
                this.index = -1; this.key = owner.value.toLowerCase() || 'null';

                if (owner.pannel) {
                    var n = ui.dom(tmpl(this.opt.tmpl, {data:data, field: owner.name}));
                    if (n) owner.pannel.innerHTML = n.innerHTML;
                } else {
                    owner.parentElement.insertAdjacentHTML('beforeend', tmpl(this.opt.tmpl, {data: data, field: owner.name}));
                    owner.parentElement.css.add('dropdown');
                    owner.pannel = owner.parentElement.ui.el('.dropdown-menu.list');
                }

                if (!this.opt.wrapper) owner.pannel.setAttribute('style','left:'+owner.offsetLeft+'px;width:'+owner.clientWidth+'px;');
                this.activeItem(this.key);
                owner.parentElement.ui.els('.dropdown-menu.list li', function () {
                    this.ui.on('mousedown', function (e) {
                        owner.value = this.innerHTML;
                        var ch = owner.typeahead.cache[owner.typeahead.key];
                        owner.setValue(ch[parseInt(this.ui.attr('value'))]);
                        return;
                    });
                });
            },
            xhr:function(){
                var owner = this.owner, params = {};

                if (this.opt.skip > owner.value.trim().length || (this.opt.validate && !input_validator(this.owner))){
                    if (owner.typeahead.cache === null) owner.typeahead.cache = {};
                    // owner.typeahead.cache[owner.value.trim()] = {};
                    return owner.typeahead.show([]);
                }

                params[owner.name] = owner.value;
                var index = owner.value ? owner.value.toLowerCase() : 'null';
                if ((this.cache === null || !this.cache.hasOwnProperty(index) || index == 'null') && owner.ui.attr('url')) {
                    owner.status = 'spinner';
                    this.__xhr = xhr({url: location.update(owner.ui.attr('url'), params),
                        rs: this.opt.rs,
                        before: function () { owner.status = 'spinner'; if (owner.pannel) owner.pannel.css.add('fade'); },
                        after: function () { if (owner.status = 'spinner') owner.status = ''; },
                        done: function (e) {
                            if ([200, 206].indexOf(this.status) < 0) {
                                msg.show({message: this.status + ': ' + this.statusText});
                            } else {
                                try {
                                    var res = JSON.parse(this.responseText);
                                    if (res.result == 'error') {
                                        owner.status = 'error';
                                    } else {
                                        var ds = (res.data||[]).map(function(e,i,a) {
                                            try { return JSON.parse(e);} catch (er) { return e; }
                                        });
                                        if (owner.typeahead.cache === null) owner.typeahead.cache = {};
                                        owner.typeahead.cache[index] = ds;
                                        owner.typeahead.activeItem(index);
                                        owner.typeahead.show(ds);
                                    }
                                } catch (e) {
                                    console.error(e,'сервер вернул не коректные данные');
                                    owner.status = 'error';
                                }
                            }
                            return this;
                        },
                        fail: function (e) { console.error('typeahead',e); }
                    });
                } else {
                    if (this.cache && this.cache.hasOwnProperty(index)) owner.typeahead.show(this.cache[index]);
                }
                return this;
            },
            show:function(data){
                var owner = this.owner;
                if (owner.ui.active) {
                    if (data && Object.keys(data).length) {
                        this.tmpl(data); owner.pannel.css.del('fade');
                    } else if (owner.pannel) {
                        owner.pannel.css.add('fade');
                    }
                }
                return false;
            },
            onKeydown:function (e) {
                var key = (e.charCode && e.charCode > 0) ? e.charCode : e.keyCode;
                if (this.typeahead.cache !== null) {
                    var th = this.typeahead, x, ch = th.cache[th.key], v = {};
                    if (ch && typeof ch === 'object') {
                        switch (key) {
                            case 38:
                                if (th.index > 0) th.index--; else th.index = Object.keys(ch).length - 1;
                                break;
                            case 40:
                                if (th.index < Object.keys(ch).length - 1) th.index++; else th.index = 0;
                                break;
                            case 13:
                                th.stoped(); if (this.pannel) this.pannel.css.add('fade');
                            default:
                                // e.preventDefault();
                                return;
                                // return false;
                        }
                        v = ch[(x = Object.keys(ch)[th.index])];
                        this.value = (typeof v === 'object' ? v[this.name] : v)||'';
                        this.selectionStart = this.selectionEnd = this.value.length;
                        if (this.pannel) {
                            this.pannel.ui.el('.active', function () {
                                this.css.del('active')
                            });
                            this.pannel.ui.el('[value="' + x + '"]', function () {
                                this.css.add('active')
                            });
                        }
                    } else {
                        if (key != 9) {
                            v = {}
                        }
                    }
                    this.setValue(v);
                    this.dispatchEvent(new Event('change'));
                }
                return;
            },
            onChange: function (e) {
                var idx, th = this.typeahead, v = {};
                if ((idx = this.value.toLowerCase()) && (th.cache||{}).hasOwnProperty(idx)) {
                    for (var k in th.cache[idx]) if (th.cache[idx][k][this.name] === idx) v = th.cache[idx][k];
                }
                this.setValue(v);
                input_validator(this);
                return;
            },
            onFocus:function(e){
                if ( this.value.length ) this.setSelectionRange(this.value.length, this.value.length);
                // if ( typeof this.status === 'undefined' ) input_validator(this);
                if ( !this.value.length || (this.value.length && ['none','success'].indexOf(this.status) == -1) ) this.typeahead.delayed();
                return;
            },
            onInput:function(e){
                if ( this.pannel ) this.pannel.css.add('fade');
                this.typeahead.delayed();
                input_validator(this);
                return;
            },
            onBlur:function(e){
                if ( this.pannel) this.pannel.css.add('fade');
                var v = {};
                if (this.typeahead.cache !== null) {
                    var self = this, th = this.typeahead, ch = th.cache[th.key];
                    if ( th.timer ) { clearTimeout(th.timer); th.timer = null; }
                    if ( ch && typeof ch === 'object' ) Object.keys(ch).forEach(function(k){ if ( ch[k][self.name] == self.value ) { v = ch[k] }});
                }

                if (Object.keys(this.typeahead.value).length !== 0) {
                    this.setValue(v);
                    this.dispatchEvent(new Event('change'));
                    input_validator(this);
                }
                return;
            }
        };

        if (!element.typeahead) {
            element.typeahead = th;
            element.typeahead.opt = Object.assign({wrapper:false, skip: 0, validate: false, tmpl: 'typeahead-tmpl', rs:{}}, opt);
            element.setValue = function (v) {
                this.typeahead.value = typeof v === 'object' ? v : {};
                if (element.typeahead.opt.hasOwnProperty('fn') && typeof element.typeahead.opt.fn === 'function') {
                    if (this.typeahead.cache !== null) element.typeahead.opt.fn.call(element, this.typeahead.value);
                    else element.typeahead.opt.fn.call(element, undefined);
                    // input_validator(element);
                }
            };
            element.typeahead.owner = inputer(element);
            element.ui.on('focus', th.onFocus).ui.on('input', th.onInput).ui.on('blur', th.onBlur).ui.on('keydown', th.onKeydown).ui.on('change', th.onChange);
            if (!element.ui.attr('tabindex')) element.ui.attr('tabindex', '0');
        }
        return element;
    }
    }; g.typeahead = typeahead;

    /**
     *
     * @param element
     * @param pattern
     * @param cleared
     * @returns {*}
     */
    var maskedigits = function(element, pattern, cleared) {
    if (element.tagName === 'INPUT') {
        var el = inputer(element);
        el.cleared = cleared == undefined ? true : !!cleared ;
        if (pattern) el.maxLength = el.ui.attr('placeholder', pattern || '').attr('placeholder').length;
        if (!el.ui.attr('tabindex')) el.ui.attr('tabindex', '0');
        if (el && !el.hasOwnProperty('insertDigit')) {
            el.insertDigit = function(dg, selected) {
                if (selected) {
                    var pos = this.value.indexOf(selected);
                    var digitOffset = /\d/.test(dg) ? 1 : 0;
                    var shift = this.ui.attr('placeholder').substr(pos, selected.length).indexOf('_');
                    if (shift > 0) pos += shift;
                    this.value = this.value.substr(0,pos)+(/\d/.test(dg)?dg:'')+this.ui.attr('placeholder').substr(pos+digitOffset,
                            selected.length-digitOffset)+this.value.substr(pos+selected.length, this.value.length);
                    this.selectionStart = this.e1 = this.selectionEnd = this.s1 = pos +1;
                } else if (/\d/.test(dg) && (this.value || this.ui.attr('placeholder')).indexOf('_') > -1) {
                    var text = this.value || this.ui.attr('placeholder');
                    var pos = text.indexOf('_');
                    var next = text.match(/\d/) ? (text.indexOf(text.match(/\d/))) : -1;
                    if (pos <= this.selectionStart || next < 0 || next > pos) {
                        this.value = (this.value || this.ui.attr('placeholder')).replace('_', dg);
                        pos = (this.value || this.ui.attr('placeholder')).indexOf('_');
                        this.e1 = this.selectionEnd = this.selectionStart = this.s1 =  pos > -1 ? pos : this.value.length;
                    } else if (pos > this.selectionStart) {
                        this.s1 = pos = this.selectionStart;
                        var text = dg + (this.value.substr(pos, this.value.length).match(/\d+/g) || []).join('')+'_';
                        for (var i= 0; i < text.length -1; i++) {
                            pos = this.value.indexOf(text.charAt(i+1), pos);
                            if (pos > -1) this.value = this.value.substr(0, pos) + text.charAt(i) + this.value.substr(pos+1, this.value.length);
                        }
                        this.selectionStart = this.e1 = this.selectionEnd = ++this.s1;
                    }
                }

                this.dispatchEvent(new Event('change'));
                return this.selectionStart;
            };
            el.init = function (clear) {
                var text = this.value;
                var pos = 0;
                if (text) {
                    this.value = '';
                    var placeholder = this.ui.attr('placeholder');
                    for (var i in placeholder) {
                        if (text.length > i && placeholder[i] == text[i]) {
                            this.value += text[i]; pos++;
                        } else if (/_/.test(placeholder[i])) {
                            this.value += (pos < text.length) ? text[pos++] : '_';
                        }
                    }
                    pos = this.value.indexOf('_');
                } else {
                    if (!clear) this.value = this.ui.attr('placeholder');
                    pos = this.ui.attr('placeholder').indexOf('_');
                }
                if (clear) this.value = this.value.replace(/\_/g, '');
                return this.e1 = this.selectionEnd = this.selectionStart = this.s1 = (pos > -1 ? pos : this.value.length);
            };
        };
        el.init(true);
        el.ui.on('keydown', function (e) {
            if (this.ui.attr('placeholder').length && !this.value) {
                this.value = this.ui.attr('placeholder');
                this.e1 = this.selectionEnd = this.selectionStart = this.s1 = 0;
            } else {
                this.s1 = this.selectionStart; this.e1 = this.selectionEnd;
            }

            //var key = (e.charCode && e.charCode > 0) ? e.charCode : e.keyCode;
            var key =  e.charCode || e.keyCode || 0;
            if ([13,27,82].indexOf(key) != -1) return true;
            var dg = ((key >= 96 && key <= 105)) ? (key-96).toString() : String.fromCharCode(key);
            //TODO: fix for FF
            //var selected = this.value.substr(this.selectionStart,this.selectionEnd);

            switch (key) {
                case 8:
                    if (selected) {
                        var pos = this.value.indexOf(selected);
                        this.value = this.value.substr(0,pos)+this.ui.attr('placeholder').substr(pos, selected.length)+
                            this.value.substr(pos+selected.length, this.value.length);
                        var shift = this.ui.attr('placeholder').substr(pos, selected.length).indexOf('_');
                        if (shift > 0) pos += shift;
                        this.selectionStart = this.e1 = this.selectionEnd = this.s1 = pos;
                    } else {
                        this.e1 = this.s1 = --this.selectionStart; --this.selectionEnd;
                        while ((this.s1 >= 0) && !/\d/.test(this.value.charAt(this.s1))) { this.s1 = --this.selectionStart; --this.selectionEnd;}
                        if (this.s1 >= 0 && /\d/.test(this.value.charAt(this.s1))) this.value = this.value.substr(0, this.s1) + '_' + this.value.substr((this.s1+1), this.value.length);
                        else this.s1 = this.e1 + 1;
                        this.selectionStart = this.selectionEnd = this.s1;
                    }
                    this.dispatchEvent(new Event('change'));
                    break;
                case 9:
                    var el = null; var way = e.shiftKey ? -1 : 1;
                    var index = parseInt(this.ui.attr('tabindex')) + way;
                    if (index > 0) while (el = ui.el('[tabindex="'+index+'"]'))
                        if (el.ui.attr('disabled')) { index += way } else { el.ui.focus(); break; }
                    if (index <= 1 && way < 0) return e.preventDefault();
                    e.stopPropagation();
                    // return false;
                    return;
                case 37:
                    this.s1 = --this.selectionStart; this.e1 = --this.selectionEnd;
                    break;
                case 39:
                    this.s1 = ++this.selectionStart;
                    break;
                case 46:
                    var sl = this.value.slice(this.selectionStart),
                        tt, ts = this.ui.attr('placeholder').slice(this.selectionStart);
                    if (selected) {
                        tt = (this.value.substr(this.selectionStart+selected.length, this.value.length).match(/\d+/g)||[]).join('');
                        this.e1 = this.s1;
                    } else {
                        tt = (this.value.slice(this.selectionStart).match(/\d+/g)||[]).join('').slice(1);
                    }
                    for (var i in tt) ts = ts.replace('_', tt[i]);
                    this.value = this.value.replace(sl, ts);
                    this.selectionStart = this.s1 ; this.selectionEnd = this.e1;
                    break;
                default: this.insertDigit(dg, selected);
            }
            e.preventDefault();
            e.stopPropagation();
            // return /\d/.test(dg);
            return;
        }).ui.on('focus', function (e) {
            this.init(false);
            // return false;
            return;
        }).ui.on('blur',function(e) {
            if (this.value.match(/[\d]+/g)) this.value = !this.cleared ? this.value : this.value.replace(/\_/g, '');
            else this.value = '';
            input_validator(this);
            // return false;
            return
        }).ui.on('paste',function(e) {
            var dgs = e.clipboardData.getData('Text').match(/\d+/g) ? e.clipboardData.getData('Text').match(/\d+/g).join('') : '';
            //TODO pate afte cursor position & past selected pice
            for (var i in dgs) this.insertDigit(dgs[i], selected);
            // return false;
            return;
        });
    }
    return el;
    }; g.maskedigits = maskedigits;

}( window, window.ui ));