var appVersion;
var CoreXT;
(function (CoreXT) {
    CoreXT.version = "0.0.1";
    Object.defineProperty(CoreXT, "version", { writable: false });
    CoreXT.getAppVersion = function () { return appVersion || "0.0.0"; };
    if (typeof navigator != 'undefined' && typeof console != 'undefined')
        if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0)
            console.log("-=< CoreXT Client OS - v" + CoreXT.version + " >=- ");
        else
            console.log("%c -=< %cCoreXT Client OS - v" + CoreXT.version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");
    var DebugModes;
    (function (DebugModes) {
        DebugModes[DebugModes["Release"] = 0] = "Release";
        DebugModes[DebugModes["Debug_Run"] = 1] = "Debug_Run";
        DebugModes[DebugModes["Debug_Wait"] = 2] = "Debug_Wait";
    })(DebugModes = CoreXT.DebugModes || (CoreXT.DebugModes = {}));
    CoreXT.debugMode = DebugModes.Debug_Run;
    function isDebugging() { return CoreXT.debugMode != DebugModes.Release; }
    CoreXT.isDebugging = isDebugging;
})(CoreXT || (CoreXT = {}));
var __NonCoreXTHost__ = (function () {
    function __NonCoreXTHost__() {
    }
    __NonCoreXTHost__.prototype.getCurrentDir = function () { return document.location.href; };
    __NonCoreXTHost__.prototype.isStudio = function () { return false; };
    __NonCoreXTHost__.prototype.isServer = function () { return false; };
    __NonCoreXTHost__.prototype.isClient = function () { return !this.isServer() && !this.isStudio(); };
    __NonCoreXTHost__.prototype.setTitle = function (title) { document.title = title; };
    __NonCoreXTHost__.prototype.getTitle = function () { return document.title; };
    __NonCoreXTHost__.prototype.isDebugMode = function () { return false; };
    return __NonCoreXTHost__;
}());
var $ICE = null;
if (typeof host === 'object' && host.isDebugMode && host.isDebugMode())
    debugger;
var siteBaseURL;
var scriptsBaseURL;
(function (CoreXT) {
    CoreXT.global = (function () { }.constructor("return this"))();
    CoreXT.host = (function () {
        if (typeof CoreXT.host !== 'object' || typeof CoreXT.host.isClient == 'undefined' || typeof CoreXT.host.isServer == 'undefined' || typeof CoreXT.host.isStudio == 'undefined')
            return new __NonCoreXTHost__();
        else
            return CoreXT.host;
    })();
    CoreXT.ROOT_NAMESPACE = "CoreXT";
    function noop() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }
    CoreXT.noop = noop;
    var Environments;
    (function (Environments) {
        Environments[Environments["Browser"] = 0] = "Browser";
        Environments[Environments["Worker"] = 1] = "Worker";
        Environments[Environments["Server"] = 2] = "Server";
    })(Environments = CoreXT.Environments || (CoreXT.Environments = {}));
    CoreXT.FUNC_NAME_REGEX = /^function\s*(\S+)\s*\(/i;
    function getFunctionName(func) {
        var name = func.$__name || func['name'];
        if (name == void 0) {
            var typeString = Object.prototype.toString.call(func);
            if (typeString.charAt(0) == '[' && typeString.charAt(typeString.length - 1) == ']')
                name = typeString.substring(1, typeString.length - 1).split(' ')[1];
            if (!name || name == "Function" || name == "Object") {
                if (typeof func == 'function') {
                    var fstr = Function.prototype.toString.call(func);
                    var results = (CoreXT.FUNC_NAME_REGEX).exec(fstr);
                    name = (results && results.length > 1) ? results[1] : void 0;
                }
                else
                    name = void 0;
            }
        }
        return name || "";
    }
    CoreXT.getFunctionName = getFunctionName;
    var extendStatics = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p]; };
    function __extends(derivedType, baseType, copyStaticProperties) {
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
    CoreXT.__extends = __extends;
    ;
    var __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };
    function __rest(s, e) {
        var t = {}, p;
        for (p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
                if (e.indexOf(p[i]) < 0)
                    t[p[i]] = s[p[i]];
        return t;
    }
    ;
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect['decorate'] === "function")
            r = Reflect['decorate'](decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    ;
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    ;
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect['metadata'] === "function")
            return Reflect['metadata'](metadataKey, metadataValue);
    }
    ;
    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    ;
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [0, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    ;
    function __exportStar(m, exports) {
        for (var p in m)
            if (!exports.hasOwnProperty(p))
                exports[p] = m[p];
    }
    ;
    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m)
            return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length)
                    o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }
    ;
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    ;
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    ;
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol['asyncIterator'])
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol['asyncIterator']] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    ;
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    ;
    function __asyncValues(o) {
        if (!Symbol['asyncIterator'])
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol['asyncIterator']], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol['asyncIterator']] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    ;
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (Object.hasOwnProperty.call(mod, k))
                    result[k] = mod[k];
        result["default"] = mod;
        return result;
    }
    ;
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    }
    ;
    function installTypeScriptHelpers(target) {
        if (target === void 0) { target = CoreXT.global; }
        target['__extends'] = __extends;
        target['__assign'] = __assign;
        target['__rest'] = __rest;
        target['__decorate'] = __decorate;
        target['__param'] = __param;
        target['__metadata'] = __metadata;
        target['__awaiter'] = __awaiter;
        target['__generator'] = __generator;
        target['__exportStar'] = __exportStar;
        target['__values'] = __values;
        target['__read'] = __read;
        target['__spread'] = __spread;
        target['__await'] = __await;
        target['__asyncGenerator'] = __asyncGenerator;
        target['__asyncDelegator'] = __asyncDelegator;
        target['__asyncValues'] = __asyncValues;
        target['__makeTemplateObject'] = __makeTemplateObject;
        target['__importStar'] = __importStar;
        target['__importDefault'] = __importDefault;
        return target;
    }
    CoreXT.installTypeScriptHelpers = installTypeScriptHelpers;
    function renderHelperVarDeclarations(paramName) {
        var helpers = installTypeScriptHelpers({});
        var decl = "";
        for (var p in helpers)
            decl += (decl ? "," : "var ") + p + "=" + paramName + "['" + p + "']";
        return [decl + ";", helpers];
    }
    CoreXT.renderHelperVarDeclarations = renderHelperVarDeclarations;
    function renderHelpers() {
        return "var __helpers = " + CoreXT.ROOT_NAMESPACE + "." + getFunctionName(renderHelperVarDeclarations) + "('__helpers[1]'); eval(__helpers[0]);";
    }
    CoreXT.renderHelpers = renderHelpers;
})(CoreXT || (CoreXT = {}));
CoreXT.safeEval = function (exp, p0, p1, p2, p3, p4, p5, p6, p7, p8, p9) { return eval(exp); };
CoreXT.globalEval = function (exp) { return (0, eval)(exp); };
(function (CoreXT) {
    eval(CoreXT.renderHelpers());
    CoreXT.ES6 = (function () { try {
        return CoreXT.globalEval("(function () { return new.target; }, true)");
    }
    catch (e) {
        return false;
    } })();
    CoreXT.ES6Targeted = (function () {
        return ((function () {
            function class_1() {
            }
            return class_1;
        }())).toString() == "class { }";
    })();
    CoreXT.Environment = (function () {
        if (typeof navigator !== 'object') {
            window = {};
            window.document = { title: "SERVER" };
            navigator = { userAgent: "Mozilla/5.0 (CoreXT) like Gecko" };
            location = {
                hash: "",
                host: "CoreXT.org",
                hostname: "CoreXT.org",
                href: "https://CoreXT.org/",
                origin: "https://CoreXT.org",
                pathname: "/",
                port: "",
                protocol: "https:"
            };
            return CoreXT.Environments.Server;
        }
        else if (typeof window == 'object' && window.document)
            return CoreXT.Environments.Browser;
        else
            return CoreXT.Environments.Worker;
    })();
    var LogTypes;
    (function (LogTypes) {
        LogTypes[LogTypes["Success"] = -1] = "Success";
        LogTypes[LogTypes["Normal"] = 0] = "Normal";
        LogTypes[LogTypes["Info"] = 1] = "Info";
        LogTypes[LogTypes["Warning"] = 2] = "Warning";
        LogTypes[LogTypes["Error"] = 3] = "Error";
        LogTypes[LogTypes["Debug"] = 4] = "Debug";
        LogTypes[LogTypes["Trace"] = 5] = "Trace";
    })(LogTypes = CoreXT.LogTypes || (CoreXT.LogTypes = {}));
    function log(title, message, type, source, throwOnError, useLogger) {
        if (type === void 0) { type = LogTypes.Normal; }
        if (throwOnError === void 0) { throwOnError = true; }
        if (useLogger === void 0) { useLogger = true; }
        if (title === null && message === null)
            return null;
        if (title !== null)
            title = ('' + title).trim();
        if (message !== null)
            message = ('' + message).trim();
        if (title === "" && message === "")
            return null;
        if (title && typeof title == 'string') {
            var _title = title;
            if (_title.charAt(title.length - 1) != ":")
                _title += ":";
            var compositeMessage = _title + " " + message;
        }
        else
            var compositeMessage = message;
        if (console)
            switch (type) {
                case LogTypes.Success:
                    console.log(compositeMessage);
                    break;
                case LogTypes.Normal:
                    console.log(compositeMessage);
                    break;
                case LogTypes.Info:
                    (console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Warning:
                    (console.warn || console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Error:
                    (console.error || console.warn || console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Debug:
                    (console.debug || console.info || console.log).call(console, compositeMessage);
                    break;
                case LogTypes.Trace:
                    (console.trace || console.info || console.log).call(console, compositeMessage);
                    break;
            }
        if (useLogger && System) {
            if (type == LogTypes.Error) {
                if (throwOnError)
                    if (System.Exception) {
                        throw System.Exception.error(title, message, source);
                    }
                    else
                        throw new Error(compositeMessage);
            }
            if (System.Diagnostics && System.Diagnostics.log)
                System.Diagnostics.log(title, message, type, false);
        }
        else if (throwOnError && type == LogTypes.Error)
            throw new Error(compositeMessage);
        return compositeMessage;
    }
    CoreXT.log = log;
    function error(title, message, source, throwException, useLogger) {
        if (throwException === void 0) { throwException = true; }
        if (useLogger === void 0) { useLogger = true; }
        return log(title, message, LogTypes.Error, source, throwException, useLogger);
    }
    CoreXT.error = error;
    function getTypeName(object, cacheTypeName) {
        if (cacheTypeName === void 0) { cacheTypeName = true; }
        if (object === void 0 || object === null)
            return void 0;
        typeInfo = object;
        if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
            if (typeof object == 'function')
                if (cacheTypeName)
                    return typeInfo.$__name = CoreXT.getFunctionName(object);
                else
                    return CoreXT.getFunctionName(object);
            var typeInfo = object.constructor;
            if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
                if (cacheTypeName)
                    return typeInfo.$__name = CoreXT.getFunctionName(object.constructor);
                else
                    return CoreXT.getFunctionName(object.constructor);
            }
            else
                return typeInfo.$__name;
        }
        else
            return typeInfo.$__name;
    }
    CoreXT.getTypeName = getTypeName;
    function getFullTypeName(object, cacheTypeName) {
        if (cacheTypeName === void 0) { cacheTypeName = true; }
        if (object.$__fullname)
            return object.$__fullname;
        return getTypeName(object, cacheTypeName);
    }
    CoreXT.getFullTypeName = getFullTypeName;
    function isEmpty(obj) {
        if (obj === void 0 || obj === null)
            return true;
        if (typeof obj == 'string' || Array.isArray(obj))
            return !obj.length;
        if (typeof obj != 'object')
            return isNaN(obj);
        for (var key in obj)
            if (CoreXT.global.Object.prototype.hasOwnProperty.call(obj, key))
                return false;
        return true;
    }
    CoreXT.isEmpty = isEmpty;
    function sealed(target, propertyName, descriptor) {
        if (typeof target == 'object')
            Object.seal(target);
        if (typeof target.prototype == 'object')
            Object.seal(target.prototype);
        return target;
    }
    CoreXT.sealed = sealed;
    function frozen(target, propertyName, descriptor) {
        if (typeof target == 'object')
            Object.freeze(target);
        if (typeof target.prototype == 'object')
            Object.freeze(target.prototype);
        return target;
    }
    CoreXT.frozen = frozen;
    function $() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return function (target, paramName, index) {
            var _target = target;
            _target.$__argumentTypes[index] = args;
        };
    }
    CoreXT.$ = $;
    var Types;
    (function (Types) {
        function getRoot(type) {
            var _type = type.$__fullname ? type : type['constructor'];
            if (_type.$__parent)
                return getRoot(_type.$__parent);
            return _type;
        }
        Types.getRoot = getRoot;
        Object.defineProperty(Types, "__types", { configurable: false, writable: false, value: {} });
        Object.defineProperty(Types, "__disposedObjects", { configurable: false, writable: false, value: {} });
        Types.autoTrackInstances = false;
        Object.defineProperty(Types, "__trackedObjects", { configurable: false, writable: false, value: [] });
        var ___nextObjectID = 0;
        Object.defineProperty(Types, "__nextObjectID", { configurable: false, get: function () { return ___nextObjectID; } });
        function getNextObjectId() { return ___nextObjectID++; }
        Types.getNextObjectId = getNextObjectId;
        function __new() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (typeof this != 'function' || !this.init && !this.new)
                error("__new(): Constructor call operation on a non-constructor function.", "Using the 'new' operator is only valid on class and class-factory types. Just call the '{FactoryType}.new()' factory *function* without the 'new' operator.", this);
            var bridge = this;
            var factory = this;
            var classType = factory.$__type;
            var classTypeInfo = classType;
            if (typeof classType != 'function')
                error("__new(): Missing class type on class factory.", "The factory '" + getFullTypeName(factory) + "' is missing the internal '$__type' class reference.", this);
            var appDomain = bridge.$__appDomain || System.AppDomain && System.AppDomain.default || void 0;
            var instance;
            var isNew = false;
            var fullTypeName = factory.$__fullname;
            var objectPool = fullTypeName && Types.__disposedObjects[fullTypeName];
            if (objectPool && objectPool.length)
                instance = objectPool.pop();
            else {
                instance = new classType();
                isNew = true;
            }
            instance.$__corext = CoreXT;
            instance.$__id = getNextObjectId();
            if (Types.autoTrackInstances && (!appDomain || appDomain.autoTrackInstances === void 0 || appDomain.autoTrackInstances))
                instance.$__globalId = CoreXT.Utilities.createGUID(false);
            if (appDomain)
                instance.$__appDomain = appDomain;
            if ('$__disposing' in instance)
                instance.$__disposing = false;
            if ('$__disposed' in instance)
                instance.$__disposed = false;
            if (CoreXT.ES6Targeted) {
                if (typeof this.init == 'function')
                    if (System.Delegate)
                        (_a = System.Delegate).fastCall.apply(_a, __spread([this.init, this, instance, isNew], arguments));
                    else
                        (_b = this.init).call.apply(_b, __spread([this, instance, isNew], arguments));
            }
            else {
                for (var i = arguments.length - 1; i >= 0; --i)
                    arguments[2 + i] = arguments[i];
                arguments[0] = instance;
                arguments[1] = isNew;
                arguments.length += 2;
                if (typeof this.init == 'function')
                    if (System.Delegate)
                        System.Delegate.fastApply(this.init, this, arguments);
                    else
                        this.init.apply(this, arguments);
            }
            if (appDomain && appDomain.autoTrackInstances)
                appDomain.attachObject(instance);
            return instance;
            var _a, _b;
        }
        Types.__new = __new;
        function __registerFactoryType(cls, factoryType, namespace, addMemberTypeInfo, exportName) {
            if (addMemberTypeInfo === void 0) { addMemberTypeInfo = true; }
            if (typeof factoryType !== 'function')
                error("__registerFactoryType()", "The 'factoryType' argument is not a valid constructor function.", classType);
            var classType = cls;
            if (typeof classType !== 'function')
                error("__registerFactoryType()", "The 'factoryType.$__type' property is not a valid constructor function.", classType);
            var _exportName = exportName || getTypeName(cls);
            if (_exportName.charAt(0) == '$')
                _exportName = _exportName.substr(1);
            namespace[_exportName] = factoryType;
            classType.$__parent = factoryType;
            classType.$__type = classType;
            classType.$__factoryType = factoryType;
            classType.$__baseFactoryType = factoryType.$__baseFactoryType;
            classType.$__name = _exportName;
            if (classType.init)
                error(getFullTypeName(classType), "You cannot create a static 'init' function directly on a class that implements the factory pattern (which could also create inheritance problems).");
            var originalInit = typeof factoryType.init == 'function' ? factoryType.init : null;
            factoryType.init = function _initProxy() {
                this.$__initCalled = true;
                originalInit && originalInit.apply(this, arguments);
                if (this.$__baseFactoryType && !this.$__baseFactoryType.$__initCalled)
                    error(getFullTypeName(classType) + ".init()", "You did not call 'this.super.init()' to complete the initialization chain.");
                factoryType.init = originalInit;
            };
            if (classType.new)
                error(getFullTypeName(classType), "You cannot create a static 'new' function directly on a class that implements the factory pattern (which could also create inheritance problems).");
            var originalNew = typeof factoryType.new == 'function' ? factoryType.new : null;
            if (!originalNew)
                factoryType.new = __new;
            else
                factoryType.new = function _firstTimeNewTest() {
                    var result = originalNew.apply(factoryType, arguments) || void 0;
                    if (result === void 0 || result === null) {
                        factoryType.new = __new;
                        return factoryType.new.apply(factoryType, arguments);
                    }
                    else if (typeof result != 'object')
                        error(getFullTypeName(classType) + ".new()", "An object instance was expected, but instead a value of type '" + (typeof result) + "' was received.");
                    factoryType.new = originalNew;
                    return result;
                };
            var registeredFactory = __registerType(cls, namespace, addMemberTypeInfo, exportName);
            classType.$__fullname = factoryType.$__fullname + ".$__type";
            return factoryType;
        }
        Types.__registerFactoryType = __registerFactoryType;
        function __registerType(type, namespace, addMemberTypeInfo, exportName) {
            if (addMemberTypeInfo === void 0) { addMemberTypeInfo = true; }
            var _namespace = namespace;
            if (_namespace.$__fullname === void 0)
                error("Types.__registerType()", "The specified namespace '" + getTypeName(namespace) + "' is not registered.  Please make sure to call 'registerNamespace()' first at the top of namespace scopes before classes are defined.", type);
            var _type = __registerNamespace(namespace, exportName || getTypeName(type));
            if (addMemberTypeInfo) {
                var prototype = type['prototype'], func;
                for (var pname in prototype)
                    if (pname != 'constructor' && pname != '__proto__') {
                        func = prototype[pname];
                        if (typeof func == 'function') {
                            func.$__argumentTypes = [];
                            func.$__fullname = _type.$__fullname + ".prototype." + pname;
                            func.$__name = pname;
                            func.$__parent = _type;
                            if (!func.name)
                                func.name = pname;
                        }
                    }
            }
            Types.__types[_type.$__fullname] = _type;
            return type;
        }
        Types.__registerType = __registerType;
        function __registerNamespace(root) {
            var namespaces = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                namespaces[_i - 1] = arguments[_i];
            }
            function exception(msg) {
                return error("Types.__registerNamespace(" + rootTypeName + ", " + namespaces.join() + ")", "The namespace/type name '" + nsOrTypeName + "' " + msg + "."
                    + " Please double check you have the correct namespace/type names.", root);
            }
            if (!root)
                root = CoreXT.global;
            var rootTypeName = getTypeName(root);
            var nsOrTypeName = rootTypeName;
            log("Registering namespace for root '" + rootTypeName + "'", namespaces.join());
            var currentNamespace = root;
            var fullname = root.$__fullname || "";
            if (root != CoreXT.global && !fullname)
                exception("has not been registered in the type system. Make sure to call 'registerNamespace()' at the top of namespace scopes before defining classes.");
            for (var i = 0, n = namespaces.length; i < n; ++i) {
                nsOrTypeName = namespaces[i];
                var trimmedName = nsOrTypeName.trim();
                if (trimmedName.charAt(0) == '$')
                    trimmedName = trimmedName.substr(1);
                if (!nsOrTypeName || !trimmedName)
                    exception("is not a valid namespace name. A namespace must not be empty or only whitespace");
                nsOrTypeName = trimmedName;
                if (root == CoreXT && nsOrTypeName == "CoreXT")
                    exception("is not valid - 'CoreXT' must not exist as a nested name under CoreXT");
                var subNS = currentNamespace[nsOrTypeName];
                if (!subNS)
                    exception("cannot be found under namespace '" + currentNamespace.$__fullname + "'");
                fullname = fullname ? fullname + "." + nsOrTypeName : nsOrTypeName;
                subNS.$__parent = currentNamespace;
                subNS.$__name = nsOrTypeName;
                subNS.$__fullname = fullname;
                (currentNamespace.$__namespaces || (currentNamespace.$__namespaces = [])).push(subNS);
                currentNamespace = subNS;
            }
            log("Registered namespace for root '" + rootTypeName + "'", fullname, LogTypes.Info);
            return currentNamespace;
        }
        Types.__registerNamespace = __registerNamespace;
        var __nonDisposableProperties = {
            $__globalId: true,
            $__appDomain: true,
            $__disposing: true,
            $__disposed: true,
            dispose: false
        };
        function __disposeValidate(object, title, source) {
            if (typeof object != 'object')
                error(title, "The argument given is not an object.", source);
            if (!object.$__corext)
                error(title, "The object instance '" + getFullTypeName(object) + "' is not a CoreXT created object.", source);
            if (object.$__corext != CoreXT)
                error(title, "The object instance '" + getFullTypeName(object) + "' was created in a different CoreXT instance and cannot be disposed by this one.", source);
            if (typeof object.dispose != 'function')
                error(title, "The object instance '" + getFullTypeName(object) + "' does not contain a 'dispose()' function.", source);
            if (!isDisposable(object))
                error(title, "The object instance '" + getFullTypeName(object) + "' is not disposable.", source);
        }
        Types.__disposeValidate = __disposeValidate;
        function dispose(object, release) {
            if (release === void 0) { release = true; }
            var _object = object;
            __disposeValidate(_object, "dispose()", Types);
            if (_object !== void 0) {
                var appDomain = _object.$__appDomain;
                if (appDomain && !_object.$__disposing) {
                    appDomain.dispose(_object, release);
                    return;
                }
                CoreXT.Utilities.erase(object, __nonDisposableProperties);
                _object.$__disposing = false;
                _object.$__disposed = true;
                if (release) {
                    var type = _object.constructor;
                    if (!type.$__fullname)
                        error("dispose()", "The object type is not registered.  Please see one of the AppDomain 'registerClass()/registerType()' functions for more details.", object);
                    var disposedObjects = Types.__disposedObjects[type.$__fullname];
                    if (!disposedObjects)
                        Types.__disposedObjects[type.$__fullname] = disposedObjects = [];
                    disposedObjects.push(_object);
                }
            }
        }
        Types.dispose = dispose;
    })(Types = CoreXT.Types || (CoreXT.Types = {}));
    var Disposable = (function () {
        function Disposable() {
        }
        Disposable.prototype.dispose = function (release) { Types.dispose(this, release); };
        return Disposable;
    }());
    CoreXT.Disposable = Disposable;
    function isDisposable(instance) {
        if (instance.$__corext != CoreXT)
            return false;
        return typeof instance.dispose == 'function';
    }
    CoreXT.isDisposable = isDisposable;
    function DisposableFromBase(baseClass, isPrimitiveOrHostBase) {
        if (!baseClass) {
            baseClass = CoreXT.global.Object;
            isPrimitiveOrHostBase = true;
        }
        var symbol = typeof Symbol != 'undefined' ? Symbol : Object;
        if (baseClass == Object || baseClass == Array || baseClass == Boolean || baseClass == String
            || baseClass == Number || baseClass == symbol || baseClass == Function || baseClass == Date
            || baseClass == RegExp || baseClass == Error)
            isPrimitiveOrHostBase = true;
        var cls = (function (_super) {
            __extends(Disposable, _super);
            function Disposable() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = this;
                if (!CoreXT.ES6Targeted && isPrimitiveOrHostBase)
                    eval("var _super = function() { return null; };");
                _this = _super.call(this) || this;
                return _this;
            }
            Disposable.prototype.dispose = function (release) { };
            return Disposable;
        }(baseClass));
        cls.prototype.dispose = CoreXT.Disposable.prototype.dispose;
        return cls;
    }
    CoreXT.DisposableFromBase = DisposableFromBase;
    function ClassFactory(namespace, base, getType, exportName, addMemberTypeInfo) {
        if (addMemberTypeInfo === void 0) { addMemberTypeInfo = true; }
        function _error(msg) {
            error("ClassFactory()", msg, namespace);
        }
        if (!getType)
            _error("A 'getType' selector function is required.");
        if (!namespace)
            _error("A 'namespace' value is required.");
        var types = getType(base && base.$__type || base);
        var cls = types[0];
        var factory = types[1];
        if (!cls)
            _error("'getType: (base: TBaseClass) => [TClass, TFactory]' did not return a class instance, which is required.");
        if (typeof cls != 'function')
            _error("'getType: (base: TBaseClass) => [TClass, TFactory]' did not return a class (function) type object, which is required.");
        var name = exportName || getTypeName(cls);
        if (name.charAt(0) == '$')
            name = name.substr(1);
        if (!factory)
            log("ClassFactory()", "Warning: No factory was supplied for class type '" + name + "' in namespace '" + getFullTypeName(namespace) + "'.", LogTypes.Warning, cls);
        return Types.__registerFactoryType(cls, factory, namespace, addMemberTypeInfo, exportName);
    }
    CoreXT.ClassFactory = ClassFactory;
    function FactoryBase(type, baseFactoryType) {
        return _a = (function (_super) {
                __extends(FactoryBase, _super);
                function FactoryBase() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Object.defineProperty(FactoryBase, "type", {
                    get: function () { return this.$__type; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(FactoryBase, "super", {
                    get: function () { return this.$__baseFactoryType; },
                    enumerable: true,
                    configurable: true
                });
                FactoryBase.prototype.dispose = function (release) { Types.dispose(this, release); };
                return FactoryBase;
            }(type)),
            _a.$__type = type,
            _a.$__baseFactoryType = baseFactoryType,
            _a;
        var _a;
    }
    CoreXT.FactoryBase = FactoryBase;
    function registerNamespace() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var root = args[args.length - 1];
        var lastIndex = (typeof root == 'object' ? args.length - 1 : (root = CoreXT.global, args.length));
        Types.__registerNamespace.apply(Types, __spread([root], CoreXT.global.Array.prototype.slice.call(arguments, 0, lastIndex)));
    }
    CoreXT.registerNamespace = registerNamespace;
    registerNamespace("CoreXT", "Types");
    function getErrorCallStack(errorSource) {
        var _e = errorSource;
        if (_e.stacktrace && _e.stack)
            return _e.stacktrace.split(/\n/g);
        var callstack = [];
        var isCallstackPopulated = false;
        var stack = _e.stack || _e.message;
        if (stack) {
            var lines = stack.split(/\n/g);
            if (lines.length) {
                for (var i = 0, len = lines.length; i < len; ++i)
                    if (/.*?:\d+:\d+/.test(lines[i]))
                        callstack.push(lines[i]);
                if (lines.length && !callstack.length)
                    callstack.push.apply(callstack, lines);
                isCallstackPopulated = true;
            }
        }
        if (!isCallstackPopulated && arguments.callee) {
            var currentFunction = arguments.callee.caller;
            while (currentFunction) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
                callstack.push(fname);
                currentFunction = currentFunction.caller;
            }
        }
        return callstack;
    }
    CoreXT.getErrorCallStack = getErrorCallStack;
    function getErrorMessage(errorSource) {
        if (typeof errorSource == 'string')
            return errorSource;
        else if (typeof errorSource == 'object') {
            if (System && System.Diagnostics && System.Diagnostics.LogItem && errorSource instanceof System.Diagnostics.LogItem) {
                return errorSource.toString();
            }
            else if ('message' in errorSource) {
                var error = errorSource;
                var msg = error.message;
                if (error.name)
                    msg = "(" + error.name + ") " + msg;
                if (error.lineno !== undefined)
                    error.lineNumber = error.lineno;
                if (error.lineNumber !== undefined) {
                    msg += "\r\non line " + error.lineNumber + ", column " + error.columnNumber;
                    if (error.fileName !== undefined)
                        msg += ", of file '" + error.fileName + "'";
                }
                else if (error.fileName !== undefined)
                    msg += "\r\nin file '" + error.fileName + "'";
                var stack = getErrorCallStack(error);
                if (stack && stack.length)
                    msg += "\r\nStack trace:\r\n" + stack.join("\r\n") + "\r\n";
                return msg;
            }
            else
                return '' + errorSource;
        }
        else
            return '' + errorSource;
    }
    CoreXT.getErrorMessage = getErrorMessage;
    CoreXT.baseURL = (function () { var u = siteBaseURL || location.origin; if (u.charAt(u.length - 1) != '/')
        u += '/'; return u; })();
    CoreXT.baseScriptsURL = (function () { var u = scriptsBaseURL || CoreXT.baseURL; if (u.charAt(u.length - 1) != '/')
        u += '/'; return u + "js/"; })();
    log("Site Base URL", CoreXT.baseURL);
    log("Scripts Base URL", CoreXT.baseScriptsURL);
    var Time;
    (function (Time) {
        registerNamespace("CoreXT", "Time");
        Time.__millisecondsPerSecond = 1000;
        Time.__secondsPerMinute = 60;
        Time.__minsPerHour = 60;
        Time.__hoursPerDay = 24;
        Time.__daysPerYear = 365;
        Time.__actualDaysPerYear = 365.2425;
        Time.__EpochYear = 1970;
        Time.__millisecondsPerMinute = Time.__secondsPerMinute * Time.__millisecondsPerSecond;
        Time.__millisecondsPerHour = Time.__minsPerHour * Time.__millisecondsPerMinute;
        Time.__millisecondsPerDay = Time.__hoursPerDay * Time.__millisecondsPerHour;
        Time.__millisecondsPerYear = Time.__daysPerYear * Time.__millisecondsPerDay;
        Time.__ISO8601RegEx = /^\d{4}-\d\d-\d\d(?:[Tt]\d\d:\d\d(?::\d\d(?:\.\d+?(?:[+-]\d\d?(?::\d\d(?::\d\d(?:.\d+)?)?)?)?)?)?[Zz]?)?$/;
        Time.__SQLDateTimeRegEx = /^\d{4}-\d\d-\d\d(?: \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?)?$/;
        Time.__SQLDateTimeStrictRegEx = /^\d{4}-\d\d-\d\d \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?$/;
        Time.__localTimeZoneOffset = (new Date()).getTimezoneOffset() * Time.__millisecondsPerMinute;
    })(Time = CoreXT.Time || (CoreXT.Time = {}));
    var System;
    (function (System) {
        registerNamespace("CoreXT", "System");
    })(System = CoreXT.System || (CoreXT.System = {}));
    var Loader;
    (function (Loader) {
        registerNamespace("CoreXT", "Loader");
        var _onSystemLoadedHandlers = [];
        function onSystemLoaded(handler) {
            if (handler && typeof handler == 'function')
                _onSystemLoadedHandlers.push(handler);
        }
        Loader.onSystemLoaded = onSystemLoaded;
        if (!XMLHttpRequest.DONE) {
            XMLHttpRequest.UNSENT = 0;
            XMLHttpRequest.OPENED = 1;
            XMLHttpRequest.HEADERS_RECEIVED = 2;
            XMLHttpRequest.LOADING = 3;
            XMLHttpRequest.DONE = 4;
        }
        var ResourceTypes;
        (function (ResourceTypes) {
            ResourceTypes[ResourceTypes["Application_Script"] = "application/javascript"] = "Application_Script";
            ResourceTypes[ResourceTypes["Application_ECMAScript"] = "application/ecmascript"] = "Application_ECMAScript";
            ResourceTypes[ResourceTypes["Application_JSON"] = "application/json"] = "Application_JSON";
            ResourceTypes[ResourceTypes["Application_ZIP"] = "application/zip"] = "Application_ZIP";
            ResourceTypes[ResourceTypes["Application_GZIP"] = "application/gzip"] = "Application_GZIP";
            ResourceTypes[ResourceTypes["Application_PDF"] = "application/pdf"] = "Application_PDF";
            ResourceTypes[ResourceTypes["Application_DefaultFormPost"] = "application/x-www-form-urlencoded"] = "Application_DefaultFormPost";
            ResourceTypes[ResourceTypes["Application_TTF"] = "application/x-font-ttf"] = "Application_TTF";
            ResourceTypes[ResourceTypes["Multipart_BinaryFormPost"] = "multipart/form-data"] = "Multipart_BinaryFormPost";
            ResourceTypes[ResourceTypes["AUDIO_MP4"] = "audio/mp4"] = "AUDIO_MP4";
            ResourceTypes[ResourceTypes["AUDIO_MPEG"] = "audio/mpeg"] = "AUDIO_MPEG";
            ResourceTypes[ResourceTypes["AUDIO_OGG"] = "audio/ogg"] = "AUDIO_OGG";
            ResourceTypes[ResourceTypes["AUDIO_AAC"] = "audio/x-aac"] = "AUDIO_AAC";
            ResourceTypes[ResourceTypes["AUDIO_CAF"] = "audio/x-caf"] = "AUDIO_CAF";
            ResourceTypes[ResourceTypes["Image_GIF"] = "image/gif"] = "Image_GIF";
            ResourceTypes[ResourceTypes["Image_JPEG"] = "image/jpeg"] = "Image_JPEG";
            ResourceTypes[ResourceTypes["Image_PNG"] = "image/png"] = "Image_PNG";
            ResourceTypes[ResourceTypes["Image_SVG"] = "image/svg+xml"] = "Image_SVG";
            ResourceTypes[ResourceTypes["Image_GIMP"] = "image/x-xcf"] = "Image_GIMP";
            ResourceTypes[ResourceTypes["Text_CSS"] = "text/css"] = "Text_CSS";
            ResourceTypes[ResourceTypes["Text_CSV"] = "text/csv"] = "Text_CSV";
            ResourceTypes[ResourceTypes["Text_HTML"] = "text/html"] = "Text_HTML";
            ResourceTypes[ResourceTypes["Text_Plain"] = "text/plain"] = "Text_Plain";
            ResourceTypes[ResourceTypes["Text_RTF"] = "text/rtf"] = "Text_RTF";
            ResourceTypes[ResourceTypes["Text_XML"] = "text/xml"] = "Text_XML";
            ResourceTypes[ResourceTypes["Text_JQueryTemplate"] = "text/x-jquery-tmpl"] = "Text_JQueryTemplate";
            ResourceTypes[ResourceTypes["Text_MarkDown"] = "text/x-markdown"] = "Text_MarkDown";
            ResourceTypes[ResourceTypes["Video_AVI"] = "video/avi"] = "Video_AVI";
            ResourceTypes[ResourceTypes["Video_MPEG"] = "video/mpeg"] = "Video_MPEG";
            ResourceTypes[ResourceTypes["Video_MP4"] = "video/mp4"] = "Video_MP4";
            ResourceTypes[ResourceTypes["Video_OGG"] = "video/ogg"] = "Video_OGG";
            ResourceTypes[ResourceTypes["Video_MOV"] = "video/quicktime"] = "Video_MOV";
            ResourceTypes[ResourceTypes["Video_WMV"] = "video/x-ms-wmv"] = "Video_WMV";
            ResourceTypes[ResourceTypes["Video_FLV"] = "video/x-flv"] = "Video_FLV";
        })(ResourceTypes = Loader.ResourceTypes || (Loader.ResourceTypes = {}));
        var ResourceExtensions;
        (function (ResourceExtensions) {
            ResourceExtensions[ResourceExtensions["Application_Script"] = ".js"] = "Application_Script";
            ResourceExtensions[ResourceExtensions["Application_ECMAScript"] = ".es"] = "Application_ECMAScript";
            ResourceExtensions[ResourceExtensions["Application_JSON"] = ".json"] = "Application_JSON";
            ResourceExtensions[ResourceExtensions["Application_ZIP"] = ".zip"] = "Application_ZIP";
            ResourceExtensions[ResourceExtensions["Application_GZIP"] = ".gz"] = "Application_GZIP";
            ResourceExtensions[ResourceExtensions["Application_PDF"] = ".pdf"] = "Application_PDF";
            ResourceExtensions[ResourceExtensions["Application_TTF"] = ".ttf"] = "Application_TTF";
            ResourceExtensions[ResourceExtensions["AUDIO_MP4"] = ".mp4"] = "AUDIO_MP4";
            ResourceExtensions[ResourceExtensions["AUDIO_MPEG"] = ".mpeg"] = "AUDIO_MPEG";
            ResourceExtensions[ResourceExtensions["AUDIO_OGG"] = ".ogg"] = "AUDIO_OGG";
            ResourceExtensions[ResourceExtensions["AUDIO_AAC"] = ".aac"] = "AUDIO_AAC";
            ResourceExtensions[ResourceExtensions["AUDIO_CAF"] = ".caf"] = "AUDIO_CAF";
            ResourceExtensions[ResourceExtensions["Image_GIF"] = ".gif"] = "Image_GIF";
            ResourceExtensions[ResourceExtensions["Image_JPEG"] = ".jpeg"] = "Image_JPEG";
            ResourceExtensions[ResourceExtensions["Image_PNG"] = ".png"] = "Image_PNG";
            ResourceExtensions[ResourceExtensions["Image_SVG"] = ".svg"] = "Image_SVG";
            ResourceExtensions[ResourceExtensions["Image_GIMP"] = ".xcf"] = "Image_GIMP";
            ResourceExtensions[ResourceExtensions["Text_CSS"] = ".css"] = "Text_CSS";
            ResourceExtensions[ResourceExtensions["Text_CSV"] = ".csv"] = "Text_CSV";
            ResourceExtensions[ResourceExtensions["Text_HTML"] = ".html"] = "Text_HTML";
            ResourceExtensions[ResourceExtensions["Text_Plain"] = ".txt"] = "Text_Plain";
            ResourceExtensions[ResourceExtensions["Text_RTF"] = ".rtf"] = "Text_RTF";
            ResourceExtensions[ResourceExtensions["Text_XML"] = ".xml"] = "Text_XML";
            ResourceExtensions[ResourceExtensions["Text_JQueryTemplate"] = ".tpl.htm"] = "Text_JQueryTemplate";
            ResourceExtensions[ResourceExtensions["Text_MarkDown"] = ".markdown"] = "Text_MarkDown";
            ResourceExtensions[ResourceExtensions["Video_AVI"] = ".avi"] = "Video_AVI";
            ResourceExtensions[ResourceExtensions["Video_MPEG"] = ".mpeg"] = "Video_MPEG";
            ResourceExtensions[ResourceExtensions["Video_MP4"] = ".mp4"] = "Video_MP4";
            ResourceExtensions[ResourceExtensions["Video_OGG"] = ".ogg"] = "Video_OGG";
            ResourceExtensions[ResourceExtensions["Video_MOV"] = ".qt"] = "Video_MOV";
            ResourceExtensions[ResourceExtensions["Video_WMV"] = ".wmv"] = "Video_WMV";
            ResourceExtensions[ResourceExtensions["Video_FLV"] = ".flv"] = "Video_FLV";
        })(ResourceExtensions = Loader.ResourceExtensions || (Loader.ResourceExtensions = {}));
        ResourceExtensions['.tpl.html'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate];
        ResourceExtensions['.tpl'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate];
        function getResourceTypeFromExtension(ext) {
            if (ext === void 0 || ext === null)
                return void 0;
            var _ext = "" + ext;
            if (_ext.charAt(0) != '.')
                _ext = '.' + _ext;
            return ResourceTypes[ResourceExtensions[ext]];
        }
        Loader.getResourceTypeFromExtension = getResourceTypeFromExtension;
        var RequestStatuses;
        (function (RequestStatuses) {
            RequestStatuses[RequestStatuses["Pending"] = 0] = "Pending";
            RequestStatuses[RequestStatuses["Error"] = 1] = "Error";
            RequestStatuses[RequestStatuses["Loading"] = 2] = "Loading";
            RequestStatuses[RequestStatuses["Loaded"] = 3] = "Loaded";
            RequestStatuses[RequestStatuses["Waiting"] = 4] = "Waiting";
            RequestStatuses[RequestStatuses["Ready"] = 5] = "Ready";
            RequestStatuses[RequestStatuses["Executed"] = 6] = "Executed";
        })(RequestStatuses = Loader.RequestStatuses || (Loader.RequestStatuses = {}));
        Loader.ResourceRequest = ClassFactory(Loader, void 0, function (base) {
            var ResourceRequest = (function () {
                function ResourceRequest() {
                    this.$__transformedData = CoreXT.noop;
                    this.responseCode = 0;
                    this.responseMessage = "";
                    this.status = RequestStatuses.Pending;
                    this.messageLog = [];
                    this.cacheBusting = ResourceRequest.cacheBusting;
                    this.cacheBustingVar = ResourceRequest.cacheBustingVar;
                    this._promiseChain = [];
                    this._promiseChainIndex = 0;
                    this._parentCompletedCount = 0;
                    this._paused = false;
                }
                Object.defineProperty(ResourceRequest.prototype, "url", {
                    get: function () {
                        if (typeof this._url == 'string' && this._url.substr(0, 2) == "~/") {
                            var _baseURL = this.type == ResourceTypes.Application_Script ? CoreXT.baseScriptsURL : CoreXT.baseURL;
                            return _baseURL + this._url.substr(2);
                        }
                        return this._url;
                    },
                    set: function (value) { this._url = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResourceRequest.prototype, "transformedData", {
                    get: function () {
                        return this.$__transformedData === CoreXT.noop ? this.data : this.$__transformedData;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ResourceRequest.prototype, "message", {
                    get: function () {
                        return this._message;
                    },
                    set: function (value) {
                        this._message = value;
                        this.messageLog.push(this._message);
                        if (this.status == RequestStatuses.Error)
                            error("ResourceRequest", this._message, this, false);
                        else
                            log("ResourceRequest", this._message, LogTypes.Normal, this);
                    },
                    enumerable: true,
                    configurable: true
                });
                ResourceRequest.prototype._queueDoNext = function (data) {
                    var _this = this;
                    setTimeout(function () {
                        _this._doNext();
                    }, 0);
                };
                ResourceRequest.prototype._queueDoError = function () {
                    var _this = this;
                    setTimeout(function () { _this._doError(); }, 0);
                };
                ResourceRequest.prototype._requeueHandlersIfNeeded = function () {
                    if (this.status == RequestStatuses.Error)
                        this._queueDoError();
                    else if (this.status >= RequestStatuses.Waiting) {
                        this._queueDoNext(this.data);
                    }
                };
                ResourceRequest.prototype.then = function (success, error) {
                    if (success !== void 0 && success !== null && typeof success != 'function' || error !== void 0 && error !== null && typeof error !== 'function')
                        throw "A handler function given is not a function.";
                    else {
                        this._promiseChain.push({ onLoaded: success, onError: error });
                        this._requeueHandlersIfNeeded();
                    }
                    if (this.status == RequestStatuses.Waiting || this.status == RequestStatuses.Ready) {
                        this.status = RequestStatuses.Loaded;
                        this.message = "New 'then' handler added.";
                    }
                    return this;
                };
                ResourceRequest.prototype.include = function (request) {
                    if (!request._parentRequests)
                        request._parentRequests = [];
                    if (!this._dependants)
                        this._dependants = [];
                    request._parentRequests.push(this);
                    this._dependants.push(request);
                    return request;
                };
                ResourceRequest.prototype.ready = function (handler) {
                    if (typeof handler == 'function') {
                        if (!this._onReady)
                            this._onReady = [];
                        this._onReady.push(handler);
                        this._requeueHandlersIfNeeded();
                    }
                    else
                        throw "Handler is not a function.";
                    return this;
                };
                ResourceRequest.prototype.while = function (progressHandler) {
                    if (typeof progressHandler == 'function') {
                        if (!this._onProgress)
                            this._onProgress = [];
                        this._onProgress.push(progressHandler);
                        this._requeueHandlersIfNeeded();
                    }
                    else
                        throw "Handler is not a function.";
                    return this;
                };
                ResourceRequest.prototype.abort = function () {
                    if (this._xhr.readyState > XMLHttpRequest.UNSENT && this._xhr.readyState < XMLHttpRequest.DONE) {
                        this._xhr.abort();
                    }
                };
                ResourceRequest.prototype.catch = function (errorHandler) {
                    if (typeof errorHandler == 'function') {
                        this._promiseChain.push({ onError: errorHandler });
                        this._requeueHandlersIfNeeded();
                    }
                    else
                        throw "Handler is not a function.";
                    return this;
                };
                ResourceRequest.prototype.finally = function (cleanupHandler) {
                    if (typeof cleanupHandler == 'function') {
                        this._promiseChain.push({ onFinally: cleanupHandler });
                        this._requeueHandlersIfNeeded();
                    }
                    else
                        throw "Handler is not a function.";
                    return this;
                };
                ResourceRequest.prototype.start = function () {
                    var _this = this;
                    if (this.async)
                        setTimeout(function () { _this._Start(); }, 0);
                    else
                        this._Start();
                    return this;
                };
                ResourceRequest.prototype._Start = function () {
                    var _this = this;
                    if (this._parentRequests)
                        for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                            this._parentRequests[i].start();
                    if (this.status == RequestStatuses.Pending) {
                        this.status = RequestStatuses.Loading;
                        this.message = "Loading resource '" + this.url + "' ...";
                        if (!CoreXT.isDebugging() && typeof Storage !== void 0)
                            try {
                                var currentAppVersion = CoreXT.getAppVersion();
                                var versionInLocalStorage = localStorage.getItem("version");
                                var appVersionInLocalStorage = localStorage.getItem("appVersion");
                                if (versionInLocalStorage && appVersionInLocalStorage && CoreXT.version == versionInLocalStorage && currentAppVersion == appVersionInLocalStorage) {
                                    this.data = localStorage.getItem("resource:" + this.url);
                                    if (this.data !== null && this.data !== void 0) {
                                        this.status = RequestStatuses.Loaded;
                                        this._doNext();
                                        return;
                                    }
                                }
                            }
                            catch (e) {
                            }
                        if (!this._xhr) {
                            this._xhr = new XMLHttpRequest();
                            var xhr = this._xhr;
                            var loaded = function () {
                                if (xhr.status == 200 || xhr.status == 304) {
                                    _this.data = xhr.response;
                                    _this.status == RequestStatuses.Loaded;
                                    _this.message = xhr.status == 304 ? "Loading completed (from browser cache)." : "Loading completed.";
                                    var responseType = xhr.getResponseHeader('content-type');
                                    if (_this.type && responseType && _this.type != responseType) {
                                        _this.setError("Resource type mismatch: expected type was '" + _this.type + "', but received '" + responseType + "' (XHR type '" + xhr.responseType + "').\r\n");
                                    }
                                    else {
                                        if (typeof Storage !== void 0)
                                            try {
                                                localStorage.setItem("version", CoreXT.version);
                                                localStorage.setItem("appVersion", CoreXT.getAppVersion());
                                                localStorage.setItem("resource:" + _this.url, _this.data);
                                                _this.message = "Resource '" + _this.url + "' loaded from local storage.";
                                            }
                                            catch (e) {
                                            }
                                        _this._doNext();
                                    }
                                }
                                else {
                                    _this.setError("There was a problem loading the resource '" + _this.url + "' (status code " + xhr.status + ": " + xhr.statusText + ").\r\n");
                                }
                            };
                            xhr.onreadystatechange = function () {
                                switch (xhr.readyState) {
                                    case XMLHttpRequest.UNSENT: break;
                                    case XMLHttpRequest.OPENED:
                                        _this.message = "Opened connection to '" + _this.url + "'.";
                                        break;
                                    case XMLHttpRequest.HEADERS_RECEIVED:
                                        _this.message = "Headers received for '" + _this.url + "'.";
                                        break;
                                    case XMLHttpRequest.LOADING: break;
                                    case XMLHttpRequest.DONE:
                                        loaded();
                                        break;
                                }
                            };
                            xhr.onerror = function (ev) { _this.setError(void 0, ev); _this._doError(); };
                            xhr.onabort = function () { _this.setError("Request aborted."); };
                            xhr.ontimeout = function () { _this.setError("Request timed out."); };
                            xhr.onprogress = function (evt) {
                                _this.message = "Loaded " + Math.round(evt.loaded / evt.total * 100) + "%.";
                                if (_this._onProgress && _this._onProgress.length)
                                    _this._doOnProgress(evt.loaded / evt.total * 100);
                            };
                        }
                    }
                    else {
                        return;
                    }
                    if (xhr.readyState != 0)
                        xhr.abort();
                    var url = this.url;
                    try {
                        if (this.cacheBusting) {
                            var bustVar = this.cacheBustingVar || "_v_";
                            if (bustVar.indexOf(" ") >= 0)
                                log("start()", "There is a space character in the cache busting query name for resource '" + url + "'.", LogTypes.Warning);
                        }
                        xhr.open("get", url, this.async);
                    }
                    catch (ex) {
                        error("start()", "Failed to load resource from URL '" + url + "': " + (ex.message || ex), this);
                    }
                    try {
                        xhr.send();
                    }
                    catch (ex) {
                        error("start()", "Failed to send request to endpoint for URL '" + url + "': " + (ex.message || ex), this);
                    }
                };
                ResourceRequest.prototype.pause = function () {
                    if (this.status >= RequestStatuses.Pending && this.status < RequestStatuses.Ready
                        || this.status == RequestStatuses.Ready && this._onReady.length)
                        this._paused = true;
                    return this;
                };
                ResourceRequest.prototype.continue = function () {
                    if (this._paused) {
                        this._paused = false;
                        this._requeueHandlersIfNeeded();
                    }
                    return this;
                };
                ResourceRequest.prototype._doOnProgress = function (percent) {
                    if (this._onProgress) {
                        for (var i = 0, n = this._onProgress.length; i < n; ++i)
                            try {
                                var cb = this._onProgress[i];
                                if (cb)
                                    cb.call(this, this);
                            }
                            catch (e) {
                                this._onProgress[i] = null;
                                this.setError("'on progress' callback #" + i + " has thrown an error:", e);
                            }
                    }
                };
                ResourceRequest.prototype.setError = function (message, error) {
                    if (error) {
                        var errMsg = getErrorMessage(error);
                        if (errMsg) {
                            if (message)
                                message += "\r\n";
                            message += errMsg;
                        }
                    }
                    this.status = RequestStatuses.Error;
                    this.message = message;
                };
                ResourceRequest.prototype._doNext = function () {
                    var _this = this;
                    if (this.status == RequestStatuses.Error) {
                        this._doError();
                        return;
                    }
                    if (this._onProgress && this._onProgress.length) {
                        this._doOnProgress(100);
                        this._onProgress.length = 0;
                    }
                    for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                        if (this._paused)
                            return;
                        var handlers = this._promiseChain[this._promiseChainIndex];
                        if (handlers.onLoaded) {
                            try {
                                var data = handlers.onLoaded.call(this, this.transformedData);
                            }
                            catch (e) {
                                this.setError("Success handler failed.", e);
                                ++this._promiseChainIndex;
                                this._doError();
                                return;
                            }
                            if (typeof data === 'object' && data instanceof ResourceRequest) {
                                if (data.status == RequestStatuses.Error) {
                                    this.setError("Rejected request returned.");
                                    ++this._promiseChainIndex;
                                    this._doError();
                                    return;
                                }
                                else {
                                    var newResReq = data;
                                    if (newResReq.status >= RequestStatuses.Ready) {
                                        if (newResReq === this)
                                            continue;
                                        data = newResReq.transformedData;
                                    }
                                    else {
                                        newResReq.ready(function (sender) { _this.$__transformedData = sender.transformedData; _this._doNext(); })
                                            .catch(function (sender) { _this.setError("Resource returned from next handler has failed to load.", sender); _this._doError(); });
                                        return;
                                    }
                                }
                            }
                            this.$__transformedData = data;
                        }
                        else if (handlers.onFinally) {
                            try {
                                handlers.onFinally.call(this);
                            }
                            catch (e) {
                                this.setError("Cleanup handler failed.", e);
                                ++this._promiseChainIndex;
                                this._doError();
                            }
                        }
                    }
                    this._promiseChain.length = 0;
                    this._promiseChainIndex = 0;
                    if (this.status < RequestStatuses.Waiting)
                        this.status = RequestStatuses.Waiting;
                    this._doReady();
                };
                ResourceRequest.prototype._doReady = function () {
                    if (this._paused)
                        return;
                    if (this.status < RequestStatuses.Waiting)
                        return;
                    if (this.status == RequestStatuses.Waiting)
                        if (!this._parentRequests || !this._parentRequests.length) {
                            this.status = RequestStatuses.Ready;
                            this.message = "Resource '" + this.url + "' has no dependencies, and is now ready.";
                        }
                        else if (this._parentCompletedCount == this._parentRequests.length) {
                            this.status = RequestStatuses.Ready;
                            this.message = "*** All dependencies for resource '" + this.url + "' have loaded, and are now ready. ***";
                        }
                        else {
                            this.message = "Resource '" + this.url + "' is waiting on dependencies (" + this._parentCompletedCount + "/" + this._parentRequests.length + " ready so far)...";
                            return;
                        }
                    if (this.status == RequestStatuses.Ready) {
                        if (this._onReady && this._onReady.length) {
                            try {
                                this._onReady.shift().call(this, this);
                                if (this._paused)
                                    return;
                            }
                            catch (e) {
                                this.setError("Error in ready handler.", e);
                            }
                        }
                        if (this._dependants)
                            for (var i = 0, n = this._dependants.length; i < n; ++i) {
                                ++this._dependants[i]._parentCompletedCount;
                                this._dependants[i]._doReady();
                            }
                    }
                };
                ResourceRequest.prototype._doError = function () {
                    var _this = this;
                    if (this._paused)
                        return;
                    if (this.status != RequestStatuses.Error) {
                        this._doNext();
                        return;
                    }
                    for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                        if (this._paused)
                            return;
                        var handlers = this._promiseChain[this._promiseChainIndex];
                        if (handlers.onError) {
                            try {
                                var newData = handlers.onError.call(this, this, this.message);
                            }
                            catch (e) {
                                this.setError("Error handler failed.", e);
                            }
                            if (typeof newData === 'object' && newData instanceof ResourceRequest) {
                                if (newData.status == RequestStatuses.Error)
                                    return;
                                else {
                                    var newResReq = newData;
                                    if (newResReq.status >= RequestStatuses.Ready)
                                        newData = newResReq.transformedData;
                                    else {
                                        newResReq.ready(function (sender) { _this.$__transformedData = sender.transformedData; _this._doNext(); })
                                            .catch(function (sender) { _this.setError("Resource returned from error handler has failed to load.", sender); _this._doError(); });
                                        return;
                                    }
                                }
                            }
                            this.status = RequestStatuses.Loaded;
                            this._message = void 0;
                            ++this._promiseChainIndex;
                            this.$__transformedData = newData;
                            this._doNext();
                            return;
                        }
                        else if (handlers.onFinally) {
                            try {
                                handlers.onFinally.call(this);
                            }
                            catch (e) {
                                this.setError("Cleanup handler failed.", e);
                            }
                        }
                    }
                    if (this.status == RequestStatuses.Error) {
                        var msgs = this.messageLog.join("\r\n· ");
                        if (msgs)
                            msgs = ":\r\n· " + msgs;
                        else
                            msgs = ".";
                        throw new Error("Unhandled error loading resource " + ResourceTypes[this.type] + " from '" + this.url + "'" + msgs + "\r\n");
                    }
                };
                ResourceRequest.prototype.reload = function (includeDependentResources) {
                    if (includeDependentResources === void 0) { includeDependentResources = true; }
                    if (this.status == RequestStatuses.Error || this.status >= RequestStatuses.Ready) {
                        this.data = void 0;
                        this.status = RequestStatuses.Pending;
                        this.responseCode = 0;
                        this.responseMessage = "";
                        this._message = "";
                        this.messageLog = [];
                        if (includeDependentResources)
                            for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                                this._parentRequests[i].reload(includeDependentResources);
                        if (this._onProgress)
                            this._onProgress.length = 0;
                        if (this._onReady)
                            this._onReady.length = 0;
                        if (this._promiseChain)
                            this._promiseChain.length = 0;
                        this.start();
                    }
                    return this;
                };
                ResourceRequest.cacheBusting = true;
                ResourceRequest.cacheBustingVar = '_v_';
                ResourceRequest['ResourceRequestFactory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function (url, type, async) { return null; };
                    Factory.init = function (o, isnew, url, type, async) {
                        if (async === void 0) { async = true; }
                        if (url === void 0 || url === null)
                            throw "A resource URL is required.";
                        if (type === void 0)
                            throw "The resource type is required.";
                        if (_resourceRequestByURL[url])
                            return _resourceRequestByURL[url];
                        o.url = url;
                        o.type = type;
                        o.async = async;
                        o.$__index = _resourceRequests.length;
                        _resourceRequests.push(o);
                        _resourceRequestByURL[o.url] = o;
                    };
                    return Factory;
                }(FactoryBase(ResourceRequest, null)));
                return ResourceRequest;
            }());
            return [ResourceRequest, ResourceRequest["ResourceRequestFactory"]];
        });
        var _resourceRequests = [];
        var _resourceRequestByURL = {};
        function get(url, type, asyc) {
            if (asyc === void 0) { asyc = true; }
            if (url === void 0 || url === null)
                throw "A resource URL is required.";
            url = "" + url;
            if (type === void 0 || type === null) {
                var ext = (url.match(/(\.[A-Za-z0-9]+)(?:[\?\#]|$)/i) || []).pop();
                type = getResourceTypeFromExtension(ext);
                if (!type)
                    error("Loader.get('" + url + "', type:" + type + ")", "A resource (MIME) type is required, and no resource type could be determined (See CoreXT.Loader.ResourceTypes). If the resource type cannot be detected by a file extension then you must specify the MIME string manually.");
            }
            var request = _resourceRequestByURL[url];
            if (!request)
                request = Loader.ResourceRequest.new(url, type, asyc);
            return request;
        }
        Loader.get = get;
        function _SystemScript_onReady_Handler(request) {
            try {
                var helpers = CoreXT.renderHelperVarDeclarations("p0");
                CoreXT.safeEval(helpers[0] + " var CoreXT=p1; " + request.transformedData, helpers[1], CoreXT);
                request.status = RequestStatuses.Executed;
                request.message = "The script has been executed.";
            }
            catch (e) {
                request.setError("There was an error executing script '" + request.url + "'.", e);
            }
        }
        Loader._SystemScript_onReady_Handler = _SystemScript_onReady_Handler;
        function bootstrap() {
            var onReady = _SystemScript_onReady_Handler;
            get("~/CoreXT.Polyfills.js").ready(onReady)
                .include(get("~/CoreXT.Utilities.js")).ready(onReady)
                .include(get("~/CoreXT.Globals.js")).ready(onReady)
                .include(get("~/CoreXT.Scripts.js").ready(onReady))
                .include(get("~/System/CoreXT.System.js").ready(onReady))
                .include(get("~/System/CoreXT.System.PrimitiveTypes.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Time.js")).ready(onReady)
                .include(get("~/System/CoreXT.System.Storage.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Exception.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Diagnostics.js")).ready(onReady)
                .include(get("~/System/CoreXT.System.Events.js").ready(onReady))
                .include(get("~/CoreXT.Browser.js")).ready(onReady)
                .include(get("~/System/CoreXT.System.Collections.IndexedObjectCollection.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Collections.ObservableCollection.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Text.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Data.js").ready(onReady))
                .include(get("~/System/CoreXT.System.IO.js").ready(onReady))
                .include(get("~/System/CoreXT.System.AppDomain.js").ready(onReady))
                .ready(function () {
                if (_onSystemLoadedHandlers && _onSystemLoadedHandlers.length)
                    for (var i = 0, n = _onSystemLoadedHandlers.length; i < n; ++i)
                        _onSystemLoadedHandlers[i]();
                CoreXT.Scripts.getManifest()
                    .include(CoreXT.Scripts.getManifest("~/app.manifest"))
                    .ready(function (mod) {
                    CoreXT.onReady.dispatch();
                    CoreXT.Scripts._tryRunApp();
                })
                    .start();
            })
                .start();
            CoreXT.Loader.bootstrap = CoreXT.noop();
        }
        Loader.bootstrap = bootstrap;
    })(Loader = CoreXT.Loader || (CoreXT.Loader = {}));
    log("CoreXT", "Core system loaded.", LogTypes.Info);
})(CoreXT || (CoreXT = {}));
var corext = CoreXT;
if (typeof $X === void 0)
    var $X = CoreXT;
if (typeof System === void 0 || System === null) {
    var System = CoreXT.System;
}
if (CoreXT.debugMode != CoreXT.DebugModes.Debug_Wait)
    CoreXT.Loader.bootstrap();
//# sourceMappingURL=CoreXT.js.map