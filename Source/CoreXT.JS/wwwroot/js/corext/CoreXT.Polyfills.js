// ###########################################################################################################################
// Browser detection (for special cases).
// ###########################################################################################################################
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
    // =============================================================================================
    var Polyfills;
    (function (Polyfills) {
        // -------------------------------------------------------------------------------------------------------------------
        var window = CoreXT.global;
        var String = CoreXT.global.String;
        var Array = CoreXT.global.Array;
        var RegExp = CoreXT.global.RegExp;
        if (!Number.MAX_SAFE_INTEGER)
            Number.MAX_SAFE_INTEGER = 9007199254740991;
        if (!Number.MIN_SAFE_INTEGER)
            Number.MIN_SAFE_INTEGER = -9007199254740991;
        // -------------------------------------------------------------------------------------------------------------------
        // ... add 'trim()' if missing, which only exists in more recent browser versions, such as IE 9+ ...
        // (source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FString%2FTrim)
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                if (!this)
                    throw new TypeError("'trim()' requires an object instance.");
                return this.replace(/^\s+|\s+$/g, '');
            };
        }
        // -------------------------------------------------------------------------------------------------------------------
        // ... fix head not accessible in IE7/8 ...
        if (!document.head)
            document.head = document.getElementsByTagName('head')[0] || {
                title: "", tagName: "HEAD", firstChild: null, lastChild: null, previousSibling: null, nextSibling: null, previousElementSibling: null, nextElementSibling: null, childNodes: [], children: []
            };
        // -------------------------------------------------------------------------------------------------------------------
        // ... add 'now()' if missing (exists as a standard in newer browsers) ...
        // (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)
        if (!Date.now) { // (used internally for log item times)
            Date.now = function now() {
                return new Date().getTime();
            };
        }
        // -------------------------------------------------------------------------------------------------------------------
        // ... fix the non-standard {string}.split() in older IE browsers, which strips out the empty strings ...
        // (this version accepts an optional third parameter, which is a list of already existing delimiters if available, which then ignores the 'separator' value [more efficient])
        if (":".split(/:/g).length == 0) {
            String.prototype['$__CoreXT_oldsplit'] = String.prototype.split; // (this is only executed once because of the ext line)
            String.prototype.split = function (separator, limit, delimiterList) {
                var delimiters, nonDelimiters;
                if (!this)
                    throw new TypeError("'split()' requires an object instance.");
                if (delimiterList)
                    delimiters = delimiterList;
                else if (!(separator instanceof RegExp))
                    return String.prototype['$__CoreXT_oldsplit'](separator, limit); // (old function works find for non-RegExp splits)
                else
                    delimiters = this.match(separator);
                nonDelimiters = [];
                // ... since empty spaces get removed, this has to be done manually by scanning across the text and matching the found delimiters ...
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
                        nonDelimiters.push(this.substring(startdi, this.length)); // (get any text past the last delimiter)
                    else
                        nonDelimiters.push(""); // (there must always by something after the last delimiter)
                }
                return nonDelimiters;
            };
        }
        // -------------------------------------------------------------------------------------------------------------------
        // ... add support for the new "{Array}.indexOf/.lastIndexOf" standard ...
        // (base on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
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
                    fromIndex = +fromIndex; // ('+' converts any boolean or string to a number)
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
        // -------------------------------------------------------------------------------------------------------------------
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
                    fromIndex = +fromIndex; // ('+' converts any boolean or string to a number)
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
        // -------------------------------------------------------------------------------------------------------------------
        // ... add any missing support for "window.location.origin" ...
        if (typeof window.location !== 'undefined' && !window.location.origin)
            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        // -------------------------------------------------------------------------------------------------------------------
        // ... add basic support for 'classList' on elements if missing ...
        if (typeof Element !== 'undefined' && !("classList" in document.createElement("_"))) { //TODO: Needs testing.
            (function () {
                var names = null; // (if 'names' is null, it is updated, and if not, use existing values [more efficient])
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
                            // ... exists, so remove it ...
                            if (!force) // If force is set to true, the class will be added but not removed.
                                this.remove(name);
                        }
                        else {
                            // ... missing, so add it ...
                            if (force) // If it’s false, the opposite will happen — the class will be removed but not added.
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
        // -------------------------------------------------------------------------------------------------------------------
        // ... add support for "Object.create" if missing ...
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
        // -------------------------------------------------------------------------------------------------------------------
        if (typeof Array.isArray != 'function') // Performance investigations: http://jsperf.com/array-isarray-vs-instanceof-array/5
            Array.isArray = function (arg) { return typeof arg == 'object' && arg instanceof Array; };
        // -------------------------------------------------------------------------------------------------------------------
        // (Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== 'function') {
                    // closest thing possible to the ECMAScript 5
                    // internal IsCallable function
                    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                }
                var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () { }, fBound = function () {
                    return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };
                if (this.prototype) {
                    // native functions don't have a prototype
                    fNOP.prototype = this.prototype;
                }
                fBound.prototype = new fNOP();
                return fBound;
            };
        }
        // -------------------------------------------------------------------------------------------------------------------
        // (prevent links from clicking into mobile safari if launching from a home screen shortcut [native full-screen mode])
        if (window.navigator && ("standalone" in window.navigator) && window.navigator["standalone"]) {
            var noddy, remotes = false;
            document.addEventListener('click', function (event) {
                noddy = event.target;
                // ... locate an anchor parent ...
                while (noddy.nodeName !== "A" && noddy.nodeName !== "HTML") {
                    noddy = noddy.parentNode;
                }
                if ('href' in noddy && noddy.href == '#') { // ('#' is a special link used for bootstrap buttons)
                    event.preventDefault();
                }
            }, false);
        }
    })(Polyfills || (Polyfills = {}));
    // =============================================================================================
})(CoreXT || (CoreXT = {}));
// #######################################################################################
//# sourceMappingURL=CoreXT.Polyfills.js.map