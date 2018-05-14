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

/**
 * The root namespace for the CoreXT system.
 */
namespace CoreXT {
    export var version = "0.0.1";
    if (typeof navigator != 'undefined' && typeof console != 'undefined')
        if (navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0)
            console.log("-=< CoreXT Client OS - v" + version + " >=- ");
        else
            console.log("%c -=< %cCoreXT Client OS - v" + version + " %c>=- ", "background: #000; color: lightblue; font-weight:bold", "background: #000; color: yellow; font-style:italic; font-weight:bold", "background: #000; color: lightblue; font-weight:bold");
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
/** Root location of the application scripts, which be default is the {site URL}+"/js/". */
var scriptsBaseURL: string;

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
    }

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
      */
    export declare function safeEval(x: string, ...args: any[]): any;

    /** Evaluates a string directly at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to allow 'var' declarations, etc., on the global scope.
      */
    export declare function globalEval(x: string, ...args: any[]): any;

    export enum Environments {
        /** Represents the CoreXT client core environment. */
        Browser, // Trusted
        /** Represents the CoreXT worker environment (where applications and certain modules reside). */
        Worker, // Secure "Sandbox"
        /** Represents the CoreXT server environment. */
        Server
    }
}

CoreXT.safeEval = function (exp: string, p1?: any, p2?: any, p3?: any): any { return eval(exp); };
// (note: this allows executing 'eval' outside the private CoreXT scope, but still within a function scope to prevent polluting the global scope,
//  and also allows passing arguments scoped only to the request).

CoreXT.globalEval = function (exp: string, p1?: any, p2?: any, p3?: any): any { return (<any>0, eval)(exp); };
// (note: indirect 'eval' calls are always globally scoped; see more: http://perfectionkills.com/global-eval-what-are-the-options/#windoweval)

namespace CoreXT { // (the core scope)
    /** Set to true if ES2015 (aka ES6) is supported ('class', 'new.target', etc.). */
    export var ES6: boolean = (() => { try { return <boolean>eval("(function () { return new.target; }, true)"); } catch (e) { return false; } })();

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

    // -------------------------------------------------------------------------------------------------------------------

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
    export function $(...args: (CoreXT.IType<any> | string)[]) { // this is the decorator factory
        return function (target: any, paramName: string, index: number) { // this is the decorator
            var _target = <CoreXT.IFunctionInfo>target;
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
        export var __types: { [fullTypeName: string]: ITypeInfo } = {};

        /** Holds all disposed objects that can be reused. */
        export var __disposedObjects: { [fulltypename: string]: IDomainObjectInfo[]; } = {}; // (can be reused by any AppDomain instance! [global pool for better efficiency])

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
            var bridge = <System.IADBridge><any>this; // (note: this should be either a bridge, or a class/factory object, or undefined)
            var type = <ITypeInfo & IFactory & IType<NativeTypes.IObject>>this;
            if (typeof this != 'function' || !this.init && !this.new)
                throw System.Exception.error("Constructor call operation on a non-constructor function.", "Using the 'new' operator is only valid on class and class-factory types. Just call the '{FactoryType}.new()' factory *function* without the 'new' operator.", this);
            var appDomain = bridge.$__appDomain || System.AppDomain && System.AppDomain.default;
            var instance: NativeTypes.IObject;
            var isNew = false;
            // ... get instance from the pool (of the same type!), or create a new one ...
            var fullTypeName = type.$__fullname;
            var objectPool = fullTypeName && __disposedObjects[fullTypeName];
            if (objectPool && objectPool.length)
                instance = objectPool.pop();
            else {
                instance = new (<IType<NativeTypes.IObject>>type)();
                isNew = true;
            }
            // ... insert [instance, isNew] without having to create a new array ...
            // TODO: Remove the following when ...rest is more widely supported.
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
         * 
         * @param {IType} factoryType The factory type to associate with the type.
         * @param {modules} namespace A list of all namespaces up to the current type, usually starting with 'CoreXT' as the first namespace.
         * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type (function object) will have type information
         * applied (using the IFunctionInfo interface).
        */
        export function __registerFactoryType<TClass extends IType, TFactory extends IFactoryTypeInfo, TNamespace extends object>
            (cls: TClass, factoryType: TFactory & { $__type: TClass }, namespace: TNamespace, addMemberTypeInfo = true, exportName?: keyof TNamespace)
            : ClassFactoryType<TClass, TFactory> {

            if (typeof factoryType !== 'function')
                error("__registerFactoryType()", "The 'factoryType' argument is not a valid constructor function.", classType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

            var classType = <IFactory<TClass> & IClassInfo><any>cls;

            if (typeof classType !== 'function')
                error("__registerFactoryType()", "The 'factoryType.$__type' property is not a valid constructor function.", classType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

            var _exportName = exportName || getTypeName(cls);
            if (_exportName.charAt(0) == '$') _exportName = _exportName.substr(1); // TODO: May not need to do this anymore.
            namespace[_exportName] = factoryType; // (usually the name will be set upon return from this function, but the type registration system will need it NOW, so just set it)

            classType.$__type = <any>classType; // (the class type AND factory type should both have a reference to the underlying type)
            classType.$__factoryType = factoryType; // (a properly registered class that supports the factory pattern should have a reference to its underlying factory type)

            // ... if no 'init()' function is specified, just call the base by default ... 

            //x if (!Object.prototype.hasOwnProperty.call(factoryType, "init") || typeof factoryType.init == 'undefined' || factoryType.init == null) {
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
            //x }

            //x if (!Object.prototype.hasOwnProperty.call(factoryType, "new") || typeof factoryType.new == 'undefined' || factoryType.new == null) {
            if (classType.new)
                error(getFullTypeName(classType), "You cannot create a static 'new' function directly on a class that implements the factory pattern (which could also create inheritance problems).");

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
            //x }
            //x else if (!classType.new || typeof classType.new != 'function') // (normally the default 'new' function should exist behind the scenes on the base Object type)
            //x    classType.new = () => {
            //x        throw "Invalid operation: no valid 'new()' function was found on type '" + getFullTypeName(classType, false) + "'. This exists on the DomainObject base type, and is required.";
            //x    }

            //x if ('__register' in _factoryType)
            //x     _factoryType['__register'] == noop;

            __registerType(cls, namespace, addMemberTypeInfo, exportName);

            return <any>factoryType;
        }

        //x /** Registers a given type by name (constructor function), and creates the function on the last specified module if it doesn't already exist.
        //x * @param {Function} type The type (constructor function) to register.
        //x * @param {modules} parentModules A list of all modules up to the current type, usually starting with 'CoreXT' as the first module.
        //x * @param {boolean} addMemberTypeInfo If true (default), all member functions of any existing type (function object) will have type information
        //x * applied (using the IFunctionInfo interface).
        //x */
        //x static registerType<T extends (...args)=>any>(type: string, parentModules: {}[], addMemberTypeInfo?: boolean): T;
        //x static registerType(type: Function, parentModules: {}[], addMemberTypeInfo?: boolean): ITypeInfo;

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
        export function __registerType<T extends IType<any>, TNamespaceParent extends object>(type: T, namespace: TNamespaceParent, addMemberTypeInfo = true, exportName?: keyof TNamespaceParent): T {

            var _namespace = <ITypeInfo>namespace;

            if (_namespace.$__fullname === void 0)
                error("Types.__registerType()", "The specified namespace '" + getTypeName(namespace) + "' is not registered.  Please make sure to call 'registerNamespace()' first at the top of namespace scopes before classes are defined.", type);

            // ... register the type with the parent namespace ...

            var _type = __registerNamespace(namespace, exportName || getTypeName(type));

            // ... scan the type's prototype functions and update the type information (only function names at this time) ...
            // TODO: Consider parsing the function parameters as well and add this information for developers.

            if (addMemberTypeInfo) {
                var prototype = type['prototype'], func: IFunctionInfo;

                for (var pname in prototype) {
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
                exception("has not been registered in the type system. Make sure to call 'registerNamespace()' at the top of namespace scopes before defining classes.");

            for (var i = 0, n = namespaces.length; i < n; ++i) {
                nsOrTypeName = namespaces[i];
                var trimmedName = nsOrTypeName.trim();
                if (trimmedName.charAt(0) == '$') trimmedName = trimmedName.substr(1); // (the convention assumes a '$' before the class name and the exported name will it removed)
                // TODO: The preceding line may be obsolete.
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

        /** Disposes a specific object in this AppDomain instance.
         * When creating thousands of objects continually, object disposal (and subsequent cache of the instances) means the GC doesn't have
         * to keep engaging to clear up the abandoned objects.  While using the "new" operator may be faster than using "{type}.new()" at
         * first, the application actually becomes very lagged while the GC keeps eventually kicking in.  This is why CoreXT objects are
         * cached and reused as much as possible.
         * @param {object} object The object to dispose and release back into the "disposed objects" pool.
         * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
         *                          false to request that child objects remain connected after disposal (not released). This
         *                          can allow quick initialization of a group of objects, instead of having to pull each one
         *                          from the object pool each time.
         */
        export function dispose(object: IDisposable, release: boolean = true): void {
            var _object: IDomainObjectInfo = <any>object;
            if (_object !== void 0) {
                // ... make sure 'dispose()' was called on the object ...

                if (_object.dispose != noop) { // ('object.dispose' is set to 'noop' if '{AppDomain}.dispose()' is called via 'object.dispose()')
                    _object.dispose = noop;
                    dispose(_object, release); // (object will not call back due to above)
                }

                // ... remove the object from the "active" list and erase it ...

                var appDomain = _object.$__appDomain;
                //? _object.$__appDomain = void 0; // (need to make sure this '{AppDomain}.dispose()' function doesn't get called again)

                if (appDomain) { // (note: '$__appDomain' is set to 'noop' if '{AppDomain}.dispose()' is called, which got us here in the first place)
                    _object.dispose = noop;
                    appDomain.dispose(_object);
                }

                Utilities.erase(this, release); // ('__id' will be erased, and serve to flag 'disposal completed'; note: any active/undisposed object)

                if (!release)
                    _object.$__appDomain = this;
                else {
                    // ... place the object into the disposed objects list ...

                    var type: ITypeInfo = <any>_object.constructor;

                    if (!type.$__fullname)
                        error("dispose()", "The object type is not registered.  Please see one of the AppDomain 'registerClass()/registerType()' functions for more details.", object);

                    var funcList = __disposedObjects[type.$__fullname];

                    if (!funcList)
                        __disposedObjects[type.$__fullname] = funcList = [];

                    funcList.push(_object);
                }
            } else {
                for (var i = this._applications.length - 1; i >= 0; --i)
                    dispose(this._applications[i]);
                this._applications.length = 0;

                for (var i = this._windows.length - 1; i >= 0; --i)
                    dispose(this._windows[i]);
                this._windows.length = 0;
            }

            // ... close all except "self", then close "self" ...
            for (var i = this._windows.length - 1; i >= 0; --i)
                if (this._windows[i].target != global)
                    this._windows[i].close();
            global.close();
        }
    }

    export interface IClassFactory { }

    export type ClassFactoryType<TClass extends IType = IType, TFactoryType extends IFactoryTypeInfo = IFactoryTypeInfo>
        = TFactoryType & IClassFactory & {
            /** This is a reference to the underlying class type for this factory type. */
            $__type: TClass
        }

    export function ClassFactory<TBaseClass extends object, TClass extends IType, TFactory extends IFactoryTypeInfo, TNamespace extends object>
        (namespace: TNamespace, base: IClassFactory & { $__type: TBaseClass }, getType: (base: TBaseClass) => [TClass, TFactory], exportName?: keyof TNamespace, addMemberTypeInfo = true)
        : ClassFactoryType<TClass, TFactory> {
        function _error(msg: string) {
            error("ClassFactory()", msg, namespace);
        }
        if (!getType) _error("A 'getType' selector function is required.");
        if (!namespace) _error("A 'namespace' value is required.");

        var types = getType(base && base.$__type || <any>base); // ('$__type' is essentially the same reference as base, but with the original type)
        var cls = types[0];
        var factory = types[1];

        if (!cls) _error("'getType: (base: TBaseClass) => [TClass, TFactory]' did not return a class instance, which is required.");
        if (typeof cls != 'function') _error("'getType: (base: TBaseClass) => [TClass, TFactory]' did not return a class (function) type object, which is required.");

        var name = exportName || getTypeName(cls);
        if (name.charAt(0) == '$') name = name.substr(1); // TODO: May not need to do this anymore.

        if (!factory) log("ClassFactory()", "Warning: No factory was supplied for class type '" + name + "' in namespace '" + getFullTypeName(namespace) + "'.", LogTypes.Warning, cls);

        return Types.__registerFactoryType(<any>cls, <any>factory, namespace, addMemberTypeInfo, exportName);
    }

    /** Builds and returns a base type to be used with creating factory objects. This function stores some type information in static properties for reference. */
    export function FactoryBase<TClass extends IType<object>, TBaseFactory extends IFactoryTypeInfo, TStaticProperties extends keyof TClass>
        (type: TClass, baseFactoryType: TBaseFactory) {
        return class FactoryBase extends type {
            /** The underlying type associated with this factory type. */
            static $__type = type;
            //x /** The factory type instance for the underlying type '$__type'. */
            //x static $__factory: IFactory;
            /** The base factory type, if any. */
            static $__baseFactoryType = baseFactoryType;

            /** The underlying type. */
            protected static get type() { return this.$__type; }
            /** The base factory instance. */
            protected static get super(): TBaseFactory { return this.$__baseFactoryType; }

            static 'new'?(...args: any[]): any;
            static init?(o: InstanceType<TClass>, isnew: boolean, ...args: any[]): void;

            ///** 
            // * Called to register factory types for a class (see also 'Types.__registerType()' for non-factory supported types).
            // * 
            // * @param {modules} namespace A list of all namespaces up to the current type, usually starting with 'CoreXT' as the first namespace.
            // * @param {boolean} addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
            // * applied (using the IFunctionInfo interface).
            //*/
            //x static register<TClass extends IType<object>, TFactory extends { new(): IFactory }>(this: TFactory & ITypeInfo & IFactoryTypeInfo & { $__type: TClass },
            //    namespace: object, addMemberTypeInfo = true): InstanceType<TFactory> & IRegisteredFactoryType<TClass, TFactory> {
            //    return Types.__registerFactoryType(<TFactory & ITypeInfo & IFactoryTypeInfo>this, namespace, addMemberTypeInfo);
            //}
        };
    }
    // (call with context vs context as arg?: https://jsperf.com/call-this-vs-this-as-argument/1)

    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<Z extends keyof T, T extends object = typeof CoreXT.global>(firstNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, Z extends keyof T[A], T extends object = typeof CoreXT.global>(ns1: A, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, B extends keyof T[A], Z extends keyof T[A][B], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], Z extends keyof T[A][B][C], T extends object = typeof CoreXT>(ns1: A, ns2?: B, ns3?: C, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], Z extends keyof T[A][B][C][D], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], Z extends keyof T[A][B][C][D][E], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], Z extends keyof T[A][B][C][D][E][F], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], Z extends keyof T[A][B][C][D][E][F][G], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], H extends keyof T[A][B][C][D][E][F][G], Z extends keyof T[A][B][C][D][E][F][G][H], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, ns8?: H, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], H extends keyof T[A][B][C][D][E][F][G], I extends keyof T[A][B][C][D][E][F][G][H], Z extends keyof T[A][B][C][D][E][F][G][H][I], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, ns8?: H, ns9?: I, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    export function registerNamespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], H extends keyof T[A][B][C][D][E][F][G], I extends keyof T[A][B][C][D][E][F][G][H], J extends keyof T[A][B][C][D][E][F][G][H][I], Z extends keyof T[A][B][C][D][E][F][G][H][I][J]= any, T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, ns8?: H, ns9?: I, ns10?: J, lastNsOrClassName?: Z, root?: T): void;
    export function registerNamespace(...args: any[]): void {
        var root = args[args.length - 1];
        var lastIndex = (typeof root == 'object' ? args.length - 1 : (root = global, args.length));
        Types.__registerNamespace(root, ...global.Array.prototype.slice.call(arguments, 0, lastIndex));
    }

    registerNamespace("CoreXT", "Types"); // ('CoreXT.Types' will become the first registered namespace)

    // ===================================================================================================================================

    /** Contains diagnostic based functions, such as those needed for logging purposes. */
    export namespace System.Diagnostics {
        registerNamespace("CoreXT", "System", "Diagnostics");
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        export var __logItems: ILogItem[] = [];
        var __logItemsSequenceCounter = 0;
        var __logCaptureStack: ILogItem[] = [];

        export enum DebugModes { // TODO: ...
            /** Run in release mode, which loads all minified module scripts, and runs the application automatically when ready. */
            Release,
            /** Run in debug mode (default), which loads all un-minified scripts, and runs the application automatically when ready. */
            Debug_Run,
            /** Run in debug mode, which loads all un-minified scripts, but does NOT run the application automatically.
              * To start the application process, call 'CoreXT.Scripts.runApp()".
              */
            Debug_Wait
        }

        /** Sets the debug mode. A developer should set this to one of the desired 'DebugModes' values.
        */
        export var debug: DebugModes = DebugModes.Debug_Run;

        /** Returns true if CoreXT is running in debug mode. */
        export function isDebugging() { return debug != DebugModes.Release; }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        export var LogItem = ClassFactory(Diagnostics, void 0,
            (base) => {
                class LogItem {
                    /** The parent log item. */
                    parent: LogItem = null;
                    /** The sequence count of this log item. */
                    sequence: number = __logItemsSequenceCounter++; // (to maintain correct ordering, as time is not reliable if log items are added too fast)
                    /** The title of this log item. */
                    title: string;
                    /** The message of this log item. */
                    message: string;
                    /** The time of this log item. */
                    time: number;
                    /** The type of this log item. */
                    type: LogTypes;
                    /** The source of the reason for this log item, if any. */
                    source: {};

                    subItems: LogItem[];

                    marginIndex: number = void 0;

                    /** Write a message to the log without using a title and return the current log item instance. */
                    write(message: string, type?: LogTypes, outputToConsole?: boolean): LogItem;
                    /** Write a message to the log. */
                    write(message: any, type?: LogTypes, outputToConsole?: boolean): LogItem;
                    write(message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): LogItem {
                        var logItem = Diagnostics.LogItem.new(this, null, message, type);
                        if (!this.subItems)
                            this.subItems = [];
                        this.subItems.push(logItem);
                        return this;
                    }

                    /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
                    log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): LogItem;
                    /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
                    log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): LogItem;
                    log(title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): LogItem {
                        var logItem = Diagnostics.LogItem.new(this, title, message, type, outputToConsole);
                        if (!this.subItems)
                            this.subItems = [];
                        this.subItems.push(logItem);
                        return logItem;
                    }

                    /** Causes all future log writes to be nested under this log entry.
                    * This is usually called at the start of a block of code, where following function calls may trigger nested log writes. Don't forget to call 'endCapture()' when done.
                    * The current instance is returned to allow chaining function calls.
                    * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
                    */
                    beginCapture(): LogItem {
                        //? if (__logCaptureStack.indexOf(this) < 0)
                        __logCaptureStack.push(this);
                        return this;
                    }

                    /** Undoes the call to 'beginCapture()', activating any previous log item that called 'beginCapture()' before this instance.
                    * See 'beginCapture()' for more details.
                    * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
                    */
                    endCapture() {
                        //var i = __logCaptureStack.lastIndexOf(this);
                        //if (i >= 0) __logCaptureStack.splice(i, 1);
                        var item = __logCaptureStack.pop();
                        if (item != null) throw Exception.from("Your calls to begin/end log capture do not match up. Make sure the calls to 'endCapture()' match up to your calls to 'beginCapture()'.", this);
                    }

                    toString(): string {
                        var time = TimeSpan && TimeSpan.utcTimeToLocalTime(this.time) || null;
                        var timeStr = time && (time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)) || "" + new Date(this.time).toLocaleTimeString();
                        var txt = "[" + this.sequence + "] (" + timeStr + ") " + this.title + ": " + this.message;
                        return txt;
                    }

                    // ------------------------------------------------------------------------------------------------------------

                    protected static readonly 'LogItemFactory' = class Factory extends FactoryBase(LogItem, null) {
                        static 'new'(parent: LogItem, title: string, message: string, type?: LogTypes, outputToConsole?: boolean): InstanceType<typeof Factory.$__type>;
                        static 'new'(parent: LogItem, title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): InstanceType<typeof Factory.$__type> { return null; }

                        static init(o: InstanceType<typeof Factory.$__type>, isnew: boolean, parent: LogItem, title: string, message: string, type?: LogTypes, outputToConsole?: boolean): void;
                        static init(o: InstanceType<typeof Factory.$__type>, isnew: boolean, parent: LogItem, title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true) {
                            if (title === void 0 || title === null) {
                                if (isEmpty(message))
                                    error("LogItem()", "A message is required if no title is given.", o);
                                title = "";
                            }
                            else if (typeof title != 'string')
                                if ((<ITypeInfo>title).$__fullname)
                                    title = (<ITypeInfo>title).$__fullname;
                                else
                                    title = title.toString && title.toString() || title.toValue && title.toValue() || "" + title;

                            if (message === void 0 || message === null)
                                message = "";
                            else
                                message = message.toString && message.toString() || message.toValue && message.toValue() || "" + message;

                            o.parent = parent;
                            o.title = title;
                            o.message = message;
                            o.time = Date.now(); /*ms*/
                            o.type = type;

                            if (console && outputToConsole) { // (if the console object is supported, and the user allows it for this item, then send this log message to it now)
                                var _title = title, margin = ""; // (modify a copy so we can continue to pass along the unaltered title text)
                                if (_title.charAt(title.length - 1) != ":") _title += ": "; else _title += " ";
                                while (parent) { parent = parent.parent; margin += "  "; }
                                if (TimeSpan) {
                                    var time = TimeSpan.utcTimeToLocalTime(o.time);
                                    var consoleText = time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)
                                        + " " + margin + _title + o.message;
                                }
                                else consoleText = (new Date()).toLocaleTimeString() + " " + margin + _title + o.message; // TODO: Make a utility function to format Date() similar to hh:mm:ss
                                CoreXT.log(null, consoleText, type, void 0, false, false);
                            }
                        }
                    };

                    // ------------------------------------------------------------------------------------------------------------
                }

                return [LogItem, LogItem["LogItemFactory"]];
            }
        );

        export interface ILogItem extends InstanceType<typeof LogItem.$__type> { }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        /** Starts a new diagnostics-based log entry. */
        export function log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
        /** Starts a new diagnostics-based log entry. */
        export function log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
        export function log(title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): ILogItem {
            if (__logCaptureStack.length) {
                var capturedLogItem = __logCaptureStack[__logCaptureStack.length - 1];
                var lastLogEntry = capturedLogItem.subItems && capturedLogItem.subItems.length && capturedLogItem.subItems[capturedLogItem.subItems.length - 1];
                if (lastLogEntry)
                    return lastLogEntry.log(title, message, type, outputToConsole);
                else
                    return capturedLogItem.log(title, message, type, outputToConsole); //capturedLogItem.log("", "");
            }
            var logItem = LogItem.new(null, title, message, type);
            __logItems.push(logItem);
            return logItem;
        }

        export function getLogAsHTML(): string {
            var i: number, n: number;
            var orderedLogItems: ILogItem[] = [];
            var item: ILogItem;
            var logHTML = "<div>\r\n", cssClass = "", title: string, icon: string,
                rowHTML: string, titleHTML: string, messageHTML: string, marginHTML: string = "";
            var logItem: ILogItem, lookAheadLogItem: ILogItem;
            var time: ITimeSpan;
            var cssAndIcon: { cssClass: string; icon: string; };
            var margins: string[] = [""];
            var currentMarginIndex: number = 0;

            function cssAndIconFromLogType_text(type: LogTypes): { cssClass: string; icon: string; } {
                var cssClass, icon;
                switch (type) {
                    case LogTypes.Success: cssClass = "text-success"; icon = "&#x221A;"; break;
                    case LogTypes.Info: cssClass = "text-info"; icon = "&#x263C;"; break;
                    case LogTypes.Warning: cssClass = "text-warning"; icon = "&#x25B2;"; break;
                    case LogTypes.Error: cssClass = "text-danger"; icon = "<b>(!)</b>"; break;
                    default: cssClass = ""; icon = "";
                }
                return { cssClass: cssClass, icon: icon };
            }
            function reorganizeEventsBySequence(logItems: ILogItem[]) {
                var i: number, n: number;
                for (i = 0, n = logItems.length; i < n; ++i) {
                    logItem = logItems[i];
                    logItem.marginIndex = void 0;
                    orderedLogItems[logItem.sequence] = logItem;
                    if (logItem.subItems && logItem.subItems.length)
                        reorganizeEventsBySequence(logItem.subItems);
                }
            }
            function setMarginIndexes(logItem: ILogItem, marginIndex: number = 0) {
                var i: number, n: number;

                if (marginIndex && !margins[marginIndex])
                    margins[marginIndex] = margins[marginIndex - 1] + "&nbsp;&nbsp;&nbsp;&nbsp;";

                logItem.marginIndex = marginIndex;

                // ... reserve the margins needed for the child items ...
                if (logItem.subItems && logItem.subItems.length) {
                    for (i = 0, n = logItem.subItems.length; i < n; ++i)
                        setMarginIndexes(logItem.subItems[i], marginIndex + 1);
                }
            }

            // ... reorganize the events by sequence ...

            reorganizeEventsBySequence(__logItems);

            // ... format the log ...

            for (i = 0, n = orderedLogItems.length; i < n; ++i) {
                logItem = orderedLogItems[i];
                if (!logItem) continue;
                rowHTML = "";

                if (logItem.marginIndex === void 0)
                    setMarginIndexes(logItem);

                marginHTML = margins[logItem.marginIndex];

                cssAndIcon = cssAndIconFromLogType_text(logItem.type);
                if (cssAndIcon.icon) cssAndIcon.icon += "&nbsp;";
                if (cssAndIcon.cssClass)
                    messageHTML = cssAndIcon.icon + "<strong>" + String.replace(logItem.message, "\r\n", "<br />\r\n") + "</strong>";
                else
                    messageHTML = cssAndIcon.icon + logItem.message;

                if (logItem.title)
                    titleHTML = logItem.title + ": ";
                else
                    titleHTML = "";

                time = TimeSpan.utcTimeToLocalTime(logItem.time);

                rowHTML = "<div class='" + cssAndIcon.cssClass + "'>"
                    + time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds) + "&nbsp;"
                    + marginHTML + titleHTML + messageHTML + "</div>" + rowHTML + "\r\n";

                logHTML += rowHTML + "</ br>\r\n";
            }

            logHTML += "</div>\r\n";

            return logHTML;
        }

        export function getLogAsText(): string {
            //??var logText = "";
            //??for (var i = 0, n = __logItems.length; i < n; ++i)
            //??    logText += String.replaceTags(__logItems[i].title) + ": " + String.replaceTags(__logItems[i].message) + "\r\n";
            return String.replaceTags(String.replace(getLogAsHTML(), "&nbsp;", " "));
        }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
    }

    // ========================================================================================================================================

    interface _IError {
        name: string;
        message: string;
        stack: string; // (in opera, this is a call stack only [no source and line details], and includes function names and args)
        stacktrace: string; // (opera - includes source and line info)
        lineNumber: number; // (Firefox)
        lineno: number; // (Firefox)
        columnNumber: number; // (Firefox)
        fileName: string; // (Firefox)
    }

    /** Returns the call stack for a given error object. */
    export function getErrorCallStack(errorSource: { stack?: string }): string[] {
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
            if (System && System.Diagnostics && System.Diagnostics.LogItem && errorSource instanceof System.Diagnostics.LogItem) {
                return errorSource.toString();
            } else if ('message' in errorSource) { // (this should support both 'Exception' AND 'Error' objects)
                var error: _IError = errorSource;
                var msg = error.message;
                if (error.name) msg = "(" + error.name + ") " + msg;
                if (error.lineno !== undefined)
                    error.lineNumber = error.lineno;
                if (error.lineNumber !== undefined) {
                    msg += "\r\non line " + error.lineNumber + ", column " + error.columnNumber;
                    if (error.fileName !== undefined)
                        msg += ", of file '" + error.fileName + "'";
                } else if (error.fileName !== undefined)
                    msg += "\r\nin file '" + error.fileName + "'";
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

    /**
     * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseURL = (() => { var u = siteBaseURL || location.origin; if (u.charAt(u.length - 1) != '/') u += '/'; return u; })(); // (example: "https://calendar.google.com/")
    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var baseScriptsURL = (() => { var u = scriptsBaseURL || baseURL; if (u.charAt(u.length - 1) != '/') u += '/'; return u + "js/"; })();

    log("Site Base URL", baseURL); // (requires the exception object, which is the last one to be defined above; now we start the first log entry with the base URI of the site)
    log("Scripts Base URL", baseScriptsURL);

    // ========================================================================================================================================

    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    export namespace Time {
        registerNamespace("CoreXT", "Time");
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

    /** The System module is the based module for most developer related API operations, and is akin to the 'System' .NET namespace. */
    export namespace System {
        registerNamespace("CoreXT", "System");
        // ===================================================================================================================================

        /** 
         * The Exception object is used to record information about errors that occur in an application.
         * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
         */
        export var Exception = ClassFactory(System, void 0,
            (base) => {
                class Exception extends Error {

                    source: object;

                    // ----------------------------------------------------------------------------------------------------------------

                    /** Returns the error message for this exception instance. */
                    toString() { return this.message; }
                    valueOf() { return this.message; }

                    /** Returns the current call stack. */
                    static printStackTrace(): string[] { // TODO: Review: http://www.eriwen.com/javascript/stacktrace-update/
                        var callstack: string[] = [];
                        var isCallstackPopulated = false;
                        try {
                            throw "";
                        } catch (e) {
                            if (e.stack) { //Firefox
                                var lines = e.stack.split('\n');
                                for (var i = 0, len = lines.length; i < len; ++i) {
                                    if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                                        callstack.push(lines[i]);
                                    }
                                }
                                //Remove call to printStackTrace()
                                callstack.shift();
                                isCallstackPopulated = true;
                            }
                            else if (global["opera"] && e.message) { //Opera
                                var lines = e.message.split('\n');
                                for (var i = 0, len = lines.length; i < len; ++i) {
                                    if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                                        var entry = lines[i];
                                        //Append next line also since it has the file info
                                        if (lines[i + 1]) {
                                            entry += ' at ' + lines[i + 1];
                                            i++;
                                        }
                                        callstack.push(entry);
                                    }
                                }
                                //Remove call to printStackTrace()
                                callstack.shift();
                                isCallstackPopulated = true;
                            }
                        }
                        if (!isCallstackPopulated) { //IE and Safari
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

                    /** Generates an exception object from a log item. This allows logging errors separately, then building exceptions from them after.
                    * Usage example: "throw System.Exception.from(logItem, this);" (see also: 'System.Diagnostics.log()')
                    * @param {Diagnostics.LogItem} logItem A log item entry to use as the error source.
                    * @param {object} source The object that is the source of the error, or related to it.
                    */
                    static from(logItem: System.Diagnostics.ILogItem, source?: object): Exception;
                    /** Generates an exception object from a simple string message.
                        * Note: This is different from 'error()' in that logging is more implicit (there is no 'title' parameter, and the log title defaults to "Exception").
                        * Usage example: "throw System.Exception.from("Error message.", this);"
                        * @param {string} message The error message.
                        * @param {object} source The object that is the source of the error, or related to it.
                        */
                    static from(message: string, source?: object): Exception;
                    static from(message: any, source: object = null): Exception {
                        // (support LogItem objects natively as the exception message source)
                        var createLog = true;
                        if (typeof message == 'object' && ((<Diagnostics.ILogItem>message).title || (<Diagnostics.ILogItem>message).message)) {
                            createLog = false; // (this is from a log item, so don't log a second time)
                            if (source != void 0)
                                (<Diagnostics.ILogItem>message).source = source;
                            source = message;
                            message = "";
                            if ((<Diagnostics.ILogItem>source).title)
                                message += (<Diagnostics.ILogItem>source).title;
                            if ((<Diagnostics.ILogItem>source).message) {
                                if (message) message += ": ";
                                message += (<Diagnostics.ILogItem>source).message;
                            }
                        }
                        //var callerFunction = System.Exception.from.caller;
                        //var callerFunctionInfo = <ITypeInfo><any>callerFunction;
                        //var callerName = getFullTypeName(callerFunctionInfo) || "/*anonymous*/";
                        ////var srcName = callerFunction.substring(callerFunction.indexOf("function"), callerFunction.indexOf("("));
                        //var args = callerFunction.arguments;
                        //var _args = args && args.length > 0 ? global.Array.prototype.join.call(args, ', ') : "";
                        //var callerSignature = (callerName ? "[" + callerName + "(" + _args + ")]" : "");
                        //message += (callerSignature ? callerSignature + ": " : "") + message + "\r\n\r\n";
                        var caller = this.from.caller;
                        while (caller && (caller == System.Exception.error || caller == System.Exception.notImplemented || caller == CoreXT.log || caller == CoreXT.error
                            || typeof (<ITypeInfo>caller).$__fullname == 'string' && (<ITypeInfo>caller).$__fullname.substr(0, 17) == "System.Exception.")) // TODO: Create "inheritsFrom()" or similar methods.
                            caller = caller.caller; // (skip the proxy functions that call this function)
                        if (caller) {
                            message += "\r\n\r\nStack:\r\n\r\n";
                            var stackMsg = "";
                            while (caller) {
                                var callerName = getFullTypeName(caller) || "/*anonymous*/";
                                var args = caller.arguments;
                                var _args = args && args.length > 0 ? global.Array.prototype.join.call(args, ', ') : "";
                                if (stackMsg) stackMsg += "called from ";
                                stackMsg += callerName + "(" + _args + ")\r\n\r\n";
                                caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
                            }
                            message += stackMsg;
                        }
                        return System.Exception.new(message, source, createLog);
                    }

                    /** Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
                        * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
                        */
                    static error(title: string, message: string, source?: object): Exception {
                        if (System.Diagnostics && System.Diagnostics.log) {
                            var logItem = System.Diagnostics.log(title, message, LogTypes.Error);
                            return Exception.from(logItem, source);
                        }
                        else return Exception.from(error(title, message, source, false, false), source);
                    }

                    /** Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
                        * The source of the exception object will be associated with the 'LogItem' object.
                        * This function is typically used with non-implemented functions in abstract types.
                        */
                    static notImplemented(functionNameOrTitle: string, source?: object, message?: string): Exception {
                        var msg = "The function is not implemented." + (message ? " " + message : "");
                        if (System.Diagnostics && System.Diagnostics.log) {
                            var logItem = System.Diagnostics.log(functionNameOrTitle, msg, LogTypes.Error);
                            return Exception.from(logItem, source);
                        }
                        else return Exception.from(error(functionNameOrTitle, msg, source, false, false), source);
                    }

                    // -------------------------------------------------------------------------------------------------------------------

                    /**
                       * Don't create objects using the 'new' operator. Use the '{class_type}.new()' static method instead.
                       */
                    constructor() {
                        if (!ES6)
                            eval("var _super = function() { return null; }"); // (ES6 fix for extending built-in types [calling constructor not supported]; more details on it here: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work)
                        super();
                    }

                    // -------------------------------------------------------------------------------------------------------------------

                    protected static readonly 'ExceptionFactory' = class Factory extends FactoryBase(Exception, null) {
                        /** Records information about errors that occur in the application.
                            * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
                            * @param {string} message The error message.
                            * @param {object} source An object that is associated with the message, or null.
                            * @param {boolean} log True to automatically create a corresponding log entry (default), or false to skip.
                            */
                        static 'new'(message: string, source: object, log?: boolean): InstanceType<typeof Factory.$__type> { return null; }

                        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
                        static init(o: InstanceType<typeof Factory.$__type>, isnew: boolean, message: string, source: object, log?: boolean) {
                            o.message = message;
                            o.source = source;
                            o.stack = (new Error()).stack;
                            if (log || log === void 0) Diagnostics.log("Exception", message, LogTypes.Error);
                        }
                    };

                    // -------------------------------------------------------------------------------------------------------------------------------
                }
                return [Exception, Exception["ExceptionFactory"]];
            }
        );

        export interface IException extends InstanceType<typeof Exception.$__type> { }

        // ===================================================================================================================================
    }

    // At this point the core type system, exception objects, and logging are now available.

    // ========================================================================================================================================

    export interface ICallback<TSender> { (sender?: TSender): void }
    export interface IResultCallback<TSender> { (sender?: TSender, result?: any): any }
    export interface IErrorCallback<TSender> { (sender?: TSender, error?: any): any }

    /** The loader namespace contains low level functions for loading/bootstrapping the whole system. */
    export namespace Loader {
        registerNamespace("CoreXT", "Loader");
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

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

        // ====================================================================================================================

        /** 
         * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
         * implementation designed to work better with the CoreXT system specifically, and to support parallel loading).
         * Note: It is advised to use 'CoreXT.Loader.loadResource()' to load resources instead of directly creating resource request objects.
         * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
         * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
         */
        export var ResourceRequest = ClassFactory(Loader, void 0,
            (base) => {
                class ResourceRequest { // (inspired by the "promises" methodology: http://www.html5rocks.com/en/tutorials/es6/promises/, http://making.change.org/post/69613524472/promises-and-error-handling, http://goo.gl/9HeBrN)
                    private $__index: number;

                    /** The requested resource URL. */
                    _url: string;
                    get url() {
                        if (typeof this._url == 'string' && this._url.substr(0, 2) == "~/") {
                            var _baseURL = this.type == ResourceTypes.Application_Script ? baseScriptsURL : baseURL;
                            return _baseURL + this._url.substr(2);
                        }
                        return this._url;
                    }
                    set url(value: string) { this._url = value; }
                    /** The requested resource type (to match against the server returned MIME type for data type verification). */
                    type: ResourceTypes | string;

                    /** The XMLHttpRequest object used for this request.  It's marked private to discourage access, but experienced
                      * developers should be able to use it if necessary to further configure the request for advanced reasons.
                      */
                    _xhr: XMLHttpRequest; // (for parallel loading, each request has its own connection)

                    /** The raw data returned from the HTTP request.
                      * Note: This does not change with new data returned from callback handlers (new data is passed on as the first argument to
                      * the next call [see 'transformedData']).
                      */
                    data: any; // (The response entity body according to responseType, as an ArrayBuffer, Blob, Document, JavaScript object (from JSON), or string. This is null if the request is not complete or was not successful.)

                    /** Set to data returned from callback handlers as the 'data' property value gets transformed.
                      * If no transformations were made, then the value in 'data' is returned.
                      */
                    get transformedData(): any {
                        return this.$__transformedData === noop ? this.data : this.$__transformedData;
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
                            error("ResourceRequest", this._message, this, false); // (send resource loading error messages to the console to aid debugging)
                        else
                            log("ResourceRequest", this._message, LogTypes.Normal, this);
                    }
                    private _message: string;

                    /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
                    messageLog: string[] = [];

                    /** If true (default), them this request is non-blocking, otherwise the calling script will be blocked until the request
                      * completes loading.  Please note that no progress callbacks can occur during blocked operations (since the thread is
                      * effectively 'paused' in this scenario).
                      */
                    async: boolean;

                    private _onProgress: ICallback<ResourceRequest>[];
                    private _onReady: ICallback<ResourceRequest>[]; // ('onReady' is triggered in order of request made, and only when all included dependencies have completed successfully)

                    /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
                    * There's also an 'on finally' which should execute on success OR failure, regardless.
                    * For each entry, only ONE of any callback type will be set.
                    */
                    private _promiseChain: {
                        onLoaded?: ICallback<ResourceRequest>; // (resource is loaded, but may not be ready [i.e. previous scripts may not have executed yet])
                        onError?: ICallback<ResourceRequest>; // (there is one error entry [defined or not] for every 'onLoaded' event entry, and vice versa)
                        onFinally?: ICallback<ResourceRequest>;
                    }[] = [];
                    private _promiseChainIndex: number = 0; // (the current position in the event chain)

                    /** 
                     * A list of parent requests that this request is depending upon.
                     * When 'start()' is called, all parents are triggered to load first, working downwards.
                     * Regardless of order, loading is in parallel asynchronously; however, the 'onReady' event will fire in the expected order.
                     * */
                    _parentRequests: ResourceRequest[];
                    private _parentCompletedCount = 0; // (when this equals the # of 'dependents', the all parent resources have loaded [just faster than iterating over them])
                    _dependants: ResourceRequest[]; // (dependant child resources)

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
                            this._queueDoNext(this.data);
                        }
                        // ... else, not needed, as the chain is still being traversed, so anything added will get run as expected ...
                    }

                    then(success: ICallback<IResourceRequest>, error?: IErrorCallback<IResourceRequest>) {
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
                    include(request: IResourceRequest) {
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

                    /** Starts loading the current resource.  If the current resource has dependencies, they are triggered to load first (in proper
                      * order).  Regardless of the start order, all scripts are loaded in parallel.
                      * Note: This call queues the start request in 'async' mode, which begins only after the current script execution is completed.
                      */
                    start(): this { if (this.async) setTimeout(() => { this._Start(); }, 0); else this._Start(); return this; }

                    private _Start() {
                        // ... start at the top most parent first, and work down ...
                        if (this._parentRequests)
                            for (var i = 0, n = this._parentRequests.length; i < n; ++i)
                                this._parentRequests[i].start();

                        if (this.status == RequestStatuses.Pending) {
                            this.status = RequestStatuses.Loading; // (do this first to protect against any possible cyclical calls)
                            this.message = "Loading resource '" + this.url + "' ...";

                            // ... this request has not been started yet; attempt to load the resource ...
                            // ... 1. see first if this file is cached in the web storage, then load it from there instead ...

                            if (System.Diagnostics && !System.Diagnostics.isDebugging() && typeof Storage !== void 0)
                                try {
                                    this.data = localStorage.getItem("resource:" + this.url); // (should return 'null' if not found)
                                    if (this.data !== null && this.data !== void 0) {
                                        this.status = RequestStatuses.Loaded;
                                        this._doNext();
                                        return;
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
                                        this.data = xhr.response;
                                        this.status == RequestStatuses.Loaded;
                                        this.message = xhr.status == 304 ? "Loading completed (from browser cache)." : "Loading completed.";

                                        // ... check if the expected mime type matches, otherwise throw an error to be safe ...
                                        var responseType = xhr.getResponseHeader('content-type');
                                        if (this.type && responseType && <string><any>this.type != responseType) {
                                            this.setError("Resource type mismatch: expected type was '" + this.type + "', but received '" + responseType + "' (XHR type '" + xhr.responseType + "').\r\n");
                                        }
                                        else {
                                            if (typeof Storage !== void 0)
                                                try {
                                                    localStorage.setItem("resource:" + this.url, this.data);
                                                    this.message = "Resource '" + this.url + "' loaded from local storage.";
                                                } catch (e) {
                                                    // .. failed: out of space? ...
                                                    // TODO: consider saving to web SQL as well, or on failure (as a backup; perhaps create a storage class with this support). //?
                                                }

                                            this._doNext();
                                        }
                                    }
                                    else {
                                        this.setError("There was a problem loading the resource '" + this.url + "' (status code " + xhr.status + ": " + xhr.statusText + ").\r\n");
                                    }
                                };

                                // ... this script is not cached, so load it ...

                                xhr.onreadystatechange = () => { // (onreadystatechange is supported by all browsers)
                                    switch (xhr.readyState) {
                                        case XMLHttpRequest.UNSENT: break;
                                        case XMLHttpRequest.OPENED: this.message = "Opened connection to '" + this.url + "'."; break;
                                        case XMLHttpRequest.HEADERS_RECEIVED: this.message = "Headers received for '" + this.url + "'."; break;
                                        case XMLHttpRequest.LOADING: break; // (this will be handled by the progress event)
                                        case XMLHttpRequest.DONE: loaded(); break;
                                    }
                                };

                                xhr.onerror = (ev: ErrorEvent) => { this.setError(void 0, ev); this._doError(); };
                                xhr.onabort = () => { this.setError("Request aborted."); };
                                xhr.ontimeout = () => { this.setError("Request timed out."); };
                                xhr.onprogress = (evt: ProgressEvent) => {
                                    this.message = "Loaded " + Math.round(evt.loaded / evt.total * 100) + "%.";
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
                            xhr.open("get", url, this.async);
                        }
                        catch (ex) {
                            error("get()", "Failed to load resource from URL '" + url + "': " + ((<Error>ex).message || ex), this);
                        }

                        try {
                            xhr.send();
                        }
                        catch (ex) {
                            error("get()", "Failed to send request to endpoint for URL '" + url + "': " + ((<Error>ex).message || ex), this);
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

                    setError(message: string, error?: { name?: string; message: string; stack?: string }): void { // TODO: Make this better, perhaps with a class to handle error objects (see 'Error' AND 'ErrorEvent'). //?

                        if (error) {
                            var errMsg = getErrorMessage(error);
                            if (errMsg) {
                                if (message) message += "\r\n";
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
                                    var data = handlers.onLoaded.call(this, this.transformedData); // (call the handler with the current data and get the resulting data, if any)
                                } catch (e) {
                                    this.setError("Success handler failed.", e);
                                    ++this._promiseChainIndex; // (the success callback failed, so trigger the error chain starting at next index)
                                    this._doError();
                                    return;
                                }
                                if (typeof data === 'object' && data instanceof ResourceRequest) {
                                    // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                                    if ((<ResourceRequest>data).status == RequestStatuses.Error) {
                                        this.setError("Rejected request returned.");
                                        ++this._promiseChainIndex;
                                        this._doError();
                                        return;
                                    } else {
                                        // ... get the data from the request object ...
                                        var newResReq = <ResourceRequest>data;
                                        if (newResReq.status >= RequestStatuses.Ready) {
                                            if (newResReq === this) continue; // ('self' [this] was returned, so go directly to the next item)
                                            data = newResReq.transformedData; // (the data is ready, so read now)
                                        } else { // (loading is started, or still in progress, so wait; we simply hook into the request object to get notified when the data is ready)
                                            newResReq.ready((sender) => { this.$__transformedData = sender.transformedData; this._doNext(); })
                                                .catch((sender) => { this.setError("Resource returned from next handler has failed to load.", sender); this._doError(); });
                                            return;
                                        }
                                    }
                                }
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
                                this.message = "Resource '" + this.url + "' has no dependencies, and is now ready.";
                            } else // ...need to determine if all parent (dependent) resources are completed first ...
                                if (this._parentCompletedCount == this._parentRequests.length) {
                                    this.status = RequestStatuses.Ready; // (all parent resource dependencies are now 'ready')
                                    this.message = "All dependencies for resource '" + this.url + "' have loaded, and are now ready.";
                                } else {
                                    this.message = "Resource '" + this.url + "' is waiting on dependencies (" + this._parentCompletedCount + "/" + this._parentRequests.length + " ready so far)...";
                                    return; // (nothing more to do yet)
                                }

                        // ... call the local 'onReady' event, and then trigger the call on the children as required.

                        if (this.status == RequestStatuses.Ready) {
                            if (this._onReady && this._onReady.length) {
                                try {
                                    this._onReady.shift().call(this, this);
                                    if (this._paused) return;
                                } catch (e) {
                                    this.setError("Error in ready handler.", e);
                                }
                            }

                            if (this._dependants)
                                for (var i = 0, n = this._dependants.length; i < n; ++i) {
                                    ++this._dependants[i]._parentCompletedCount;
                                    this._dependants[i]._doReady(); // (notify all children that this resource is now 'ready' for use [all events have been run, as opposed to just being loaded])
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
                                if (typeof newData === 'object' && newData instanceof ResourceRequest) {
                                    // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                                    if ((<ResourceRequest>newData).status == RequestStatuses.Error)
                                        return; // (no correction made, still in error; terminate the event chain here)
                                    else {
                                        var newResReq = <ResourceRequest>newData;
                                        if (newResReq.status >= RequestStatuses.Ready)
                                            newData = newResReq.transformedData;
                                        else { // (loading is started, or still in progress, so wait)
                                            newResReq.ready((sender) => { this.$__transformedData = sender.transformedData; this._doNext(); })
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
                    }

                    // ----------------------------------------------------------------------------------------------------------------

                    protected static readonly 'ResourceRequestFactory' = class Factory extends FactoryBase(ResourceRequest, null) {
                        /** Returns a new module object only - does not load it. */
                        static 'new'(url: string, type: ResourceTypes | string, async?: boolean): InstanceType<typeof Factory.$__type> { return null; }

                        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
                        static init(o: InstanceType<typeof Factory.$__type>, isnew: boolean, url: string, type: ResourceTypes | string, async: boolean = true) {
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
                        }
                    };

                    // ----------------------------------------------------------------------------------------------------------------
                }
                return [ResourceRequest, ResourceRequest["ResourceRequestFactory"]];
            }
        );

        export interface IResourceRequest extends InstanceType<typeof ResourceRequest.$__type> { }

        // ====================================================================================================================

        var _resourceRequests: IResourceRequest[] = []; // (requests are loaded in parallel, but executed in order of request)
        var _resourceRequestByURL: { [url: string]: IResourceRequest } = {}; // (a quick named index lookup into '__loadRequests')

        /** Returns a load request promise-type object for a resource loading operation. */
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

        /** Used by the bootstrapper in applying system scripts as they become ready.
          * Applications should normally never use this, and instead use the 'modules' system in the 'CoreXT.Scripts' namespace for
          * script loading.
          */
        export function _SystemScript_onReady_Handler(request: IResourceRequest) {
            try {
                globalEval(request.transformedData); // ('CoreXT.eval' is used for system scripts because some core scripts need initialize in the global scope [mostly due to TypeScript limitations])
                // (^note: MUST use global evaluation as code may contain 'var's that will get stuck within function scopes)
                request.status = RequestStatuses.Executed;
                request.message = "The script has been executed.";
            } catch (e) {
                request.setError("There was an error executing script '" + request.url + "'.", e);
            }
        }

        export function bootstrap() {
            // (note: the request order is the dependency order)

            var onReady = _SystemScript_onReady_Handler;

            // ... load the base scripts first (all of these are not modules, so they have to be loaded in the correct order) ...
            get("~/CoreXT.Utilities.js").ready(onReady) // (a lot of items depend on time [such as some utilities and logging] so this needs to be loaded first)
                .include(get("~/CoreXT.Globals.js")).ready(onReady)
                .include(get("~/System/CoreXT.System.js").ready(onReady))
                .include(get("~/System/CoreXT.System.PrimitiveTypes.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Collections.IndexedObjectCollection.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Collections.ObservableCollection.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Time.js")).ready(onReady)
                .include(get("~/System/CoreXT.System.Events.js").ready(onReady))
                .include(get("~/CoreXT.Browser.js")).ready(onReady) // (in case some polyfills are needed after this point)
                .include(get("~/CoreXT.Scripts.js").ready(onReady))
                // ... load the rest of the core system next ...
                .include(get("~/System/CoreXT.System.AppDomain.js").ready(onReady))
                .include(get("~/System/CoreXT.System.IO.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Data.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Diagnostics.js").ready(onReady))
                .include(get("~/System/CoreXT.System.Exception.js").ready(onReady))
                .ready(() => {
                    // ... all core system scripts loaded, load the default manifests next ...
                    Scripts.getManifest() // (load the default manifest in the current path [defaults to 'manifest.js'])
                        .include(Scripts.getManifest("~/app.manifest")) // (load a custom named manifest; application launching begins here)
                        .ready((mod) => {
                            CoreXT.onReady.dispatch();
                            Scripts._tryRunApp();
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
}

// ========================================================================================================================================

/** (See 'CoreXT') */
var corext = CoreXT; // (allow all lower case usage)

if (typeof $X === void 0)
    /** A shorthand form to use for the 'CoreXT' global reference. */
    var $X = CoreXT;

// ... users will need to make sure 'System' and/or 'using' are not in use (undefined or set to null before this script is executed) in order to use it as a valid type reference ...

if (typeof System === void 0 || System === null) { // (users should reference "System.", but "CoreXT.System" can be used if the global 'System' is needed for something else)
    /** The base module for all CoreXT System namespace types. */
    var System = CoreXT.System; // (try to make this global, unless otherwise predefined ...)
}

CoreXT.Loader.bootstrap();
// TODO: Allow users to use 'CoreXT.Loader' to load their own scripts, and skip loading the CoreXT system.
