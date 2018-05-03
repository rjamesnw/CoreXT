var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        CoreXT.registerNamespace("CoreXT", "System");
        var $Object = (function (_super) {
            __extends($Object, _super);
            function $Object() {
                var _this = this;
                if (CoreXT.Browser.ES6)
                    CoreXT.safeEval("var _super = function() { return null; }");
                _this = _super.call(this) || this;
                return _this;
            }
            $Object.prototype.getTypeInfo = function () {
                if (!this.constructor.$__name && this.constructor.getTypeName)
                    this.constructor.getTypeName();
                return this.constructor;
            };
            ;
            $Object.prototype.equal = function (value) {
                return this === value;
            };
            $Object.prototype.valueOf = function () { return this.$__value; };
            ;
            $Object.prototype.toString = function () { return '' + this; };
            ;
            $Object.prototype.getData = function (data) {
            };
            $Object.prototype.setData = function (data) {
            };
            $Object.prototype.dispose = function (release) {
                var appDomain = this.$__appDomain;
                this.dispose = CoreXT.noop;
                if (appDomain)
                    appDomain.dispose(this, release);
            };
            ;
            $Object.prototype.$__reset = function () {
                if (this.dispose !== CoreXT.noop)
                    CoreXT.dispose(this, false);
                var instance = (_a = this.init).call.apply(_a, __spread([this, this, false], arguments));
                instance.$__appDomain.objects.addObject(instance);
                delete instance.dispose;
                return this;
                var _a;
            };
            $Object.getTypeName = function (object, cacheTypeName) {
                if (cacheTypeName === void 0) { cacheTypeName = true; }
                this.getTypeName = CoreXT.getTypeName;
                return CoreXT.getTypeName(object, cacheTypeName);
            };
            $Object.isEmpty = function (obj) {
                this.isEmpty = CoreXT.isEmpty;
                return CoreXT.isEmpty(obj);
            };
            $Object['$Object Factory'] = (function (_super) {
                __extends(Factory, _super);
                function Factory() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Factory.prototype['new'] = function (value, makeValuePrivate) {
                    if (makeValuePrivate === void 0) { makeValuePrivate = false; }
                    return CoreXT.Types.__new.call(this, value, makeValuePrivate);
                };
                Factory.prototype.init = function ($this, isnew, value, makePrivate) {
                    if (makePrivate === void 0) { makePrivate = false; }
                    if (!isnew)
                        $this.$__reset();
                    if ($this.$__appDomain == void 0)
                        $this.$__appDomain = System.AppDomain.default;
                    if ($this.$__app == void 0)
                        $this.$__app = System.Application.default;
                    if (value == void 0) {
                        if (makePrivate) {
                            $this.valueOf = function () { return value; };
                            $this.toString = function () { return '' + value; };
                        }
                        else {
                            $this['$__value'] = value;
                        }
                    }
                    return $this;
                };
                return Factory;
            }(CoreXT.FactoryBase($Object, null))).register(System);
            return $Object;
        }(CoreXT.global.Object));
        System.Object = $Object['$Object Factory'].$__type;
        function _addObjectPrototypeProperties(type) {
            for (var p in $Object.prototype)
                if (System.Object.prototype.hasOwnProperty.call($Object.prototype, p) && p.charAt(0) != "$" && p.charAt(0) != "_")
                    if (!(p in type.prototype))
                        type.prototype[p] = $Object.prototype[p];
            return type;
        }
        var $String = (function (_super) {
            __extends($String, _super);
            function $String() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            $String.replace = function (source, replaceWhat, replaceWith, ignoreCase) {
                if (typeof source !== 'string')
                    source = "" + source;
                if (typeof replaceWhat !== 'string')
                    replaceWhat = "" + replaceWhat;
                if (typeof replaceWith !== 'string')
                    replaceWith = "" + replaceWith;
                if (ignoreCase)
                    return source.replace(new RegExp(System.Text.RegEx.escapeRegex(replaceWhat), 'gi'), replaceWith);
                else if (CoreXT.Browser.type == CoreXT.Browser.BrowserTypes.Chrome)
                    return source.split(replaceWhat).join(replaceWith);
                else
                    return source.replace(new RegExp(System.Text.RegEx.escapeRegex(replaceWhat), 'g'), replaceWith);
            };
            $String.replaceTags = function (html, tagReplacement) {
                return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
            };
            $String.pad = function (str, fixedLength, leftPadChar, rightPadChar) {
                if (str === void 0)
                    str = "";
                if (leftPadChar === void 0 || leftPadChar === null)
                    leftPadChar = "";
                if (rightPadChar === void 0 || rightPadChar === null)
                    rightPadChar = "";
                var s = "" + str, targetLength = fixedLength || 0, remainder = targetLength - s.length, lchar = "" + leftPadChar, rchar = "" + rightPadChar, i, n, llen, rlen, lpad = "", rpad = "";
                if (remainder == 0 || (!lchar && !rchar))
                    return str;
                if (lchar && rchar) {
                    llen = Math.floor(remainder / 2);
                    rlen = targetLength - llen;
                }
                else if (lchar)
                    llen = remainder;
                else if (rchar)
                    rlen = remainder;
                for (i = 0; i < llen; ++i)
                    lpad += lchar;
                for (i = 0; i < rlen; ++i)
                    rpad += rchar;
                return lpad + s + rpad;
            };
            $String.append = function (source, suffix, delimiter) {
                if (source === void 0)
                    source = "";
                else if (typeof source != 'string')
                    source = '' + source;
                if (typeof suffix != 'string')
                    suffix = '' + suffix;
                if (typeof delimiter != 'string')
                    delimiter = '' + delimiter;
                if (!source)
                    return suffix;
                return source + delimiter + suffix;
            };
            $String.prepend = function (source, prefix, delimiter) {
                if (source === void 0)
                    source = "";
                else if (typeof source != 'string')
                    source = '' + source;
                if (typeof prefix != 'string')
                    prefix = '' + prefix;
                if (typeof delimiter != 'string')
                    delimiter = '' + delimiter;
                if (!source)
                    return prefix;
                return prefix + delimiter + source;
            };
            $String.prototype.replaceAll = function (replaceWhat, replaceWith, ignoreCase) {
                return $String.replace(this.toString(), replaceWhat, replaceWith, ignoreCase);
            };
            $String.prototype.toString = function () { return this.$__value; };
            $String.prototype.valueOf = function () { return this.$__value; };
            $String['$String Factory'] = (function (_super) {
                __extends(Factory, _super);
                function Factory() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Factory.prototype['new'] = function (value) { return null; };
                Factory.prototype.init = function ($this, isnew, value) {
                    $this.$__value = CoreXT.global.String(value);
                    $this.length = $this.$__value.length;
                    for (var i = 0; i < $this.length; ++i)
                        $this[i] = $this.charAt(i);
                    return $this;
                };
                return Factory;
            }(CoreXT.FactoryBase($String, null))).register(System);
            return $String;
        }(CoreXT.global.String));
        System.String = $String['$String Factory'].$__type;
        var $Array = (function (_super) {
            __extends($Array, _super);
            function $Array() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            $Array['$Array Factory'] = function () {
                return (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.$Type = $Array;
                        _this.$BaseFactory = null;
                        return _this;
                    }
                    Factory.prototype['new'] = function () {
                        var items = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            items[_i] = arguments[_i];
                        }
                        return null;
                    };
                    Factory.prototype.init = function ($this, isnew) {
                        var items = [];
                        for (var _i = 2; _i < arguments.length; _i++) {
                            items[_i - 2] = arguments[_i];
                        }
                        try {
                            $this.push.apply($this, items);
                        }
                        catch (e) {
                            for (var i = 0, n = items.length; i < n; ++i)
                                $this.push(items[i]);
                        }
                        $this.length = $this.$__value.length;
                        for (var i = 0; i < $this.length; ++i)
                            $this[i] = $this.charAt(i);
                        return $this;
                    };
                    return Factory;
                }(CoreXT.FactoryBase($Array, null))).register(System);
            }();
            return $Array;
        }(CoreXT.global.Array));
        System.Array = $Array['$Array Factory'].$__type;
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.PrimitiveTypes.js.map