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
    CoreXT.version = "0.0.1";
    if (typeof navigator != 'undefined' && typeof console != 'undefined')
        if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0)
            console.log("-=< CoreXT Client OS - v" + CoreXT.version + " >=- ");
        else
            console.log("%c -=< %cCoreXT Client OS - v" + CoreXT.version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");
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
})(CoreXT || (CoreXT = {}));
CoreXT.safeEval = function (exp, p1, p2, p3) { return eval(exp); };
CoreXT.globalEval = function (exp, p1, p2, p3) { return (0, eval)(exp); };
(function (CoreXT) {
    CoreXT.ES6 = (function () { try {
        return eval("(function () { return new.target; }, true)");
    }
    catch (e) {
        return false;
    } })();
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
    function getTypeName(object, cacheTypeName) {
        if (cacheTypeName === void 0) { cacheTypeName = true; }
        if (object === void 0 || object === null)
            return void 0;
        typeInfo = object;
        if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
            if (typeof object == 'function')
                if (cacheTypeName)
                    return typeInfo.$__name = getFunctionName(object);
                else
                    return getFunctionName(object);
            var typeInfo = object.constructor;
            if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
                if (cacheTypeName)
                    return typeInfo.$__name = getFunctionName(object.constructor);
                else
                    return getFunctionName(object.constructor);
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
        Types.__types = {};
        Types.__disposedObjects = {};
        function __new() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var bridge = this;
            var type = this;
            if (typeof this != 'function' || !this.init && !this.new)
                throw System.Exception.error("Constructor call operation on a non-constructor function.", "Using the 'new' operator is only valid on class and class-factory types. Just call the '{FactoryType}.new()' factory *function* without the 'new' operator.", this);
            var appDomain = bridge.$__appDomain || System.AppDomain && System.AppDomain.default;
            var instance;
            var isNew = false;
            var fullTypeName = type.$__fullname;
            var objectPool = fullTypeName && Types.__disposedObjects[fullTypeName];
            if (objectPool && objectPool.length)
                instance = objectPool.pop();
            else {
                instance = new type();
                isNew = true;
            }
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
            return instance;
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
            namespace[_exportName] = cls;
            classType.$__type = classType;
            classType.$__factoryType = factoryType;
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
            __registerType(factoryType.$__type, namespace, addMemberTypeInfo, exportName);
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
                for (var pname in prototype) {
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
        function dispose(object, release) {
            if (release === void 0) { release = true; }
            var _object = object;
            if (_object !== void 0) {
                if (_object.dispose != CoreXT.noop) {
                    _object.dispose = CoreXT.noop;
                    dispose(_object, release);
                }
                var appDomain = _object.$__appDomain;
                if (appDomain) {
                    _object.dispose = CoreXT.noop;
                    appDomain.dispose(_object);
                }
                CoreXT.Utilities.erase(this, release);
                if (!release)
                    _object.$__appDomain = this;
                else {
                    var type = _object.constructor;
                    if (!type.$__fullname)
                        error("dispose()", "The object type is not registered.  Please see one of the AppDomain 'registerClass()/registerType()' functions for more details.", object);
                    var funcList = Types.__disposedObjects[type.$__fullname];
                    if (!funcList)
                        Types.__disposedObjects[type.$__fullname] = funcList = [];
                    funcList.push(_object);
                }
            }
            else {
                for (var i = this._applications.length - 1; i >= 0; --i)
                    dispose(this._applications[i]);
                this._applications.length = 0;
                for (var i = this._windows.length - 1; i >= 0; --i)
                    dispose(this._windows[i]);
                this._windows.length = 0;
            }
            for (var i = this._windows.length - 1; i >= 0; --i)
                if (this._windows[i].target != CoreXT.global)
                    this._windows[i].close();
            CoreXT.global.close();
        }
        Types.dispose = dispose;
    })(Types = CoreXT.Types || (CoreXT.Types = {}));
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
    var System;
    (function (System) {
        var Diagnostics;
        (function (Diagnostics) {
            registerNamespace("CoreXT", "System", "Diagnostics");
            Diagnostics.__logItems = [];
            var __logItemsSequenceCounter = 0;
            var __logCaptureStack = [];
            var DebugModes;
            (function (DebugModes) {
                DebugModes[DebugModes["Release"] = 0] = "Release";
                DebugModes[DebugModes["Debug_Run"] = 1] = "Debug_Run";
                DebugModes[DebugModes["Debug_Wait"] = 2] = "Debug_Wait";
            })(DebugModes = Diagnostics.DebugModes || (Diagnostics.DebugModes = {}));
            Diagnostics.debug = DebugModes.Debug_Run;
            function isDebugging() { return Diagnostics.debug != DebugModes.Release; }
            Diagnostics.isDebugging = isDebugging;
            Diagnostics.LogItem = ClassFactory(Diagnostics, void 0, function (base) {
                var LogItem = (function () {
                    function LogItem() {
                        this.parent = null;
                        this.sequence = __logItemsSequenceCounter++;
                        this.marginIndex = void 0;
                    }
                    LogItem.prototype.write = function (message, type, outputToConsole) {
                        if (type === void 0) { type = LogTypes.Normal; }
                        if (outputToConsole === void 0) { outputToConsole = true; }
                        var logItem = Diagnostics.LogItem.new(this, null, message, type);
                        if (!this.subItems)
                            this.subItems = [];
                        this.subItems.push(logItem);
                        return this;
                    };
                    LogItem.prototype.log = function (title, message, type, outputToConsole) {
                        if (type === void 0) { type = LogTypes.Normal; }
                        if (outputToConsole === void 0) { outputToConsole = true; }
                        var logItem = Diagnostics.LogItem.new(this, title, message, type, outputToConsole);
                        if (!this.subItems)
                            this.subItems = [];
                        this.subItems.push(logItem);
                        return logItem;
                    };
                    LogItem.prototype.beginCapture = function () {
                        __logCaptureStack.push(this);
                        return this;
                    };
                    LogItem.prototype.endCapture = function () {
                        var item = __logCaptureStack.pop();
                        if (item != null)
                            throw System.Exception.from("Your calls to begin/end log capture do not match up. Make sure the calls to 'endCapture()' match up to your calls to 'beginCapture()'.", this);
                    };
                    LogItem.prototype.toString = function () {
                        var time = System.TimeSpan && System.TimeSpan.utcTimeToLocalTime(this.time) || null;
                        var timeStr = time && (time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)) || "" + new Date(this.time).toLocaleTimeString();
                        var txt = "[" + this.sequence + "] (" + timeStr + ") " + this.title + ": " + this.message;
                        return txt;
                    };
                    LogItem['LogItemFactory'] = (function (_super) {
                        __extends(Factory, _super);
                        function Factory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        Factory['new'] = function (parent, title, message, type, outputToConsole) {
                            if (type === void 0) { type = LogTypes.Normal; }
                            if (outputToConsole === void 0) { outputToConsole = true; }
                            return null;
                        };
                        Factory.init = function (o, isnew, parent, title, message, type, outputToConsole) {
                            if (type === void 0) { type = LogTypes.Normal; }
                            if (outputToConsole === void 0) { outputToConsole = true; }
                            if (title === void 0 || title === null) {
                                if (isEmpty(message))
                                    error("LogItem()", "A message is required if no title is given.", o);
                                title = "";
                            }
                            else if (typeof title != 'string')
                                if (title.$__fullname)
                                    title = title.$__fullname;
                                else
                                    title = title.toString && title.toString() || title.toValue && title.toValue() || "" + title;
                            if (message === void 0 || message === null)
                                message = "";
                            else
                                message = message.toString && message.toString() || message.toValue && message.toValue() || "" + message;
                            o.parent = parent;
                            o.title = title;
                            o.message = message;
                            o.time = Date.now();
                            o.type = type;
                            if (console && outputToConsole) {
                                var _title = title, margin = "";
                                if (_title.charAt(title.length - 1) != ":")
                                    _title += ": ";
                                else
                                    _title += " ";
                                while (parent) {
                                    parent = parent.parent;
                                    margin += "  ";
                                }
                                if (System.TimeSpan) {
                                    var time = System.TimeSpan.utcTimeToLocalTime(o.time);
                                    var consoleText = time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)
                                        + " " + margin + _title + o.message;
                                }
                                else
                                    consoleText = Date() + " " + margin + _title + o.message;
                                CoreXT.log(null, consoleText, type, void 0, false, false);
                            }
                        };
                        return Factory;
                    }(FactoryBase(LogItem, null)));
                    return LogItem;
                }());
                return [LogItem, LogItem["LogItemFactory"]];
            });
            function log(title, message, type, outputToConsole) {
                if (type === void 0) { type = LogTypes.Normal; }
                if (outputToConsole === void 0) { outputToConsole = true; }
                if (__logCaptureStack.length) {
                    var capturedLogItem = __logCaptureStack[__logCaptureStack.length - 1];
                    var lastLogEntry = capturedLogItem.subItems && capturedLogItem.subItems.length && capturedLogItem.subItems[capturedLogItem.subItems.length - 1];
                    if (lastLogEntry)
                        return lastLogEntry.log(title, message, type, outputToConsole);
                    else
                        return capturedLogItem.log(title, message, type, outputToConsole);
                }
                var logItem = Diagnostics.LogItem.new(null, title, message, type);
                Diagnostics.__logItems.push(logItem);
                return logItem;
            }
            Diagnostics.log = log;
            function getLogAsHTML() {
                var i, n;
                var orderedLogItems = [];
                var item;
                var logHTML = "<div>\r\n", cssClass = "", title, icon, rowHTML, titleHTML, messageHTML, marginHTML = "";
                var logItem, lookAheadLogItem;
                var time;
                var cssAndIcon;
                var margins = [""];
                var currentMarginIndex = 0;
                function cssAndIconFromLogType_text(type) {
                    var cssClass, icon;
                    switch (type) {
                        case LogTypes.Success:
                            cssClass = "text-success";
                            icon = "&#x221A;";
                            break;
                        case LogTypes.Info:
                            cssClass = "text-info";
                            icon = "&#x263C;";
                            break;
                        case LogTypes.Warning:
                            cssClass = "text-warning";
                            icon = "&#x25B2;";
                            break;
                        case LogTypes.Error:
                            cssClass = "text-danger";
                            icon = "<b>(!)</b>";
                            break;
                        default:
                            cssClass = "";
                            icon = "";
                    }
                    return { cssClass: cssClass, icon: icon };
                }
                function reorganizeEventsBySequence(logItems) {
                    var i, n;
                    for (i = 0, n = logItems.length; i < n; ++i) {
                        logItem = logItems[i];
                        logItem.marginIndex = void 0;
                        orderedLogItems[logItem.sequence] = logItem;
                        if (logItem.subItems && logItem.subItems.length)
                            reorganizeEventsBySequence(logItem.subItems);
                    }
                }
                function setMarginIndexes(logItem, marginIndex) {
                    if (marginIndex === void 0) { marginIndex = 0; }
                    var i, n;
                    if (marginIndex && !margins[marginIndex])
                        margins[marginIndex] = margins[marginIndex - 1] + "&nbsp;&nbsp;&nbsp;&nbsp;";
                    logItem.marginIndex = marginIndex;
                    if (logItem.subItems && logItem.subItems.length) {
                        for (i = 0, n = logItem.subItems.length; i < n; ++i)
                            setMarginIndexes(logItem.subItems[i], marginIndex + 1);
                    }
                }
                reorganizeEventsBySequence(Diagnostics.__logItems);
                for (i = 0, n = orderedLogItems.length; i < n; ++i) {
                    logItem = orderedLogItems[i];
                    if (!logItem)
                        continue;
                    rowHTML = "";
                    if (logItem.marginIndex === void 0)
                        setMarginIndexes(logItem);
                    marginHTML = margins[logItem.marginIndex];
                    cssAndIcon = cssAndIconFromLogType_text(logItem.type);
                    if (cssAndIcon.icon)
                        cssAndIcon.icon += "&nbsp;";
                    if (cssAndIcon.cssClass)
                        messageHTML = cssAndIcon.icon + "<strong>" + System.String.replace(logItem.message, "\r\n", "<br />\r\n") + "</strong>";
                    else
                        messageHTML = cssAndIcon.icon + logItem.message;
                    if (logItem.title)
                        titleHTML = logItem.title + ": ";
                    else
                        titleHTML = "";
                    time = System.TimeSpan.utcTimeToLocalTime(logItem.time);
                    rowHTML = "<div class='" + cssAndIcon.cssClass + "'>"
                        + time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds) + "&nbsp;"
                        + marginHTML + titleHTML + messageHTML + "</div>" + rowHTML + "\r\n";
                    logHTML += rowHTML + "</ br>\r\n";
                }
                logHTML += "</div>\r\n";
                return logHTML;
            }
            Diagnostics.getLogAsHTML = getLogAsHTML;
            function getLogAsText() {
                return System.String.replaceTags(System.String.replace(getLogAsHTML(), "&nbsp;", " "));
            }
            Diagnostics.getLogAsText = getLogAsText;
        })(Diagnostics = System.Diagnostics || (System.Diagnostics = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
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
    (function (System) {
        registerNamespace("CoreXT", "System");
        System.Exception = ClassFactory(System, void 0, function (base) {
            var Exception = (function (_super) {
                __extends(Exception, _super);
                function Exception() {
                    var _this = this;
                    if (!CoreXT.ES6)
                        eval("var _super = function() { return null; }");
                    _this = _super.call(this) || this;
                    return _this;
                }
                Exception.prototype.toString = function () { return this.message; };
                Exception.prototype.valueOf = function () { return this.message; };
                Exception.printStackTrace = function () {
                    var callstack = [];
                    var isCallstackPopulated = false;
                    try {
                        throw "";
                    }
                    catch (e) {
                        if (e.stack) {
                            var lines = e.stack.split('\n');
                            for (var i = 0, len = lines.length; i < len; ++i) {
                                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                                    callstack.push(lines[i]);
                                }
                            }
                            callstack.shift();
                            isCallstackPopulated = true;
                        }
                        else if (CoreXT.global["opera"] && e.message) {
                            var lines = e.message.split('\n');
                            for (var i = 0, len = lines.length; i < len; ++i) {
                                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                                    var entry = lines[i];
                                    if (lines[i + 1]) {
                                        entry += ' at ' + lines[i + 1];
                                        i++;
                                    }
                                    callstack.push(entry);
                                }
                            }
                            callstack.shift();
                            isCallstackPopulated = true;
                        }
                    }
                    if (!isCallstackPopulated) {
                        var currentFunction = arguments.callee.caller;
                        while (currentFunction) {
                            var fn = currentFunction.toString();
                            var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
                            callstack.push(fname);
                            currentFunction = currentFunction.caller;
                        }
                    }
                    return callstack;
                };
                Exception.from = function (message, source) {
                    if (source === void 0) { source = null; }
                    var createLog = true;
                    if (typeof message == 'object' && (message.title || message.message)) {
                        createLog = false;
                        if (source != void 0)
                            message.source = source;
                        source = message;
                        message = "";
                        if (source.title)
                            message += source.title;
                        if (source.message) {
                            if (message)
                                message += ": ";
                            message += source.message;
                        }
                    }
                    var caller = this.from.caller;
                    while (caller && (caller == System.Exception.error || caller == System.Exception.notImplemented || caller == CoreXT.log || caller == CoreXT.error
                        || typeof caller.$__fullname == 'string' && caller.$__fullname.substr(0, 17) == "System.Exception."))
                        caller = caller.caller;
                    if (caller) {
                        message += "\r\n\r\nStack:\r\n\r\n";
                        var stackMsg = "";
                        while (caller) {
                            var callerName = getFullTypeName(caller) || "/*anonymous*/";
                            var args = caller.arguments;
                            var _args = args && args.length > 0 ? CoreXT.global.Array.prototype.join.call(args, ', ') : "";
                            if (stackMsg)
                                stackMsg += "called from ";
                            stackMsg += callerName + "(" + _args + ")\r\n\r\n";
                            caller = caller.caller != caller ? caller.caller : null;
                        }
                        message += stackMsg;
                    }
                    return System.Exception.new(message, source, createLog);
                };
                Exception.error = function (title, message, source) {
                    if (System.Diagnostics && System.Diagnostics.log) {
                        var logItem = System.Diagnostics.log(title, message, LogTypes.Error);
                        return Exception.from(logItem, source);
                    }
                    else
                        return Exception.from(error(title, message, source, false, false), source);
                };
                Exception.notImplemented = function (functionNameOrTitle, source, message) {
                    var msg = "The function is not implemented." + (message ? " " + message : "");
                    if (System.Diagnostics && System.Diagnostics.log) {
                        var logItem = System.Diagnostics.log(functionNameOrTitle, msg, LogTypes.Error);
                        return Exception.from(logItem, source);
                    }
                    else
                        return Exception.from(error(functionNameOrTitle, msg, source, false, false), source);
                };
                Exception['ExceptionFactory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function (message, source, log) { return null; };
                    Factory.init = function (o, isnew, message, source, log) {
                        o.message = message;
                        o.source = source;
                        o.stack = (new Error()).stack;
                        if (log || log === void 0)
                            System.Diagnostics.log("Exception", message, LogTypes.Error);
                    };
                    return Factory;
                }(FactoryBase(Exception, null)));
                return Exception;
            }(Error));
            return [Exception, Exception["ExceptionFactory"]];
        });
    })(System = CoreXT.System || (CoreXT.System = {}));
    var Loader;
    (function (Loader) {
        registerNamespace("CoreXT", "Loader");
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
                        if (typeof Storage !== void 0)
                            try {
                                this.data = localStorage.getItem("resource:" + this.url);
                                if (this.data !== null && this.data !== void 0) {
                                    this.status = RequestStatuses.Loaded;
                                    this._doNext();
                                    return;
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
                        xhr.open("get", url, this.async);
                    }
                    catch (ex) {
                        error("get()", "Failed to load resource from URL '" + url + "': " + (ex.message || ex), this);
                    }
                    try {
                        xhr.send();
                    }
                    catch (ex) {
                        error("get()", "Failed to send request to endpoint for URL '" + url + "': " + (ex.message || ex), this);
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
                            this.message = "All dependencies for resource '" + this.url + "' have loaded, and are now ready.";
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
                CoreXT.globalEval(request.transformedData);
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
            get("~/CoreXT.Utilities.js").ready(onReady)
                .include(get("~/CoreXT.Globals.js")).ready(onReady)
                .include(get("~/System/CoreXT.System.js").ready(onReady))
                .include(get("~/System/CoreXT.System.PrimitiveTypes.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Events.js").ready(onReady))
                .include(get("~/CoreXT.Browser.js")).ready(onReady)
                .include(get("~/CoreXT.Scripts.js").ready(onReady))
                .include(get("~/System/CoreXT.System.AppDomain.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Time.js")).ready(onReady)
                .include(get("~/System/CoreXT.System.IO.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Data.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Diagnostics.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Exception.js").ready(onReady))
                .ready(function () {
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
CoreXT.Loader.bootstrap();
//# sourceMappingURL=CoreXT.js.map