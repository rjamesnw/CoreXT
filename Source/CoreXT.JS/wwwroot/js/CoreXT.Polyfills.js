Array.prototype.last = function () { return this[this.length - 1]; };
Array.prototype.first = function () { return this[0]; };
Array.prototype.append = function (items) { this.push.apply(this, items); return this; };
Array.prototype.select = function (func) { if (!func)
    return this; var _ = [], __; for (var i = 0; i < this.length; ++i)
    _[i] = func(this[i]); return _; };
Array.prototype.where = function (func) { if (!func)
    return this; var _ = [], __; for (var i = 0; i < this.length; ++i)
    if (func(__ = this[i]))
        _.push(__); return _; };
var CoreXT;
(function (CoreXT) {
    var Pollyfills;
    (function (Pollyfills) {
        var window = CoreXT.global;
        var String = CoreXT.global.String;
        var Array = CoreXT.global.Array;
        var RegExp = CoreXT.global.RegExp;
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                if (!this)
                    throw new TypeError("'trim()' requires an object instance.");
                return this.replace(/^\s+|\s+$/g, '');
            };
        }
        if (!document.head)
            document.head = document.getElementsByTagName('head')[0] || {
                title: "", tagName: "HEAD", firstChild: null, lastChild: null, previousSibling: null, nextSibling: null, previousElementSibling: null, nextElementSibling: null, childNodes: [], children: []
            };
        if (!Date.now) {
            Date.now = function now() {
                return new Date().getTime();
            };
        }
        if (":".split(/:/g).length == 0) {
            String.prototype['$__CoreXT_oldsplit'] = String.prototype.split;
            String.prototype.split = function (separator, limit, delimiterList) {
                var delimiters, nonDelimiters;
                if (!this)
                    throw new TypeError("'split()' requires an object instance.");
                if (delimiterList)
                    delimiters = delimiterList;
                else if (!(separator instanceof RegExp))
                    return String.prototype['$__CoreXT_oldsplit'](separator, limit);
                else
                    delimiters = this.match(separator);
                nonDelimiters = [];
                var i, n, delimiter, startdi = 0, enddi = 0;
                if (delimiters) {
                    for (i = 0, n = delimiters.length; i < n; ++i) {
                        delimiter = delimiters[i];
                        enddi = this.indexOf(delimiter, startdi);
                        if (enddi == startdi)
                            nonDelimiters.push("");
                        else
                            nonDelimiters.push(this.substring(startdi, enddi));
                        startdi = enddi + delimiter.length;
                    }
                    if (startdi < this.length)
                        nonDelimiters.push(this.substring(startdi, this.length));
                    else
                        nonDelimiters.push("");
                }
                return nonDelimiters;
            };
        }
        if (!Array.prototype.indexOf)
            Array.prototype['indexOf'] = function (searchElement, fromIndex) {
                if (!this)
                    throw new TypeError("'indexOf()' requires an object instance.");
                var i, length = this.length;
                if (!length)
                    return -1;
                if (typeof fromIndex === 'undefined')
                    fromIndex = 0;
                else {
                    fromIndex = +fromIndex;
                    if (isNaN(fromIndex))
                        return -1;
                    if (fromIndex >= length)
                        fromIndex = length - 1;
                }
                if (fromIndex >= length)
                    return -1;
                if (fromIndex < 0)
                    fromIndex += length;
                for (i = fromIndex; i < length; ++i)
                    if (this[i] === searchElement)
                        return i;
                return -1;
            };
        if (!Array.prototype.lastIndexOf)
            Array.prototype['lastIndexOf'] = function (searchElement, fromIndex) {
                if (!this)
                    throw new TypeError("'lastIndexOf()' requires an object instance.");
                var i, length = this.length;
                if (!length)
                    return -1;
                if (typeof fromIndex == 'undefined')
                    fromIndex = length - 1;
                else {
                    fromIndex = +fromIndex;
                    if (isNaN(fromIndex))
                        return -1;
                    if (fromIndex >= length)
                        fromIndex = length - 1;
                }
                if (fromIndex < 0)
                    fromIndex += length;
                for (i = fromIndex; i >= 0; --i)
                    if (this[i] === searchElement)
                        return i;
                return -1;
            };
        if (typeof window.location !== 'undefined' && !window.location.origin)
            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        if (typeof Element !== 'undefined' && !("classList" in document.createElement("_"))) {
            (function () {
                var names = null;
                Element.prototype['classList'] = {
                    contains: function (name) {
                        if (!names) {
                            names = this.className.split(' ');
                            var namesUpdated = true;
                        }
                        var exists = names.indexOf(name) >= 0;
                        if (namesUpdated)
                            names = null;
                        return exists;
                    },
                    add: function (name) {
                        if (!names) {
                            names = this.className.split(' ');
                            var namesUpdated = true;
                        }
                        if (names.indexOf(name) < 0)
                            this.className += ' ' + name;
                        if (namesUpdated)
                            names = null;
                    },
                    remove: function (name) {
                        if (!names) {
                            names = this.className.split(' ');
                            var namesUpdated = true;
                        }
                        var i = names.indexOf(name);
                        if (i >= 0) {
                            names.splice(i);
                            this.className = names.join(' ');
                        }
                        if (namesUpdated)
                            names = null;
                    },
                    toggle: function (name, force) {
                        if (!names) {
                            names = this.className.split(' ');
                            var namesUpdated = true;
                        }
                        var exists = this.contains(name);
                        if (typeof force === 'undefined')
                            force = !exists;
                        if (exists) {
                            if (!force)
                                this.remove(name);
                        }
                        else {
                            if (force)
                                this.add(name);
                        }
                        if (namesUpdated)
                            names = null;
                        return !exists;
                    },
                    toString: function () {
                        return this.className;
                    }
                };
            })();
        }
        ;
        if (typeof Object.create != 'function') {
            (function () {
                var _ = function () { };
                Object.create = function (proto, propertiesObject) {
                    if (propertiesObject !== void 0) {
                        throw Error("'propertiesObject' parameter not supported.");
                    }
                    if (proto === null) {
                        throw Error("'proto' [prototype] parameter cannot be null.");
                    }
                    if (typeof proto != 'object') {
                        throw TypeError("'proto' [prototype] must be an object.");
                    }
                    _.prototype = proto;
                    return new _();
                };
            })();
        }
        if (typeof Array.isArray != 'function')
            Array.isArray = function (arg) { return typeof arg == 'object' && arg instanceof Array; };
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== 'function') {
                    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                }
                var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () { }, fBound = function () {
                    return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };
                if (this.prototype) {
                    fNOP.prototype = this.prototype;
                }
                fBound.prototype = new fNOP();
                return fBound;
            };
        }
    })(Pollyfills || (Pollyfills = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.Polyfills.js.map