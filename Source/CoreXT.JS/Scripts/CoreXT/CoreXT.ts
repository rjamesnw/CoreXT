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
var appVersion: string;

//declare function Symbol(desc?: string): string;

if (typeof this['Symbol'] == 'undefined') { // (mainly for IE 11)
    // ... create a simple polyfill for this ...
    this['Symbol'] = function Symbol(desc?: string) { var d = new Date().getTime(), dStr = '$' + d; this.valueOf = () => dStr; this.toString = () => dStr; return this; };
}

/**
 * The root namespace for the CoreXT system.
 */
namespace CoreXT {
    // ------------------------------------------------------------------------------------------------------------------------

    /** The current version of the CoreXT system. */
    export var version = "0.0.1";
    Object.defineProperty(CoreXT, "version", { writable: false });

    /** Returns the current user defined application version, or a default version. */
    export var getAppVersion = () => appVersion || "0.0.0";

    if (typeof navigator != 'undefined' && typeof console != 'undefined')
        if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0)
            console.log("-=< CoreXT Client OS - v" + version + " >=- ");
        else
            console.log("%c -=< %cCoreXT Client OS - v" + version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");

    // ------------------------------------------------------------------------------------------------------------------------

    export var constructor = Symbol("static constructor");

    // ------------------------------------------------------------------------------------------------------------------------
}

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

// ===========================================================================================================================
// Allow accessing properties of primitive objects by string index.

interface Function {
    [index: string]: any;
}

interface Object {
    [index: string]: any;
}

interface Array<T> {
    [index: string]: any;
}

// =======================================================================================================================

/** The "fake" host object is only used when there is no .NET host wrapper integration available.
* In this case, the environment is running as a simple web application.
*/
class __NonCoreXTHost__ implements IHostBridge {

    constructor() { }

    getCurrentDir(): string { return document.location.href; }

    isStudio(): boolean { return false; }
    isServer(): boolean { return false; }
    isClient(): boolean { return !this.isServer() && !this.isStudio(); }

    setTitle(title: string) { document.title = title; }
    getTitle(): string { return document.title; }

    isDebugMode(): boolean { return false; }
}

var $ICE: IHostBridge_ICE = null;
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
var siteBaseURL: string;
/** Root location of the application scripts, which by default is {site URL}+"/js/". */
var scriptsBaseURL: string;
/** Root location of the CSS files, which by default is {site URL}+"/css/". */
var cssBaseURL: string;

// ===========================================================================================================================
// Setup some preliminary settings before the core scope, including the "safe" and "global" 'eval()' functions.

namespace CoreXT {

    // =======================================================================================================================
    // Integrate native types

    export interface IndexedObject {
        [name: string]: any;
    }

    export declare namespace NativeTypes {
        export interface IFunction extends Function { }
        export interface IObject extends Object, IndexedObject { }
        export interface IArray<T> extends Array<T> { }
        export interface IString extends String { }
        export interface INumber extends Number { }
        export interface IBoolean extends Boolean { }
        export interface IRegExp extends RegExp { }
        export interface IDate extends Date { }
        export interface IIMath extends Math { }
        export interface IError extends Error { }
        export interface IXMLHttpRequest extends XMLHttpRequest { }
        export interface IHTMLElement extends HTMLElement { }
        export interface IWindow extends Window { }
    }

    //x export declare module NativeStaticTypes {
    //    export var StaticFunction: FunctionConstructor;
    //    export var StaticObject: ObjectConstructor;
    //    export var StaticArray: ArrayConstructor;
    //    export var StaticString: StringConstructor;
    //    export var StaticNumber: NumberConstructor;
    //    export var StaticBoolean: BooleanConstructor;
    //    export var StaticRegExp: RegExpConstructor;
    //    export var StaticDate: DateConstructor;
    //    export var StaticMath: typeof Math;
    //    export var StaticError: ErrorConstructor;
    //    export var StaticXMLHttpRequest: typeof XMLHttpRequest;
    //    export var StaticNode: typeof Node;
    //    export var StaticElement: typeof Element;
    //    export var StaticHTMLElement: typeof HTMLElement;
    //    export var StaticText: typeof Text;
    //    export var StaticWindow: typeof Window;
    //x }

    export interface IStaticGlobals extends Window {
        [index: string]: any;
        Function: FunctionConstructor;
        Object: ObjectConstructor;
        Array: ArrayConstructor;
        String: StringConstructor;
        Number: NumberConstructor;
        Boolean: BooleanConstructor;
        RegExp: RegExpConstructor;
        Date: DateConstructor;
        Math: Math;
        Error: ErrorConstructor;
        XMLHttpRequest: typeof XMLHttpRequest;
        Node: typeof Node;
        Element: typeof Element;
        HTMLElement: typeof HTMLElement;
        Text: typeof Text;
        Window: typeof Window;
        CoreXT: typeof CoreXT;
        siteBaseURL: typeof siteBaseURL;
        scriptsBaseURL: typeof scriptsBaseURL;
        cssBaseURL: typeof cssBaseURL;
    }
    export type KeyOf<T> = keyof Required<T>;

    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    export var global: IStaticGlobals = (function () { }.constructor("return this"))(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])

    export var host: IHostBridge = (() => {
        // ... make sure the host object is valid for at least checking client/server/studio states
        if (typeof host !== 'object' || typeof host.isClient == 'undefined' || typeof host.isServer == 'undefined' || typeof host.isStudio == 'undefined')
            return new __NonCoreXTHost__();
        else
            return host; // (running in a valid host (or emulator? ;) )
    })();

    // =======================================================================================================================

    /** The root namespace name as the string constant. */
    export const ROOT_NAMESPACE = "CoreXT";

    /** A simple function that does nothing (no operation).
    * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
    * or when replacing the 'CoreXT.Loader.bootstrap()' function, which should only ever need to be called once.
    */
    export function noop(...args: any[]): any { }

    /** Evaluates a string within a Function scope at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to keep 'var' declarations, etc., within a function scope.
      * Note: By default, parameter indexes 0-9 are automatically assigned to parameter identifiers 'p0' through 'p9' for easy reference.
      */
    export declare function safeEval(x: string, ...args: any[]): any;

    /** Evaluates a string directly at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to allow 'var' declarations, etc., on the global scope.
      */
    export declare function globalEval(x: string): any;

    export enum Environments {
        /** Represents the CoreXT client core environment. */
        Browser, // Trusted
        /** Represents the CoreXT worker environment (where applications and certain modules reside). */
        Worker, // Secure "Sandbox"
        /** Represents the CoreXT server environment. */
        Server
    }

    // ------------------------------------------------------------------------------------------------------------------------

    export enum DebugModes {
        /** Run in release mode, which loads all minified module scripts, and runs the application automatically when ready. */
        Release,
        /** Run in debug mode (default), which loads all un-minified scripts, and runs the application automatically when ready. */
        Debug_Run,
        /** 
          * Run in debug mode, which loads all un-minified scripts, but does NOT boot the system nor run the application automatically.
          * To manually start the CoreXT system boot process, call 'CoreXT.Loader.bootstrap()'.
          * Once the boot process completes, the application will not start automatically. To start the application process, call 'CoreXT.Scripts.runApp()".
          */
        Debug_Wait
    }

    /** Sets the debug mode. A developer should set this to one of the desired 'DebugModes' values. The default is 'Debug_Run'. */
    export var debugMode: DebugModes = typeof debugMode != 'number' ? DebugModes.Debug_Run : debugMode;

    /** Returns true if CoreXT is running in debug mode. */
    export function isDebugging() { return debugMode != DebugModes.Release; }

    // =========================================================================================================================================

    /** Returns the name of a namespace or variable reference at runtime. */
    export function nameof(selector: () => any, fullname = false): string {
        var s = '' + selector;
        //var m = s.match(/return\s*([A-Z.]+)/i) || s.match(/=>\s*{?\s*([A-Z.]+)/i) || s.match(/function.*?{\s*([A-Z.]+)/i);
        var m = s.match(/return\s+([A-Z$_.]+)/i) || s.match(/.*?(?:=>|function.*?{(?!\s*return))\s*([A-Z.]+)/i);
        var name = m && m[1] || "";
        return fullname ? name : name.split('.').reverse()[0];
    }

    // =========================================================================================================================================

    export var FUNC_NAME_REGEX = /^function\s*(\S+)\s*\(/i; // (note: never use the 'g' flag here, or '{regex}.exec()' will only work once every two calls [attempts to traverse])

    /** Attempts to pull the function name from the function object, and returns an empty string if none could be determined. */
    export function getFunctionName(func: Function): string {
        // ... if an internal name is already set return it now ...
        var name = (<ITypeInfo><any>func).$__name || func['name'];
        if (name == void 0) {
            // ... check the type (this quickly detects internal/native Browser types) ...
            var typeString: string = Object.prototype.toString.call(func);
            // (typeString is formated like "[object SomeType]")
            if (typeString.charAt(0) == '[' && typeString.charAt(typeString.length - 1) == ']')
                name = typeString.substring(1, typeString.length - 1).split(' ')[1];
            if (!name || name == "Function" || name == "Object") { // (a basic function/object was found)
                if (typeof func == 'function') {
                    // ... if this has a function text get the name as defined (in IE, Window+'' returns '[object Window]' but in Chrome it returns 'function Window() { [native code] }') ...
                    var fstr = Function.prototype.toString.call(func);
                    var results = (FUNC_NAME_REGEX).exec(fstr); // (note: for function expression object contexts, the constructor (type) name is always 'Function')
                    name = (results && results.length > 1) ? results[1] : void 0;
                }
                else name = void 0;
            }
        }
        return name || "";

    }

    // =========================================================================================================================================
    // A dump of the functions required by TypeScript in one place.

    var extendStatics = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b: {}) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    /** Extends from a base type by chaining a derived type's 'prototype' to the base type's prototype.
    * This method takes into account any preset properties that may exist on the derived type's prototype.
    * Note: Extending an already extended derived type will recreate the prototype connection again using a new prototype instance pointing to the given base type.
    * Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
    * @param {Function} derivedType The derived type (function) that will extend from a base type.
    * @param {Function} baseType The base type (function) to extend to the derived type.
    * @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
    */
    export function __extends<DerivedType extends Function, BaseType extends Function>(derivedType: DerivedType, baseType: BaseType, copyStaticProperties = true): DerivedType {
        if (copyStaticProperties)
            extendStatics(derivedType, baseType);
        // ... create a prototype link for the given type ...
        function __() { this.constructor = derivedType; }
        var newProto: object = baseType === null ? Object.create(baseType) : (__.prototype = baseType.prototype, new (<any>__)());
        // ... copy forward any already defined properties in the derived prototype being replaced, if any, before setting the derived types prototype ...
        for (var p in derivedType.prototype)
            if (derivedType.prototype.hasOwnProperty(p))
                newProto[p] = derivedType.prototype[p];
        // ... set the new prototype ...
        derivedType.prototype = newProto;
        // ... return the extended derived type ...
        return derivedType;
    };

    var __assign = Object.assign || function (t: any) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    function __rest(s: any, e: any) {
        var t = {}, p: any;
        for (p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = <any>Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };

    function __decorate(decorators: any, target: any, key: any, desc: any) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect['decorate'] === "function") r = Reflect['decorate'](decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    function __param(paramIndex: any, decorator: any) {
        return function (target: any, key: any) { decorator(target, key, paramIndex); }
    };

    function __metadata(metadataKey: any, metadataValue: any) {
        if (typeof Reflect === "object" && typeof Reflect['metadata'] === "function") return Reflect['metadata'](metadataKey, metadataValue);
    };

    function __awaiter(thisArg: any, _arguments: any, P: any, generator: any) {
        return new (P || (P = Promise))(function (resolve: any, reject: any) {
            function fulfilled(value: any) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value: any) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result: any) { result.done ? resolve(result.value) : new P(function (resolve: any) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    function __generator(thisArg: any, body: any) {
        var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: <any[]>[], ops: <any[]>[] }, f: any, y: any, t: any, g: any;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n: any) { return function (v: any) { return step([n, v]); }; }
        function step(op: any) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = <any>0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    function __exportStar(m: any, exports: any) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    function __values(o: any) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    function __read(o: object, n?: number) {
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

    function __spread() {
        for (var ar: any[] = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    function __await(v: any): any {
        return this instanceof __await ? (this.v = v, this) : new (<any>__await)(v);
    };

    function __asyncGenerator(thisArg: any, _arguments: any[], generator: any) {
        if (!Symbol['asyncIterator']) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i: any, q: any[] = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol['asyncIterator']] = function () { return this; }, i;
        function verb(n: any) { if (g[n]) i[n] = function (v: any) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n: any, v: any) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r: any) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value: any) { resume("next", value); }
        function reject(value: any) { resume("throw", value); }
        function settle(f: any, v: any) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    function __asyncDelegator(o: any) {
        var i: any, p: any;
        return i = {}, verb("next"), verb("throw", function (e: any) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n: any, f?: any) { i[n] = o[n] ? function (v: any) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    function __asyncValues(o: any) {
        if (!Symbol['asyncIterator']) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol['asyncIterator']], i: any;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol['asyncIterator']] = function () { return this; }, i);
        function verb(n: any) { i[n] = o[n] && function (v: any) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve: any, reject: any, d: any, v: any) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    };

    function __makeTemplateObject(cooked: any, raw: any) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod: any) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    function __importDefault(mod: any) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    /** 
     * Copies over the helper functions to the target and returns the target.
     * 
     * CoreXT contains it's own copies of the TypeScript helper functions to help reduce code size. By default the global scope
     * is not polluted with these functions, but you can call this method (without any arguments) to set the functions on the 
     * global scope.
     * 
     * @param {object} target Allows copying the helper functions to a different object instance other than the global scope.
     */
    export function installTypeScriptHelpers(target: object = global) {
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

    /** 
     * Renders the TypeScript helper references in the 'var a=param['a'],b=param['b'],etc.;' format. This is used mainly when executing scripts wrapped in functions.
     * This format allows declaring local function scope helper variables that simply pull references from a given object
     * passed in to a single function parameter.
     * 
     * Example: eval("function executeTSCodeInFunctionScope(p){"+renderHelperVars("p")+code+"}");
     * 
     * Returns the code to be execute within scope using 'eval()'.
     */
    export function renderHelperVarDeclarations(paramName: string): [string, object] {
        var helpers = installTypeScriptHelpers({});
        var decl = "";
        for (var p in helpers)
            decl += (decl ? "," : "var ") + p + "=" + paramName + "['" + p + "']";
        return [decl + ";", helpers];
    }

    /** 
     * Renders the TypeScript helper references to already existing functions into a string to be executed using 'eval()'. 
     * This format is used mainly to declare helpers at the start of a namespace or function body that simply pull
     * references to the already existing helper functions to help reduce code size.
     * 
     * Example: namespace CoreXT{ eval(renderHelpers()); ...code that may require helpers... }
     * 
     * Returns an array in the [{declarations string}, {helper object}] format.
     */
    export function renderHelpers() {
        return "var __helpers = " + ROOT_NAMESPACE + "." + getFunctionName(renderHelperVarDeclarations) + "('__helpers[1]'); eval(__helpers[0]);";
    }

    // ========================================================================================================================================
}

CoreXT.safeEval = function (exp: string, p0?: any, p1?: any, p2?: any, p3?: any, p4?: any, p5?: any, p6?: any, p7?: any, p8?: any, p9?: any): any { return eval(exp); };
// (note: this allows executing 'eval' outside the private CoreXT scope, but still within a function scope to prevent polluting the global scope,
//  and also allows passing arguments scoped only to the request).

CoreXT.globalEval = function (exp: string): any { return (<any>0, eval)(exp); };
// (note: indirect 'eval' calls are always globally scoped; see more: http://perfectionkills.com/global-eval-what-are-the-options/#windoweval)

namespace CoreXT { // (the core scope)

    eval(renderHelpers());

    /** Set to true if ES2015+ (aka ES6+) is supported in the browser environment ('class', 'new.target', etc.). */
    export var ES6: boolean = (() => { try { return <boolean>globalEval("(function () { return new.target; }, true)"); } catch (e) { return false; } })();

    /** Set to true if ES2015+ (aka ES6+ - i.e. 'class', 'new.target', etc.) was targeted when this CoreXT JS code was transpiled. */
    export var ES6Targeted: boolean = (() => {
        return (class { }).toString() == "class { }"; // (if targeting ES6 in the configuration, 'class' will be output as a function instead)
    })();

    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
      * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
      * 'Environments.Worker'.
      * The core of CoreXT runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since 
      * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
      * For scripts running on the serve side, this will be set to 'Environments.Server'.
      */
    export var Environment = (function (): Environments {
        if (typeof navigator !== 'object') {
            // On the server side, create a basic "shell" to maintain some compatibility with some system functions.
            window = <any>{};
            (<any>window).document = <any>{ title: "SERVER" }
            navigator = <any>{ userAgent: "Mozilla/5.0 (CoreXT) like Gecko" };
            location = <any>{
                hash: "",
                host: "CoreXT.org",
                hostname: "CoreXT.org",
                href: "https://CoreXT.org/",
                origin: "https://CoreXT.org",
                pathname: "/",
                port: "",
                protocol: "https:"
            };
            return Environments.Server;
        } else if (typeof window == 'object' && window.document)
            return Environments.Browser;
        else
            return Environments.Worker;
    })();

    // =======================================================================================================================

    /** Used with 'CoreXT.log(...)' to write to the host console, if available.
      */
    export enum LogTypes { //{ Message, Info, Warning, Error, Debug, Trace }
        /** An important or critical action was a success. */
        Success = -1,
        /** General logging information - nothing of great importance (such as writing messages to developers in the console, or perhaps noting the entry/exit of a section of code), but could be good to know during support investigations. */
        Normal,
        /** An important action has started, or important information must be noted (usually not debugging related, but could be good to know during support investigations). */
        Info,
        /** A warning or non critical error has occurred. */
        Warning,
        /** A error has occurred (usually critical). */
        Error,
        /** Debugging details only. In a live system debugging related log writes are ignored. */
        Debug,
        /** Usually used with more verbose logging to trace execution. In a live system debugging related log writes are ignored. */
        Trace
    }

    /** Logs the message to the console (if available) and returns the message.
      *  By default errors are thrown instead of being returned.  Set 'throwOnError' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {LogTypes} type The type of message to log.
      * @param {boolean} throwOnError If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
    export function log(title: string, message: string, type: LogTypes = LogTypes.Normal, source?: object, throwOnError = true, useLogger = true): string {
        if (title === null && message === null) return null;
        if (title !== null) title = ('' + title).trim();
        if (message !== null) message = ('' + message).trim();
        if (title === "" && message === "") return null;

        if (title && typeof title == 'string') {
            var _title = title; // (modify a copy so we can continue to pass along the unaltered title text)
            if (_title.charAt(title.length - 1) != ":")
                _title += ":";
            var compositeMessage = _title + " " + message;
        }
        else var compositeMessage = message;

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
        else
            if (throwOnError && type == LogTypes.Error)
                throw new Error(compositeMessage);

        return compositeMessage;
    }

    /** Logs the error message to the console (if available) and throws the error.
      *  By default errors are thrown instead of being returned.  Set 'throwException' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {boolean} throwException If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
    export function error(title: string, message: string, source?: object, throwException = true, useLogger = true): string {
        return log(title, message, LogTypes.Error, source, throwException, useLogger);
    }

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
    export function getTypeName(object: object, cacheTypeName = true): string {
        if (object === void 0 || object === null) return void 0;
        typeInfo = <ITypeInfo>object;
        if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
            if (typeof object == 'function')
                if (cacheTypeName)
                    return typeInfo.$__name = getFunctionName(object as Function);
                else
                    return getFunctionName(object as Function);
            var typeInfo = <ITypeInfo><any>object.constructor;
            if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
                if (cacheTypeName)
                    return typeInfo.$__name = getFunctionName(object.constructor);
                else
                    return getFunctionName(object.constructor);
            }
            else
                return typeInfo.$__name;
        }
        else return typeInfo.$__name;
    }

    /** 
     * Returns the full type name of the type or namespace, if available, or the name o the object itself if the full name (with namespaces) is not known. 
     * @see getTypeName()
     */
    export function getFullTypeName(object: object, cacheTypeName = true): string {
        if ((<ITypeInfo>object).$__fullname) return (<ITypeInfo>object).$__fullname;
        return getTypeName(object, cacheTypeName);
    }

    /** Returns true if the given object is empty, or an invalid value (eg. NaN, or an empty object, array, or string). */
    export function isEmpty(obj: any): boolean {
        if (obj === void 0 || obj === null) return true;
        // (note 'DontEnum flag' enumeration bug in IE<9 [on toString, valueOf, etc.])
        if (typeof obj == 'string' || Array.isArray(obj)) return !obj.length;
        if (typeof obj != 'object') return isNaN(obj);
        for (var key in obj)
            if (global.Object.prototype.hasOwnProperty.call(obj, key)) return false;
        return true;
    }

    // =======================================================================================================================

    /**
    * A TypeScript decorator used to seal a function and its prototype. Properties cannot be added, but existing ones can be updated.
    */
    export function sealed<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T {
        if (typeof target == 'object')
            Object.seal(target);
        if (typeof (<Object>target).prototype == 'object')
            Object.seal((<Object>target).prototype);
        return target;
    }

    /**
    * A TypeScript decorator used to freeze a function and its prototype.  Properties cannot be added, and existing ones cannot be changed.
    */
    export function frozen<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T {
        if (typeof target == 'object')
            Object.freeze(target);
        if (typeof (<Object>target).prototype == 'object')
            Object.freeze((<Object>target).prototype);
        return target;
    }

    // =======================================================================================================================
    // Function Parameter Dependency Injection Support
    // TODO: Consider DI support at some point.

    /**
     * A decorator used to add DI information for a function parameter.
     * @param args A list of items which are either fully qualified type names, or references to the type functions.
     * The order specified is important.  A new (transient) or existing (singleton) instance of the first matching type found is returned.
     */
    export function $(...args: (IType<any> | string)[]) { // this is the decorator factory
        return function (target: any, paramName: string, index: number) { // this is the decorator
            var _target = <IFunctionInfo>target;
            _target.$__argumentTypes[index] = args;
        }
    }

    // ========================================================================================================================================

    /** Holds utility methods for type management. All registered types and disposed objects are stored here. */
    export namespace Types {
        /** Returns the root type object from nested type objects. Use this to get the root namespace  */
        export function getRoot(type: ITypeInfo): ITypeInfo {
            var _type: ITypeInfo = type.$__fullname ? type : <any>type['constructor']
            if (_type.$__parent) return getRoot(_type.$__parent);
            return _type;
        }

        /** Holds all the types registered globally by calling one of the 'Types.__register???()' functions. Types are not app-domain specific. */
        export declare var __types: { [fullTypeName: string]: ITypeInfo };
        Object.defineProperty(Types, "__types", { configurable: false, writable: false, value: {} });

        /** Holds all disposed objects that can be reused. */
        export declare var __disposedObjects: { [fulltypename: string]: IDomainObjectInfo[]; }; // (can be reused by any AppDomain instance! [global pool for better efficiency])
        Object.defineProperty(Types, "__disposedObjects", { configurable: false, writable: false, value: {} });

        /** 
         * If true the system will automatically track new objects created under this CoreXT context and store them in 'Types.__trackedObjects'. 
         * The default is false to prevent memory leaks by those unaware of how the CoreXT factory pattern works.
         * Setting this to true (either here or within a specific AppDomain) means you take full responsibility to dispose all objects you create.
         */
        export var autoTrackInstances = false;
        export declare var __trackedObjects: IDisposable[];
        Object.defineProperty(Types, "__trackedObjects", { configurable: false, writable: false, value: [] });

        export declare var __nextObjectID: number; // (incremented automatically for each new object instance)
        var ___nextObjectID = 0;
        Object.defineProperty(Types, "__nextObjectID", { configurable: false, get: () => ___nextObjectID });

        /** Returns 'Types.__nextObjectID' and increments the value by 1. */
        export function getNextObjectId() { return ___nextObjectID++; }

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
        export function __new(this: IFactoryTypeInfo, ...args: any[]): NativeTypes.IObject {
            // ... this is the default 'new' function ...
            // (note: this function may be called with an empty object context [of the expected type] and only one '$__appDomain' property, in which '$__shellType' will be missing)

            if (typeof this != 'function' || !this.init && !this.new)
                error("__new(): Constructor call operation on a non-constructor function.", "Using the 'new' operator is only valid on class and class-factory types. Just call the '{FactoryType}.new()' factory *function* without the 'new' operator.", this);

            var bridge = <System.IADBridge><any>this; // (note: this should be either a bridge, or a class factory object, or undefined)
            var factory = this;
            var classType: IType = factory.$__type;
            var classTypeInfo = <ITypeInfo>classType; // TODO: Follow up: cannot do 'IType & ITypeInfo' and still retain the 'new' signature.

            if (typeof classType != 'function')
                error("__new(): Missing class type on class factory.", "The factory '" + getFullTypeName(factory) + "' is missing the internal '$__type' class reference.", this);

            var appDomain = bridge.$__appDomain || System.AppDomain && System.AppDomain.default || void 0;
            var instance: NativeTypes.IObject & IDomainObjectInfo;
            var isNew = false;

            // ... get instance from the pool (of the same type!), or create a new one ...
            // 
            var fullTypeName = factory.$__fullname; // (the factory type holds the proper full name)
            var objectPool = fullTypeName && __disposedObjects[fullTypeName];

            if (objectPool && objectPool.length)
                instance = objectPool.pop();
            else {
                instance = <any>new classType();
                isNew = true;
            }

            // ... initialize CoreXT and app domain references ...
            instance.$__corext = CoreXT;
            instance.$__id = getNextObjectId();
            if (autoTrackInstances && (!appDomain || appDomain.autoTrackInstances === void 0 || appDomain.autoTrackInstances))
                instance.$__globalId = Utilities.createGUID(false);
            if (appDomain)
                instance.$__appDomain = appDomain;
            if ('$__disposing' in instance) instance.$__disposing = false; // (only reset if exists)
            if ('$__disposed' in instance) instance.$__disposed = false; // (only reset if exists)

            // ... insert [instance, isNew] without having to create a new array ...
            // TODO: Clean up the following when ...rest is more widely supported. Also needs testing to see which is actually more efficient when compiled for ES6.
            if (ES6Targeted) {
                if (typeof this.init == 'function')
                    if (System.Delegate)
                        System.Delegate.fastCall(this.init, this, instance, isNew, ...arguments);
                    else
                        this.init.call(this, instance, isNew, ...arguments);
            } else {
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
        export function __registerFactoryType<TClass extends IType, TFactory extends IType & IFactory, TNamespace extends object>
            (factoryType: TFactory & { $__type: TClass }, namespace: TNamespace, addMemberTypeInfo = true) {

            var classType = <IFactory<TClass> & IClassInfo & IType><any>factoryType.$__type;
            var factoryTypeInfo = <IFactoryTypeInfo><any>factoryType;

            if (typeof factoryType !== 'function')
                error("__registerFactoryType()", "The 'factoryType' argument is not a valid constructor function.", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

            if (typeof namespace != 'object' && typeof namespace != 'function')
                error("__registerFactoryType()", "No namespace was specified for factory type '" + getFullTypeName(factoryType) + "', which is required. If the type is in the global scope, then use 'this' or 'CoreXT.global'.", factoryType);

            if (!(<ITypeInfo>namespace).$__fullname)
                error("__registerFactoryType()", "The specified namespace given for factory type '" + getFullTypeName(factoryType) + "' is not registered. Please call 'namespace()' to register it first (before the factory is defined).", factoryType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

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

            if (typeof factoryType[constructor] == 'function')
                factoryType[constructor].call(classType);

            if (typeof classType[constructor] == 'function')
                classType[constructor](factoryType);

            // ... hook into the 'init' and 'new' factory methods ...
            // (note: if no 'init()' function is specified, just call the base by default)

            if (classType.init)
                error(getFullTypeName(classType), "You cannot create a static 'init' function directly on a class that implements the factory pattern (which could also create inheritance problems).");

            var originalInit = typeof factoryType.init == 'function' ? factoryType.init : null; // (take user defined, else set to null)

            factoryType.init = <any>function _initProxy(this: IFactoryTypeInfo) {
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
                factoryType.new = <any>function _firstTimeNewTest() {
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
        export function __registerType<T extends IType, TParentTypeOrNamespace extends object>(type: T, parentTypeOrNS: TParentTypeOrNamespace, addMemberTypeInfo = true): T {

            var _namespace = <ITypeInfo>parentTypeOrNS;

            if (!_namespace.$__fullname)
                error("Types.__registerType()", "The specified namespace '" + getTypeName(parentTypeOrNS) + "' is not registered.  Please make sure to call 'namespace()' first at the top of namespace scopes before factories and types are defined.", type);

            // ... register the type with the parent namespace ...

            var _type = __registerNamespace(parentTypeOrNS, getTypeName(type));

            // ... scan the type's prototype functions and update the type information (only function names at this time) ...
            // TODO: Consider parsing the function parameters as well and add this information for developers.

            if (addMemberTypeInfo) {
                var prototype = type['prototype'], func: IFunctionInfo;

                for (var pname in prototype)
                    if (pname != 'constructor' && pname != '__proto__') {
                        func = <IFunctionInfo>prototype[pname];
                        if (typeof func == 'function') {
                            func.$__argumentTypes = []; // TODO: Add function parameters if specified as parameter comments.
                            func.$__fullname = _type.$__fullname + ".prototype." + pname;
                            func.$__name = pname;
                            func.$__parent = _type;
                            if (!func.name)
                                (<any>func).name = pname; // (may not be supported or available, so try to set it [normally this is read-only])
                        }
                    }
            }

            // ... register the type ...
            // (all registered type names will be made available here globally, since types are not AppDomain specific)

            __types[_type.$__fullname] = _type;

            return type;
        }

        /**
         * Registers nested namespaces and adds type information.
         * @param {IType} namespaces A list of namespaces to register.
         * @param {IType} type An optional type (function constructor) to specify at the end of the name space list.
         */
        export function __registerNamespace(root: {}, ...namespaces: string[]): ITypeInfo {
            function exception(msg: String) {
                return error("Types.__registerNamespace(" + rootTypeName + ", " + namespaces.join() + ")", "The namespace/type name '" + nsOrTypeName + "' " + msg + "."
                    + " Please double check you have the correct namespace/type names.", root);
            }

            if (!root) root = global;

            var rootTypeName = getTypeName(root);
            var nsOrTypeName = rootTypeName;
            log("Registering namespace for root '" + rootTypeName + "'", namespaces.join());

            var currentNamespace = <INamespaceInfo>root;
            var fullname = (<ITypeInfo>root).$__fullname || "";

            if (root != global && !fullname)
                exception("has not been registered in the type system. Make sure to call 'namespace()' at the top of namespace scopes before defining classes.");

            for (var i = 0, n = namespaces.length; i < n; ++i) {
                nsOrTypeName = namespaces[i];
                var trimmedName = nsOrTypeName.trim();
                if (!nsOrTypeName || !trimmedName) exception("is not a valid namespace name. A namespace must not be empty or only whitespace");
                nsOrTypeName = trimmedName; // (storing the trimmed name at this point allows showing any whitespace-only characters in the error)
                if (root == CoreXT && nsOrTypeName == "CoreXT") exception("is not valid - 'CoreXT' must not exist as a nested name under CoreXT");

                var subNS = <INamespaceInfo>currentNamespace[nsOrTypeName];
                if (!subNS) exception("cannot be found under namespace '" + currentNamespace.$__fullname + "'");

                fullname = fullname ? fullname + "." + nsOrTypeName : nsOrTypeName;

                subNS.$__parent = <INamespaceInfo>currentNamespace; // (each namespace will have a reference to its parent namespace [object], and its local and full type names; note: the CoreXT parent will be pointing to 'CoreXT.global')
                subNS.$__name = nsOrTypeName; // (the local namespace name)
                subNS.$__fullname = fullname; // (the fully qualified namespace name for this namespace)
                (currentNamespace.$__namespaces || (currentNamespace.$__namespaces = [])).push(subNS);

                currentNamespace = subNS;
            }

            log("Registered namespace for root '" + rootTypeName + "'", fullname, LogTypes.Info);

            return currentNamespace;
        }

        var __nonDisposableProperties = <IDomainObjectInfo>{
            $__globalId: <any>true,
            $__appDomain: <any>true,
            $__disposing: true,
            $__disposed: true,
            dispose: <any>false
        };

        export function __disposeValidate(object: IDisposable, title: string, source?: any) {
            if (typeof object != 'object') error(title, "The argument given is not an object.", source);
            if (!object.$__corext) error(title, "The object instance '" + getFullTypeName(object) + "' is not a CoreXT created object.", source);
            if (object.$__corext != CoreXT) error(title, "The object instance '" + getFullTypeName(object) + "' was created in a different CoreXT instance and cannot be disposed by this one.", source); // (if loaded as a module perhaps, where other instance may exist [just in case])
            if (typeof object.dispose != 'function') error(title, "The object instance '" + getFullTypeName(object) + "' does not contain a 'dispose()' function.", source);
            if (!isDisposable(object)) error(title, "The object instance '" + getFullTypeName(object) + "' is not disposable.", source);
        }

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
        export function dispose(object: IDisposable, release: boolean = true): void {
            var _object: IDomainObjectInfo = <any>object;

            __disposeValidate(_object, "dispose()", Types);

            if (_object !== void 0) {
                // ... remove the object from the app domain "active" list and then erase it ...

                var appDomain = _object.$__appDomain;

                if (appDomain && !_object.$__disposing) { // (note: '$__disposing' is set to 'true' when '{AppDomain}.dispose()' is called; otherwise they did not call it via the domain instance)
                    appDomain.dispose(_object, release);
                    return;
                }

                Utilities.erase(object, __nonDisposableProperties);

                _object.$__disposing = false;
                _object.$__disposed = true;

                if (release) {
                    // ... place the object into the disposed objects list ...

                    var type: ITypeInfo = <any>_object.constructor;

                    if (!type.$__fullname)
                        error("dispose()", "The object type is not registered.  Please see one of the AppDomain 'registerClass()/registerType()' functions for more details.", object);

                    var disposedObjects = __disposedObjects[type.$__fullname];

                    if (!disposedObjects)
                        __disposedObjects[type.$__fullname] = disposedObjects = [];

                    disposedObjects.push(_object);
                }
            }
        }
    }

    export interface IClassFactory { }

    /** A 'Disposable' base type that implements 'IDisposable', which is the base for all CoreXT objects that can be disposed. */
    export class Disposable implements IDisposable {
        /** 
         * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
         * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
         * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
         *                          false to request that child objects remain connected after disposal (not released). This
         *                          can allow quick initialization of a group of objects, instead of having to pull each one
         *                          from the object pool each time.
         */
        dispose(release?: boolean): void { Types.dispose(this, release); }
    }

    /** Returns true if the specified object can be disposed using this CoreXT system. */
    export function isDisposable(instance: IDisposable) {
        if (instance.$__corext != CoreXT) return false;
        return typeof instance.dispose == 'function';
    }

    /** Returns true if the given type (function) represents a primitive type constructor. */
    export function isPrimitiveType(o: object) {
        var symbol = typeof Symbol != 'undefined' ? Symbol : Object; // (not supported in IE11)
        return (<object>o == Object || <object>o == Array || <object>o == Boolean || <object>o == String
            || <object>o == Number || <object>o == symbol || <object>o == Function || <object>o == Date
            || <object>o == RegExp || <object>o == Error);
    }

    /** 
     * Creates a 'Disposable' type from another base type. This is primarily used to extend primitive types.
     * Note: These types are NOT instances of 'CoreXT.Disposable', since they must have prototype chains that link to other base types.
     * @param {TBaseClass} baseClass The base class to inherit from.
     * @param {boolean} isPrimitiveOrHostBase Set this to true when inheriting from primitive types. This is normally auto-detected, but can be forced in cases
     * where 'new.target' (ES6) prevents proper inheritance from host system base types that are not primitive types.
     * This is only valid if compiling your .ts source for ES5 while also enabling support for ES6 environments. 
     * If you compile your .ts source for ES6 then the 'class' syntax will be used and this value has no affect.
     */
    export function DisposableFromBase<TBaseClass extends IType=ObjectConstructor>(baseClass: TBaseClass, isPrimitiveOrHostBase?: boolean) {
        if (!baseClass) {
            baseClass = <any>global.Object;
            isPrimitiveOrHostBase = true;
        }
        else if (typeof isPrimitiveOrHostBase == 'undefined') isPrimitiveOrHostBase = isPrimitiveType(baseClass);

        var cls = class Disposable extends baseClass implements IDisposable {
            /**
            * Don't create objects using the 'new' operator. Use '{NameSpaces...ClassType}.new()' static methods instead.
            */
            constructor(...args: any[]) {
                if (!ES6Targeted && isPrimitiveOrHostBase)
                    eval("var _super = function() { return null; };"); // (ES6 fix for extending built-in types [calling constructor not supported prior] when compiling for ES5; more details on it here: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work)
                super();
            }
            /** 
            * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
            * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
            * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
            *                          false to request that child objects remain connected after disposal (not released). This
            *                          can allow quick initialization of a group of objects, instead of having to pull each one
            *                          from the object pool each time.
            */
            dispose(release?: boolean): void { }
        }
        cls.prototype.dispose = CoreXT.Disposable.prototype.dispose; // (make these functions both the same function reference by default)
        return cls;
    }

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

    export function FactoryType<TBaseFactory extends IType>(baseFactory?: { $__type: TBaseFactory }) {
        return baseFactory.$__type;
    }

    /** 
     * Builds and returns a base type to be used with creating type factories. This function stores some type
     * information in static properties for reference.
     * @param {TBaseFactory} baseFactoryType The factory that this factory type derives from.
     * @param {TBaseType} staticBaseClass An optional base type to inherit static types from.
    */
    export function FactoryBase<TBaseFactory extends IFactory, TBaseType extends IType = new () => object>
        (baseFactoryType?: TBaseFactory, staticBaseClass?: TBaseType) {

        if (typeof staticBaseClass != 'function')
            staticBaseClass = <any>global.Object;

        var cls = class FactoryBase extends staticBaseClass {
            /** The underlying type associated with this factory type. */
            static $__type: IType;

            /** Set to true when the object is being disposed. By default this is undefined.  This is only set to true when 'dispose()' is first call to prevent cyclical calls. */
            $__disposing?: boolean;
            /** Set to true once the object is disposed. By default this is undefined, which means "not disposed".  This is only set to true when disposed, and false when reinitialized. */
            $__disposed?: boolean;

            /** References the base factory. */
            static get super(): TBaseFactory { return baseFactoryType || void 0; } // ('|| void 0' keeps things consistent in case 'null' is given)

            static 'new'?(...args: any[]): any;
            static init?(o: object, isnew: boolean, ...args: any[]): void;

            /**
              * Don't create objects using the 'new' operator. Use '{NameSpaces...ClassType}.new()' static methods instead.
              */
            constructor(...args: any[]) {
                error("FactoryBase", "You cannot create instances of factory types.");
                super();
            }

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
            static $__register<TClass extends IType, TFactory extends IFactory & IType>(this: TFactory & ITypeInfo & { $__type: TClass },
                namespace: object, addMemberTypeInfo = true): TFactory {
                return Types.__registerFactoryType(this, namespace, addMemberTypeInfo);
            }
        };
        (<IClassInfo><any>cls).$__baseFactoryType = <any>baseFactoryType;
        return cls;
    }
    // (call with context vs context as arg?: https://jsperf.com/call-this-vs-this-as-argument/1)

    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<Z extends keyof T, T extends object = typeof CoreXT.global>(firstNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, Z extends keyof T[A], T extends object = typeof CoreXT.global>(ns1: A, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, B extends keyof T[A], Z extends keyof T[A][B], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], Z extends keyof T[A][B][C], T extends object = typeof CoreXT>(ns1: A, ns2?: B, ns3?: C, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], Z extends keyof T[A][B][C][D], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], Z extends keyof T[A][B][C][D][E], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], Z extends keyof T[A][B][C][D][E][F], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], Z extends keyof T[A][B][C][D][E][F][G], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], H extends keyof T[A][B][C][D][E][F][G], Z extends keyof T[A][B][C][D][E][F][G][H], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, ns8?: H, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], H extends keyof T[A][B][C][D][E][F][G], I extends keyof T[A][B][C][D][E][F][G][H], Z extends keyof T[A][B][C][D][E][F][G][H][I], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, ns8?: H, ns9?: I, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], H extends keyof T[A][B][C][D][E][F][G], I extends keyof T[A][B][C][D][E][F][G][H], J extends keyof T[A][B][C][D][E][F][G][H][I], Z extends keyof T[A][B][C][D][E][F][G][H][I][J]= any, T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, ns8?: H, ns9?: I, ns10?: J, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. 
     * @param {function} namespacePathSelector A selector in the format '()=>A.B.C' or 'function(){A.B.C}' that specifies the FULL namespace path from the root object on global.
     */
    export function namespace(namespacePathSelector: () => object, root?: object): void;
    export function namespace(...args: any[]): void {
        if (typeof args[0] == 'function') {
            var root = args.length >= 2 ? args[args.length - 1] || global : global;
            if (typeof root != 'object' && typeof root != 'function') root = global;
            var items = nameof(args[0], true).split('.');
            if (!items.length) error("namespace()", "A valid namespace path selector function was expected (i.e. '()=>First.Second.Third.Etc').");
            Types.__registerNamespace(root, ...items);
        } else {
            var root = args[args.length - 1];
            var lastIndex = (typeof root == 'object' || typeof root == 'function' ? args.length - 1 : (root = global, args.length));
            Types.__registerNamespace(root, ...global.Array.prototype.slice.call(arguments, 0, lastIndex));
        }
    }

    namespace("CoreXT", "Types"); // ('CoreXT.Types' will become the first registered namespace)

    // ========================================================================================================================================

    interface _IError {
        name: string;
        functionName: string; // (CoreXT: Scripts.ScriptError)
        message: string;
        reason: string; // (for promises)
        type: string; // (for basic error events inheriting from the base Error type)
        stack: string; // (in opera, this is a call stack only [no source and line details], and includes function names and args)
        stacktrace: string; // (opera - includes source and line info)
        lineNumber: number; // (Firefox)
        lineno: number; // (Firefox)
        columnNumber: number; // (Firefox)
        colno: number; // (ErrorEvent)
        fileName: string; // (Firefox)
        filename: string; // (ErrorEvent)
        url: string; // (just in case)
        error: string | Error; // (ErrorEvent)
    }

    /** Returns the call stack for a given error object. */
    export function getErrorCallStack(errorSource: { stack?: string }): string[] {
        if (!errorSource || !errorSource.stack) return [];
        var _e: _IError = <any>errorSource;
        if (_e.stacktrace && _e.stack) return _e.stacktrace.split(/\n/g); // (opera provides one already good to go) [note: can also check for 'global["opera"]']
        var callstack: string[] = [];
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

    /** Returns the message of the specified error source by returning either 'errorSource' if it's a string, a formatted LogItem object,
      * a formatted Exception or Error object, or 'errorSource.message' if the source is an object with a 'message' property.
      */
    export function getErrorMessage(errorSource: any): string { // TODO: Test how this works with the logging system items.
        if (typeof errorSource == 'string')
            return errorSource;
        else if (typeof errorSource == 'object') {
            if (System && System.Diagnostics && System.Diagnostics.LogItem && errorSource instanceof System.Diagnostics.LogItem.$__type) {
                return errorSource.toString();
            } else if ('message' in errorSource) { // (this should support both 'Exception' AND 'Error' objects)
                var errorInfo: _IError = errorSource;
                var error: Error = errorSource instanceof Error ? errorSource : errorSource instanceof ErrorEvent ? errorSource.error : null;
                var msg = '' + (Scripts && Scripts.ScriptError && (errorSource instanceof Scripts.ScriptError)
                    ? errorSource.error && errorSource.error.message || errorSource.error && errorInfo.error : (errorInfo.message || errorInfo.reason || errorInfo.type));
                var fname = errorInfo instanceof Function ? getTypeName(errorInfo, false) : errorInfo.functionName;
                var sourceLocation = errorInfo.fileName || errorInfo.filename || errorInfo.url;
                if (fname) msg = "(" + fname + ") " + msg;
                var lineno = errorInfo.lineno !== void 0 ? errorInfo.lineno : errorInfo.lineNumber;
                var colno = errorInfo.colno !== void 0 ? errorInfo.colno : errorInfo.columnNumber;
                if (lineno !== void 0) {
                    msg += "\r\non line " + lineno + ", column " + colno;
                    if (sourceLocation !== void 0)
                        msg += ", of file '" + sourceLocation + "'";
                } else if (sourceLocation !== void 0)
                    msg += "\r\nin file '" + sourceLocation + "'";
                var stack = getErrorCallStack(error);
                if (stack && stack.length)
                    msg += "\r\nStack trace:\r\n" + stack.join("\r\n") + "\r\n";
                return msg;
            }
            else
                return '' + errorSource;
        } else
            return '' + errorSource;
    }

    // ========================================================================================================================================

    // ... polyfill some XHR 'readyState' constants ...

    if (!XMLHttpRequest.DONE) {
        (<any>XMLHttpRequest).UNSENT = 0;
        (<any>XMLHttpRequest).OPENED = 1;
        (<any>XMLHttpRequest).HEADERS_RECEIVED = 2;
        (<any>XMLHttpRequest).LOADING = 3;
        (<any>XMLHttpRequest).DONE = 4;
    }

    /** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
    /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceExtensions' as well implicitly. */
    export enum ResourceTypes { // (http://en.wikipedia.org/wiki/Internet_media_type)
        // Application
        Application_Script = <any>"application/javascript", // (note: 'text/javascript' is most common, but is obsolete)
        Application_ECMAScript = <any>"application/ecmascript",
        Application_JSON = <any>"application/json",
        Application_ZIP = <any>"application/zip",
        Application_GZIP = <any>"application/gzip",
        Application_PDF = <any>"application/pdf",
        Application_DefaultFormPost = <any>"application/x-www-form-urlencoded",
        Application_TTF = <any>"application/x-font-ttf",
        // Multipart
        Multipart_BinaryFormPost = <any>"multipart/form-data",
        // Audio
        AUDIO_MP4 = <any>"audio/mp4",
        AUDIO_MPEG = <any>"audio/mpeg",
        AUDIO_OGG = <any>"audio/ogg",
        AUDIO_AAC = <any>"audio/x-aac",
        AUDIO_CAF = <any>"audio/x-caf",
        // Image
        Image_GIF = <any>"image/gif",
        Image_JPEG = <any>"image/jpeg",
        Image_PNG = <any>"image/png",
        Image_SVG = <any>"image/svg+xml",
        Image_GIMP = <any>"image/x-xcf",
        // Text
        Text_CSS = <any>"text/css",
        Text_CSV = <any>"text/csv",
        Text_HTML = <any>"text/html",
        Text_Plain = <any>"text/plain",
        Text_RTF = <any>"text/rtf",
        Text_XML = <any>"text/xml",
        Text_JQueryTemplate = <any>"text/x-jquery-tmpl",
        Text_MarkDown = <any>"text/x-markdown",
        // Video
        Video_AVI = <any>"video/avi",
        Video_MPEG = <any>"video/mpeg",
        Video_MP4 = <any>"video/mp4",
        Video_OGG = <any>"video/ogg",
        Video_MOV = <any>"video/quicktime",
        Video_WMV = <any>"video/x-ms-wmv",
        Video_FLV = <any>"video/x-flv"
    }

    /** A map of popular resource extensions to resource enum type names.
      * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
      * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
      * Example 3: CoreXT.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
      * Example 4: CoreXT.Loader.getResourceTypeFromExtension(".js");
      */
    /* NOTE: The enums entries MUST be prefixed with '<any>' in order for this mapping to work with 'ResourceTypes' as well implicitly. */
    export enum ResourceExtensions { // (http://tools.ietf.org/html/rfc4329#page-12)
        Application_Script = <any>".js", // (note: 'text/javascript' is most common, but is obsolete)
        Application_ECMAScript = <any>".es",
        Application_JSON = <any>".json",
        Application_ZIP = <any>".zip",
        Application_GZIP = <any>".gz",
        Application_PDF = <any>".pdf",
        Application_TTF = <any>".ttf",
        // Audio
        AUDIO_MP4 = <any>".mp4",
        AUDIO_MPEG = <any>".mpeg",
        AUDIO_OGG = <any>".ogg",
        AUDIO_AAC = <any>".aac",
        AUDIO_CAF = <any>".caf",
        // Image
        Image_GIF = <any>".gif",
        Image_JPEG = <any>".jpeg",
        Image_PNG = <any>".png",
        Image_SVG = <any>".svg",
        Image_GIMP = <any>".xcf",
        // Text
        Text_CSS = <any>".css",
        Text_CSV = <any>".csv",
        Text_HTML = <any>".html",
        Text_Plain = <any>".txt",
        Text_RTF = <any>".rtf",
        Text_XML = <any>".xml",
        Text_JQueryTemplate = <any>".tpl.htm", // (http://encosia.com/using-external-templates-with-jquery-templates/) Note: Not standard!
        Text_MarkDown = <any>".markdown", // (http://daringfireball.net/linked/2014/01/08/markdown-extension)
        // Video
        Video_AVI = <any>".avi",
        Video_MPEG = <any>".mpeg",
        Video_MP4 = <any>".mp4",
        Video_OGG = <any>".ogg",
        Video_MOV = <any>".qt",
        Video_WMV = <any>".wmv",
        Video_FLV = <any>".flv"
    }
    (<any>ResourceExtensions)[<any>'.tpl.html'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)
    (<any>ResourceExtensions)[<any>'.tpl'] = ResourceExtensions[ResourceExtensions.Text_JQueryTemplate]; // (map to the same 'Text_JQueryTemplate' target)

    /** Return the resource (MIME) type of a given extension (with or without the period). */
    export function getResourceTypeFromExtension(ext: string): ResourceTypes;
    /** Return the resource (MIME) type of a given extension type. */
    export function getResourceTypeFromExtension(ext: ResourceExtensions): ResourceTypes;
    export function getResourceTypeFromExtension(ext: any): ResourceTypes {
        if (ext === void 0 || ext === null) return void 0;
        var _ext = "" + ext; // (make sure it's a string)
        if (_ext.charAt(0) != '.') _ext = '.' + _ext; // (a period is required)
        return <any>ResourceTypes[<any>ResourceExtensions[ext]];
    }

    export enum RequestStatuses {
        /** The request has not been executed yet. */
        Pending,
        /** The resource failed to load.  Check the request object for the error details. */
        Error,
        /** The requested resource is loading. */
        Loading,
        /** The requested resource has loaded (nothing more). */
        Loaded,
        /** The requested resource is waiting on parent resources to complete. */
        Waiting,
        /** The requested resource is ready to be used. */
        Ready,
        /** The source is a script, and was executed (this only occurs on demand [not automatic]). */
        Executed,
    }

    // ------------------------------------------------------------------------------------------------------------------------

    /** 
     * Returns true if the URL contains the specific action and controller names at the end of the URL path. 
     * This of course assumes typical routing patterns in the format '/controller/action' or '/area/controller/action'.
     */
    export function isPage(action: string, controller = "home", area = "") {
        var regexStr = "\/" + action + "(?:\/?[?&#]|$)";
        if (controller) regexStr = "\/" + controller + regexStr;
        if (area) regexStr = "\/" + area + regexStr;
        return new RegExp(regexStr, "gi").test(location.pathname);
    }

    // ------------------------------------------------------------------------------------------------------------------------

    /**
     * Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups], where
     * 'groups' index 0 is the full matched text, and 1 onwards are any matched groups).
     */
    export function matches(regex: RegExp, text: string): string[][] {
        var matchesFound: string[][] = [], result: RegExpExecArray;
        if (!regex.global) throw new Error("The 'global' flag is required in order to find all matches.");
        regex.lastIndex = 0;
        while ((result = regex.exec(text)) !== null)
            matchesFound.push(result.slice());
        return matchesFound;
    }

    // ------------------------------------------------------------------------------------------------------------------------

    /** Used to strip out script source mappings. Used with 'extractSourceMapping()'. */
    export var SCRIPT_SOURCE_MAPPING_REGEX = /^\s*(\/\/[#@])\s*([A-Za-z0-9$_]+)\s*=\s*([^;/]*)(.*)/gim;

    /** Holds details on extract script pragmas. @See extractPragmas() */
    export class PragmaInfo {
        /**
         * @param {string} prefix The "//#" part.
         * @param {string} name The pragma name, such as 'sourceMappingURL'.
         * @param {string} value The part after "=" in the pragma expression.
         * @param {string} extras Any extras on the line (like comments) that are not part of the extracted value.
         */
        constructor(public prefix: string, public name: string, public value: string, public extras: string) {
            this.prefix = (this.prefix || "").trim().replace("//@", "//#"); // ('@' is depreciated in favor of '#' because of conflicts with IE, so help out by making this correction automatically)
            this.name = (this.name || "").trim();
            this.value = (this.value || "").trim();
            this.extras = (this.extras || "").trim();
        }
        /**
         * Make a string from this source map info.
         * @param {string} valuePrefix An optional string to insert before the value, such as a sub-directory path, or missing protocol+server+port URL parts, etc.
         * @param {string} valueSuffix An optional string to insert after the value.
         */
        toString(valuePrefix?: string, valueSuffix?: string) {
            if (valuePrefix !== void 0 && valuePrefix !== null && typeof valuePrefix != 'string') valuePrefix = '' + valuePrefix;
            if (valueSuffix !== void 0 && valuePrefix !== null && typeof valueSuffix != 'string') valueSuffix = '' + valueSuffix;
            return this.prefix + " " + this.name + "=" + (valuePrefix || "") + this.value + (valueSuffix || "") + this.extras;
        } // (NOTE: I space after the prefix IS REQUIRED [at least for IE])
        valueOf() { return this.prefix + " " + this.name + "=" + this.value + this.extras; }
    }

    /** @See extractPragmas() */
    export interface IExtractedPragmaDetails {
        /** The original source given to the function. */
        originalSource: string;
        /** The original source minus the extracted pragmas. */
        filteredSource: string;
        /** The extracted pragma information. */
        pragmas: PragmaInfo[];
    }

    /** 
     * Extract any pragmas, such as source mapping. This is used mainly with XHR loading of scripts in order to execute them with
     * source mapping support while being served from a CoreXT .Net Core MVC project.
     */
    export function extractPragmas(src: string) {
        var srcMapPragmas: PragmaInfo[] = [], result: RegExpExecArray, filteredSrc = src;
        SCRIPT_SOURCE_MAPPING_REGEX.lastIndex = 0;
        while ((result = SCRIPT_SOURCE_MAPPING_REGEX.exec(src)) !== null) {
            var srcMap = new PragmaInfo(result[1], result[2], result[3], result[4]);
            srcMapPragmas.push(srcMap);
            filteredSrc = filteredSrc.substr(0, result.index) + filteredSrc.substr(result.index + result[0].length);
        }
        return <IExtractedPragmaDetails>{
            /** The original source given to the function. */
            originalSource: src,
            /** The original source minus the extracted pragmas. */
            filteredSource: filteredSrc,
            /** The extracted pragma information. */
            pragmas: srcMapPragmas
        };
    }

    /** 
     * Returns the base path based on the resource type.  
     */
    export function basePathFromResourceType(resourceType: string | ResourceTypes) {
        return (resourceType == ResourceTypes.Application_Script || resourceType == ResourceTypes.Application_ECMAScript) ? baseScriptsURL :
            resourceType == ResourceTypes.Text_CSS ? baseCSSURL : baseURL;
    }

    /** 
     * Converts the given value to a string and returns it.  'undefined' (void 0) and null become empty, string types are
     * returned as is, and everything else will be converted to a string by calling 'toString()', or simply '""+value' if
     * 'value.toString' is not a function. If for some reason a call to 'toString()' does not return a string the cycle
     * starts over with the new value until a string is returned.
     * Note: If no arguments are passed in (i.e. 'CoreXT.toString()'), then CoreXT.ROOT_NAMESPACE is returned, which should be the string "CoreXT".
     */
    export function toString(value?: any): string {
        if (arguments.length == 0) return ROOT_NAMESPACE;
        if (value === void 0 || value === null) return "";
        if (typeof value == 'string') return value;
        return typeof value.toString == 'function' ? toString(value.toString()) : "" + value;
    }

    /** The System module is the based module for most developer related API operations, and is akin to the 'System' .NET namespace. */
    export namespace System {
        /** This namespace contains types and routines for data communication, URL handling, and page navigation. */
        export namespace IO {
            /** Path/URL based utilities. */
            export namespace Path {
                namespace(() => CoreXT.System.IO.Path);
                // ==========================================================================================================================

                /** Parses the URL into 1: protocol (without '://'), 2: username, 3: password, 4: host, 5: port, 6: path, 7: query (without '?'), and 8: fragment (without '#'). */
                export var URL_PARSER_REGEX = /^[\t\f\v ]*(?:(?:(?:(\w+):\/\/|\/\/)(?:(.*?)(?::(.*?))?@)?([^#?/:~\r\n]*))(?::(\d*))?)?([^#?\r\n]+)?(?:\?([^#\r\n]*))?(?:\#(.*))?/m;
                // (testing: https://regex101.com/r/8qnEdP/5)

                /** The result of 'Path.parse()', and also helps building URLs manually. */
                export class Uri { // TODO: Make URL builder?
                    constructor(
                        /** Protocol (without '://'). */
                        public protocol?: string,
                        /** URL host. */
                        public hostName?: string,
                        /** Host port. */
                        public port?: string,
                        /** URL path. */
                        public path?: string,
                        /** Query (without '?'). */
                        public query?: string,
                        /** Fragment (without '#'). */
                        public fragment?: string,
                        /** A username for login. Note: Depreciated, as stated in RFC 3986 3.2.1. */
                        public username?: string, // (see also: https://goo.gl/94ivpK)
                        /** A password for login (not recommended!). Note: Depreciated, as stated in RFC 3986 3.2.1. */
                        public password?: string) {

                        if (typeof protocol != 'string') protocol = CoreXT.toString(protocol);
                        if (typeof hostName != 'string') hostName = CoreXT.toString(hostName);
                        if (typeof port != 'string') port = CoreXT.toString(port);
                        if (typeof path != 'string') path = CoreXT.toString(path);
                        if (typeof query != 'string') query = CoreXT.toString(query);
                        if (typeof fragment != 'string') fragment = CoreXT.toString(fragment);
                        if (typeof username != 'string') username = CoreXT.toString(username);
                        if (typeof password != 'string') password = CoreXT.toString(password);
                    }

                    /** Returns only  host + port parts combined. */
                    host() { return "" + (this.username ? this.username + (this.password ? ":" + this.password : "") + "@" : "") + (this.hostName || "") + (this.port ? ":" + this.port : ""); }

                    /** Returns only the protocol + host + port parts combined. */
                    origin() {
                        var p = this.protocol ? this.protocol + ":" : "", h = this.host();
                        return p + (h || p ? "//" + h + "/" : "");
                    }

                    /**
                       * Builds the full URL from the parts specified in this instance while also allowing to override parts.
                       * @param {string} origin An optional origin that replaces the protocol+host+port part.
                       * @param {string} path An optional path that replaces the current path property value on this instance.
                       * @param {string} query An optional query that replaces the current query property value on this instance.
                       * This value should not start with a '?', but if exists will be handled correctly.
                       * @param {string} fragment An optional fragment that replaces the current fragment property value on this instance.
                       * This value should not start with a '#', but if exists will be handled correctly.
                       */
                    toString(origin?: string, path?: string, query?: string, fragment?: string) {
                        // TODO: consider an option to auto-removed default ports based on protocols.
                        origin = origin && toString(origin) || this.origin();
                        path = path && toString(path) || this.path;
                        query = query && toString(query) || this.query;
                        fragment = fragment && toString(fragment) || this.fragment;
                        if (query.charAt(0) == '?') query = query.substr(1);
                        if (fragment.charAt(0) == '#') fragment = fragment.substr(1);
                        return combine(origin, path) + (query ? "?" + query : "") + (fragment ? "#" + fragment : "");
                    }

                    /** 
                       * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
                       * the path to the resource (minus the resource name part).
                       * For example, if the path is 'a/b/c' or 'a/b/c.ext' (etc.) then 'a/b/' is returned.
                       * This is useful to help remove resource names, such as file names, from the end of a URL path.
                       * @param {string} resourceName An optional resource name to append to the end of the resulting path.
                       */
                    getResourcePath(resourceName?: string) {
                        var m = (this.path || "").match(/.*[\/\\]/);
                        return (m && m[0] || "") + (resourceName !== void 0 && resourceName !== null ? toString(resourceName) : "");
                    }

                    /** 
                       * Assuming 'this.path' represents a path to a resource where the resource name is at the end of the path, this returns
                       * the path to the resource (minus the resource name part), and optionally appends a new 'resourceName' value.
                       * For example, if the current Uri represents 'http://server/a/b/c?a=b#h' or 'http://server/a/b/c.ext?a=b#h' (etc.), and
                       * 'resourceName' is "x", then 'http://server/a/b/x?a=b#h' is returned.
                       * This is useful to help remove resource names, such as file names, from the end of a URL path.
                       * @param {string} resourceName An optional name to append to the end of the resulting path.
                       */
                    getResourceURL(resourceName?: string) { return this.toString(void 0, this.getResourcePath(resourceName)); }

                    /** Returns a new Uri object that represents the 'window.location' object values. */
                    static fromLocation() {
                        return new Uri(
                            location.protocol,
                            location.hostname,
                            location.port,
                            location.pathname,
                            location.search.substr(1),
                            location.hash.substr(1),
                            (<any>location).username,
                            (<any>location).password
                        );
                    }
                }

                /** Parses the URL into 1: protocol (without '://'), 2: host, 3: port, 4: path, 5: query (without '?'), and 6: fragment (without '#'). */
                export function parse(url: string) {
                    if (typeof url != 'string') url = toString(url);
                    var m = url.match(URL_PARSER_REGEX);
                    return m && new Uri(
                        (m[1] || "").trim(),
                        (m[4] || "").trim(),
                        (+(m[5] || "").trim() || "").toString(),
                        (m[6] || "").trim(),
                        (m[7] || "").trim(),
                        (m[8] || "").trim(),
                        (m[2] || "").trim(),
                        (m[3] || "").trim()
                    ) || // (just in case it fails somehow...)
                        new Uri(void 0, void 0, void 0, url); // (returns the url as is if this is not a proper absolute path)
                }

                /**
                   * Appends 'path2' to 'path1', inserting a path separator character (/) if required.
                   * Set 'normalizePathSeparators' to true to normalize any '\' path characters to '/' instead.
                   */
                export function combine(path1: string, path2: string, normalizePathSeparators = false): string {
                    if (typeof path1 != 'string') path1 = toString(path1);
                    if (typeof path2 != 'string') path2 = toString(path2);
                    if (path2.charAt(0) == '~') path2 = path2.substr(1);
                    if (!path2) return path1;
                    if (!path1) return path2;
                    if (path1.charAt(path1.length - 1) != '/' && path1.charAt(path1.length - 1) != '\\') path1 += '/';
                    var combinedPath = path1 + ((path2.charAt(0) == '/' || path2.charAt(0) == '\\') ? path2.substr(1) : path2);
                    return normalizePathSeparators ? combinedPath.split('\\').join('/') : combinedPath;
                }

                /** Returns the protocol + host + port parts of the given absolute URL. */
                export function getRoot(absoluteURL: string | Uri) {
                    return (absoluteURL instanceof Uri ? absoluteURL : parse(absoluteURL)).origin();
                }

                /** 
                   * Combines a path with either the base site path or a current alternative path. The following logic is followed for combining 'path':
                   * 1. If it starts with '~/' or '~' is will be relative to 'baseURL'.
                   * 2. If it starts with '/' it is relative to the server root 'protocol://server:port' (using current or base path, but with the path part ignored).
                   * 3. If it starts without a path separator, or is empty, then it is combined as relative to 'currentResourceURL'.
                   * Note: if 'currentResourceURL' is empty, then 'baseURL' is assumed.
                   * @param {string} currentResourceURL An optional path that specifies a resource location to take into consideration when resolving relative paths.
                   * If not specified, this is 'location.href' by default.
                   * @param {string} baseURL An optional path that specifies the site's root URL.  By default this is 'CoreXT.baseURL'.
                   */
                export function resolve(path: string, currentResourceURL = location.href, baseURL = CoreXT.baseURL) {
                    baseURL = toString(baseURL).trim();
                    currentResourceURL = toString(currentResourceURL).trim();
                    if (currentResourceURL) currentResourceURL = parse(currentResourceURL).getResourceURL();
                    path = toString(path).trim();
                    if (!path) return currentResourceURL || baseURL;
                    if (path.charAt(0) == '/' || path.charAt(0) == '\\') {
                        // ... resolve to the root of the host; determine current or base, whichever is available ...
                        var parts = currentResourceURL && parse(currentResourceURL) || null;
                        if (parts && (parts.protocol || parts.hostName))
                            return combine(getRoot(parts), path);
                        else
                            return combine(getRoot(baseURL), path);
                    }
                    if (path.charAt(0) == '~') return combine(baseURL, path);
                    // ... check if path is already absolute with a protocol ...
                    var parts = parse(path);
                    if (parts.protocol || parts.hostName) return path; // (already absolute)
                    return combine(currentResourceURL || baseURL, path);
                }
                // TODO: Consider 'absolute()' function to resolve '..' in paths. Resolve the URL first, then modify the final path.

                /** Fixes a URL by splitting it apart, trimming it, then recombining it along with a trailing forward slash (/) at the end. */
                export function fix(url: string): string {
                    return parse(url).toString();
                }

                // ===================================================================================================================

                /** Returns true if the specified extension is missing from the end of 'pathToFile'.
                  * An exception is made if special characters are detected (such as "?" or "#"), in which case true is always returned, as the resource may be returned
                  * indirectly via a server side script, or handled in some other special way).
                  * @param {string} ext The extension to check for (with or without the preceding period [with preferred]).
                  */
                export function hasFileExt(pathToFile: string, ext: string): boolean {
                    if (ext.length > 0 && ext.charAt(0) != '.') ext = '.' + ext;
                    return pathToFile.lastIndexOf(ext) == pathToFile.length - ext.length || pathToFile.indexOf("?") >= 0 || pathToFile.indexOf("#") >= 0;
                }

                // ===================================================================================================================

                export var QUERY_STRING_REGEX: RegExp = /[?|&][a-zA-Z0-9-._]+(?:=[^&#$]*)?/gi;

                /** 
                  * Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
                  * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
                  * with all values escaped and ready to be appended to a URI.
                  * Note: Call 'Query.new()' to create new instances.
                  */
                export class Query extends FactoryBase() {
                    /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                       * @param {string|object} query A full URI string, a query string (such as 'location.search'), or an object to create query values from.
                       * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                       */
                    static 'new': (query?: string | object, makeNamesLowercase?: boolean) => IQuery;
                    /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                       * @param {string|object} query A full URI string, a query string (such as 'location.search'), or an object to create query values from.
                       * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                       */
                    static init: (o: IQuery, isnew: boolean, query?: string | object, makeNamesLowercase?: boolean) => void;
                }
                export namespace Query {
                    export class $__type extends Disposable {
                        // ----------------------------------------------------------------------------------------------------------------

                        values: { [index: string]: string } = {};

                        // ----------------------------------------------------------------------------------------------------------------

                        /** 
                            * Use to add additional query string values. The function returns the current object to allow chaining calls.
                            * Example: add({'name1':'value1', 'name2':'value2', ...});
                            * Note: Use this to also change existing values.
                            * @param {boolean} newValues An object whose properties will be added to the current query.
                            * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                            */
                        addOrUpdate(newValues: object | { [index: string]: string }, makeNamesLowercase = false) {
                            if (newValues)
                                for (var pname in newValues)
                                    this.values[makeNamesLowercase ? pname.toLocaleLowerCase() : pname] = newValues[pname];
                            return this;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
                            * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
                            * Warning: If the new name already exists, it will be replaced.
                            */
                        rename(newNames: { [index: string]: string }) {
                            for (var pname in this.values)
                                for (var pexistingname in newNames)
                                    if (pexistingname == pname && newNames[pexistingname] && newNames[pexistingname] != pname) { // (&& make sure the new name is actually different)
                                        this.values[newNames[pexistingname]] = this.values[pexistingname];
                                        delete this.values[pexistingname];
                                    }
                            return this;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
                            * Example: remove(['name1', 'name2', 'name3']);
                            */
                        remove(namesToDelete: string[]) {
                            if (namesToDelete && namesToDelete.length)
                                for (var i = 0, n = namesToDelete.length; i < n; ++i)
                                    if (this.values[namesToDelete[i]])
                                        delete this.values[namesToDelete[i]];
                            return this;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Creates and returns a duplicate of this object. */
                        clone(): IQuery {
                            var q = Path.Query.new();
                            for (var pname in this.values)
                                q.values[pname] = this.values[pname];
                            return q;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        appendTo(uri: string): string {
                            return uri.match(/^[^\?]*/g)[0] + this.toString();
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Returns the specified value, or a default value if nothing was found. */
                        getValue(name: string, defaultValueIfUndefined?: string): any {
                            var value = this.values[name];
                            if (value === void 0) value = defaultValueIfUndefined;
                            return value;
                        }

                        /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
                        getLCValue(name: string, defaultValueIfUndefined?: string): string {
                            var value = this.values[name];
                            if (value === void 0) value = defaultValueIfUndefined;
                            return ("" + value).toLowerCase();
                        }

                        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                        getUCValue(name: string, defaultValueIfUndefined?: string): string {
                            var value = this.values[name];
                            if (value === void 0) value = defaultValueIfUndefined;
                            return ("" + value).toUpperCase();
                        }

                        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                        getNumber(name: string, defaultValueIfUndefined?: number): number {
                            var value = parseFloat(this.values[name]);
                            if (value === void 0) value = defaultValueIfUndefined;
                            return value;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
                            * The existing value is replaced by the encoded value, and the encoded value is returned.
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        encodeValue(name: string): string {
                            var value = this.values[name], result: string;
                            if (value !== void 0 && value !== null) {
                                this.values[name] = result = Text.Encoding.base64Encode(value, Text.Encoding.Base64Modes.URI);
                            }
                            return result;
                        }

                        /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
                            * The existing value is replaced by the decoded value, and the decoded value is returned.
                            */
                        decodeValue(name: string): string {
                            var value = this.values[name], result: string;
                            if (value !== void 0 && value !== null) {
                                this.values[name] = result = Text.Encoding.base64Decode(value, Text.Encoding.Base64Modes.URI);
                            }
                            return result;
                        }

                        /** Encode ALL query values (see 'encodeValue()'). 
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        encodeAll(): void {
                            for (var p in this.values)
                                this.encodeValue(p);
                        }

                        /** Decode ALL query values (see 'encodeValue()'). 
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        decodeAll(): void {
                            for (var p in this.values)
                                this.decodeValue(p);
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        /** 
                           * Converts the underlying query values to a proper search string that can be appended to a URI.
                           * @param {boolean} addQuerySeparator If true (the default) prefixes '?' before the returned query string.
                           */
                        toString(addQuerySeparator = true): string {
                            var qstr = "";
                            for (var pname in this.values)
                                if (this.values[pname] !== void 0)
                                    qstr += (qstr ? "&" : "") + encodeURIComponent(pname) + "=" + encodeURIComponent(this.values[pname]);
                            return (addQuerySeparator ? "?" : "") + qstr;
                        }

                        // ---------------------------------------------------------------------------------------------------------------

                        private static [constructor](factory: typeof Query) {
                            factory.init = (o, isnew, query = null, makeNamesLowercase = false) => {
                                if (query)
                                    if (typeof query == 'object')
                                        o.addOrUpdate(query, makeNamesLowercase);
                                    else {
                                        if (typeof query != 'string') query = toString(query);
                                        var nameValuePairs = query.match(QUERY_STRING_REGEX);
                                        var i: number, n: number, eqIndex: number, nameValue: string;
                                        if (nameValuePairs)
                                            for (var i = 0, n = nameValuePairs.length; i < n; ++i) {
                                                nameValue = nameValuePairs[i];
                                                eqIndex = nameValue.indexOf('='); // (need to get first instance of the '=' char)
                                                if (eqIndex == -1) eqIndex = nameValue.length; // (whole string is the name)
                                                if (makeNamesLowercase)
                                                    o.values[decodeURIComponent(nameValue).substring(1, eqIndex).toLowerCase()] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                                                else
                                                    o.values[decodeURIComponent(nameValue).substring(1, eqIndex)] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                                            }
                                    }
                            };
                        }
                    }

                    Query.$__register(Path);
                }

                export interface IQuery extends Query.$__type { }

                // ==========================================================================================================================

                //! if (pageQuery.getValue('debug', '') == 'true') Diagnostics.debug = Diagnostics.DebugModes.Debug_Run; // (only allow this on the sandbox and development servers)
                //! var demo = demo || pageQuery.getValue('demo', '') == 'true'; // (only allow this on the sandbox and development servers)

                /** 
                   * Redirect the current page to another location.
                   * @param {string} url The URL to redirect to.
                   * @param {boolean} url If true, the current page query string is merged. The default is false,
                   * @param {boolean} bustCache If true, the current page query string is merged. The default is false,
                   */
                export function setLocation(url: string, includeExistingQuery = false, bustCache = false) {
                    var query = Query.new(url);
                    if (bustCache) query.values[ResourceRequest.cacheBustingVar] = Date.now().toString();
                    if (includeExistingQuery)
                        query.addOrUpdate(pageQuery.values);
                    if (url.charAt(0) == '/')
                        url = resolve(url);
                    url = query.appendTo(url);
                    query.dispose();
                    if (wait)
                        wait();
                    setTimeout(() => { location.href = url; }, 1); // (let events finish before setting)
                }

                // ==========================================================================================================================

                /**
                  * Returns true if the page URL contains the given controller and action names (not case sensitive).
                  * This only works with typical default routing of "{host}/Controller/Action/etc.".
                  * @param action A controller action name.
                  * @param controller A controller name (defaults to "home" if not specified)
                  */
                export function isView(action: string, controller = "home"): boolean {
                    return new RegExp("^\/" + controller + "\/" + action + "(?:[\/?&#])?", "gi").test(location.pathname);
                }

                // ==========================================================================================================================

                /** Subtracts the current site's base URL from the given URL and returns 'serverWebRoot' with the remained appended. */
                export function map(url: string) {
                    if (url.substr(0, CoreXT.baseURL.length).toLocaleLowerCase() == CoreXT.baseURL.toLocaleLowerCase()) {
                        // TODO: Make this more robust by parsing and checked individual URL parts properly (like default vs explicit ports in the URL).
                        var subpath = url.substr(CoreXT.baseURL.length);
                        return combine(CoreXT.serverWebRoot, subpath);
                    }
                    else return parse(url).toString(CoreXT.serverWebRoot); // (the origin is not the same, so just assume everything after the URL's origin is the path)
                }

                // ==========================================================================================================================

                /** This is set automatically to the query for the current page. */
                export var pageQuery = Query.new(location.href);

                // ==========================================================================================================================
            }

            // ===============================================================================================================================

            /** 
             * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
             * implementation designed to work better with the CoreXT system specifically, and to support parallel loading).
             * Note: It is advised to use 'CoreXT.Loader.loadResource()' to load resources instead of directly creating resource request objects.
             * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
             * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
             */
            export class ResourceRequest extends FactoryBase() {
                /** 
                 * If true (the default) then a 'ResourceRequest.cacheBustingVar+"="+Date.now()' query item is added to make sure the browser never uses
                 * the cache. To change the variable used, set the 'cacheBustingVar' property also.
                 * Each resource request instance can also have its own value set separate from the global one.
                 * Note: CoreXT has its own caching that uses the local storage, where supported.
                 */
                static cacheBusting = true;

                /** See the 'cacheBusting' property. */
                static get cacheBustingVar() { return this._cacheBustingVar || '_v_'; }; // (note: ResourceInfo.cs uses this same default)
                static set cacheBustingVar(value) { this._cacheBustingVar = toString(value) || '_v_'; };
                private static _cacheBustingVar = '_v_';

                /** Returns a new module object only - does not load it. */
                static 'new': (...args: any[]) => IResourceRequest;
                /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
                static init: (o: IResourceRequest, isnew: boolean, url: string, type: ResourceTypes | string, async?: boolean) => void;
            }
            export namespace ResourceRequest {
                export class $__type {
                    private $__index: number;

                    /** The requested resource URL. If the URL string starts with '~/' then it becomes relative to the content type base path. */
                    get url() {
                        if (typeof this._url == 'string' && this._url.charAt(0) == "~") {
                            var _baseURL = basePathFromResourceType(this.type);
                            return System.IO.Path.resolve(this._url, void 0, _baseURL);
                        }
                        return this._url;
                    }
                    set url(value: string) { this._url = value; }

                    /** The raw unresolved URL given for this resource. Use the 'url' property to resolve content roots when '~' is used. */
                    _url: string;

                    /** 
                       * The HTTP request method to use, such as "GET" (the default), "POST", "PUT", "DELETE", etc.  Ignored for non-HTTP(S) URLs.
                       * 
                       */
                    method = "GET";

                    /** Optional data to send with the request, such as for POST operations. */
                    body: any;

                    /** An optional username to pass to the XHR instance when opening the connecting. */
                    username: string;
                    /** An optional password to pass to the XHR instance when opening the connecting. */
                    password: string;

                    /** The requested resource type (to match against the server returned MIME type for data type verification). */
                    type: ResourceTypes | string;

                    /**
                       * The XMLHttpRequest object used for this request.  It's marked private to discourage access, but experienced
                       * developers should be able to use it if necessary to further configure the request for advanced reasons.
                       */
                    _xhr: XMLHttpRequest; // (for parallel loading, each request has its own connection)

                    /**
                       * The raw data returned from the HTTP request.
                       * Note: This does not change with new data returned from callback handlers (new data is passed on as the first argument to
                       * the next call [see 'transformedData']).
                       */
                    response: any; // (The response entity body according to responseType, as an ArrayBuffer, Blob, Document, JavaScript object (from JSON), or string. This is null if the request is not complete or was not successful.)

                    /** This gets set to data returned from callback handlers as the 'response' property value gets transformed.
                      * If no transformations were made, then the value in 'response' is returned.
                      */
                    get transformedResponse(): any {
                        return this.$__transformedData === noop ? this.response : this.$__transformedData;
                    }
                    private $__transformedData: any = noop;

                    /** The response code from the XHR response. */
                    responseCode: number = 0; // (the response code returned)
                    /** The response code message from the XHR response. */
                    responseMessage: string = ""; // (the response code message)

                    /** The current request status. */
                    status: RequestStatuses = RequestStatuses.Pending;

                    /** 
                     * A progress/error message related to the status (may not be the same as the response message).
                     * Setting this property sets the local message and updates the local message log. Make sure to set 'this.status' first before setting a message.
                     */
                    get message(): string { // (for errors, aborts, timeouts, etc.)
                        return this._message;
                    }
                    set message(value: string) {
                        this._message = value;
                        this.messageLog.push(this._message);
                        if (this.status == RequestStatuses.Error)
                            error("ResourceRequest (" + this.url + ")", this._message, this, false); // (send resource loading error messages to the console to aid debugging)
                        else
                            log("ResourceRequest (" + this.url + ")", this._message, LogTypes.Normal, this);
                    }
                    private _message: string;

                    /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
                    messageLog: string[] = [];

                    /** 
                     * If true (default), them this request is non-blocking, otherwise the calling script will be blocked until the request
                     * completes loading.  Please note that no progress callbacks can occur during blocked operations (since the thread is
                     * effectively 'paused' in this scenario).
                     * Note: Depreciated: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests#Synchronous_request
                     * "Starting with Gecko 30.0 (Firefox 30.0 / Thunderbird 30.0 / SeaMonkey 2.27), Blink 39.0, and Edge 13, synchronous requests on the main thread have been deprecated due to the negative effects to the user experience."
                     */
                    async: boolean;

                    /** 
                     * If true (the default) then a '"_="+Date.now()' query item is added to make sure the browser never uses
                     * the cache. To change the variable used, set the 'cacheBustingVar' property also.
                     * Note: CoreXT has its own caching that uses the local storage, where supported.
                     */
                    cacheBusting = ResourceRequest.cacheBusting;

                    /** See the 'cacheBusting' property. */
                    cacheBustingVar = ResourceRequest.cacheBustingVar;

                    private _onProgress: ICallback<IResourceRequest>[];
                    private _onReady: ICallback<IResourceRequest>[]; // ('onReady' is triggered in order of request made, and only when all included dependencies have completed successfully)

                    /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
                    * There's also an 'on finally' which should execute on success OR failure, regardless.
                    * For each entry, only ONE of any callback type will be set.
                    */
                    private _promiseChain: {
                        onLoaded?: IResultCallback<IResourceRequest>; // (resource is loaded, but may not be ready [i.e. previous scripts may not have executed yet])
                        onError?: IErrorCallback<IResourceRequest>; // (there is one error entry [defined or not] for every 'onLoaded' event entry, and vice versa)
                        onFinally?: ICallback<IResourceRequest>;
                    }[] = [];
                    private _promiseChainIndex: number = 0; // (the current position in the event chain)

                    /** 
                     * A list of parent requests that this request is depending upon.
                     * When 'start()' is called, all parents are triggered to load first, working downwards.
                     * Regardless of order, loading is in parallel asynchronously; however, the 'onReady' event will fire in the expected order.
                     * */
                    _parentRequests: IResourceRequest[];
                    private _parentCompletedCount = 0; // (when this equals the # of 'dependents', the all parent resources have loaded [just faster than iterating over them])
                    _dependants: IResourceRequest[]; // (dependant child resources)

                    private _paused = false;

                    private _queueDoNext(data: any) {
                        setTimeout(() => {
                            // ... before this, fire any handlers that would execute before this ...
                            this._doNext();
                        }, 0);
                    } // (simulate an async response, in case more handlers need to be added next)
                    private _queueDoError() { setTimeout(() => { this._doError(); }, 0); } // (simulate an async response, in case more handlers need to be added next)
                    private _requeueHandlersIfNeeded() {
                        if (this.status == RequestStatuses.Error)
                            this._queueDoError();
                        else if (this.status >= RequestStatuses.Waiting) {
                            this._queueDoNext(this.response);
                        }
                        // ... else, not needed, as the chain is still being traversed, so anything added will get run as expected ...
                    }

                    /** Triggers a success or error callback after the resource loads, or fails to load. */
                    then(success: IResultCallback<IResourceRequest>, error?: IErrorCallback<IResourceRequest>) {
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
                    }

                    /** Adds another request and makes it dependent on the current 'parent' request.  When all parent requests have completed,
                      * the dependant request fires its 'onReady' event.
                      * Note: The given request is returned, and not the current context, so be sure to complete configurations before hand.
                      */
                    include<T extends IResourceRequest>(request: T) {
                        if (!request._parentRequests)
                            request._parentRequests = [];
                        if (!this._dependants)
                            this._dependants = [];
                        request._parentRequests.push(this);
                        this._dependants.push(request);
                        return request;
                    }

                    /**
                     * Add a call-back handler for when the request completes successfully.
                     * This event is triggered after the resource successfully loads and all callbacks in the promise chain get called.
                     * @param handler
                     */
                    ready(handler: ICallback<IResourceRequest>) {
                        if (typeof handler == 'function') {
                            if (!this._onReady)
                                this._onReady = [];
                            this._onReady.push(handler);
                            this._requeueHandlersIfNeeded();
                        } else throw "Handler is not a function.";
                        return this;
                    }

                    /** Adds a hook into the resource load progress event. */
                    while(progressHandler: ICallback<IResourceRequest>) {
                        if (typeof progressHandler == 'function') {
                            if (!this._onProgress)
                                this._onProgress = [];
                            this._onProgress.push(progressHandler);
                            this._requeueHandlersIfNeeded();
                        } else throw "Handler is not a function.";
                        return this;
                    }

                    /** Call this anytime while loading is in progress to terminate the request early. An error event will be triggered as well. */
                    abort(): void {
                        if (this._xhr.readyState > XMLHttpRequest.UNSENT && this._xhr.readyState < XMLHttpRequest.DONE) {
                            this._xhr.abort();
                        }
                    }

                    /**
                     * Provide a handler to catch any errors from this request.
                     */
                    catch(errorHandler: IErrorCallback<IResourceRequest>) {
                        if (typeof errorHandler == 'function') {
                            this._promiseChain.push({ onError: errorHandler });
                            this._requeueHandlersIfNeeded();
                        } else
                            throw "Handler is not a function.";
                        return this;
                    }

                    /**
                     * Provide a handler which should execute on success OR failure, regardless.
                     */
                    finally(cleanupHandler: ICallback<IResourceRequest>) {
                        if (typeof cleanupHandler == 'function') {
                            this._promiseChain.push({ onFinally: cleanupHandler });
                            this._requeueHandlersIfNeeded();
                        } else
                            throw "Handler is not a function.";
                        return this;
                    }

                    /** 
                       * Starts loading the current resource.  If the current resource has dependencies, they are triggered to load first (in proper
                       * order).  Regardless of the start order, all scripts are loaded in parallel.
                       * Note: This call queues the start request in 'async' mode, which begins only after the current script execution is completed.
                       * @param {string} method An optional method to override the default request method set in the 'method' property on this request instance.
                       * @param {string} body Optional payload data to send, which overrides any value set in the 'payload' property on this request instance.
                       * @param {string} username Optional username value, instead of storing the username in the instance.
                       * @param {string} password Optional password value, instead of storing the password in the instance.
                       */
                    start(method?: string, body?: string, username?: string, password?: string): this {
                        if (this.async) setTimeout(() => { this._Start(method, body, username, password); }, 0); else this._Start(); return this;
                    }

                    private _Start(_method?: string, _body?: string, _username?: string, _password?: string) {
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

                            if (!isDebugging() && typeof Storage !== void 0)
                                try {
                                    var currentAppVersion = getAppVersion();
                                    var versionInLocalStorage = localStorage.getItem("version");
                                    var appVersionInLocalStorage = localStorage.getItem("appVersion");
                                    if (versionInLocalStorage && appVersionInLocalStorage && version == versionInLocalStorage && currentAppVersion == appVersionInLocalStorage) {
                                        // ... all versions match, just pull from local storage (faster) ...
                                        this.response = localStorage.getItem("resource:" + this.url); // (should return 'null' if not found)
                                        if (this.response !== null && this.response !== void 0) {
                                            this.status = RequestStatuses.Loaded;
                                            this._doNext();
                                            return;
                                        }
                                    }
                                } catch (e) {
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

                                var loaded = () => {
                                    if (xhr.status == 200 || xhr.status == 304) {
                                        this.response = xhr.response;
                                        this.status == RequestStatuses.Loaded;
                                        this.message = xhr.status == 304 ? "Loading completed (from browser cache)." : "Loading completed.";

                                        // ... check if the expected mime type matches, otherwise throw an error to be safe ...
                                        var responseType = xhr.getResponseHeader('content-type');
                                        if (this.type && responseType && <string><any>this.type != responseType) {
                                            this.setError("Resource type mismatch: expected type was '" + this.type + "', but received '" + responseType + "' (XHR type '" + xhr.responseType + "').\r\n");
                                        }
                                        else {
                                            if (!isDebugging() && typeof Storage !== void 0)
                                                try {
                                                    localStorage.setItem("version", version);
                                                    localStorage.setItem("appVersion", getAppVersion());
                                                    localStorage.setItem("resource:" + this.url, this.response);
                                                    this.message = "Resource cached in local storage.";
                                                } catch (e) {
                                                    // .. failed: out of space? ...
                                                    // TODO: consider saving to web SQL as well, or on failure (as a backup; perhaps create a storage class with this support). //?
                                                }
                                            else this.message = "Resource not cached in local storage because of debug mode. Release mode will use local storage to help survive clearing CoreXT files when temporary content files are deleted.";

                                            this._doNext();
                                        }
                                    }
                                    else {
                                        this.setError("There was a problem loading the resource (status code " + xhr.status + ": " + xhr.statusText + ").\r\n");
                                    }
                                };

                                // ... this script is not cached, so load it ...

                                xhr.onreadystatechange = () => { // (onreadystatechange is supported by all browsers)
                                    switch (xhr.readyState) {
                                        case XMLHttpRequest.UNSENT: break;
                                        case XMLHttpRequest.OPENED: this.message = "Opened connection ..."; break;
                                        case XMLHttpRequest.HEADERS_RECEIVED: this.message = "Headers received ..."; break;
                                        case XMLHttpRequest.LOADING: break; // (this will be handled by the progress event)
                                        case XMLHttpRequest.DONE: loaded(); break;
                                    }
                                };

                                xhr.onerror = (ev: ProgressEvent) => { this.setError(void 0, ev); this._doError(); };
                                xhr.onabort = () => { this.setError("Request aborted."); };
                                xhr.ontimeout = () => { this.setError("Request timed out."); };
                                xhr.onprogress = (evt: ProgressEvent) => {
                                    this.message = Math.round(evt.loaded / evt.total * 100) + "% loaded ...";
                                    if (this._onProgress && this._onProgress.length)
                                        this._doOnProgress(evt.loaded / evt.total * 100);
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
                                var bustVar = this.cacheBustingVar;
                                if (bustVar.indexOf(" ") >= 0) log("start()", "There is a space character in the cache busting query name for resource '" + url + "'.", LogTypes.Warning);
                            }

                            if (!_method) _method = this.method || "GET";
                            xhr.open(_method, url, this.async, _username || this.username || void 0, _password || this.password || void 0);
                        }
                        catch (ex) {
                            error("start()", "Failed to load resource from URL '" + url + "': " + ((<Error>ex).message || ex), this);
                        }

                        try {
                            var payload: any = _body || this.body;
                            if (typeof payload == 'object' && payload.__proto__ == CoreObject.prototype) {
                                // (can't send object literals! convert to something else ...)
                                if (_method == 'GET') {
                                    var q = IO.Path.Query.new(payload);
                                    payload = q.toString(false);
                                } else {
                                    var formData = new FormData(); // TODO: Test if "multipart/form-data" is needed.
                                    for (var p in payload)
                                        formData.append(p, payload[p]);
                                    payload = formData;
                                }
                            }
                            xhr.send(payload);
                        }
                        catch (ex) {
                            error("start()", "Failed to send request to endpoint for URL '" + url + "': " + ((<Error>ex).message || ex), this);
                        }

                        //?if (!this.async && (xhr.status)) doSuccess();
                    }

                    /** Upon return, the 'then' or 'ready' event chain will pause until 'continue()' is called. */
                    pause() {
                        if (this.status >= RequestStatuses.Pending && this.status < RequestStatuses.Ready
                            || this.status == RequestStatuses.Ready && this._onReady.length)
                            this._paused = true;
                        return this;
                    }

                    /** After calling 'pause()', use this function to re-queue the 'then' or 'ready' even chain for continuation.
                      * Note: This queues on a timer with a 0 ms delay, and does not call any events before returning to the caller.
                      */
                    continue() {
                        if (this._paused) {
                            this._paused = false;
                            this._requeueHandlersIfNeeded();
                        }
                        return this;
                    }

                    private _doOnProgress(percent: number) {
                        // ... notify any handlers as well ...
                        if (this._onProgress) {
                            for (var i = 0, n = this._onProgress.length; i < n; ++i)
                                try {
                                    var cb = this._onProgress[i];
                                    if (cb)
                                        cb.call(this, this);
                                } catch (e) {
                                    this._onProgress[i] = null; // (won't be called again)
                                    this.setError("'on progress' callback #" + i + " has thrown an error:", e);
                                    // ... do nothing, not important ...
                                }
                        }
                    }

                    setError(message: string, error?: { name?: string; reason?: string; message?: string; type?: any; stack?: string }): void { // TODO: Make this better, perhaps with a class to handle error objects (see 'Error' AND 'ErrorEvent'). //?

                        if (error) {
                            var errMsg = getErrorMessage(error);
                            if (errMsg) {
                                if (message) message += " \r\n";
                                message += errMsg;
                            }
                        }

                        this.status = RequestStatuses.Error;
                        this.message = message; // (automatically adds to 'this.messages' and writes to the console)
                    }

                    private _doNext(): void { // (note: because this is a pseudo promise-like implementation on a single object instance, return values from handlers are not wrapped in new request instances [partially against specifications: http://goo.gl/igCsnS])
                        if (this.status == RequestStatuses.Error) {
                            this._doError(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                            return;
                        }

                        if (this._onProgress && this._onProgress.length) {
                            this._doOnProgress(100);
                            this._onProgress.length = 0;
                        }

                        for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                            if (this._paused) return;

                            var handlers = this._promiseChain[this._promiseChainIndex]; // (get all the handlers waiting for the result of this request)

                            if (handlers.onLoaded) {
                                try {
                                    var data = handlers.onLoaded.call(this, this, this.transformedResponse); // (call the handler with the current data and get the resulting data, if any)
                                } catch (e) {
                                    this.setError("An 'onLoaded' handler failed.", e);
                                    ++this._promiseChainIndex; // (the success callback failed, so trigger the error chain starting at next index)
                                    this._doError();
                                    return;
                                }

                                if (typeof data === 'object' && data instanceof $__type) {
                                    // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                                    if ((<IResourceRequest>data).status == RequestStatuses.Error) {
                                        this.setError("Rejected request returned from 'onLoaded' handler.");
                                        ++this._promiseChainIndex;
                                        this._doError(); // (cascade the error)
                                        return;
                                    } else {
                                        // ... get the data from the request object ...
                                        var newResReq = <IResourceRequest>data;
                                        if (newResReq.status >= RequestStatuses.Ready) {
                                            if (newResReq === this) continue; // ('self' [this] was returned, so go directly to the next item)
                                            data = newResReq.transformedResponse; // (the data is ready, so read now)
                                        } else { // (loading is started, or still in progress, so wait; we simply hook into the request object to get notified when the data is ready)
                                            newResReq.ready((sender) => { this.$__transformedData = sender.transformedResponse; this._doNext(); })
                                                .catch((sender) => { this.setError("Resource returned from next handler has failed to load.", sender); this._doError(); });
                                            return;
                                        }
                                    }
                                }

                                if (data !== void 0)
                                    this.$__transformedData = data;

                            } else if (handlers.onFinally) {
                                try {
                                    handlers.onFinally.call(this);
                                } catch (e) {
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
                    }

                    private _doReady(): void {
                        if (this._paused) return;

                        if (this.status < RequestStatuses.Waiting) return; // (the 'ready' event must only trigger after the resource loads, AND all handlers have been called)

                        // ... check parent dependencies first ...

                        if (this.status == RequestStatuses.Waiting)
                            if (!this._parentRequests || !this._parentRequests.length) {
                                this.status = RequestStatuses.Ready; // (no parent resource dependencies, so this resource is 'ready' by default)
                                this.message = "Resource has no dependencies, and is now ready.";
                            } else // ...need to determine if all parent (dependent) resources are completed first ...
                                if (this._parentCompletedCount == this._parentRequests.length) {
                                    this.status = RequestStatuses.Ready; // (all parent resource dependencies are now 'ready')
                                    this.message = "*** All dependencies for resource have loaded, and are now ready. ***";
                                } else {
                                    this.message = "Resource is waiting on dependencies (" + this._parentCompletedCount + "/" + this._parentRequests.length + " ready so far)...";
                                    return; // (nothing more to do yet)
                                }

                        // ... call the local 'onReady' event, and then trigger the call on the children as required.

                        if (this.status == RequestStatuses.Ready) {
                            if (this._onReady && this._onReady.length) {
                                try {
                                    for (var i = 0, n = this._onReady.length; i < n; ++i) {
                                        this._onReady[i].call(this, this);
                                        if (this.status < RequestStatuses.Ready)
                                            return; // (a callback changed state so stop at this point as we are no longer ready!)
                                    }
                                    if (this._paused) return;
                                } catch (e) {
                                    this.setError("Error in ready handler.", e);
                                    if (isDebugging() && (this.type == ResourceTypes.Application_Script || this.type == ResourceTypes.Application_ECMAScript))
                                        throw e; // (propagate script errors to the browser for debuggers, if any)
                                }
                            }

                            if (this._dependants)
                                for (var i = 0, n = this._dependants.length; i < n; ++i) {
                                    ++this._dependants[i]._parentCompletedCount;
                                    this._dependants[i]._doReady(); // (notify all children that this resource is now 'ready' for use [all events have been run, as opposed to just being loaded])
                                    if (this.status < RequestStatuses.Ready)
                                        return; // (something changed the "Ready" state so abort!)
                                }
                        }
                    }

                    private _doError(): void { // (note: the following event link handles the preceding error, skipping first any and all 'finally' handlers)
                        if (this._paused) return;

                        if (this.status != RequestStatuses.Error) {
                            this._doNext(); // (still in an error state, so pass on to trigger error handlers in case new ones were added)
                            return;
                        }

                        for (var n = this._promiseChain.length; this._promiseChainIndex < n; ++this._promiseChainIndex) {
                            if (this._paused) return;

                            var handlers = this._promiseChain[this._promiseChainIndex];

                            if (handlers.onError) {
                                try {
                                    var newData = handlers.onError.call(this, this, this.message); // (this handler should "fix" the situation and return valid data)
                                } catch (e) {
                                    this.setError("Error handler failed.", e);
                                }
                                if (typeof newData === 'object' && newData instanceof $__type) {
                                    // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                                    if ((<IResourceRequest>newData).status == RequestStatuses.Error)
                                        return; // (no correction made, still in error; terminate the event chain here)
                                    else {
                                        var newResReq = <IResourceRequest>newData;
                                        if (newResReq.status >= RequestStatuses.Ready)
                                            newData = newResReq.transformedResponse;
                                        else { // (loading is started, or still in progress, so wait)
                                            newResReq.ready((sender) => { this.$__transformedData = sender.transformedResponse; this._doNext(); })
                                                .catch((sender) => { this.setError("Resource returned from error handler has failed to load.", sender); this._doError(); });
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
                            } else if (handlers.onFinally) {
                                try {
                                    handlers.onFinally.call(this);
                                } catch (e) {
                                    this.setError("Cleanup handler failed.", e);
                                }
                            }
                        }

                        // ... if this is reached, then there are no following error handlers, so throw the existing message ...

                        if (this.status == RequestStatuses.Error) {
                            var msgs = this.messageLog.join("\r\n· ");
                            if (msgs) msgs = ":\r\n· " + msgs; else msgs = ".";
                            throw new Error("Unhandled error loading resource " + ResourceTypes[this.type] + " from '" + this.url + "'" + msgs + "\r\n");
                        }
                    }

                    /** Resets the current resource data, and optionally all dependencies, and restarts the whole loading process.
                      * Note: All handlers (including the 'progress' and 'ready' handlers) are cleared and will have to be reapplied (clean slate).
                      * @param {boolean} includeDependentResources Reload all resource dependencies as well.
                      */
                    reload(includeDependentResources: boolean = true) {
                        if (this.status == RequestStatuses.Error || this.status >= RequestStatuses.Ready) {
                            this.response = void 0;
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
                    }

                    private static [constructor](factory: typeof ResourceRequest) {
                        factory.init = (o, isnew, url, type, async = true) => {
                            if (url === void 0 || url === null) throw "A resource URL is required.";
                            if (type === void 0) throw "The resource type is required.";

                            if ((<any>_resourceRequestByURL)[url])
                                return (<any>_resourceRequestByURL)[url]; // (abandon this new object instance in favor of the one already existing and returned it)

                            o.url = url;
                            o.type = type;
                            o.async = async;

                            o.$__index = _resourceRequests.length;

                            _resourceRequests.push(o);
                            _resourceRequestByURL[o.url] = o;
                        };
                    }
                }

                ResourceRequest.$__register(IO);
            }

            export interface IResourceRequest extends ResourceRequest.$__type { }

            // ===============================================================================================================================

            var _resourceRequests: IResourceRequest[] = []; // (requests are loaded in parallel, but executed in order of request)
            var _resourceRequestByURL: { [url: string]: IResourceRequest } = {}; // (a quick named index lookup into '__loadRequests')

            /** A shortcut for returning a load request promise-type object for a resource loading operation. */
            export function get(url: string, type?: ResourceTypes | string, asyc: boolean = true): IResourceRequest {
                if (url === void 0 || url === null) throw "A resource URL is required.";
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

            // ===============================================================================================================================
        }
    }

    /** 
     * Extracts and replaces source mapping pragmas. This is used mainly with XHR loading of scripts in order to execute them with
     * source mapping support while being served from a CoreXT .Net Core MVC project.
     */
    export function fixSourceMappingsPragmas(sourcePragmaInfo: IExtractedPragmaDetails, scriptURL: string) {
        var script = sourcePragmaInfo && sourcePragmaInfo.originalSource || "";
        if (sourcePragmaInfo.pragmas && sourcePragmaInfo.pragmas.length)
            for (var i = 0, n = +sourcePragmaInfo.pragmas.length; i < n; ++i) {
                var pragma = sourcePragmaInfo.pragmas[i];
                if (pragma.name.substr(0, 6) != "source")
                    script += "\r\n" + pragma; // (not for source mapping, so leave as is)
                else
                    script += "\r\n" + pragma.prefix + " " + pragma.name + "="
                        + System.IO.Path.resolve(pragma.value, System.IO.Path.map(scriptURL), serverWebRoot ? serverWebRoot : baseScriptsURL) + pragma.extras;
            }
        return script;
    }

    // ========================================================================================================================================

    /**
     * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property, or if using CoreXT.JS for
     * .Net Core MVC, make sure '@RenderCoreXTJSConfigurations()' is called before all scripts in the header section of your layout view.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseURL: string = System.IO.Path.fix(global.siteBaseURL || baseURL || location.origin); // (example: "https://calendar.google.com/")

    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseScriptsURL: string = global.scriptsBaseURL ? System.IO.Path.fix(global.scriptsBaseURL || baseScriptsURL) : baseURL + "js/";

    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseCSSURL: string = global.cssBaseURL ? System.IO.Path.fix(global.cssBaseURL || baseCSSURL) : baseURL + "css/";

    /**
     * This is set by default when '@RenderCoreXTJSConfigurations()' is called at the top of the layout page and a debugger is attached. It is
     * used to resolve source maps delivered through XHR while debugging.
     * Typically the server side web root file path matches the same root as the http root path in 'baseURL'.
     */
    export var serverWebRoot: string;

    log("CoreXT.baseURL", baseURL + " (If this is wrong, set a global 'siteBaseURL' variable to the correct path, or if using CoreXT.JS for .Net Core MVC, make sure '@RenderCoreXTJSConfigurations()' is called in the header section of your layout view)"); // (requires the exception object, which is the last one to be defined above; now we start the first log entry with the base URI of the site)
    log("CoreXT.baseScriptsURL", baseScriptsURL + " (If this is wrong, set a global 'scriptsBaseURL' variable to the correct path)");
    if (serverWebRoot)
        log("CoreXT.serverWebRoot", serverWebRoot + " (typically set server side within the layout view only while debugging to help resolve script source maps)");

    // ========================================================================================================================================

    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    export namespace Time {
        namespace("CoreXT", "Time");
        // =======================================================================================================================

        export var __millisecondsPerSecond = 1000;
        export var __secondsPerMinute = 60;
        export var __minsPerHour = 60;
        export var __hoursPerDay = 24;
        export var __daysPerYear = 365;
        export var __actualDaysPerYear = 365.2425;
        export var __EpochYear = 1970;
        export var __millisecondsPerMinute = __secondsPerMinute * __millisecondsPerSecond;
        export var __millisecondsPerHour = __minsPerHour * __millisecondsPerMinute;
        export var __millisecondsPerDay = __hoursPerDay * __millisecondsPerHour;
        export var __millisecondsPerYear = __daysPerYear * __millisecondsPerDay;

        export var __ISO8601RegEx = /^\d{4}-\d\d-\d\d(?:[Tt]\d\d:\d\d(?::\d\d(?:\.\d+?(?:[+-]\d\d?(?::\d\d(?::\d\d(?:.\d+)?)?)?)?)?)?[Zz]?)?$/;
        export var __SQLDateTimeRegEx = /^\d{4}-\d\d-\d\d(?: \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?)?$/; // (Standard SQL Date/Time Format)
        export var __SQLDateTimeStrictRegEx = /^\d{4}-\d\d-\d\d \d\d:\d\d(?::\d\d(?:.\d{1,3})?)?(?:\+\d\d)?$/; // (Standard SQL Date/Time Format)

        /** The time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        export var __localTimeZoneOffset = (new Date()).getTimezoneOffset() * __millisecondsPerMinute; // ('getTimezoneOffset()' returns minutes, which is converted to ms for '__localTimeZoneOffset')
    }

    // ========================================================================================================================================

    export namespace System {
        namespace("CoreXT", "System");
    }

    // *** At this point the core type system, error handling, and console-based logging are now available. ***

    // ========================================================================================================================================

    export interface ICallback<TSender> { (sender?: TSender): void }
    /** 
     * A handler that is called when a resource is loaded. 
     * The data supplied may not be the original data. Each handler can apply transformations to the data. Any data returned replaces the
     * underlying data for the request and gets passed to the next callback in the chain (if any), which is useful for filtering.
     * Another resource request can also be returned, in which case the 'transformedData' value of that request becomes the result (unless that
     * request failed, which would cascade the failure the current request as well).
     */
    export interface IResultCallback<TSender> { (sender?: TSender, data?: any): any | System.IO.IResourceRequest }
    export interface IErrorCallback<TSender> { (sender?: TSender, error?: any): any }

    // TODO: Iron this out - we need to make sure the claim below works well, or at least the native browser cache can help with this naturally.
    /** 
     * The loader namespace contains low level functions for loading/bootstrapping the whole system. 
     * Why use a loader instead of combining all scripts into one file? The main reason is so that individual smaller scripts can be upgraded
     * without needing to re-transfer the whole system to the client. It's much faster to just resend one small file that might change. This
     * also allows extending (add to) the existing scripts for system upgrades.
     */
    export namespace Loader {
        namespace("CoreXT", "Loader");
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        export interface ISystemLoadHandler { (): void }
        var _onSystemLoadedHandlers: ISystemLoadHandler[] = [];

        /** 
         * Use this function to register a handler to be called when the core system is loaded, just before 'app.manifest.ts' gets loaded.
         * Note: The PROPER way to load an application is via a manifest file (app.manifest.ts).  Very few functions and event hooks are available
         * until the system is fully loaded. For example, 'CoreXT.DOM.Loader' is not available until the system is loaded, which means you
         * cannot hook into 'CoreXT.DOM.Loader.onDOMLoaded()' or access 'CoreXT.Browser' properties until then. This is because all files
         * are dynamically loaded as needed (the CoreXT system uses the more efficient dynamic loading system).
         */
        export function onSystemLoaded(handler: ISystemLoadHandler) {
            if (handler && typeof handler == 'function')
                _onSystemLoadedHandlers.push(handler);
        }

        /** Used by the bootstrapper in applying system scripts as they become ready.
          * Applications should normally never use this, and instead use the 'modules' system in the 'CoreXT.Scripts' namespace for
          * script loading.
          */
        export function _SystemScript_onReady_Handler(request: System.IO.IResourceRequest) {
            try {
                request.message = "Executing script ...";
                var helpers = renderHelperVarDeclarations("p0");
                var sourcePragmaInfo = extractPragmas(request.transformedResponse);
                var script = fixSourceMappingsPragmas(sourcePragmaInfo, request.url);
                safeEval(helpers[0] + " var CoreXT=p1; " + script, /*p0*/  helpers[1], /*p1*/  CoreXT); // ('CoreXT.eval' is used for system scripts because some core scripts need initialize in the global scope [mostly due to TypeScript limitations])
                //x (^note: MUST use global evaluation as code may contain 'var's that will get stuck within function scopes)
                request.status = RequestStatuses.Executed;
                request.message = "The script has been executed successfully.";
            } catch (ex) {
                var errorMsg = getErrorMessage(ex);
                var msg = "There was an error executing script '" + request.url + "'.  The first 255 characters of the response was \r\n\"" + request.transformedResponse.substr(0, 255) + "\". \r\nError message:";
                request.setError(msg, ex);
                if (isDebugging())
                    throw ex;
            }
        }

        /** This is the root path to the boot scripts for CoreXT.JS. The default starts with '~/' in order to be relative to 'baseScriptsURL'. */
        export var rootBootPath: string = rootBootPath && ('' + rootBootPath) || "~/CoreXT/";

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
        export function bootstrap() {
            // (note: the request order is the dependency order)

            rootBootPath = ('' + Loader.rootBootPath);
            var rbpLastChar = rootBootPath.charAt(rootBootPath.length - 1);
            if (rbpLastChar != '/' && rbpLastChar != '\\')
                rootBootPath += '/'; // (must end with a slash)

            log("Loader.BootSubPath", rootBootPath + " (if this path is wrong set 'CoreXT.Loader.BootSubPath' before 'Loader.bootstrap()' gets called)");

            var onReady = _SystemScript_onReady_Handler;

            var get = System.IO.get;

            // ... load the base utility scripts first (all of these are not modules, so they have to be loaded in the correct order) ...
            get(rootBootPath + "CoreXT.Polyfills.js").ready(onReady) // (some polyfills may be needed by the system)
                .include(get(rootBootPath + "CoreXT.Types.js")).ready(onReady) // (common base types)
                .include(get(rootBootPath + "CoreXT.Utilities.js")).ready(onReady) // (a lot of items depend on time utilities [such as some utilities and logging] so this needs to be loaded first)
                .include(get(rootBootPath + "CoreXT.Globals.js")).ready(onReady) // (a place to store global values [especially global scope callbacks required by some libraries, such as Google Maps, etc.] without polluting the global scope)
                .include(get(rootBootPath + "CoreXT.Scripts.js")).ready(onReady) // (supports CoreXT-based module loading)
                // ... load the rest of the core library system next (this is ONLY the bare required basics; everything else can optionally be loaded as needed) ...
                .include(get(rootBootPath + "System/CoreXT.System.js").ready(onReady)) // (any general common system properties and setups)
                .include(get(rootBootPath + "System/CoreXT.System.PrimitiveTypes.js").ready(onReady)) // (start the primitive object definitions required by more advanced types)
                .include(get(rootBootPath + "System/CoreXT.System.Time.js")).ready(onReady) // (extends the time utilities and constants into a TimeSpan wrapper)
                .include(get(rootBootPath + "System/CoreXT.System.Exception.js").ready(onReady)) // (setup exception support)
                .include(get(rootBootPath + "System/CoreXT.System.Diagnostics.js")).ready(onReady) // (setup diagnostic support)
                .include(get(rootBootPath + "System/CoreXT.System.Events.js").ready(onReady)) // (advanced event handling)
                .include(get(rootBootPath + "System/CoreXT.System.Browser.js")).ready(onReady) // (uses the event system)
                .include(get(rootBootPath + "System/CoreXT.System.Text.js").ready(onReady)) // (utilities specific to working with texts)
                .include(get(rootBootPath + "System/CoreXT.System.Data.js").ready(onReady))
                .include(get(rootBootPath + "System/CoreXT.System.IO.js").ready(onReady)) // (adds URL query handling and navigation [requires 'Events.EventDispatcher'])
                .include(get(rootBootPath + "System/CoreXT.System.Storage.js").ready(onReady)) // (utilities for local storage support in CoreXT)
                .ready(() => {
                    if (_onSystemLoadedHandlers && _onSystemLoadedHandlers.length)
                        for (var i = 0, n = _onSystemLoadedHandlers.length; i < n; ++i)
                            _onSystemLoadedHandlers[i]();
                    // ... all core system scripts loaded, load the default manifests next ...
                    Scripts.getManifest() // (load the default manifest in the current path [defaults to 'manifest.js'])
                        .include(Scripts.getManifest("~/app.manifest")) // (load a custom named manifest; application launching begins here)
                        .ready((mod) => {
                            CoreXT.onReady.dispatch();
                            if (Scripts.Modules.App)
                                Scripts.Modules.App(Scripts._tryRunApp);
                        }) // (triggered when 'app.manifest' is executed and ready)
                        .start();
                })
                .start(); // (note: while all requests are loaded in parallel [regardless of dependencies], all 'ready' events are fired in proper order)

            CoreXT.Loader.bootstrap = <any>noop(); // (prevent this function from being called again)
        }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
    }

    // ========================================================================================================================================

    log("CoreXT", "Core system loaded.", LogTypes.Info);

    // ========================================================================================================================================

    /** This is provided to allow callbacks to run just before 'CoreXT.Loader.bootstrap()' gets called (depending on the 'CoreXT.debugMode' setting). 
     * * Setting 'CoreXT.debugMode' to 'CoreXT.DebugModes.Debug_Wait' prevents 'CoreXT.Loader.bootstrap()' from getting called automatically.
     * * Returning an explicit 'false' boolean value will also prevent the bootstrap from running automatically.
     */
    export var onBeforeBootstrapHandlers: { (): void | boolean }[];

    if (onBeforeBootstrapHandlers && (typeof onBeforeBootstrapHandlers != 'object' || !('length' in onBeforeBootstrapHandlers)))
        error("Before Bootstrap Events", "The property 'CoreXT.onBeforeBootstrapHandlers' is not set correctly.  Please set it with an array of handlers to call, or leave it undefined.");

    namespace _StartBoot {
        var autoboot = true;
        if (typeof onBeforeBootstrapHandlers == 'object' && onBeforeBootstrapHandlers.length)
            for (var i = 0, n = onBeforeBootstrapHandlers.length; i < n; ++i)
                if (onBeforeBootstrapHandlers[i]() === false)
                    autoboot = false; // (explicit request to prevent auto booting)

        if (autoboot && CoreXT.debugMode != CoreXT.DebugModes.Debug_Wait)
            CoreXT.Loader.bootstrap();
        // TODO: Allow users to use 'CoreXT.Loader' to load their own scripts, and skip loading the CoreXT system.
    }
}

// ========================================================================================================================================
