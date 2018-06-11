/*
 * CoreXT (CoreXT.com), (c) Twigate.com
 * License: http://creativecommons.org/licenses/by-nc/4.0/
 * License note: While the core OS (server side) is protected, the client side and modules will be open source to allow community
 *               contributions. The aim is to protect the quality of the system, while also allowing the community to build upon it freely.
 *
 * Description: CoreXT is an Internet-based operating system.  The idea behind it is similar to a web desktop, but without any UI at all.
 *              The CoreXT API resides on a web server, and allows other web apps to integrate with it, much like any other social API,
 *              such as those provided by Facebook, Twitter, etc. (without any actual web pages).
 *
 *              This file is just a bootstrap to help load the required modules and dependencies.
 *
 * Purpose: To provide a JS framework for .Net CoreXT and WebDesktop.org, but also for other web applications in a security enhanced and controlled manner.
 *
 * Note: Good performance rules: http://developer.yahoo.com/performance/rules.html
 * Note: Loading benchmark done using "http://www.webpagetest.org/".
 * Note: Reason for factory object construction (new/init) patterns in CoreXT: http://www.html5rocks.com/en/tutorials/speed/static-mem-pools/
 */
/** The current application version (user defined). */
var appVersion;
//declare function Symbol(desc?: string): string;
if (typeof this['Symbol'] == 'undefined') { // (mainly for IE 11)
    // ... create a simple polyfill for this ...
    this['Symbol'] = function Symbol(desc) { var d = new Date().getTime(), dStr = '$' + d; this.valueOf = function () { return dStr; }; this.toString = function () { return dStr; }; return this; };
}
/**
 * The root namespace for the CoreXT system.
 */
var CoreXT;
(function (CoreXT) {
    /** The current version of the CoreXT system. */
    CoreXT.version = "0.0.1";
    Object.defineProperty(CoreXT, "version", { writable: false });
    /** Returns the current user defined application version, or a default version. */
    CoreXT.getAppVersion = function () { return appVersion || "0.0.0"; };
    if (typeof navigator != 'undefined' && typeof console != 'undefined')
        if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0)
            console.log("-=< CoreXT Client OS - v" + CoreXT.version + " >=- ");
        else
            console.log("%c -=< %cCoreXT Client OS - v" + CoreXT.version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");
    var DebugModes;
    (function (DebugModes) {
        /** Run in release mode, which loads all minified module scripts, and runs the application automatically when ready. */
        DebugModes[DebugModes["Release"] = 0] = "Release";
        /** Run in debug mode (default), which loads all un-minified scripts, and runs the application automatically when ready. */
        DebugModes[DebugModes["Debug_Run"] = 1] = "Debug_Run";
        /**
          * Run in debug mode, which loads all un-minified scripts, but does NOT boot the system nor run the application automatically.
          * To manually start the CoreXT system boot process, call 'CoreXT.Loader.bootstrap()'.
          * Once the boot process completes, the application will not start automatically. To start the application process, call 'CoreXT.Scripts.runApp()".
          */
        DebugModes[DebugModes["Debug_Wait"] = 2] = "Debug_Wait";
    })(DebugModes = CoreXT.DebugModes || (CoreXT.DebugModes = {}));
    /** Sets the debug mode. A developer should set this to one of the desired 'DebugModes' values. The default is 'Debug_Run'. */
    CoreXT.debugMode = DebugModes.Debug_Run;
    /** Returns true if CoreXT is running in debug mode. */
    function isDebugging() { return CoreXT.debugMode != DebugModes.Release; }
    CoreXT.isDebugging = isDebugging;
    /** Returns the name of a namespace or variable reference at runtime. */
    function nameof(selector, fullname) {
        if (fullname === void 0) { fullname = false; }
        var s = '' + selector;
        //var m = s.match(/return\s*([A-Z.]+)/i) || s.match(/=>\s*{?\s*([A-Z.]+)/i) || s.match(/function.*?{\s*([A-Z.]+)/i);
        var m = s.match(/return\s+([A-Z$_.]+)/i) || s.match(/.*?(?:=>|function.*?{(?!\s*return))\s*([A-Z.]+)/i);
        var name = m && m[1] || "";
        return fullname ? name : name.split('.').reverse()[0];
    }
    CoreXT.nameof = nameof;
    CoreXT.constructor = Symbol("static constructor");
    // ===================================================================================================================
    /**
     * Returns true if the URL contains the specific action and controller names at the end of the URL path.
     * This of course assumes typical routing patterns in the format '/controller/action' or '/area/controller/action'.
     */
    function isPage(action, controller, area) {
        if (controller === void 0) { controller = "home"; }
        if (area === void 0) { area = ""; }
        var regexStr = "\/" + action + "(?:\/?[?&#]|$)";
        if (controller)
            regexStr = "\/" + controller + regexStr;
        if (area)
            regexStr = "\/" + area + regexStr;
        return new RegExp(regexStr, "gi").test(location.pathname);
    }
    CoreXT.isPage = isPage;
    // ===================================================================================================================
})(CoreXT || (CoreXT = {}));
/** (See 'CoreXT') */
var corext = CoreXT; // (allow all lower case usage)
if (typeof $X === void 0)
    /** A shorthand form to use for the 'CoreXT' global reference. */
    var $X = CoreXT;
// ... users will need to make sure 'System' and/or 'using' are not in use (undefined or set to null before this script is executed) in order to use it as a valid type reference ...
if (typeof System === void 0 || System === null) { // (users should reference "System." for the main types, but "CoreXT.System" can be used if the global 'System' is needed for something else)
    /** The base module for all CoreXT System namespace types. */
    var System = CoreXT.System; // (try to make this global, unless otherwise predefined ...)
}
// =======================================================================================================================
/** The "fake" host object is only used when there is no .NET host wrapper integration available.
* In this case, the environment is running as a simple web application.
*/
var __NonCoreXTHost__ = /** @class */ (function () {
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
// TODO: $ICE loads as a module, and should do this differently.
//??else
//??    $ICE = <IHostBridge_ICE>host;
// =======================================================================================================================
// If the host is in debug mode, then this script should try to wait on it.
// Note: This many only work if the debugger is actually open when this script executes.
if (typeof host === 'object' && host.isDebugMode && host.isDebugMode())
    debugger;
// ===========================================================================================================================
/** An optional site root URL if the main site root path is in a virtual path. */
var siteBaseURL;
/** Root location of the application scripts, which be default is the {site URL}+"/js/". */
var scriptsBaseURL;
// ===========================================================================================================================
// Setup some preliminary settings before the core scope, including the "safe" and "global" 'eval()' functions.
(function (CoreXT) {
    // =======================================================================================================================
    // Integrate native types
    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    CoreXT.global = (function () { }.constructor("return this"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])
    CoreXT.host = (function () {
        // ... make sure the host object is valid for at least checking client/server/studio states
        if (typeof CoreXT.host !== 'object' || typeof CoreXT.host.isClient == 'undefined' || typeof CoreXT.host.isServer == 'undefined' || typeof CoreXT.host.isStudio == 'undefined')
            return new __NonCoreXTHost__();
        else
            return CoreXT.host; // (running in a valid host (or emulator? ;) )
    })();
    // =======================================================================================================================
    /** The root namespace name as the string constant. */
    CoreXT.ROOT_NAMESPACE = "CoreXT";
    /** A simple function that does nothing (no operation).
    * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
    * or when replacing the 'CoreXT.Loader.bootstrap()' function, which should only ever need to be called once.
    */
    function noop() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }
    CoreXT.noop = noop;
    var Environments;
    (function (Environments) {
        /** Represents the CoreXT client core environment. */
        Environments[Environments["Browser"] = 0] = "Browser";
        /** Represents the CoreXT worker environment (where applications and certain modules reside). */
        Environments[Environments["Worker"] = 1] = "Worker";
        /** Represents the CoreXT server environment. */
        Environments[Environments["Server"] = 2] = "Server";
    })(Environments = CoreXT.Environments || (CoreXT.Environments = {}));
    // =========================================================================================================================================
    CoreXT.FUNC_NAME_REGEX = /^function\s*(\S+)\s*\(/i; // (note: never use the 'g' flag here, or '{regex}.exec()' will only work once every two calls [attempts to traverse])
    /** Attempts to pull the function name from the function object, and returns an empty string if none could be determined. */
    function getFunctionName(func) {
        // ... if an internal name is already set return it now ...
        var name = func.$__name || func['name'];
        if (name == void 0) {
            // ... check the type (this quickly detects internal/native Browser types) ...
            var typeString = Object.prototype.toString.call(func);
            // (typeString is formated like "[object SomeType]")
            if (typeString.charAt(0) == '[' && typeString.charAt(typeString.length - 1) == ']')
                name = typeString.substring(1, typeString.length - 1).split(' ')[1];
            if (!name || name == "Function" || name == "Object") { // (a basic function/object was found)
                if (typeof func == 'function') {
                    // ... if this has a function text get the name as defined (in IE, Window+'' returns '[object Window]' but in Chrome it returns 'function Window() { [native code] }') ...
                    var fstr = Function.prototype.toString.call(func);
                    var results = (CoreXT.FUNC_NAME_REGEX).exec(fstr); // (note: for function expression object contexts, the constructor (type) name is always 'Function')
                    name = (results && results.length > 1) ? results[1] : void 0;
                }
                else
                    name = void 0;
            }
        }
        return name || "";
    }
    CoreXT.getFunctionName = getFunctionName;
    // =========================================================================================================================================
    // A dump of the functions required by TypeScript in one place.
    var extendStatics = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p]; };
    /** Extends from a base type by chaining a derived type's 'prototype' to the base type's prototype.
    * This method takes into account any preset properties that may exist on the derived type's prototype.
    * Note: Extending an already extended derived type will recreate the prototype connection again using a new prototype instance pointing to the given base type.
    * Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
    * @param {Function} derivedType The derived type (function) that will extend from a base type.
    * @param {Function} baseType The base type (function) to extend to the derived type.
    * @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
    */
    function __extends(derivedType, baseType, copyStaticProperties) {
        if (copyStaticProperties === void 0) { copyStaticProperties = true; }
        if (copyStaticProperties)
            extendStatics(derivedType, baseType);
        // ... create a prototype link for the given type ...
        function __() { this.constructor = derivedType; }
        var newProto = baseType === null ? Object.create(baseType) : (__.prototype = baseType.prototype, new __());
        // ... copy forward any already defined properties in the derived prototype being replaced, if any, before setting the derived types prototype ...
        for (var p in derivedType.prototype)
            if (derivedType.prototype.hasOwnProperty(p))
                newProto[p] = derivedType.prototype[p];
        // ... set the new prototype ...
        derivedType.prototype = newProto;
        // ... return the extended derived type ...
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
    /**
     * Copies over the helper functions to the target and returns the target.
     *
     * CoreXT contains it's own copies of the TypeScript helper functions to help reduce code size. By default the global scope
     * is not polluted with these functions, but you can call this method (without any arguments) to set the functions on the
     * global scope.
     *
     * @param {object} target Allows copying the helper functions to a different object instance other than the global scope.
     */
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
    /**
     * Renders the TypeScript helper references in the 'var a=param['a'],b=param['b'],etc.;' format. This is used mainly when executing scripts wrapped in functions.
     * This format allows declaring local function scope helper variables that simply pull references from a given object
     * passed in to a single function parameter.
     *
     * Example: eval("function executeTSCodeInFunctionScope(p){"+renderHelperVars("p")+code+"}");
     *
     * Returns the code to be execute within scope using 'eval()'.
     */
    function renderHelperVarDeclarations(paramName) {
        var helpers = installTypeScriptHelpers({});
        var decl = "";
        for (var p in helpers)
            decl += (decl ? "," : "var ") + p + "=" + paramName + "['" + p + "']";
        return [decl + ";", helpers];
    }
    CoreXT.renderHelperVarDeclarations = renderHelperVarDeclarations;
    /**
     * Renders the TypeScript helper references to already existing functions into a string to be executed using 'eval()'.
     * This format is used mainly to declare helpers at the start of a namespace or function body that simply pull
     * references to the already existing helper functions to help reduce code size.
     *
     * Example: namespace CoreXT{ eval(renderHelpers()); ...code that may require helpers... }
     *
     * Returns an array in the [{declarations string}, {helper object}] format.
     */
    function renderHelpers() {
        return "var __helpers = " + CoreXT.ROOT_NAMESPACE + "." + getFunctionName(renderHelperVarDeclarations) + "('__helpers[1]'); eval(__helpers[0]);";
    }
    CoreXT.renderHelpers = renderHelpers;
    // ========================================================================================================================================
})(CoreXT || (CoreXT = {}));
CoreXT.safeEval = function (exp, p0, p1, p2, p3, p4, p5, p6, p7, p8, p9) { return eval(exp); };
// (note: this allows executing 'eval' outside the private CoreXT scope, but still within a function scope to prevent polluting the global scope,
//  and also allows passing arguments scoped only to the request).
CoreXT.globalEval = function (exp) { return (0, eval)(exp); };
// (note: indirect 'eval' calls are always globally scoped; see more: http://perfectionkills.com/global-eval-what-are-the-options/#windoweval)
(function (CoreXT) {
    eval(CoreXT.renderHelpers());
    /** Set to true if ES2015+ (aka ES6+) is supported in the browser environment ('class', 'new.target', etc.). */
    CoreXT.ES6 = (function () { try {
        return CoreXT.globalEval("(function () { return new.target; }, true)");
    }
    catch (e) {
        return false;
    } })();
    /** Set to true if ES2015+ (aka ES6+ - i.e. 'class', 'new.target', etc.) was targeted when this CoreXT JS code was transpiled. */
    CoreXT.ES6Targeted = (function () {
        return (/** @class */ (function () {
            function class_1() {
            }
            return class_1;
        }())).toString() == "class { }"; // (if targeting ES6 in the configuration, 'class' will be output as a function instead)
    })();
    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
      * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
      * 'Environments.Worker'.
      * The core of CoreXT runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since
      * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
      * For scripts running on the serve side, this will be set to 'Environments.Server'.
      */
    CoreXT.Environment = (function () {
        if (typeof navigator !== 'object') {
            // On the server side, create a basic "shell" to maintain some compatibility with some system functions.
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
    // =======================================================================================================================
    /** Used with 'CoreXT.log(...)' to write to the host console, if available.
      */
    var LogTypes;
    (function (LogTypes) {
        /** An important or critical action was a success. */
        LogTypes[LogTypes["Success"] = -1] = "Success";
        /** General logging information - nothing of great importance (such as writing messages to developers in the console, or perhaps noting the entry/exit of a section of code), but could be good to know during support investigations. */
        LogTypes[LogTypes["Normal"] = 0] = "Normal";
        /** An important action has started, or important information must be noted (usually not debugging related, but could be good to know during support investigations). */
        LogTypes[LogTypes["Info"] = 1] = "Info";
        /** A warning or non critical error has occurred. */
        LogTypes[LogTypes["Warning"] = 2] = "Warning";
        /** A error has occurred (usually critical). */
        LogTypes[LogTypes["Error"] = 3] = "Error";
        /** Debugging details only. In a live system debugging related log writes are ignored. */
        LogTypes[LogTypes["Debug"] = 4] = "Debug";
        /** Usually used with more verbose logging to trace execution. In a live system debugging related log writes are ignored. */
        LogTypes[LogTypes["Trace"] = 5] = "Trace";
    })(LogTypes = CoreXT.LogTypes || (CoreXT.LogTypes = {}));
    /** Logs the message to the console (if available) and returns the message.
      *  By default errors are thrown instead of being returned.  Set 'throwOnError' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {LogTypes} type The type of message to log.
      * @param {boolean} throwOnError If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
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
            var _title = title; // (modify a copy so we can continue to pass along the unaltered title text)
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
                        throw System.Exception.error(title, message, source); // (logs automatically)
                    }
                    else
                        throw new Error(compositeMessage); // (fallback, then try the diagnostics debugger)
            }
            if (System.Diagnostics && System.Diagnostics.log)
                System.Diagnostics.log(title, message, type, false); // (if 'System.Exception' is thrown it will also auto log and this line is never reached)
        }
        else if (throwOnError && type == LogTypes.Error)
            throw new Error(compositeMessage);
        return compositeMessage;
    }
    CoreXT.log = log;
    /** Logs the error message to the console (if available) and throws the error.
      *  By default errors are thrown instead of being returned.  Set 'throwException' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {boolean} throwException If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
    function error(title, message, source, throwException, useLogger) {
        if (throwException === void 0) { throwException = true; }
        if (useLogger === void 0) { useLogger = true; }
        return log(title, message, LogTypes.Error, source, throwException, useLogger);
    }
    CoreXT.error = error;
    // =======================================================================================================================
    /** Returns the type name for an object instance registered with 'AppDomain.registerType()'.  If the object does not have
    * type information, and the object is a function, then an attempt is made to pull the function name (if one exists).
    * Note: This function returns the type name ONLY (not the FULL type name [no namespace path]).
    * Note: The name will be undefined if a type name cannot be determined.
    * @param {object} object The object to determine a type name for.  If the object type was not registered using 'AppDomain.registerType()',
    * and the object is not a function, no type information will be available. Unregistered function objects simply
    * return the function's name.
    * @param {boolean} cacheTypeName (optional) If true (default), the name is cached using the 'ITypeInfo' interface via the '$__name' property.
    * This helps to speed up future calls.
    */
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
    /**
     * Returns the full type name of the type or namespace, if available, or the name o the object itself if the full name (with namespaces) is not known.
     * @see getTypeName()
     */
    function getFullTypeName(object, cacheTypeName) {
        if (cacheTypeName === void 0) { cacheTypeName = true; }
        if (object.$__fullname)
            return object.$__fullname;
        return getTypeName(object, cacheTypeName);
    }
    CoreXT.getFullTypeName = getFullTypeName;
    /** Returns true if the given object is empty, or an invalid value (eg. NaN, or an empty object, array, or string). */
    function isEmpty(obj) {
        if (obj === void 0 || obj === null)
            return true;
        // (note 'DontEnum flag' enumeration bug in IE<9 [on toString, valueOf, etc.])
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
    // =======================================================================================================================
    /**
    * A TypeScript decorator used to seal a function and its prototype. Properties cannot be added, but existing ones can be updated.
    */
    function sealed(target, propertyName, descriptor) {
        if (typeof target == 'object')
            Object.seal(target);
        if (typeof target.prototype == 'object')
            Object.seal(target.prototype);
        return target;
    }
    CoreXT.sealed = sealed;
    /**
    * A TypeScript decorator used to freeze a function and its prototype.  Properties cannot be added, and existing ones cannot be changed.
    */
    function frozen(target, propertyName, descriptor) {
        if (typeof target == 'object')
            Object.freeze(target);
        if (typeof target.prototype == 'object')
            Object.freeze(target.prototype);
        return target;
    }
    CoreXT.frozen = frozen;
    // =======================================================================================================================
    // Function Parameter Dependency Injection Support
    // TODO: Consider DI support at some point.
    /**
     * A decorator used to add DI information for a function parameter.
     * @param args A list of items which are either fully qualified type names, or references to the type functions.
     * The order specified is important.  A new (transient) or existing (singleton) instance of the first matching type found is returned.
     */
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
    // ========================================================================================================================================
    /** Holds utility methods for type management. All registered types and disposed objects are stored here. */
    var Types;
    (function (Types) {
        /** Returns the root type object from nested type objects. Use this to get the root namespace  */
        function getRoot(type) {
            var _type = type.$__fullname ? type : type['constructor'];
            if (_type.$__parent)
                return getRoot(_type.$__parent);
            return _type;
        }
        Types.getRoot = getRoot;
        Object.defineProperty(Types, "__types", { configurable: false, writable: false, value: {} });
        Object.defineProperty(Types, "__disposedObjects", { configurable: false, writable: false, value: {} });
        /**
         * If true the system will automatically track new objects created under this CoreXT context and store them in 'Types.__trackedObjects'.
         * The default is false to prevent memory leaks by those unaware of how the CoreXT factory pattern works.
         * Setting this to true (either here or within a specific AppDomain) means you take full responsibility to dispose all objects you create.
         */
        Types.autoTrackInstances = false;
        Object.defineProperty(Types, "__trackedObjects", { configurable: false, writable: false, value: [] });
        var ___nextObjectID = 0;
        Object.defineProperty(Types, "__nextObjectID", { configurable: false, get: function () { return ___nextObjectID; } });
        /** Returns 'Types.__nextObjectID' and increments the value by 1. */
        function getNextObjectId() { return ___nextObjectID++; }
        Types.getNextObjectId = getNextObjectId;
        /**
          * Used in place of the constructor to create a new instance of the underlying object type for a specific domain.
          * This allows the reuse of disposed objects to prevent garbage collection hits that may cause the application to lag, and
          * also makes sure the object is associated with an application domain. Reducing lag due to GC collection is an
          * important consideration when development games, which makes the CoreXTJS system a great way to get started quickly.
          *
          * Objects that derive from 'System.Object' should register the type and supply a custom 'init' function instead of a
          * constructor (in fact, only a default constructor should exist). This is done by creating a static property on the class
          * that uses 'TypeFactory.__RegisterFactoryType()' to register the type.
          *
          * Performance note: When creating thousands of objects continually, proper CoreXT object disposal (and subsequent
          * cache of the instances) means the GC doesn't have to keep engaging to clear up the abandoned objects.  While using
          * the 'new' operator may be faster than using "{type}.new()" factory function at first, the application actually
          * becomes very lagged while the GC keeps eventually kicking in. This is why CoreXT objects are cached and reused as
          * much as possible, and why you should try to refrain from using the 'new', operator, or any other operation that
          * creates objects that the GC has to manage by blocking the main thread.
          */
        function __new() {
            // ... this is the default 'new' function ...
            // (note: this function may be called with an empty object context [of the expected type] and only one '$__appDomain' property, in which '$__shellType' will be missing)
            var _a, _b;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (typeof this != 'function' || !this.init && !this.new)
                error("__new(): Constructor call operation on a non-constructor function.", "Using the 'new' operator is only valid on class and class-factory types. Just call the '{FactoryType}.new()' factory *function* without the 'new' operator.", this);
            var bridge = this; // (note: this should be either a bridge, or a class factory object, or undefined)
            var factory = this;
            var classType = factory.$__type;
            var classTypeInfo = classType; // TODO: Follow up: cannot do 'IType & ITypeInfo' and still retain the 'new' signature.
            if (typeof classType != 'function')
                error("__new(): Missing class type on class factory.", "The factory '" + getFullTypeName(factory) + "' is missing the internal '$__type' class reference.", this);
            var appDomain = bridge.$__appDomain || System.AppDomain && System.AppDomain.default || void 0;
            var instance;
            var isNew = false;
            // ... get instance from the pool (of the same type!), or create a new one ...
            // 
            var fullTypeName = factory.$__fullname; // (the factory type holds the proper full name)
            var objectPool = fullTypeName && Types.__disposedObjects[fullTypeName];
            if (objectPool && objectPool.length)
                instance = objectPool.pop();
            else {
                instance = new classType();
                isNew = true;
            }
            // ... initialize CoreXT and app domain references ...
            instance.$__corext = CoreXT;
            instance.$__id = getNextObjectId();
            if (Types.autoTrackInstances && (!appDomain || appDomain.autoTrackInstances === void 0 || appDomain.autoTrackInstances))
                instance.$__globalId = CoreXT.Utilities.createGUID(false);
            if (appDomain)
                instance.$__appDomain = appDomain;
            if ('$__disposing' in instance)
                instance.$__disposing = false; // (only reset if exists)
            if ('$__disposed' in instance)
                instance.$__disposed = false; // (only reset if exists)
            // ... insert [instance, isNew] without having to create a new array ...
            // TODO: Clean up the following when ...rest is more widely supported. Also needs testing to see which is actually more efficient when compiled for ES6.
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
            // ... finally, add this object to the app domain selected, if any ...
            if (appDomain && appDomain.autoTrackInstances)
                appDomain.attachObject(instance);
            return instance;
        }
        Types.__new = __new;
        ///** 
        //x * Called internally once registration is finalized (see also end of 'AppDomain.registerClass()').
        //x * 
        //x * @param {IType} type The type (constructor function) to register.
        //x * @param {IType} factoryType The factory type to associated with the type.
        //x * @param {modules} parentModules A list of all modules up to the current type, usually starting with 'CoreXT' as the first module.
        //x * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type (function object) will have type information
        //x * applied (using the IFunctionInfo interface).
        //*/
        //x export function __registerFactoryType<TClass extends IType<object>, TFactory extends IFactory<object>>(type: TClass, factoryType: new () => TFactory, parentModules: object[], addMemberTypeInfo = true): TClass & TFactory {
        /**
         * Called to register factory types for a class (see also 'Types.__registerType()' for non-factory supported types).
         * This method should be called AFTER a factory type is fully defined.
         *
         * @param {IType} factoryType The factory type to associate with the type.
         * @param {modules} namespace A list of all namespaces up to the current type, usually starting with 'CoreXT' as the first namespace.
         * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type (function object) will have type information
         * applied (using the IFunctionInfo interface).
        */
        function __registerFactoryType(factoryType, namespace, addMemberTypeInfo) {
            if (addMemberTypeInfo === void 0) { addMemberTypeInfo = true; }
            var classType = factoryType.$__type;
            var factoryTypeInfo = factoryType;
            if (typeof factoryType !== 'function')
                error("__registerFactoryType()", "The 'factoryType' argument is not a valid constructor function.", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.
            if (typeof namespace == 'object' || typeof namespace == 'function') {
                if (!namespace.$__fullname)
                    error("__registerFactoryType()", "The specified namespace given for factory type '" + getFullTypeName(factoryType) + "' is not registered. Please call 'namespace()' to register it first (before the factory is defined).", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.
            }
            if (typeof classType == 'undefined')
                error("__registerFactoryType()", "Factory instance type '" + getFullTypeName(factoryType) + ".$__type' is not defined.", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.
            if (typeof classType != 'function')
                error("__registerFactoryType()", "'" + getFullTypeName(factoryType) + ".$__type' is not a valid constructor function.", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.
            // ... register type information first BEFORER we call any static constructor (so it is available to the user)s ...
            var registeredFactory = __registerType(factoryType, namespace, addMemberTypeInfo);
            //x factoryTypeInfo.$__type = <any>classType; // (the class type AND factory type should both have a reference to the underlying type)
            //x classType.$__type = <any>classType; // (the class type AND factory type should both have a reference to the underlying type)
            classType.$__factoryType = factoryTypeInfo; // (a properly registered class that supports the factory pattern should have a reference to its underlying factory type)
            classType.$__baseFactoryType = factoryTypeInfo.$__baseFactoryType;
            var registeredFactoryType = __registerType(classType, factoryType, addMemberTypeInfo);
            //x .. finally, update the class static properties also with the values set on the factory from the previous line (to be thorough) ...
            //x classType.$__fullname = factoryTypeInfo.$__fullname + "." + classType.$__name; // (the '$__fullname' property on a class should allow absolute reference back to it [note: '__proto__' could work here also due to static inheritance])
            // ... if the user supplied a static constructor then call it now before we do anything more ...
            // (note: the static constructor may be where 'new' and 'init' factory functions are provided, so we MUST call them first before we hook into anything)
            if (typeof factoryType[CoreXT.constructor] == 'function')
                factoryType[CoreXT.constructor].call(classType);
            if (typeof classType[CoreXT.constructor] == 'function')
                classType[CoreXT.constructor](factoryType);
            // ... hook into the 'init' and 'new' factory methods ...
            // (note: if no 'init()' function is specified, just call the base by default)
            if (classType.init)
                error(getFullTypeName(classType), "You cannot create a static 'init' function directly on a class that implements the factory pattern (which could also create inheritance problems).");
            var originalInit = typeof factoryType.init == 'function' ? factoryType.init : null; // (take user defined, else set to null)
            factoryType.init = function _initProxy() {
                this.$__initCalled = true; // (flag that THIS init function was called on THIS factory type)
                originalInit && originalInit.apply(this, arguments);
                if (this.$__baseFactoryType && !this.$__baseFactoryType.$__initCalled)
                    error(getFullTypeName(classType) + ".init()", "You did not call 'this.super.init()' to complete the initialization chain.");
                // TODO: Once parsing of function parameters are in place we can detect this, but for now require it)
                factoryType.init = originalInit; // (everything is ok here, so bypass this check next time)
            };
            //x if (classType.new)
            //x     error(getFullTypeName(classType), "You cannot create a static 'new' function directly on a class that implements the factory pattern (which could also create inheritance problems).");
            var originalNew = typeof factoryType.new == 'function' ? factoryType.new : null; // (take user defined, else set to null)
            if (!originalNew)
                factoryType.new = __new; // ('new' is missing, so just use the default handler)
            else
                factoryType.new = function _firstTimeNewTest() {
                    var result = originalNew.apply(factoryType, arguments) || void 0;
                    // (did the user supply a valid 'new' function that returned an object type?)
                    if (result === void 0 || result === null) {
                        // (an object is required, otherwise this is not valid or only a place holder; if so, revert to the generic 'new' implementation)
                        factoryType.new = __new;
                        return factoryType.new.apply(factoryType, arguments);
                    }
                    else if (typeof result != 'object')
                        error(getFullTypeName(classType) + ".new()", "An object instance was expected, but instead a value of type '" + (typeof result) + "' was received.");
                    // (else the call returned a valid value, so next time, just default directly to the user supplied factory function)
                    factoryType.new = originalNew;
                    return result;
                };
            return factoryType;
        }
        Types.__registerFactoryType = __registerFactoryType;
        /**
         * Registers a given type (constructor function) in a specified namespace and builds some relational type properties.
         *
         * Note: DO NOT use this to register factory types.  You must used '__registerFactoryType()' for those.
         *
         * @param {IType} type The type (constructor function) to register.
         * @param {modules} parentNamespaces A list of all modules up to the current type, usually starting with 'CoreXT' as the first module.
         * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type will have type information applied (using the IFunctionInfo interface).
         * @param {boolean} exportName (optional) The name exported from the namespace for this type. By default the type (class) name is assumed.
         * If the name exported from the namespace is different, specify it here.
         */
        function __registerType(type, parentTypeOrNS, addMemberTypeInfo) {
            if (addMemberTypeInfo === void 0) { addMemberTypeInfo = true; }
            var _namespace = parentTypeOrNS;
            if (!_namespace.$__fullname)
                error("Types.__registerType()", "The specified namespace '" + getTypeName(parentTypeOrNS) + "' is not registered.  Please make sure to call 'namespace()' first at the top of namespace scopes before factories and types are defined.", type);
            // ... register the type with the parent namespace ...
            var _type = __registerNamespace(parentTypeOrNS, getTypeName(type));
            // ... scan the type's prototype functions and update the type information (only function names at this time) ...
            // TODO: Consider parsing the function parameters as well and add this information for developers.
            if (addMemberTypeInfo) {
                var prototype = type['prototype'], func;
                for (var pname in prototype)
                    if (pname != 'constructor' && pname != '__proto__') {
                        func = prototype[pname];
                        if (typeof func == 'function') {
                            func.$__argumentTypes = []; // TODO: Add function parameters if specified as parameter comments.
                            func.$__fullname = _type.$__fullname + ".prototype." + pname;
                            func.$__name = pname;
                            func.$__parent = _type;
                            if (!func.name)
                                func.name = pname; // (may not be supported or available, so try to set it [normally this is read-only])
                        }
                    }
            }
            // ... register the type ...
            // (all registered type names will be made available here globally, since types are not AppDomain specific)
            Types.__types[_type.$__fullname] = _type;
            return type;
        }
        Types.__registerType = __registerType;
        /**
         * Registers nested namespaces and adds type information.
         * @param {IType} namespaces A list of namespaces to register.
         * @param {IType} type An optional type (function constructor) to specify at the end of the name space list.
         */
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
                exception("has not been registered in the type system. Make sure to call 'namespace()' at the top of namespace scopes before defining classes.");
            for (var i = 0, n = namespaces.length; i < n; ++i) {
                nsOrTypeName = namespaces[i];
                var trimmedName = nsOrTypeName.trim();
                if (!nsOrTypeName || !trimmedName)
                    exception("is not a valid namespace name. A namespace must not be empty or only whitespace");
                nsOrTypeName = trimmedName; // (storing the trimmed name at this point allows showing any whitespace-only characters in the error)
                if (root == CoreXT && nsOrTypeName == "CoreXT")
                    exception("is not valid - 'CoreXT' must not exist as a nested name under CoreXT");
                var subNS = currentNamespace[nsOrTypeName];
                if (!subNS)
                    exception("cannot be found under namespace '" + currentNamespace.$__fullname + "'");
                fullname = fullname ? fullname + "." + nsOrTypeName : nsOrTypeName;
                subNS.$__parent = currentNamespace; // (each namespace will have a reference to its parent namespace [object], and its local and full type names; note: the CoreXT parent will be pointing to 'CoreXT.global')
                subNS.$__name = nsOrTypeName; // (the local namespace name)
                subNS.$__fullname = fullname; // (the fully qualified namespace name for this namespace)
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
                error(title, "The object instance '" + getFullTypeName(object) + "' was created in a different CoreXT instance and cannot be disposed by this one.", source); // (if loaded as a module perhaps, where other instance may exist [just in case])
            if (typeof object.dispose != 'function')
                error(title, "The object instance '" + getFullTypeName(object) + "' does not contain a 'dispose()' function.", source);
            if (!isDisposable(object))
                error(title, "The object instance '" + getFullTypeName(object) + "' is not disposable.", source);
        }
        Types.__disposeValidate = __disposeValidate;
        /** Disposes a specific object in this AppDomain instance.
         * When creating thousands of objects continually, object disposal (and subsequent cache of the instances) means the GC doesn't have
         * to keep engaging to clear up the abandoned objects.  While using the "new" operator may be faster than using "{type}.new()" at
         * first, the application actually becomes very lagged while the GC keeps eventually kicking in.  This is why CoreXT objects are
         * cached and reused as much as possible.
         * @param {object} object The object to dispose and release back into the "disposed objects" pool.
         * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
         *                          false to request that child objects remain associated after disposal (not released). This
         *                          can allow quick initialization of a group of objects, instead of having to pull each one
         *                          from the object pool each time.
         */
        function dispose(object, release) {
            if (release === void 0) { release = true; }
            var _object = object;
            __disposeValidate(_object, "dispose()", Types);
            if (_object !== void 0) {
                // ... remove the object from the app domain "active" list and then erase it ...
                var appDomain = _object.$__appDomain;
                if (appDomain && !_object.$__disposing) { // (note: '$__disposing' is set to 'true' when '{AppDomain}.dispose()' is called; otherwise they did not call it via the domain instance)
                    appDomain.dispose(_object, release);
                    return;
                }
                CoreXT.Utilities.erase(object, __nonDisposableProperties);
                _object.$__disposing = false;
                _object.$__disposed = true;
                if (release) {
                    // ... place the object into the disposed objects list ...
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
    /** A 'Disposable' base type that implements 'IDisposable', which is the base for all CoreXT objects that can be disposed. */
    var Disposable = /** @class */ (function () {
        function Disposable() {
        }
        /**
         * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
         * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
         * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
         *                          false to request that child objects remain connected after disposal (not released). This
         *                          can allow quick initialization of a group of objects, instead of having to pull each one
         *                          from the object pool each time.
         */
        Disposable.prototype.dispose = function (release) { Types.dispose(this, release); };
        return Disposable;
    }());
    CoreXT.Disposable = Disposable;
    /** Returns true if the specified object can be disposed using this CoreXT system. */
    function isDisposable(instance) {
        if (instance.$__corext != CoreXT)
            return false;
        return typeof instance.dispose == 'function';
    }
    CoreXT.isDisposable = isDisposable;
    /** Returns true if the given type (function) represents a primitive type constructor. */
    function isPrimitiveType(o) {
        var symbol = typeof Symbol != 'undefined' ? Symbol : Object; // (not supported in IE11)
        return (o == Object || o == Array || o == Boolean || o == String
            || o == Number || o == symbol || o == Function || o == Date
            || o == RegExp || o == Error);
    }
    CoreXT.isPrimitiveType = isPrimitiveType;
    /**
     * Creates a 'Disposable' type from another base type. This is primarily used to extend primitive types.
     * Note: These types are NOT instances of 'CoreXT.Disposable', since they must have prototype chains that link to other base types.
     * @param {TBaseClass} baseClass The base class to inherit from.
     * @param {boolean} isPrimitiveOrHostBase Set this to true when inheriting from primitive types. This is normally auto-detected, but can be forced in cases
     * where 'new.target' (ES6) prevents proper inheritance from host system base types that are not primitive types.
     * This is only valid if compiling your .ts source for ES5 while also enabling support for ES6 environments.
     * If you compile your .ts source for ES6 then the 'class' syntax will be used and this value has no affect.
     */
    function DisposableFromBase(baseClass, isPrimitiveOrHostBase) {
        if (!baseClass) {
            baseClass = CoreXT.global.Object;
            isPrimitiveOrHostBase = true;
        }
        else if (typeof isPrimitiveOrHostBase == 'undefined')
            isPrimitiveOrHostBase = isPrimitiveType(baseClass);
        var cls = /** @class */ (function (_super) {
            __extends(Disposable, _super);
            /**
            * Don't create objects using the 'new' operator. Use '{NameSpaces...ClassType}.new()' static methods instead.
            */
            function Disposable() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = this;
                if (!CoreXT.ES6Targeted && isPrimitiveOrHostBase)
                    eval("var _super = function() { return null; };"); // (ES6 fix for extending built-in types [calling constructor not supported prior] when compiling for ES5; more details on it here: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work)
                _this = _super.call(this) || this;
                return _this;
            }
            /**
            * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
            * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
            * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
            *                          false to request that child objects remain connected after disposal (not released). This
            *                          can allow quick initialization of a group of objects, instead of having to pull each one
            *                          from the object pool each time.
            */
            Disposable.prototype.dispose = function (release) { };
            return Disposable;
        }(baseClass));
        cls.prototype.dispose = CoreXT.Disposable.prototype.dispose; // (make these functions both the same function reference by default)
        return cls;
    }
    CoreXT.DisposableFromBase = DisposableFromBase;
    ///** 
    // * Registers a type in the CoreXT system and associates a type with a parent type or namespace. 
    // * This decorator is also responsible for calling the static '[constructor]()' function on a type, if one exists.
    // * Usage: 
    // *      @factory(ForSomeNamespace)
    // *      class MyFactory {
    // *          static 'new': (...args:any[]) => IMyFactory;
    // *          static init: (o: IMyFactory, isnew: boolean, ...args: any[]) => void;
    // *      }
    // *      namespace MyFactory {
    // *          @factoryInstance(MyFactory)
    // *          export class $__type {
    // *              private static [constructor](factory: typeof MyFactory) {
    // *                  factory.init = (o, isnew) => { };
    // *              }
    // *          }
    // *      }
    // *      interface IMyFactory extends MyFactory.$__type {}
    // */
    //export function type(parentType: IType | object) {
    //    return (cls: IType) => <any>cls; // (not used yet)
    //}
    ///** Constructs factory objects. */
    //x export function ClassFactory<TBaseClass extends object, TClass extends IType, TFactory extends IFactoryTypeInfo, TNamespace extends object>
    //    (namespace: TNamespace, base: IClassFactory & { $__type: TBaseClass }, getType: (base: TBaseClass) => [TClass, TFactory], exportName?: keyof TNamespace, addMemberTypeInfo = true)
    //    : ClassFactoryType<TClass, TFactory> {
    //    function _error(msg: string) {
    //        error("ClassFactory()", msg, namespace);
    //    }
    //    if (!getType) _error("A 'getType' selector function is required.");
    //    if (!namespace) _error("A 'namespace' value is required.");
    //    var types = getType(base && base.$__type || <any>base); // ('$__type' is essentially the same reference as base, but with the original type)
    //    var cls = types[0];
    //    var factory = types[1];
    //    if (!cls) _error("'getType: (base: TBaseClass) => [TClass, TFactory]' did not return a class instance, which is required.");
    //    if (typeof cls != 'function') _error("'getType: (base: TBaseClass) => [TClass, TFactory]' did not return a class (function) type object, which is required.");
    //    var name = <string>exportName || getTypeName(cls);
    //    if (name.charAt(0) == '$') name = name.substr(1); // TODO: May not need to do this anymore.
    //    if (!factory) log("ClassFactory()", "Warning: No factory was supplied for class type '" + name + "' in namespace '" + getFullTypeName(namespace) + "'.", LogTypes.Warning, cls);
    //    return Types.__registerFactoryType(<any>cls, <any>factory, namespace, addMemberTypeInfo, exportName);
    //}
    function FactoryType(baseFactory) {
        return baseFactory.$__type;
    }
    CoreXT.FactoryType = FactoryType;
    /**
     * Builds and returns a base type to be used with creating type factories. This function stores some type
     * information in static properties for reference.
     * @param {TBaseFactory} baseFactoryType The factory that this factory type derives from.
     * @param {TBaseType} staticBaseClass An optional base type to inherit static types from.
    */
    function FactoryBase(baseFactoryType, staticBaseClass) {
        if (typeof staticBaseClass != 'function')
            staticBaseClass = CoreXT.global.Object;
        var cls = /** @class */ (function (_super) {
            __extends(FactoryBase, _super);
            /**
              * Don't create objects using the 'new' operator. Use '{NameSpaces...ClassType}.new()' static methods instead.
              */
            function FactoryBase() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = this;
                error("FactoryBase", "You cannot create instances of factory types.");
                _this = _super.call(this) || this;
                return _this;
            }
            Object.defineProperty(FactoryBase, "super", {
                /** References the base factory. */
                get: function () { return baseFactoryType || void 0; } // ('|| void 0' keeps things consistent in case 'null' is given)
                ,
                enumerable: true,
                configurable: true
            });
            ///** 
            // * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
            // * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
            // * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
            // *                          false to request that child objects remain connected after disposal (not released). This
            // *                          can allow quick initialization of a group of objects, instead of having to pull each one
            // *                          from the object pool each time.
            // */
            //dispose(release?: boolean): void { Types.dispose(this, release); }
            /**
              * Called to register factory types with the internal types system (see also 'Types.__registerType()' for non-factory supported types).
              * Any static constructors defined will also be called at this point.
              *
              * @param {modules} namespace The parent namespace to the current type.
              * @param {boolean} addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
              * applied (using the IFunctionInfo interface).
             */
            FactoryBase.$__register = function (namespace, addMemberTypeInfo) {
                if (addMemberTypeInfo === void 0) { addMemberTypeInfo = true; }
                return Types.__registerFactoryType(this, namespace, addMemberTypeInfo);
            };
            return FactoryBase;
        }(staticBaseClass));
        cls.$__baseFactoryType = baseFactoryType;
        return cls;
    }
    CoreXT.FactoryBase = FactoryBase;
    function namespace() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (typeof args[0] == 'function') {
            var root = args.length >= 2 ? args[args.length - 1] || CoreXT.global : CoreXT.global;
            if (typeof root != 'object' && typeof root != 'function')
                root = CoreXT.global;
            var items = CoreXT.nameof(args[0], true).split('.');
            if (!items.length)
                error("namespace()", "A valid namespace path selector function was expected (i.e. '()=>First.Second.Third.Etc').");
            Types.__registerNamespace.apply(Types, __spread([root], items));
        }
        else {
            var root = args[args.length - 1];
            var lastIndex = (typeof root == 'object' || typeof root == 'function' ? args.length - 1 : (root = CoreXT.global, args.length));
            Types.__registerNamespace.apply(Types, __spread([root], CoreXT.global.Array.prototype.slice.call(arguments, 0, lastIndex)));
        }
    }
    CoreXT.namespace = namespace;
    namespace("CoreXT", "Types"); // ('CoreXT.Types' will become the first registered namespace)
    /** Returns the call stack for a given error object. */
    function getErrorCallStack(errorSource) {
        var _e = errorSource;
        if (_e.stacktrace && _e.stack)
            return _e.stacktrace.split(/\n/g); // (opera provides one already good to go) [note: can also check for 'global["opera"]']
        var callstack = [];
        var isCallstackPopulated = false;
        var stack = _e.stack || _e.message;
        if (stack) {
            var lines = stack.split(/\n/g);
            if (lines.length) {
                // ... try to extract stack details only (some browsers include other info) ...
                for (var i = 0, len = lines.length; i < len; ++i)
                    if (/.*?:\d+:\d+/.test(lines[i]))
                        callstack.push(lines[i]);
                // ... if there are lines, but nothing was added, then assume this is a special unknown stack format and just dump it as is ...
                if (lines.length && !callstack.length)
                    callstack.push.apply(callstack, lines);
                isCallstackPopulated = true;
            }
        }
        if (!isCallstackPopulated && arguments.callee) { //(old IE and Safari - fall back to traversing the call stack by caller reference [note: this may become depreciated])
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
    /** Returns the message of the specified error source by returning either 'errorSource' if it's a string, a formatted LogItem object,
      * a formatted Exception or Error object, or 'errorSource.message' if the source is an object with a 'message' property.
      */
    function getErrorMessage(errorSource) {
        if (typeof errorSource == 'string')
            return errorSource;
        else if (typeof errorSource == 'object') {
            if (System && System.Diagnostics && System.Diagnostics.LogItem && errorSource instanceof System.Diagnostics.LogItem.$__type) {
                return errorSource.toString();
            }
            else if ('message' in errorSource) { // (this should support both 'Exception' AND 'Error' objects)
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
    // ========================================================================================================================================
    /**
     * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property, or if using CoreXT.JS for
     * .Net Core MVC, make sure '@RenderCoreXTJSConfigurations()' is called before all scripts in the header section of your layout view.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    CoreXT.baseURL = (function () { var u = CoreXT.global.siteBaseURL || CoreXT.baseURL || location.origin; if (u.charAt(u.length - 1) != '/')
        u += '/'; return u; })(); // (example: "https://calendar.google.com/")
    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    CoreXT.baseScriptsURL = (function () { var u = CoreXT.global.scriptsBaseURL || CoreXT.baseURL; if (u.charAt(u.length - 1) != '/')
        u += '/'; return u + "js/"; })();
    log("CoreXT.baseURL", CoreXT.baseURL + " (If this is wrong, set a global 'siteBaseURL' variable to the correct path, or if using CoreXT.JS for .Net Core MVC, make sure '@RenderCoreXTJSConfigurations()' is called in the header section of your layout view)"); // (requires the exception object, which is the last one to be defined above; now we start the first log entry with the base URI of the site)
    log("CoreXT.baseScriptsURL", CoreXT.baseScriptsURL + " (If this is wrong, set a global 'scriptsBaseURL' variable to the correct path)");
    // ========================================================================================================================================
    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    var Time;
    (function (Time) {
        namespace("CoreXT", "Time");
        // =======================================================================================================================
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
        Time.__SQLDateTimeRegEx = /^\d{4}-\d\d-\d\d(?: \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?)?$/; // (Standard SQL Date/Time Format)
        Time.__SQLDateTimeStrictRegEx = /^\d{4}-\d\d-\d\d \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?$/; // (Standard SQL Date/Time Format)
        /** The time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        Time.__localTimeZoneOffset = (new Date()).getTimezoneOffset() * Time.__millisecondsPerMinute; // ('getTimezoneOffset()' returns minutes, which is converted to ms for '__localTimeZoneOffset')
    })(Time = CoreXT.Time || (CoreXT.Time = {}));
    // ========================================================================================================================================
    /** The System module is the based module for most developer related API operations, and is akin to the 'System' .NET namespace. */
    var System;
    (function (System) {
        namespace("CoreXT", "System");
    })(System = CoreXT.System || (CoreXT.System = {}));
    // TODO: Iron this out - we need to make sure the claim below works well, or at least the native browser cache can help with this naturally.
    /**
     * The loader namespace contains low level functions for loading/bootstrapping the whole system.
     * Why use a loader instead of combining all scripts into one file? The main reason is so that individual smaller scripts can be upgraded
     * without needing to re-transfer the whole system to the client. It's much faster to just resend one small file that might change. This
     * also allows extending (add to) the existing scripts for system upgrades.
     */
    var Loader;
    (function (Loader) {
        namespace("CoreXT", "Loader");
        var _onSystemLoadedHandlers = [];
        /**
         * Use this function to register a handler to be called when the core system is loaded, just before 'app.manifest.ts' gets loaded.
         * Note: The PROPER way to load an application is via a manifest file (app.manifest.ts).  Very few functions and event hooks are available
         * until the system is fully loaded. For example, 'CoreXT.DOM.Loader' is not available until the system is loaded, which means you
         * cannot hook into 'CoreXT.DOM.Loader.onDOMLoaded()' or access 'CoreXT.Browser' properties until then. This is because all files
         * are dynamically loaded as needed (the CoreXT system uses the more efficient dynamic loading system).
         */
        function onSystemLoaded(handler) {
            if (handler && typeof handler == 'function')
                _onSystemLoadedHandlers.push(handler);
        }
        Loader.onSystemLoaded = onSystemLoaded;
        // ... polyfill some XHR 'readyState' constants ...
        if (!XMLHttpRequest.DONE) {
            XMLHttpRequest.UNSENT = 0;
            XMLHttpRequest.OPENED = 1;
            XMLHttpRequest.HEADERS_RECEIVED = 2;
            XMLHttpRequest.LOADING = 3;
            XMLHttpRequest.DONE = 4;
        }
        /** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
        /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceExtensions' as well implicitly. */
        var ResourceTypes;
        (function (ResourceTypes) {
            // Application
            ResourceTypes[ResourceTypes["Application_Script"] = "application/javascript"] = "Application_Script";
            ResourceTypes[ResourceTypes["Application_ECMAScript"] = "application/ecmascript"] = "Application_ECMAScript";
            ResourceTypes[ResourceTypes["Application_JSON"] = "application/json"] = "Application_JSON";
            ResourceTypes[ResourceTypes["Application_ZIP"] = "application/zip"] = "Application_ZIP";
            ResourceTypes[ResourceTypes["Application_GZIP"] = "application/gzip"] = "Application_GZIP";
            ResourceTypes[ResourceTypes["Application_PDF"] = "application/pdf"] = "Application_PDF";
            ResourceTypes[ResourceTypes["Application_DefaultFormPost"] = "application/x-www-form-urlencoded"] = "Application_DefaultFormPost";
            ResourceTypes[ResourceTypes["Application_TTF"] = "application/x-font-ttf"] = "Application_TTF";
            // Multipart
            ResourceTypes[ResourceTypes["Multipart_BinaryFormPost"] = "multipart/form-data"] = "Multipart_BinaryFormPost";
            // Audio
            ResourceTypes[ResourceTypes["AUDIO_MP4"] = "audio/mp4"] = "AUDIO_MP4";
            ResourceTypes[ResourceTypes["AUDIO_MPEG"] = "audio/mpeg"] = "AUDIO_MPEG";
            ResourceTypes[ResourceTypes["AUDIO_OGG"] = "audio/ogg"] = "AUDIO_OGG";
            ResourceTypes[ResourceTypes["AUDIO_AAC"] = "audio/x-aac"] = "AUDIO_AAC";
            ResourceTypes[ResourceTypes["AUDIO_CAF"] = "audio/x-caf"] = "AUDIO_CAF";
            // Image
            ResourceTypes[ResourceTypes["Image_GIF"] = "image/gif"] = "Image_GIF";
            ResourceTypes[ResourceTypes["Image_JPEG"] = "image/jpeg"] = "Image_JPEG";
            ResourceTypes[ResourceTypes["Image_PNG"] = "image/png"] = "Image_PNG";
            ResourceTypes[ResourceTypes["Image_SVG"] = "image/svg+xml"] = "Image_SVG";
            ResourceTypes[ResourceTypes["Image_GIMP"] = "image/x-xcf"] = "Image_GIMP";
            // Text
            ResourceTypes[ResourceTypes["Text_CSS"] = "text/css"] = "Text_CSS";
            ResourceTypes[ResourceTypes["Text_CSV"] = "text/csv"] = "Text_CSV";
            ResourceTypes[ResourceTypes["Text_HTML"] = "text/html"] = "Text_HTML";
            ResourceTypes[ResourceTypes["Text_Plain"] = "text/plain"] = "Text_Plain";
            ResourceTypes[ResourceTypes["Text_RTF"] = "text/rtf"] = "Text_RTF";
            ResourceTypes[ResourceTypes["Text_XML"] = "text/xml"] = "Text_XML";
            ResourceTypes[ResourceTypes["Text_JQueryTemplate"] = "text/x-jquery-tmpl"] = "Text_JQueryTemplate";
            ResourceTypes[ResourceTypes["Text_MarkDown"] = "text/x-markdown"] = "Text_MarkDown";
            // Video
            ResourceTypes[ResourceTypes["Video_AVI"] = "video/avi"] = "Video_AVI";
            ResourceTypes[ResourceTypes["Video_MPEG"] = "video/mpeg"] = "Video_MPEG";
            ResourceTypes[ResourceTypes["Video_MP4"] = "video/mp4"] = "Video_MP4";
            ResourceTypes[ResourceTypes["Video_OGG"] = "video/ogg"] = "Video_OGG";
            ResourceTypes[ResourceTypes["Video_MOV"] = "video/quicktime"] = "Video_MOV";
            ResourceTypes[ResourceTypes["Video_WMV"] = "video/x-ms-wmv"] = "Video_WMV";
            ResourceTypes[ResourceTypes["Video_FLV"] = "video/x-flv"] = "Video_FLV";
        })(ResourceTypes = Loader.ResourceTypes || (Loader.ResourceTypes = {}));
        /** A map of popular resource extensions to resource enum type names.
          * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
          * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
          * Example 3: CoreXT.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
          * Example 4: CoreXT.Loader.getResourceTypeFromExtension(".js");
          */
        /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceTypes' as well implicitly. */
        var ResourceExtensions;
        (function (ResourceExtensions) {
            ResourceExtensions[ResourceExtensions["Application_Script"] = ".js"] = "Application_Script";
            ResourceExtensions[ResourceExtensions["Application_ECMAScript"] = ".es"] = "Application_ECMAScript";
            ResourceExtensions[ResourceExtensions["Application_JSON"] = ".json"] = "Application_JSON";
            ResourceExtensions[ResourceExtensions["Application_ZIP"] = ".zip"] = "Application_ZIP";
            ResourceExtensions[ResourceExtensions["Application_GZIP"] = ".gz"] = "Application_GZIP";
            ResourceExtensions[ResourceExtensions["Application_PDF"] = ".pdf"] = "Application_PDF";
            ResourceExtensions[ResourceExtensions["Application_TTF"] = ".ttf"] = "Application_TTF";
            // Audio
            ResourceExtensions[ResourceExtensions["AUDIO_MP4"] = ".mp4"] = "AUDIO_MP4";
            ResourceExtensions[ResourceExtensions["AUDIO_MPEG"] = ".mpeg"] = "AUDIO_MPEG";
            ResourceExtensions[ResourceExtensions["AUDIO_OGG"] = ".ogg"] = "AUDIO_OGG";
            ResourceExtensions[ResourceExtensions["AUDIO_AAC"] = ".aac"] = "AUDIO_AAC";
            ResourceExtensions[ResourceExtensions["AUDIO_CAF"] = ".caf"] = "AUDIO_CAF";
            // Image
            ResourceExtensions[ResourceExtensions["Image_GIF"] = ".gif"] = "Image_GIF";
            ResourceExtensions[ResourceExtensions["Image_JPEG"] = ".jpeg"] = "Image_JPEG";
            ResourceExtensions[ResourceExtensions["Image_PNG"] = ".png"] = "Image_PNG";
            ResourceExtensions[ResourceExtensions["Image_SVG"] = ".svg"] = "Image_SVG";
            ResourceExtensions[ResourceExtensions["Image_GIMP"] = ".xcf"] = "Image_GIMP";
            // Text
            ResourceExtensions[ResourceExtensions["Text_CSS"] = ".css"] = "Text_CSS";
            ResourceExtensions[ResourceExtensions["Text_CSV"] = ".csv"] = "Text_CSV";
            ResourceExtensions[ResourceExtensions["Text_HTML"] = ".html"] = "Text_HTML";
            ResourceExtensions[ResourceExtensions["Text_Plain"] = ".txt"] = "Text_Plain";
            ResourceExtensions[ResourceExtensions["Text_RTF"] = ".rtf"] = "Text_RTF";
            ResourceExtensions[ResourceExtensions["Text_XML"] = ".xml"] = "Text_XML";
            ResourceExtensions[ResourceExtensions["Text_JQueryTemplate"] = ".tpl.htm"] = "Text_JQueryTemplate";
            ResourceExtensions[ResourceExtensions["Text_MarkDown"] = ".markdown"] = "Text_MarkDown";
            // Video
            ResourceExtensions[ResourceExtensions["Video_AVI"] = ".avi"] = "Video_AVI";
            ResourceExtensions[ResourceExtensions["Video_MPEG"] = ".mpeg"] = "Video_MPEG";
            ResourceExtensions[ResourceExtensions["Video_MP4"] = ".mp4"] = "Video_MP4";
            ResourceExtensions[ResourceExtensions["Video_OGG"] = ".ogg"] = "Video_OGG";
            ResourceExtensions[ResourceExtensions["Video_MOV"] = ".qt"] = "Video_MOV";
            ResourceExtensions[ResourceExtensions["Video_WMV"] = ".wmv"] = "Video_WMV";
            ResourceExtensions[ResourceExtensions["Video_FLV"] = ".flv"] = "Video_FLV";
        })(ResourceExtensions = Loader.ResourceExtensions || (Loader.ResourceExtensions = {}));
        ResourceExtensions['.tpl.html'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)
        ResourceExtensions['.tpl'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)
        function getResourceTypeFromExtension(ext) {
            if (ext === void 0 || ext === null)
                return void 0;
            var _ext = "" + ext; // (make sure it's a string)
            if (_ext.charAt(0) != '.')
                _ext = '.' + _ext; // (a period is required)
            return ResourceTypes[ResourceExtensions[ext]];
        }
        Loader.getResourceTypeFromExtension = getResourceTypeFromExtension;
        var RequestStatuses;
        (function (RequestStatuses) {
            /** The request has not been executed yet. */
            RequestStatuses[RequestStatuses["Pending"] = 0] = "Pending";
            /** The resource failed to load.  Check the request object for the error details. */
            RequestStatuses[RequestStatuses["Error"] = 1] = "Error";
            /** The requested resource is loading. */
            RequestStatuses[RequestStatuses["Loading"] = 2] = "Loading";
            /** The requested resource has loaded (nothing more). */
            RequestStatuses[RequestStatuses["Loaded"] = 3] = "Loaded";
            /** The requested resource is waiting on parent resources to complete. */
            RequestStatuses[RequestStatuses["Waiting"] = 4] = "Waiting";
            /** The requested resource is ready to be used. */
            RequestStatuses[RequestStatuses["Ready"] = 5] = "Ready";
            /** The source is a script, and was executed (this only occurs on demand [not automatic]). */
            RequestStatuses[RequestStatuses["Executed"] = 6] = "Executed";
        })(RequestStatuses = Loader.RequestStatuses || (Loader.RequestStatuses = {}));
        // ====================================================================================================================
        /**
         * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
         * implementation designed to work better with the CoreXT system specifically, and to support parallel loading).
         * Note: It is advised to use 'CoreXT.Loader.loadResource()' to load resources instead of directly creating resource request objects.
         * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
         * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
         */
        var ResourceRequest = /** @class */ (function (_super) {
            __extends(ResourceRequest, _super);
            function ResourceRequest() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /**
             * If true (the default) then a '"_v_="+Date.now()' query item is added to make sure the browser never uses
             * the cache. To change the variable used, set the 'cacheBustingVar' property also.
             * Each resource request instance can also have its own value set separate from the global one.
             * Note: CoreXT has its own caching that uses the local storage, where supported.
             */
            ResourceRequest.cacheBusting = true;
            /** See the 'cacheBusting' property. */
            ResourceRequest.cacheBustingVar = '_v_'; // (note: ResourceInfo.cs uses this same default)
            return ResourceRequest;
        }(FactoryBase()));
        Loader.ResourceRequest = ResourceRequest;
        (function (ResourceRequest) {
            var $__type = /** @class */ (function () {
                function $__type() {
                    this.$__transformedData = CoreXT.noop;
                    /** The response code from the XHR response. */
                    this.responseCode = 0; // (the response code returned)
                    /** The response code message from the XHR response. */
                    this.responseMessage = ""; // (the response code message)
                    /** The current request status. */
                    this.status = RequestStatuses.Pending;
                    /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
                    this.messageLog = [];
                    /**
                     * If true (the default) then a '"_="+Date.now()' query item is added to make sure the browser never uses
                     * the cache. To change the variable used, set the 'cacheBustingVar' property also.
                     * Note: CoreXT has its own caching that uses the local storage, where supported.
                     */
                    this.cacheBusting = ResourceRequest.cacheBusting;
                    /** See the 'cacheBusting' property. */
                    this.cacheBustingVar = ResourceRequest.cacheBustingVar;
                    /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
                    * There's also an 'on finally' which should execute on success OR failure, regardless.
                    * For each entry, only ONE of any callback type will be set.
                    */
                    this._promiseChain = [];
                    this._promiseChainIndex = 0; // (the current position in the event chain)
                    this._parentCompletedCount = 0; // (when this equals the # of 'dependents', the all parent resources have loaded [just faster than iterating over them])
                    this._paused = false;
                }
                Object.defineProperty($__type.prototype, "url", {
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
                Object.defineProperty($__type.prototype, "transformedData", {
                    /** Set to data returned from callback handlers as the 'data' property value gets transformed.
                      * If no transformations were made, then the value in 'data' is returned.
                      */
                    get: function () {
                        return this.$__transformedData === CoreXT.noop ? this.data : this.$__transformedData;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty($__type.prototype, "message", {
                    /**
                     * A progress/error message related to the status (may not be the same as the response message).
                     * Setting this property sets the local message and updates the local message log. Make sure to set 'this.status' first before setting a message.
                     */
                    get: function () {
                        return this._message;
                    },
                    set: function (value) {
                        this._message = value;
                        this.messageLog.push(this._message);
                        if (this.status == RequestStatuses.Error)
                            error("ResourceRequest (" + this.url + ")", this._message, this, false); // (send resource loading error messages to the console to aid debugging)
                        else
                            log("ResourceRequest (" + this.url + ")", this._message, LogTypes.Normal, this);
                    },
                    enumerable: true,
                    configurable: true
                });
                $__type.prototype._queueDoNext = function (data) {
                    var _this = this;
                    setTimeout(function () {
                        // ... before this, fire any handlers that would execute before this ...
                        _this._doNext();
                    }, 0);
                }; // (simulate an async response, in case more handlers need to be added next)
                $__type.prototype._queueDoError = function () {
                    var _this = this;
                    setTimeout(function () { _this._doError(); }, 0);
                }; // (simulate an async response, in case more handlers need to be added next)
                $__type.prototype._requeueHandlersIfNeeded = function () {
                    if (this.status == RequestStatuses.Error)
                        this._queueDoError();
                    else if (this.status >= RequestStatuses.Waiting) {
                        this._queueDoNext(this.data);
                    }
                    // ... else, not needed, as the chain is still being traversed, so anything added will get run as expected ...
                };
                /** Triggers a success or error callback after the resource loads, or fails to load. */
                $__type.prototype.then = function (success, error) {
                    if (success !== void 0 && success !== null && typeof success != 'function' || error !== void 0 && error !== null && typeof error !== 'function')
                        throw "A handler function given is not a function.";
                    else {
                        this._promiseChain.push({ onLoaded: success, onError: error });
                        this._requeueHandlersIfNeeded();
                    }
                    if (this.status == RequestStatuses.Waiting || this.status == RequestStatuses.Ready) {
                        this.status = RequestStatuses.Loaded; // (back up)
                        this.message = "New 'then' handler added.";
                    }
                    return this;
                };
                /** Adds another request and makes it dependent on the current 'parent' request.  When all parent requests have completed,
                  * the dependant request fires its 'onReady' event.
                  * Note: The given request is returned, and not the current context, so be sure to complete configurations before hand.
                  */
                $__type.prototype.include = function (request) {
                    if (!request._parentRequests)
                        request._parentRequests = [];
                    if (!this._dependants)
                        this._dependants = [];
                    request._parentRequests.push(this);
                    this._dependants.push(request);
                    return request;
                };
                /**
                 * Add a call-back handler for when the request completes successfully.
                 * This event is triggered after the resource successfully loads and all callbacks in the promise chain get called.
                 * @param handler
                 */
                $__type.prototype.ready = function (handler) {
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
                /** Adds a hook into the resource load progress event. */
                $__type.prototype.while = function (progressHandler) {
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
                /** Call this anytime while loading is in progress to terminate the request early. An error event will be triggered as well. */
                $__type.prototype.abort = function () {
                    if (this._xhr.readyState > XMLHttpRequest.UNSENT && this._xhr.readyState < XMLHttpRequest.DONE) {
                        this._xhr.abort();
                    }
                };
                /**
                 * Provide a handler to catch any errors from this request.
                 */
                $__type.prototype.catch = function (errorHandler) {
                    if (typeof errorHandler == 'function') {
                        this._promiseChain.push({ onError: errorHandler });
                        this._requeueHandlersIfNeeded();
                    }
                    else
                        throw "Handler is not a function.";
                    return this;
                };
                /**
                 * Provide a handler which should execute on success OR failure, regardless.
                 */
                $__type.prototype.finally = function (cleanupHandler) {
                    if (typeof cleanupHandler == 'function') {
                        this._promiseChain.push({ onFinally: cleanupHandler });
                        this._requeueHandlersIfNeeded();
                    }
                    else
                        throw "Handler is not a function.";
                    return this;
                };
                /** Starts loading the current resource.  If the current resource has dependencies, they are triggered to load first (in proper
                  * order).  Regardless of the start order, all scripts are loaded in parallel.
                  * Note: This call queues the start request in 'async' mode, which begins only after the current script execution is completed.
                  */
                $__type.prototype.start = function () {
                    var _this = this;
                    if (this.async)
                        setTimeout(function () { _this._Start(); }, 0);
                    else
                        this._Start();
                    return this;
                };
                $__type.prototype._Start = function () {
                    var _this = this;
                    // ... start at the top most parent first, and work down ...
                    if (this._parentRequests)
                        for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                            this._parentRequests[i].start();
                    if (this.status == RequestStatuses.Pending) {
                        this.status = RequestStatuses.Loading; // (do this first to protect against any possible cyclical calls)
                        this.message = "Loading resource ...";
                        // ... this request has not been started yet; attempt to load the resource ...
                        // ... 1. see first if this file is cached in the web storage, then load it from there instead ...
                        //    (ignore the local caching if in debug or the versions are different)
                        if (!CoreXT.isDebugging() && typeof Storage !== void 0)
                            try {
                                var currentAppVersion = CoreXT.getAppVersion();
                                var versionInLocalStorage = localStorage.getItem("version");
                                var appVersionInLocalStorage = localStorage.getItem("appVersion");
                                if (versionInLocalStorage && appVersionInLocalStorage && CoreXT.version == versionInLocalStorage && currentAppVersion == appVersionInLocalStorage) {
                                    // ... all versions match, just pull from local storage (faster) ...
                                    this.data = localStorage.getItem("resource:" + this.url); // (should return 'null' if not found)
                                    if (this.data !== null && this.data !== void 0) {
                                        this.status = RequestStatuses.Loaded;
                                        this._doNext();
                                        return;
                                    }
                                }
                            }
                            catch (e) {
                                // ... not supported? ...
                            }
                        // ... 2. check web SQL for the resource ...
                        // TODO: Consider Web SQL Database as well. (though not supported by IE yet, as usual, but could help greatly on the others) //?
                        // ... 3. if not in web storage, try loading from a CoreXT core system, if available ...
                        // TODO: Message CoreXT core system for resource data. // TODO: need to build the bridge class first.
                        // ... next, create an XHR object and try to load the resource ...
                        if (!this._xhr) {
                            this._xhr = new XMLHttpRequest();
                            var xhr = this._xhr;
                            var loaded = function () {
                                if (xhr.status == 200 || xhr.status == 304) {
                                    _this.data = xhr.response;
                                    _this.status == RequestStatuses.Loaded;
                                    _this.message = xhr.status == 304 ? "Loading completed (from browser cache)." : "Loading completed.";
                                    // ... check if the expected mime type matches, otherwise throw an error to be safe ...
                                    var responseType = xhr.getResponseHeader('content-type');
                                    if (_this.type && responseType && _this.type != responseType) {
                                        _this.setError("Resource type mismatch: expected type was '" + _this.type + "', but received '" + responseType + "' (XHR type '" + xhr.responseType + "').\r\n");
                                    }
                                    else {
                                        if (!CoreXT.isDebugging() && typeof Storage !== void 0)
                                            try {
                                                localStorage.setItem("version", CoreXT.version);
                                                localStorage.setItem("appVersion", CoreXT.getAppVersion());
                                                localStorage.setItem("resource:" + _this.url, _this.data);
                                                _this.message = "Resource cached in local storage.";
                                            }
                                            catch (e) {
                                                // .. failed: out of space? ...
                                                // TODO: consider saving to web SQL as well, or on failure (as a backup; perhaps create a storage class with this support). //?
                                            }
                                        else
                                            _this.message = "Resource not cached in local storage because of debug mode. Release mode will use local storage to help survive clearing CoreXT files when temporary content files are deleted.";
                                        _this._doNext();
                                    }
                                }
                                else {
                                    _this.setError("There was a problem loading the resource (status code " + xhr.status + ": " + xhr.statusText + ").\r\n");
                                }
                            };
                            // ... this script is not cached, so load it ...
                            xhr.onreadystatechange = function () {
                                switch (xhr.readyState) {
                                    case XMLHttpRequest.UNSENT: break;
                                    case XMLHttpRequest.OPENED:
                                        _this.message = "Opened connection ...";
                                        break;
                                    case XMLHttpRequest.HEADERS_RECEIVED:
                                        _this.message = "Headers received ...";
                                        break;
                                    case XMLHttpRequest.LOADING: break; // (this will be handled by the progress event)
                                    case XMLHttpRequest.DONE:
                                        loaded();
                                        break;
                                }
                            };
                            xhr.onerror = function (ev) { _this.setError(void 0, ev); _this._doError(); };
                            xhr.onabort = function () { _this.setError("Request aborted."); };
                            xhr.ontimeout = function () { _this.setError("Request timed out."); };
                            xhr.onprogress = function (evt) {
                                _this.message = Math.round(evt.loaded / evt.total * 100) + "% loaded ...";
                                if (_this._onProgress && _this._onProgress.length)
                                    _this._doOnProgress(evt.loaded / evt.total * 100);
                            };
                            // (note: all event 'on...' properties only available in IE10+)
                        }
                    }
                    else { // (this request was already started)
                        return;
                    }
                    if (xhr.readyState != 0)
                        xhr.abort(); // (abort existing, just in case)
                    var url = this.url;
                    try {
                        // ... check if we need to bust the cache ...
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
                    //?if (!this.async && (xhr.status)) doSuccess();
                };
                /** Upon return, the 'then' or 'ready' event chain will pause until 'continue()' is called. */
                $__type.prototype.pause = function () {
                    if (this.status >= RequestStatuses.Pending && this.status < RequestStatuses.Ready
                        || this.status == RequestStatuses.Ready && this._onReady.length)
                        this._paused = true;
                    return this;
                };
                /** After calling 'pause()', use this function to re-queue the 'then' or 'ready' even chain for continuation.
                  * Note: This queues on a timer with a 0 ms delay, and does not call any events before returning to the caller.
                  */
                $__type.prototype.continue = function () {
                    if (this._paused) {
                        this._paused = false;
                        this._requeueHandlersIfNeeded();
                    }
                    return this;
                };
                $__type.prototype._doOnProgress = function (percent) {
                    // ... notify any handlers as well ...
                    if (this._onProgress) {
                        for (var i = 0, n = this._onProgress.length; i < n; ++i)
                            try {
                                var cb = this._onProgress[i];
                                if (cb)
                                    cb.call(this, this);
                            }
                            catch (e) {
                                this._onProgress[i] = null; // (won't be called again)
                                this.setError("'on progress' callback #" + i + " has thrown an error:", e);
                                // ... do nothing, not important ...
                            }
                    }
                };
                $__type.prototype.setError = function (message, error) {
                    if (error) {
                        var errMsg = getErrorMessage(error);
                        if (errMsg) {
                            if (message)
                                message += " \r\n";
                            message += errMsg;
                        }
                    }
                    this.status = RequestStatuses.Error;
                    this.message = message; // (automatically adds to 'this.messages' and writes to the console)
                };
                $__type.prototype._doNext = function () {
                    var _this = this;
                    if (this.status == RequestStatuses.Error) {
                        this._doError(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                        return;
                    }
                    if (this._onProgress && this._onProgress.length) {
                        this._doOnProgress(100);
                        this._onProgress.length = 0;
                    }
                    for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                        if (this._paused)
                            return;
                        var handlers = this._promiseChain[this._promiseChainIndex]; // (get all the handlers waiting for the result of this request)
                        if (handlers.onLoaded) {
                            try {
                                var data = handlers.onLoaded.call(this, this, this.transformedData); // (call the handler with the current data and get the resulting data, if any)
                            }
                            catch (e) {
                                this.setError("An 'onLoaded' handler failed.", e);
                                ++this._promiseChainIndex; // (the success callback failed, so trigger the error chain starting at next index)
                                this._doError();
                                return;
                            }
                            if (typeof data === 'object' && data instanceof $__type) {
                                // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                                if (data.status == RequestStatuses.Error) {
                                    this.setError("Rejected request returned from 'onLoaded' handler.");
                                    ++this._promiseChainIndex;
                                    this._doError(); // (cascade the error)
                                    return;
                                }
                                else {
                                    // ... get the data from the request object ...
                                    var newResReq = data;
                                    if (newResReq.status >= RequestStatuses.Ready) {
                                        if (newResReq === this)
                                            continue; // ('self' [this] was returned, so go directly to the next item)
                                        data = newResReq.transformedData; // (the data is ready, so read now)
                                    }
                                    else { // (loading is started, or still in progress, so wait; we simply hook into the request object to get notified when the data is ready)
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
                                ++this._promiseChainIndex; // (the finally callback failed, so trigger the error chain starting at next index)
                                this._doError();
                            }
                        }
                    }
                    this._promiseChain.length = 0;
                    this._promiseChainIndex = 0;
                    // ... finished: now trigger any "ready" handlers ...
                    if (this.status < RequestStatuses.Waiting)
                        this.status = RequestStatuses.Waiting; // (default to this next before being 'ready')
                    this._doReady(); // (this triggers in dependency order)
                };
                $__type.prototype._doReady = function () {
                    if (this._paused)
                        return;
                    if (this.status < RequestStatuses.Waiting)
                        return; // (the 'ready' event must only trigger after the resource loads, AND all handlers have been called)
                    // ... check parent dependencies first ...
                    if (this.status == RequestStatuses.Waiting)
                        if (!this._parentRequests || !this._parentRequests.length) {
                            this.status = RequestStatuses.Ready; // (no parent resource dependencies, so this resource is 'ready' by default)
                            this.message = "Resource has no dependencies, and is now ready.";
                        }
                        else // ...need to determine if all parent (dependent) resources are completed first ...
                         if (this._parentCompletedCount == this._parentRequests.length) {
                            this.status = RequestStatuses.Ready; // (all parent resource dependencies are now 'ready')
                            this.message = "*** All dependencies for resource have loaded, and are now ready. ***";
                        }
                        else {
                            this.message = "Resource is waiting on dependencies (" + this._parentCompletedCount + "/" + this._parentRequests.length + " ready so far)...";
                            return; // (nothing more to do yet)
                        }
                    // ... call the local 'onReady' event, and then trigger the call on the children as required.
                    if (this.status == RequestStatuses.Ready) {
                        if (this._onReady && this._onReady.length) {
                            try {
                                for (var i = 0, n = this._onReady.length; i < n; ++i)
                                    this._onReady[i].call(this, this);
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
                                this._dependants[i]._doReady(); // (notify all children that this resource is now 'ready' for use [all events have been run, as opposed to just being loaded])
                            }
                    }
                };
                $__type.prototype._doError = function () {
                    var _this = this;
                    if (this._paused)
                        return;
                    if (this.status != RequestStatuses.Error) {
                        this._doNext(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                        return;
                    }
                    for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                        if (this._paused)
                            return;
                        var handlers = this._promiseChain[this._promiseChainIndex];
                        if (handlers.onError) {
                            try {
                                var newData = handlers.onError.call(this, this, this.message); // (this handler should "fix" the situation and return valid data)
                            }
                            catch (e) {
                                this.setError("Error handler failed.", e);
                            }
                            if (typeof newData === 'object' && newData instanceof $__type) {
                                // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                                if (newData.status == RequestStatuses.Error)
                                    return; // (no correction made, still in error; terminate the event chain here)
                                else {
                                    var newResReq = newData;
                                    if (newResReq.status >= RequestStatuses.Ready)
                                        newData = newResReq.transformedData;
                                    else { // (loading is started, or still in progress, so wait)
                                        newResReq.ready(function (sender) { _this.$__transformedData = sender.transformedData; _this._doNext(); })
                                            .catch(function (sender) { _this.setError("Resource returned from error handler has failed to load.", sender); _this._doError(); });
                                        return;
                                    }
                                }
                            }
                            // ... continue with the value from the error handler (even if none) ...
                            this.status = RequestStatuses.Loaded;
                            this._message = void 0; // (clear the current message [but keep history])
                            ++this._promiseChainIndex; // (pass on to next handler in the chain)
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
                    // ... if this is reached, then there are no following error handlers, so throw the existing message ...
                    if (this.status == RequestStatuses.Error) {
                        var msgs = this.messageLog.join("\r\n· ");
                        if (msgs)
                            msgs = ":\r\n· " + msgs;
                        else
                            msgs = ".";
                        throw new Error("Unhandled error loading resource " + ResourceTypes[this.type] + " from '" + this.url + "'" + msgs + "\r\n");
                    }
                };
                /** Resets the current resource data, and optionally all dependencies, and restarts the whole loading process.
                  * Note: All handlers (including the 'progress' and 'ready' handlers) are cleared and will have to be reapplied (clean slate).
                  * @param {boolean} includeDependentResources Reload all resource dependencies as well.
                  */
                $__type.prototype.reload = function (includeDependentResources) {
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
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, url, type, async) {
                        if (async === void 0) { async = true; }
                        if (url === void 0 || url === null)
                            throw "A resource URL is required.";
                        if (type === void 0)
                            throw "The resource type is required.";
                        if (_resourceRequestByURL[url])
                            return _resourceRequestByURL[url]; // (abandon this new object instance in favor of the one already existing and returned it)
                        o.url = url;
                        o.type = type;
                        o.async = async;
                        o.$__index = _resourceRequests.length;
                        _resourceRequests.push(o);
                        _resourceRequestByURL[o.url] = o;
                    };
                };
                return $__type;
            }());
            ResourceRequest.$__type = $__type;
            ResourceRequest.$__register(Loader);
        })(ResourceRequest = Loader.ResourceRequest || (Loader.ResourceRequest = {}));
        // ====================================================================================================================
        var _resourceRequests = []; // (requests are loaded in parallel, but executed in order of request)
        var _resourceRequestByURL = {}; // (a quick named index lookup into '__loadRequests')
        /** Returns a load request promise-type object for a resource loading operation. */
        function get(url, type, asyc) {
            if (asyc === void 0) { asyc = true; }
            if (url === void 0 || url === null)
                throw "A resource URL is required.";
            url = "" + url;
            if (type === void 0 || type === null) {
                // (make sure it's a string)
                // ... a valid type is required, but try to detect first ...
                var ext = (url.match(/(\.[A-Za-z0-9]+)(?:[\?\#]|$)/i) || []).pop();
                type = getResourceTypeFromExtension(ext);
                if (!type)
                    error("Loader.get('" + url + "', type:" + type + ")", "A resource (MIME) type is required, and no resource type could be determined (See CoreXT.Loader.ResourceTypes). If the resource type cannot be detected by a file extension then you must specify the MIME string manually.");
            }
            var request = _resourceRequestByURL[url]; // (try to load any already existing requests)
            if (!request)
                request = ResourceRequest.new(url, type, asyc);
            return request;
        }
        Loader.get = get;
        /** Used by the bootstrapper in applying system scripts as they become ready.
          * Applications should normally never use this, and instead use the 'modules' system in the 'CoreXT.Scripts' namespace for
          * script loading.
          */
        function _SystemScript_onReady_Handler(request) {
            try {
                request.message = "Executing script ...";
                var helpers = CoreXT.renderHelperVarDeclarations("p0");
                CoreXT.safeEval(helpers[0] + " var CoreXT=p1; " + request.transformedData, /*p0*/ helpers[1], /*p1*/ CoreXT); // ('CoreXT.eval' is used for system scripts because some core scripts need initialize in the global scope [mostly due to TypeScript limitations])
                //x (^note: MUST use global evaluation as code may contain 'var's that will get stuck within function scopes)
                request.status = RequestStatuses.Executed;
                request.message = "The script has been executed successfully.";
            }
            catch (ex) {
                var errorMsg = getErrorMessage(ex);
                var msg = "There was an error executing script '" + request.url + "'.  The first 255 characters of the response was \r\n\"" + request.transformedData.substr(0, 255) + "\". \r\nError message:";
                request.setError(msg, ex);
            }
        }
        Loader._SystemScript_onReady_Handler = _SystemScript_onReady_Handler;
        Loader.BootSubPath = Loader.BootSubPath && ('' + Loader.BootSubPath) || "~/CoreXT/";
        /**
         * Starts loading the CoreXT system.  To prevent this from happening automatically simply set the CoreXT debug
         * mode before the CoreXT.js file runs: "CoreXT = { debugMode: 2 };" (see CoreXT.DebugModes.Debug_Wait)
         * You can use 'Loader.onSystemLoaded()' to register handlers to run when the system is ready.
         *
         * Note: When developing applications, the CoreXT-way is to create an 'app.manifest.ts' file that will auto load and
         * run once the system boots up. Manifest files are basically "modules" loaded in an isolated scope from the global
         * scope to help prevent pollution of the global scope. In a manifest file you declare and define all the types for
         * your module, including any dependencies on other modules in the CoreXT system.  This promotes a more efficient
         * module-based loading structure that allows pages to load faster and saves on bandwidth.
         */
        function bootstrap() {
            // (note: the request order is the dependency order)
            var BootSubPath = ('' + Loader.BootSubPath);
            var rbpLastChar = BootSubPath.charAt(BootSubPath.length - 1);
            if (rbpLastChar != '/' && rbpLastChar != '\\')
                BootSubPath += '/'; // (must end with a slash)
            log("Loader.BootSubPath", BootSubPath + " (if this path is wrong set 'CoreXT.Loader.BootSubPath' before 'Loader.bootstrap()' gets called)");
            var onReady = _SystemScript_onReady_Handler;
            // ... load the base scripts first (all of these are not modules, so they have to be loaded in the correct order) ...
            get(BootSubPath + "CoreXT.Polyfills.js").ready(onReady) // (in case some polyfills are needed after this point)
                .include(get(BootSubPath + "CoreXT.Utilities.js")).ready(onReady) // (a lot of items depend on time utilities [such as some utilities and logging] so this needs to be loaded first)
                .include(get(BootSubPath + "CoreXT.Globals.js")).ready(onReady)
                .include(get(BootSubPath + "CoreXT.Scripts.js").ready(onReady)) // (supports CoreXT-based module loading)
                // ... load the rest of the core system next ...
                .include(get(BootSubPath + "System/CoreXT.System.js").ready(onReady)) // (any general common system properties and setups)
                .include(get(BootSubPath + "System/CoreXT.System.PrimitiveTypes.js").ready(onReady)) // (start the primitive object definitions required by more advanced types)
                .include(get(BootSubPath + "System/CoreXT.System.Time.js")).ready(onReady) // (extends the time utilities and constants into a TimeSpan wrapper)
                .include(get(BootSubPath + "System/CoreXT.System.Storage.js").ready(onReady)) // (utilities for local storage support in CoreXT)
                .include(get(BootSubPath + "System/CoreXT.System.Exception.js").ready(onReady)) // (setup exception support)
                .include(get(BootSubPath + "System/CoreXT.System.Diagnostics.js")).ready(onReady) // (setup diagnostic support)
                .include(get(BootSubPath + "System/CoreXT.System.Events.js").ready(onReady)) // (advanced event handling)
                .include(get(BootSubPath + "CoreXT.Browser.js")).ready(onReady) // (uses the event system)
                .include(get(BootSubPath + "System/CoreXT.System.Collections.IndexedObjectCollection.js").ready(onReady))
                .include(get(BootSubPath + "System/CoreXT.System.Collections.ObservableCollection.js").ready(onReady)) // (uses events)
                .include(get(BootSubPath + "System/CoreXT.System.Text.js").ready(onReady)) // (utilities specific to working with texts)
                .include(get(BootSubPath + "System/CoreXT.System.Data.js").ready(onReady))
                .include(get(BootSubPath + "System/CoreXT.System.IO.js").ready(onReady)) // (adds URL query handling and navigation [requires 'Events.EventDispatcher'])
                .include(get(BootSubPath + "System/CoreXT.System.AppDomain.js").ready(onReady)) // (holds the default app domain and default application)
                .ready(function () {
                if (_onSystemLoadedHandlers && _onSystemLoadedHandlers.length)
                    for (var i = 0, n = _onSystemLoadedHandlers.length; i < n; ++i)
                        _onSystemLoadedHandlers[i]();
                // ... all core system scripts loaded, load the default manifests next ...
                CoreXT.Scripts.getManifest() // (load the default manifest in the current path [defaults to 'manifest.js'])
                    .include(CoreXT.Scripts.getManifest("~/app.manifest")) // (load a custom named manifest; application launching begins here)
                    .ready(function (mod) {
                    CoreXT.onReady.dispatch();
                    if (CoreXT.Scripts.Modules.App)
                        CoreXT.Scripts.Modules.App(CoreXT.Scripts._tryRunApp);
                }) // (triggered when 'app.manifest' is executed and ready)
                    .start();
            })
                .start(); // (note: while all requests are loaded in parallel [regardless of dependencies], all 'ready' events are fired in proper order)
            CoreXT.Loader.bootstrap = CoreXT.noop(); // (prevent this function from being called again)
        }
        Loader.bootstrap = bootstrap;
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
    })(Loader = CoreXT.Loader || (CoreXT.Loader = {}));
    // ========================================================================================================================================
    log("CoreXT", "Core system loaded.", LogTypes.Info);
    if (CoreXT.onBeforeBootstrapHandlers && (typeof CoreXT.onBeforeBootstrapHandlers != 'object' || !('length' in CoreXT.onBeforeBootstrapHandlers)))
        error("Before Bootstrap Events", "The property 'CoreXT.onBeforeBootstrapHandlers' is not set correctly.  Please set it with an array of handlers to call, or leave it undefined.");
    var _StartBoot;
    (function (_StartBoot) {
        var autoboot = true;
        if (typeof CoreXT.onBeforeBootstrapHandlers == 'object' && CoreXT.onBeforeBootstrapHandlers.length)
            for (var i = 0, n = CoreXT.onBeforeBootstrapHandlers.length; i < n; ++i)
                if (CoreXT.onBeforeBootstrapHandlers[i]() === false)
                    autoboot = false; // (explicit request to prevent auto booting)
        if (autoboot && CoreXT.debugMode != CoreXT.DebugModes.Debug_Wait)
            CoreXT.Loader.bootstrap();
        // TODO: Allow users to use 'CoreXT.Loader' to load their own scripts, and skip loading the CoreXT system.
    })(_StartBoot || (_StartBoot = {}));
})(CoreXT || (CoreXT = {}));
// ========================================================================================================================================
//# sourceMappingURL=CoreXT.js.map