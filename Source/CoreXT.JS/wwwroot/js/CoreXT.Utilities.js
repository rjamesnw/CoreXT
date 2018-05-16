var CoreXT;
(function (CoreXT) {
    var Utilities;
    (function (Utilities) {
        CoreXT.registerNamespace("CoreXT", "Utilities");
        function escapeRegex(regExStr) {
            return regExStr.replace(/([.?*+^$[\]\\(){}-])/g, "\\$1");
        }
        Utilities.escapeRegex = escapeRegex;
        function getReferenceName(obj, reference) {
            for (var p in obj)
                if (obj[p] === reference)
                    return p;
            return void 0;
        }
        Utilities.getReferenceName = getReferenceName;
        function erase(obj, ignore) {
            for (var p in obj)
                if ((p != "__proto__" && p != 'constructor' && obj).hasOwnProperty(p))
                    if (!ignore || !ignore[name])
                        obj[p] = void 0;
            return obj;
        }
        Utilities.erase = erase;
        function clone(value) {
            if (typeof value !== 'object')
                return value;
            var newObject, p, rcCount, v;
            if (clone.arguments.length > 1) {
                rcCount = clone.arguments[clone.arguments.length - 1];
                if (value['@__recursiveCheck'] === rcCount)
                    return value;
            }
            else
                rcCount = (value['@__recursiveCheck'] || 0) + 1;
            value['@__recursiveCheck'] = rcCount;
            newObject = {};
            for (p in value) {
                v = value[p];
                if (typeof v !== 'object')
                    newObject[p] = v;
                else
                    newObject[p] = clone(v, rcCount);
            }
            return newObject;
        }
        Utilities.clone = clone;
        ;
        function dereferencePropertyPath(path, origin, unsafe) {
            if (unsafe === void 0) { unsafe = false; }
            if (unsafe)
                return CoreXT.safeEval('p0.' + path, origin);
            if (origin === void 0 || origin === null)
                origin = this !== CoreXT.global ? this : CoreXT.global;
            if (typeof path !== 'string')
                path = '' + path;
            var o = origin, c = '', pc, i = 0, n = path.length, name = '';
            if (n)
                ((c = path[i++]) == '.' || c == '[' || c == ']' || c == void 0)
                    ? (name ? (o = o[name], name = '') : (pc == '.' || pc == '[' || pc == ']' && c == ']' ? i = n + 2 : void 0), pc = c)
                    : name += c;
            if (i == n + 2)
                throw CoreXT.System.Exception.from("Invalid path: " + path, origin);
        }
        Utilities.dereferencePropertyPath = dereferencePropertyPath;
        function waitReady(obj, propertyName, callback, timeout, timeoutCallback) {
            if (timeout === void 0) { timeout = 60000; }
            if (!callback)
                throw "'callback' is required.";
            if (!obj)
                throw "'obj' is required.";
            if (obj[propertyName] !== void 0)
                callback();
            else {
                if (timeout != 0) {
                    if (timeout > 0)
                        timeout--;
                    setTimeout(function () {
                        waitReady(obj, propertyName, callback);
                    }, 1);
                }
                else if (timeoutCallback)
                    timeoutCallback();
            }
        }
        Utilities.waitReady = waitReady;
        var extendStatics = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p]; };
        function extend(derivedType, baseType, copyStaticProperties) {
            if (copyStaticProperties === void 0) { copyStaticProperties = true; }
            if (copyStaticProperties)
                extendStatics(derivedType, baseType);
            function __() { this.constructor = derivedType; }
            var newProto = baseType === null ? Object.create(baseType) : (__.prototype = baseType.prototype, new __());
            for (var p in derivedType.prototype)
                if (derivedType.prototype.hasOwnProperty(p))
                    newProto[p] = derivedType.prototype[p];
            derivedType.prototype = newProto;
            return derivedType;
        }
        Utilities.extend = extend;
        ;
        function apply(func, _this, args) {
            if (func.apply) {
                return func.apply(_this, args);
            }
            else {
                return Function.prototype.apply.apply(func, [_this, args]);
            }
        }
        Utilities.apply = apply;
        var _guidSeed = (function () {
            var text = navigator.userAgent + location.href;
            for (var i = 0, n = text.length, randseed = 0; i < n; ++i)
                randseed += navigator.userAgent.charCodeAt(i);
            return randseed;
        })();
        var _guidCounter = 0;
        function createGUID(hyphens) {
            if (hyphens === void 0) { hyphens = true; }
            var time = (Date.now ? Date.now() : new Date().getTime()) + CoreXT.Time.__localTimeZoneOffset;
            var randseed = time + _guidSeed;
            var hexTime = time.toString(16) + (_guidCounter <= 0xffffffff ? _guidCounter++ : _guidCounter = 0).toString(16), i = hexTime.length, pi = 0;
            var pattern = hyphens ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' : 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx', len = pattern.length, result = "", c, r;
            while (pi < len)
                c = pattern[pi++], result += c != 'x' && c != 'y' ? c : i > 0 ? hexTime[--i] : (r = Math.random() * randseed % 16 | 0, c == 'x' ? r : r & 0x3 | 0x8).toString(16);
            return result;
        }
        Utilities.createGUID = createGUID;
    })(Utilities = CoreXT.Utilities || (CoreXT.Utilities = {}));
    CoreXT.__extends = Utilities.extend;
})(CoreXT || (CoreXT = {}));
var __extends = CoreXT.__extends;
//# sourceMappingURL=CoreXT.Utilities.js.map