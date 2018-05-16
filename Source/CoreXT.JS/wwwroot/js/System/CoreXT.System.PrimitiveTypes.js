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
        System.Object = CoreXT.ClassFactory(System, void 0, function (base) {
            var Object = (function (_super) {
                __extends(Object, _super);
                function Object() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Object.prototype.getTypeInfo = function () {
                    if (!this.constructor.$__name && this.constructor.getTypeName)
                        this.constructor.getTypeName();
                    return this.constructor;
                };
                ;
                Object.prototype.equal = function (value) {
                    return this === value;
                };
                Object.prototype.valueOf = function () { return this.$__value; };
                ;
                Object.prototype.toString = function () { return '' + this; };
                ;
                Object.prototype.getData = function (data) {
                };
                Object.prototype.setData = function (data) {
                };
                Object.prototype.$__reset = function () {
                    if (this.dispose !== CoreXT.noop)
                        CoreXT.dispose(this, false);
                    var instance = (_a = this.init).call.apply(_a, __spread([this, this, false], arguments));
                    instance.$__appDomain.objects.addObject(instance);
                    delete instance.dispose;
                    return this;
                    var _a;
                };
                Object.getTypeName = function (object, cacheTypeName) {
                    if (cacheTypeName === void 0) { cacheTypeName = true; }
                    this.getTypeName = CoreXT.getTypeName;
                    return CoreXT.getTypeName(object, cacheTypeName);
                };
                Object.isEmpty = function (obj) {
                    this.isEmpty = CoreXT.isEmpty;
                    return CoreXT.isEmpty(obj);
                };
                Object['ObjectFactory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function (value, makeValuePrivate) {
                        if (makeValuePrivate === void 0) { makeValuePrivate = false; }
                        return CoreXT.Types.__new.call(this, value, makeValuePrivate);
                    };
                    Factory.init = function (o, isnew, value, makePrivate) {
                        if (makePrivate === void 0) { makePrivate = false; }
                        if (!isnew)
                            o.$__reset();
                        if (o.$__appDomain == void 0 && System.AppDomain)
                            o.$__appDomain = System.AppDomain.default;
                        if (o.$__app == void 0 && System.Application)
                            o.$__app = System.Application.default;
                        if (value != void 0) {
                            if (makePrivate) {
                                o.valueOf = function () { return value; };
                                o.toString = function () { return '' + value; };
                            }
                            else {
                                o['$__value'] = value;
                            }
                        }
                    };
                    return Factory;
                }(CoreXT.FactoryBase(Object, null)));
                return Object;
            }(CoreXT.DisposableFromBase(CoreXT.global.Object)));
            return [Object, Object["ObjectFactory"]];
        }, "Object");
        function _addObjectPrototypeProperties(type) {
            for (var p in System.Object.prototype)
                if (System.Object.prototype.hasOwnProperty.call(System.Object.prototype, p) && p.charAt(0) != "$" && p.charAt(0) != "_")
                    if (!(p in type.prototype))
                        type.prototype[p] = System.Object.prototype[p];
            return type;
        }
        System.String = CoreXT.ClassFactory(System, void 0, function (base) {
            var String = (function (_super) {
                __extends(String, _super);
                function String() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                String.replace = function (source, replaceWhat, replaceWith, ignoreCase) {
                    if (typeof source !== 'string')
                        source = "" + source;
                    if (typeof replaceWhat !== 'string')
                        replaceWhat = "" + replaceWhat;
                    if (typeof replaceWith !== 'string')
                        replaceWith = "" + replaceWith;
                    if (ignoreCase)
                        return source.replace(new RegExp(CoreXT.Utilities.escapeRegex(replaceWhat), 'gi'), replaceWith);
                    else if (CoreXT.Browser.type == CoreXT.Browser.BrowserTypes.Chrome)
                        return source.split(replaceWhat).join(replaceWith);
                    else
                        return source.replace(new RegExp(CoreXT.Utilities.escapeRegex(replaceWhat), 'g'), replaceWith);
                };
                String.replaceTags = function (html, tagReplacement) {
                    return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
                };
                String.pad = function (str, fixedLength, leftPadChar, rightPadChar) {
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
                String.append = function (source, suffix, delimiter) {
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
                String.prepend = function (source, prefix, delimiter) {
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
                String.prototype.replaceAll = function (replaceWhat, replaceWith, ignoreCase) {
                    return String.replace(this.toString(), replaceWhat, replaceWith, ignoreCase);
                };
                String.prototype.toString = function () { return this.$__value; };
                String.prototype.valueOf = function () { return this.$__value; };
                String['StringFactory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function (value) { return null; };
                    Factory.init = function (o, isnew, value) {
                        o.$__value = CoreXT.global.String(value);
                        o.length = o.$__value.length;
                        for (var i = 0; i < o.length; ++i)
                            o[i] = o.charAt(i);
                    };
                    return Factory;
                }(CoreXT.FactoryBase(String, null)));
                return String;
            }(CoreXT.DisposableFromBase(CoreXT.global.String)));
            return [String, String["StringFactory"]];
        }, "String");
        System.Array = CoreXT.ClassFactory(System, void 0, function (base) {
            var Array = (function (_super) {
                __extends(Array, _super);
                function Array() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Array['ArrayFactory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function () {
                        var items = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            items[_i] = arguments[_i];
                        }
                        return null;
                    };
                    Factory.init = function (o, isnew) {
                        var items = [];
                        for (var _i = 2; _i < arguments.length; _i++) {
                            items[_i - 2] = arguments[_i];
                        }
                        try {
                            o.push.apply(o, items);
                        }
                        catch (e) {
                            for (var i = 0, n = items.length; i < n; ++i)
                                o.push(items[i]);
                        }
                    };
                    return Factory;
                }(CoreXT.FactoryBase(Array, null)));
                return Array;
            }(CoreXT.DisposableFromBase(CoreXT.global.Array)));
            return [Array, Array["ArrayFactory"]];
        }, "Array");
        var DependentObject = (function (_super) {
            __extends(DependentObject, _super);
            function DependentObject() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(DependentObject.prototype, "parent", {
                get: function () { return this.__parent; },
                enumerable: true,
                configurable: true
            });
            return DependentObject;
        }(System.Object.$__type));
        System.DependentObject = DependentObject;
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.PrimitiveTypes.js.map