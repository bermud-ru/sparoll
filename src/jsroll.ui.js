/**
 * @app jsroll.ui.js
 * @category RIA (Rich Internet Application) / SPA (Single-page Application) UI (User Interface)
 *
 * Классы RIA / SPA application framework UI (User Interface)
 * @author Андрей Новиков <andrey@novikov.be>
 * @status beta
 * @version 0.1.0
 * @revision $Id: jsroll.ui.js 0004 2016-05-30 9:00:01Z $
 */

(function ( g, undefined ) {
    'suspected';
    'use strict';

    g.config = {
        app: {container:'[role="workspace"]'},
        msg: {container:'.alert.alert-danger', tmpl:'alert-box'},
        spinner: '.locker.spinner',
        popup: {wnd:'.b-popup', container:'.b-popup .b-popup-content'}
    };

    var ui = function(instance) {
        this._parent = null;
        this._css = null;
        this.instance = instance || g;
        return this;
    }; ui.prototype = {
        create:function(el, v){
            if (typeof el === 'object') { var o = new ui(el); if (o && typeof v == 'string') g[v]=o; return o; }
            return null;
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
                var els = this.instance.querySelectorAll(s);
                if (!els) return []; var r = Array.prototype.slice.call(els).map(function (e,i,a) {
                    if (!e.hasOwnProperty('ui')) e.ui = new ui(e);
                    if (typeof fn == 'function') fn.call(e,i,a);
                    return e;
                });
                if (typeof fn == 'string') g[fn]=r; else if (typeof v == 'string') g[v]=r;
                return r;
            } else return [];
        },
        attr: function (a, v) {
            if (!a) {
                var attrs = {}, n;
                for (var i in this.instance.attributes)
                    attrs[(n = this.instance.attributes[i].nodeName)] = this.instance.getAttribute(n);
                return attrs;
            }
            if (a && typeof v === 'undefined') try {
                return JSON.parse(this.instance.getAttribute(a));
            } catch (e) {
                return this.instance.getAttribute(a);
            } else if (a && v)
                if (typeof v === 'object') this.instance.setAttribute(a, JSON.stringify(v));
                else this.instance.setAttribute(a, v);
            return this;
        },
        merge: function () {
            var i = 1, t = arguments[0] || {};
            if (this.instance.hasOwnProperty('ui')) { t = this.instance; i = 0; }
            Array.prototype.slice.call(arguments, i).forEach( function(v, k, a) {
                Object.defineProperties(t, Object.keys(v).reduce( function (d, key) {
                    d[key] = Object.getOwnPropertyDescriptor(v, key);
                    return d;
                }, {}));
            });
            return t;
        },
        get parent() {
            return this._parent || (this._parent = new ui(this.instance && this.instance.parentElement));
        },
        src: function (e) {
            var el = e ? e : this.instance;
            return new ui(el.srcElement || el.target);
        },
        get css() {
            return this._css || (this._css = new css(this.instance));
        },
        on: function (event, fn, opt) {
            this.instance.addEventListener(event, fn, !!opt);
            return this.instance;
        },
        dom: function(d, mime) {
            if ( !d || typeof d !== 'string' ) return null;
            return g.dom(d, mine);
        },
        focus: function(s) {
            var el;
            if (s) el = (typeof s == 'string' ? document.querySelector(s) : s); else el = this.instance;
            if (el) g.setTimeout(function() { el.focus(); return false }, 0);
            return el;
        }
    }; g.ui = new ui(document);

    var css = function(instance){
        this.instance = instance;
        return this;
    }; css.prototype = {
        el: function(i) {
          this.instance = typeof i === 'string' ? document.querySelector(i) : i ; return this;
        },
        style:function(k,v) {
            this.instance.style[k] = v;
            return this;
        },
        has: function(c){
           return this.instance.className.match(re('(?:^|\\s)' + c + '(?!\\S)'));
        },
        add: function (c) {
            if (this.instance && !this.has(c)) this.instance.className += ' ' + c;
            return this;
        },
        del: function (c) {
            if (this.instance) this.instance.className = this.instance.className.replace(re('(?:^|\\s)' + c + '(?!\\S)'), '');
            return this;
        },
        tgl: function (c) {
            if (this.instance) {
                if (!this.has(c)) this.instance.className += ' ' + c;
                else  this.instance.className = this.instance.className.replace(re('(?:^|\\s)' + c + '(?!\\S)'), '');
            }
            return this;
        }
    }; g.css = new css(document);

    Object.defineProperty(g, 'selected', {
        get: function selected() {
            return  g.getSelection ? g.getSelection().toString() : // Not IE, используем метод getSelection
                document.selection.createRange().text; // IE, используем объект selection
        }
    });

    function selecting() {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
            }
        } else if (document.selection) {  // IE?
            document.selection.empty();
        }
    }; g.selecting = selecting;

    g.fadeRule = [0.0,  0.301, 0.477, 0.602, 0.699, 0.778, 0.845, 0.903, 0.954, 1.0]; // Math.log([1..10])/ Math.log(10);
        // g.fadeRule.reverse();
    /**
     * @function fadeOut
     * Функция плавного скрытия элемента - свойство opacity = 0
     *
     * @param el элемент DOM
     * @param cb callback функция
     */
    function fadeOut(el, cb){
        var st = null, d = 8,
            fn = function fn (d, cb) {
                this.style.opacity = g.fadeRule[d];
                if (d-- <= 0){ this.style.display = 'none'; clearTimeout(st); if (typeof cb === 'function') return cb.call(this); }
                else return st = setTimeout(fn.bind(this, d, cb),typeof cb === 'number' ? cb : 25);
            };
        if (el) {
            el.style.display = 'inherit'; el.style.opacity = 1;
            st = setTimeout(fn.bind(el, d, cb), typeof cb === 'number' ? cb : 25);
        }
    }; g.fadeOut = fadeOut;

    /**
     * @function fadeIn
     * Функция плавного отображения элемента - свойство opacity = 1
     *
     * @param el элемент DOM
     * @param cb callback функция
     */
    function fadeIn(el, cb) {
        var st = null, d = 1,
            fn = function fn (d, cb) {
                this.style.opacity = g.fadeRule[d];
                if (d++ >= 9){ clearTimeout(st); if (typeof cb === 'function') return cb.call(this); }
                else return st = setTimeout(fn.bind(this, d, cb),typeof cb === 'number' ? cb : 25);
            };
        if (el) {
            el.style.display = 'inherit'; el.style.opacity = 0;
            return st = setTimeout(fn.bind(el, d, cb), typeof cb === 'number' ? cb : 25);
        }
    }; g.fadeIn = fadeIn;
}( window ));

(function ( g, ui, undefined ) {
    'suspected';
    'use strict';

    if ( typeof ui === 'undefined' ) return false;

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
        ui.on("keydown", function (e) { if (e.keyCode == 27 ) g.app.popup(); });
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
            (s || []).map(function (a, i) {
                for (var b in self.registry[a]) {
                    switch  (typeof self.registry[a][b]) {
                        case 'object': p.ui.els(a, function(){ this.ui.on(self.registry[a][b][0], self.registry[a][b][1]);}); break;
                        case 'string': p.ui.els(a, function(){ this.ui.on(self.registry[a][0], self.registry[a][1]);}); return;
                        case 'function': self.registry[a][b].call(p.ui.els(a), self.dim[a] || {});
                    }
                };
            });
            return self;
        },
        variable: function (el, id) {
            if (el && !el.hasOwnProperty('dim')) {
                Object.defineProperty(el, 'dim', {
                    get: function () {
                        try {
                            return g.app.dim[id] || (g.app.dim[id] = Object.assign(JSON.parse(storage.getItem(id)||''),{self:el}));
                        } catch (e) { g.app.dim[id] = {}; g.app.dim[id].self = el; return g.app.dim[id]; }
                    }
                });
                g.app.dim[id] = {}; g.app.dim[id].self = el;
                el.store = function (fields) {
                    var s = {};
                    Object.keys(g.app.dim[id]).map(function(k){if(fields.indexOf(k) != -1) s[k] = g.app.dim[id][k];});
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
        },
        elem: ui.el(g.config.msg.container),
        msg: {
            show: function (params, close) {
                tmpl(g.config.msg.tmpl, params, g.app.elem);
                fadeIn(g.app.elem, 0);
                if (typeof close == 'undefined' || !close) fadeOut(g.app.elem, 90);
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

        popup: function (id, data, opt) {
            this.wnd = this.wnd || ui.el(g.config.popup.wnd);
            if (arguments.length && !this.wnd.visible) {
                this.container = this.container || ui.el(g.config.popup.container);
                tmpl(id, data, this.variable(this.container, id), opt);
                fadeIn(this.wnd, 35);
                this.wnd.visible = true;
            } else {
                if (this.wnd.visible) fadeOut(this.wnd, 35);
                this.wnd.visible = false;
            }
            return this.container;
        },

        fader: function (el, v, context) {
            var app = this, self = v ? ui.el(el, v) : ui.el(el);
            if (self && !self.hasOwnProperty('fade')) {
                self.sleep = 35;
                self.faded = false;
                self.fade_context = context ? self.ui.el(context) : self;
                self.fade = function (id, data, opt) {
                    if (arguments.length && !self.faded) {
                        tmpl(id, data, app.variable(self.fade_context, id), opt);
                        fadeIn(self, this.sleep); self.faded = true;
                    } else if (!arguments.length && self.faded) {
                        fadeOut(self, this.sleep); self.faded = false;
                    }
                    return self;
                };
            }
            return self;
        }

    }; g.app = new app(g.document);

    var filter = function (els, v) {
        var elements = [], index = 0, valid = true;
        if (els) {
            if (typeof v === 'object' && v.hasOwnProperty('page')) index = v['page'];
            els.map(function (e, i, a) {
                e.ui.el('input', function (e) {
                    elements.push(this);
                    if (typeof v === 'object' && v.hasOwnProperty(this.name)) this.value = v[this.name];
                    valid = valid & input_validator(this);
                });
            });

            return {
                el: elements,
                index: index,
                valid: valid,
                set params(v) {
                    var params = {};
                    if (typeof v === 'object') params = v; else if (typeof v === 'string') params = location.decoder(v);
                    this.valid = true;
                    if (params.hasOwnProperty('page')) this.index = params['page'];
                    this.el.map(function (e,i,a) {
                        if (params.hasOwnProperty(e.name)) e.value = params[e.name];
                        else e.value = '';
                        this.valid = this.valid & input_validator(e);
                    });
                },
                get params() {
                    var params = {};
                    this.valid = true, self = this;
                    this.el.map(function (e,i,a) {
                        if (e.value) params[e.name] = e.value;
                        self.valid = self.valid & input_validator(e);
                    });
                    return params;
                },
                // diff: function (a, b) {
                //     return Object.keys(a).concat(Object.keys(b)).reduce(function(map, k) {
                //         if (a[k] !== b[k]) map[k] = b[k];
                //         return map;
                //     }, {});
                // },
                get uri() {
                    var p = this.params;
                    p['page'] = this.index;
                    return location.encoder(p);
                }
            };
        }
        return null;
    }; g.filter = filter;

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
            abort:function () {
                if (this.proc) this.proc.abort(); this.proc = null;
            },
            done:function (data,  method) {
                return this.rs[method] = data;
            },
            fail:function (data,  method) {
                return this.error = data;
            }
        }; for (var n in methods) {
            var l = methods[n].toLowerCase(), u = l.toUpperCase();
            p.rs[u] = null;
            p[l] = (function(u){ return function(data) { this.rs[u] = null; return this.proc = rest(this,u,data); }}).apply(p,[u]);
            Object.defineProperty(p, u, { get: function() { return this.rs[u]; }});
        }

        if (rt) return p;
        else console.warn('Can\'t resolve route:' ,route);
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
            fadeIn(this.elem, 0);
            if (typeof close == 'undefined' || !close) fadeOut(this.elem, 90);
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

    var input_validator = function(element){
        if (element) {
            var res = true;
            if ((element.getAttribute('required') !== null) && !element.value) res = false;
            else if ((element.getAttribute('required') === null) && !element.value) res = true;
            else if (element.getAttribute('pattern') === null) res = true;
            else {
                try {
                    var pattern = /[?\/]([^\/]+)\/([^\/]*)/g.exec(element.getAttribute('pattern')) || [];
                    var re = new RegExp(pattern[1], pattern[2]);
                    res = re.test(element.value.trim());
                } catch(e) { res = false }
            }

            var el = inputer(element.hasOwnProperty('ui') ? element.ui : ui.create(element));
            if (!res) el.instance.status = 'error';
            else if (!el.instance.hasAttribute('disabled'))
                if (element.value.length) el.instance.status = 'success'; else el.instance.status = 'none';
            return res;
        }
        return false;
    };  g.input_validator = input_validator;

    var inputer = function(el) {
        if (el && !el.instance.hasOwnProperty('status')) {
            var parent = el.parent;
            el.instance.chk = parent.el('span').ui;
            Object.defineProperty(el.instance, 'status', {
                set: function status(stat) {
                    parent.css.add('has-feedback').del('has-error').del('has-warning').del('has-success');
                    if (this.chk)  this.chk.css.del('glyphicon-ok').del('glyphicon-warning-sign').del('glyphicon-remove').del('spinner');
                    switch (stat) {
                        case 'error':
                            this._status = 'error';
                            if (this.chk) this.chk.css.add('glyphicon-remove');
                            parent.css.add('has-error');
                            break;
                        case 'warning':
                            this._status = 'warning';
                            if (this.chk) this.chk.css.add('glyphicon-warning-sign');
                            parent.css.add('has-warning');
                            break;
                        case 'success':
                            this._status = 'success';
                            if (this.chk) this.chk.css.add('glyphicon-ok');
                            parent.css.add('has-success');
                            break;
                        case 'spinner':
                            this._status = 'spinner';
                            if (this.chk) this.chk.css.add('spinner');
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
        var result = true;
        for (var i =0; i < this.elements.length; i++) result = result & input_validator(this.elements[i]);

        if (!result) {
            if (spinner) spinner = false;
            msg.show({message: 'неверно заполнены поля формы!'});
        }
    return result;
    };

    var typeahead = function (element, opt) {
    if (element) {
        var instance = element.hasOwnProperty('ui') ? element : ui.create(element).instance;
        var th = {
            tmpl:function(data){
                var self = this.owner;
                this.index = 0; this.key = self.value.toLowerCase() || 'null';
                if (self.pannel) {
                    var n = ui.dom(tmpl(this.opt.tmpl, {data:data})).firstChild;
                    if (n) self.pannel.innerHTML = n.innerHTML;
                } else {
                    self.ui.parent.instance.insertAdjacentHTML('beforeend', tmpl(this.opt.tmpl, {data: data}));
                    self.ui.parent.css().add('dropdown');
                    self.pannel = self.ui.parent.el('.dropdown-menu.list');
                }
                self.ui.parent.els('.dropdown-menu.list li', function () {
                    this.ui.on('mousedown', function (e) {
                        self.value = this.innerHTML;
                        if (self.typeahead.opt.key) self.typeahead.opt.key.value = this.ui.attr('value');
                        return false;
                    });
                });
            },
            xhr:function(){
                var self = this.owner, params = {};
                params[self.name] = self.value;
                var index = self.value ? self.value.toLowerCase() : 'null';
                if (!this.cache.hasOwnProperty(index) || index == 'null'){
                    self.status = 'spinner';
                    xhr.request({url: location.update(self.ui.attr('url'), params), rs: {'Hash': acl.user.hash}})
                        .result(function (d) {
                            if ([200, 206].indexOf(this.status) < 0) {
                                msg.show({error: 'ОШИБКА', message: this.status + ': ' + this.statusText});
                            } else {
                                try {
                                    var res = JSON.parse(this.responseText);
                                    if (res.result == 'error') {
                                        msg.show(res);
                                    } else {
                                        self.typeahead.cache[index] = res.data;
                                        self.typeahead.show(res.data);
                                    }
                                } catch (e) {
                                    msg.show({message: 'сервер вернул не коректные данные'});
                                }
                            }
                            self.status = 'none';
                            return this;
                        });
                } else {
                    self.typeahead.show(this.cache[index]);
                }
            },
            show:function(data){
                var self = this.owner;
                if (self === g.document.activeElement) if (Object.keys(data).length) {
                    this.tmpl(data);
                    return fadeIn(self.pannel);
                } else {
                    if (self.pannel) {
                        self.pannel.innerHTML = null;
                        fadeOut(self.pannel);
                    }
                }
                return false;
            },
            onKeydown:function (e) {
                var key = (e.charCode && e.charCode > 0) ? e.charCode : e.keyCode;
                var th = this.typeahead, cashe = th.cache[th.key],cnt = Object.keys(cashe || {}).length - 1,y = 0;
                switch (key) {
                    case 38:
                        for (var x in cashe) {
                            if (y == th.index) {
                                this.value = cashe[x];
                                if (th.opt.key) th.opt.key.value = x;
                                this.selectionStart = this.selectionEnd = this.value.length;
                                if (th.index > 0) th.index--; else th.index = cnt;
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            }
                            y++;
                        }
                        return false;
                    case 40:
                        for (var x in cashe) {
                            if (y == th.index) {
                                this.value = cashe[x];
                                if (th.opt.key) th.opt.key.value = x;
                                this.selectionStart = this.selectionEnd = this.value.length;
                                if (th.index < cnt) th.index++; else th.index = 0;
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            }
                            y++;
                        }
                        return false;
                    case 13:
                        this.status = 'none';
                        fadeOut(this.pannel);
                        e.preventDefault();
                        return e.stopPropagation();
                    default: return false;
                }
            },
            onChange: function (e) {
                var th = this.typeahead;
                if (th.opt.key) {
                    th.opt.key.value = '';
                    if (this.value && th.cache.hasOwnProperty(this.value.toLowerCase())) {
                        var ds = this.typeahead.cache[this.value.toLowerCase()];
                        for (var x in ds) if (ds[x].toLowerCase() === this.value.toLowerCase()) th.opt.key.value = x;
                    }
                    return th.opt.key.value;
                }
                return false;
            },
            onFocus:function(e){
                this.typeahead.xhr();
                return false;
            },
            onInput:function(e){
                this.typeahead.xhr();
                return false;
            },
            onBlur:function(e){
                fadeOut(this.pannel);
                return false;
            }
        };
        th.index = 0; th.key = null; th.cache = {}; th.opt = {master:[], slave:[], tmpl:'typeahead-tmpl'};
        instance.typeahead = th;
        th.opt = Object.assign(th.opt, opt);
        instance.typeahead.owner = element;
        inputer(instance.ui).on('focus',th.onFocus).ui.on('input',th.onInput)
            .ui.on('blur',th.onBlur).ui.on('keydown', th.onKeydown).ui.on('change',th.onChange);
        if (!instance.ui.attr('tabindex')) instance.ui.attr('tabindex', '0');
        return instance;
    }
    }; g.typeahead = typeahead;

    var maskedigits = function(elemetn, pattern) {
    var el = inputer(elemetn);
    if (el.instance.tagName === 'INPUT') {
        if (pattern) el.instance.maxLength = el.attr('placeholder', pattern || '').attr('placeholder').length;
        if (!el.attr('tabindex')) el.attr('tabindex', '0');
        if (el && !el.instance.hasOwnProperty('insertDigit')) {
            el.instance.insertDigit = function(dg, selected) {
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
                return this.selectionStart;
            };
            el.instance.init = function (clear) {
                var text = this.value;
                var pos = 0;
                if (text) {
                    this.value = this.ui.attr('placeholder');
                    pos = this.value.indexOf('_');
                    for (var i in text) if (/\d/.test(text[i])) {
                        this.value = this.value.replace('_', text[i]);
                        pos = this.value.indexOf('_');
                    }
                } else {
                    if (!clear) this.value = this.ui.attr('placeholder');
                    pos = this.ui.attr('placeholder').indexOf('_');
                }
                if (clear) this.value = this.value.replace(/\_/g, '');
                return this.e1 = this.selectionEnd = this.selectionStart = this.s1 = (pos > -1 ? pos : this.value.length);
            };
        };
        el.instance.init(true);
        el.on('keydown', function (e) {
            if (this.ui.attr('placeholder').length && !this.value) {
                this.value = this.ui.attr('placeholder');
                this.e1 = this.selectionEnd = this.selectionStart = this.s1 = 0;
            } else {
                this.s1 = this.selectionStart; this.e1 = this.selectionEnd;
            }

            var key = (e.charCode && e.charCode > 0) ? e.charCode : e.keyCode;
            if ([13,27,82].indexOf(key) != -1) return true;
            var dg = ((key >= 96 && key <= 105)) ? (key-96).toString() : String.fromCharCode(key);

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
                    break;
                case 9:
                    var el = false; var way = e.shiftKey ? -1 : 1;
                    var index = parseInt(this.ui.attr('tabindex'));
                    if (index > 0) while (el = ui.el('[tabindex="'+index+'"]'))
                        if (el.ui.attr('disabled')) index += way; else { el.focus(); break; }
                    if (index <= 1 && way < 0) return e.preventDefault();
                    e.stopPropagation();
                    return false;
                case 37:
                    this.s1 = --this.selectionStart; this.e1 = --this.selectionEnd;
                    break
                case 39:
                    this.s1 = ++this.selectionStart;
                    break
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
                    break
                default: this.insertDigit(dg, selected);
            }
            e.preventDefault(); e.stopPropagation();
            return /d/.test(dg);
        }).ui.on('focus', function (e) {
            this.init(false); e.preventDefault(); e.stopPropagation();
            return false;
        }).ui.on('blur',function(e){
            if (this.value.match(/[\d]+/g)) this.value = this.value.replace(/\_/g, '');
            else this.value = '';
            e.preventDefault(); e.stopPropagation();
            return false;
        }).ui.on('paste',function(e){
            var dgs = e.clipboardData.getData('Text').match(/\d+/g) ? e.clipboardData.getData('Text').match(/\d+/g).join('') : ''
            //TODO pate afte cursor position & past selected pice
            for (var i in dgs) this.insertDigit(dgs[i], selected);
            e.preventDefault(); e.stopPropagation();
            return false;
        });
    }
    return el;
    }; g.maskedigits = maskedigits;

}( window, window.ui ));