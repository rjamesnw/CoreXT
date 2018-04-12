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

declare var siteBaseURL: string;

// ===========================================================================================================================

/**
 * The root namespace for the CoreXT system.
 */
namespace CoreXT {

    // =======================================================================================================================
    // Integrate native types

    export interface IIndexableObject { [index: string]: any }

    export declare module NativeTypes {
        export interface IFunction extends Function { }
        export interface IObject extends Object, IIndexableObject { }
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

    export declare module NativeStaticTypes {
        export var StaticFunction: FunctionConstructor;
        export var StaticObject: ObjectConstructor;
        export var StaticArray: ArrayConstructor;
        export var StaticString: StringConstructor;
        export var StaticNumber: NumberConstructor;
        export var StaticBoolean: BooleanConstructor;
        export var StaticRegExp: RegExpConstructor;
        export var StaticDate: DateConstructor;
        export var StaticMath: typeof Math;
        export var StaticError: ErrorConstructor;
        export var StaticXMLHttpRequest: typeof XMLHttpRequest;
        export var StaticHTMLElement: typeof HTMLElement;
        export var StaticWindow: typeof Window;
    }

    export interface IStaticGlobals extends Window {
        [index: string]: any;
        Function: typeof NativeStaticTypes.StaticFunction;
        Object: typeof NativeStaticTypes.StaticObject;
        Array: typeof NativeStaticTypes.StaticArray;
        String: typeof NativeStaticTypes.StaticString;
        Number: typeof NativeStaticTypes.StaticNumber;
        Boolean: typeof NativeStaticTypes.StaticBoolean;
        RegExp: typeof NativeStaticTypes.StaticRegExp;
        Date: typeof NativeStaticTypes.StaticDate;
        Math: typeof NativeStaticTypes.StaticMath;
        Error: typeof NativeStaticTypes.StaticError;
        XMLHttpRequest: typeof NativeStaticTypes.StaticXMLHttpRequest;
        HTMLElement: typeof NativeStaticTypes.StaticHTMLElement;
        Window: typeof NativeStaticTypes.StaticWindow;
    }

    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    export var global: IStaticGlobals = (function () { return function () { }.constructor("return this"); })(); // (note: this is named as 'global' to support the NodeJS "global" object as well [for compatibility, or to ease portability])

    export var host: IHostBridge = (() => {
        // ... make sure the host object is valid for at least checking client/server/studio states
        if (typeof host !== 'object' || typeof host.isClient == 'undefined' || typeof host.isServer == 'undefined' || typeof host.isStudio == 'undefined')
            return new __NonCoreXTHost__();
        else
            return host; // (running in a valid host (or emulator? ;) )
    })();

    // =======================================================================================================================
    /** A constant value for 'undefined' (eg. if (typeof value == UNDEFINED)...). */
    export const UNDEFINED = 'undefined';
    /** A constant value for 'function' (eg. if (typeof value == FUNCTION)...). */
    export const FUNCTION = 'function';
    /** A constant value for 'object' (eg. if (typeof value == OBJECT)...). */
    export const OBJECT = 'object';
    /** A constant value for 'string' (eg. if (typeof value == STRING)...). */
    export const STRING = 'string';
    /** A constant value for 'number' (eg. if (typeof value == NUMBER)...). */
    export const NUMBER = 'number';
    /** A constant value for 'boolean' (eg. if (typeof value == BOOLEAN)...). */
    export const BOOLEAN = 'boolean';

    /** The root namespace name as the string constant. */
    export const ROOT_NAMESPACE = "CoreXT";

    /** A simple function that does nothing (no operation).
    * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
    * or when replacing the 'CoreXT.Loader.bootstrap()' function, which should only ever need to be called once.
    */
    export function noop(...args: any[]): any { }

    /** Evaluates a string within a Function scope at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures.
      */
    export declare function safeEval(x: string, ...args: any[]): any;

    /** Evaluates a string directly at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures.
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

    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
      * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
      * 'Environments.Worker'.
      * The core of CoreXT runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since 
      * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
      * For scripts running on the serve side, this will be set to 'Environments.Server'.
      */
    export var Environment = (function (): Environments {
        if (typeof navigator !== OBJECT) {
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
        } else if (typeof window == OBJECT && window.document)
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

    /** Logs the message to the console (if available) and returns it.
      * If 'userLogger' is true (default) then 'System.Diagnostics.log' is also called.
      */
    export function log(msg: any, logType = LogTypes.Normal, throwOnError = true, useLogger = true): string {
        msg = '' + msg;
        if (console)
            switch (logType) {
                case LogTypes.Success:
                    console.log(msg);
                    break;
                case LogTypes.Normal:
                    console.log(msg);
                    break;
                case LogTypes.Info:
                    (console.info || console.log).call(console, msg);
                    break;
                case LogTypes.Warning:
                    (console.warn || console.info || console.log).call(console, msg);
                    break;
                case LogTypes.Error:
                    (console.error || console.warn || console.info || console.log).call(console, msg);
                    throw msg;
                case LogTypes.Debug:
                    (console.debug || console.info || console.log).call(console, msg);
                    break;
                case LogTypes.Trace:
                    (console.trace || console.info || console.log).call(console, msg);
                    break;
            }

        if (System.Diagnostics && System.Diagnostics.log)
            System.Diagnostics.log(void 0, msg, logType, false);

        if (throwOnError && logType == LogTypes.Error)
            throw throwOnError;

        return msg;
    }

    // =======================================================================================================================

    /**
     * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    export var BaseURI = (() => { var u = siteBaseURL || location.origin; if (u.charAt(u.length - 1) != '/') u += '/'; return u; })(); // (example: "https://calendar.google.com/")

    log("Base URI: " + BaseURI);

    // =======================================================================================================================

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
        if (typeof errorSource == STRING)
            return errorSource;
        else if (typeof errorSource == OBJECT) {
            if (System && System.Diagnostics && System.Diagnostics.LogItem && errorSource instanceof System.Diagnostics.LogItem) {
                return errorSource.toString();
            } else if ('message' in errorSource) { // (this should support both 'Exception' AND 'Error' objects)
                var error: _IError = errorSource;
                var msg = error.message;
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
            if (typeof object == FUNCTION)
                if (cacheTypeName)
                    return typeInfo.$__name = Utilities.getFunctionName(object as Function);
                else
                    return Utilities.getFunctionName(object as Function);
            var typeInfo = <ITypeInfo><any>object.constructor;
            if (typeInfo.$__name === void 0 || typeInfo.$__name === null) {
                if (cacheTypeName)
                    return typeInfo.$__name = Utilities.getFunctionName(object.constructor);
                else
                    return Utilities.getFunctionName(object.constructor);
            }
            else
                return typeInfo.$__name;
        }
        else return typeInfo.$__name;
    }

    /** Returns true if the given object is empty, or an invalid value (eg. NaN, or an empty object, array, or string). */
    export function isEmpty(obj: any): boolean {
        if (obj === void 0 || obj === null) return true;
        // (note 'DontEnum flag' enumeration bug in IE<9 [on toString, valueOf, etc.])
        if (typeof obj == STRING || Array.isArray(obj)) return !obj.length;
        if (typeof obj != OBJECT) return isNaN(obj);
        for (var key in obj)
            if (global.Object.prototype.hasOwnProperty.call(obj, key)) return false;
        return true;
    }

    // =======================================================================================================================

    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    export namespace Time {
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

    // =======================================================================================================================

    export namespace TypeFactory {
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
        export function __new(...args: any[]): NativeTypes.IObject {
            // ... this is the default 'new' function ...
            // (note: this function may be called with an empty object context [of the expected type] and only one '$__appDomain' property, in which '$__shellType' will be missing)
            var bridge = <System.IADBridge>this; // (note: this should be either a bridge, or a class/factory object, or undefined)
            var type = <ITypeInfo & IFactoryType>this;
            if (this !== void 0 && isEmpty(this) || typeof this != FUNCTION)
                throw System.Exception.error("Constructor call operation on a non-constructor function.", "Using the 'new' operator is only valid on class and class-factory types. Just call the 'SomeType.new()' factory *function* without the 'new' operator.", this);
            var appDomain = bridge.$__appDomain || System.AppDomain.default;
            var instance: NativeTypes.IObject;
            var isNew = false;
            // ... get instance from the pool (of the same type!), or create a new one ...
            var fullTypeName = type.$__fullname;
            var objectPool = fullTypeName && __disposedObjects[fullTypeName];
            if (!objectPool && objectPool.length)
                instance = objectPool.pop();
            else {
                instance = new type.$Type();
                isNew = true;
            }
            if (typeof instance.init == FUNCTION)
                System.Delegate.fastCall(instance.init, instance, isNew, ...arguments);
            return instance;
        }

        /** Called internally once registration is finalized (see also end of 'AppDomain.registerClass()'). */
        export function __RegisterFactoryType<TClass extends IType<object>, TFactory extends IFactoryType<object>>(type: TClass, factoryType: TFactory): TClass & TFactory {
            var _type = <IFactoryType & ITypeInfo & Object><any>type;
            var _factoryType = <TFactory & Object>factoryType;

            if (!_factoryType.$Type)
                _factoryType.$Type = type;

            _type.$__factory = _factoryType; // (sets the factory type on the )
            _type.$InstanceType = factoryType.$InstanceType; // (this copy is not really necessary, but here anyhow to be thorough)
            _type.$BaseFactory = factoryType.$BaseFactory;

            // ... create the 'init' and 'new' hooks ...

            if (!Object.prototype.hasOwnProperty.call(_type.prototype, "init"))
                if (_factoryType.prototype.init && typeof _factoryType.prototype.init == FUNCTION)
                    _type.prototype.init = _factoryType.prototype.init;
                else if (!type.prototype.init || typeof type.prototype.init != FUNCTION)
                    _type.prototype.init = noop;

            if (!Object.prototype.hasOwnProperty.call(_type, "new"))
                if (_factoryType.new && typeof _factoryType.new == FUNCTION)
                    _type.new = function _firstTimeNewTest() {
                        var result = _factoryType.new.call(this, ...arguments);
                        if (result && typeof result == OBJECT) {
                            // (the call returned a valid value, so next time, just use that one as is)
                            _type.new = _factoryType.new;
                            return result;
                        }
                        else {
                            // (an object is required, otherwise this is not valid and only a place holder; if so, revert to the generic 'new' implementation)
                            _type.new = _factoryType.new = __new;
                            return _factoryType.new.call(this, ...arguments);
                        }
                    };
                else if (!_type.new || typeof _type.new != FUNCTION) // (normally the default 'new' function should exist behind the scenes on the base Object type)
                    _type.new = () => {
                        throw "Invalid operation: no valid 'new' function was found on the given type '" + getTypeName(_factoryType, false) + "'. This exists on the DomainObject base type, and is required.";
                    }

            // ... copy over any other static methods and properties on the factory object ...

            for (var p in _factoryType)
                if (_factoryType.hasOwnProperty(p) && !_type.hasOwnProperty(p))
                    _type[p] = _factoryType[p];

            //x if ('__register' in _factoryType)
            //x     _factoryType['__register'] == noop;

            return <any>_type;
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
                        if (System.Exception)
                            throw System.Exception.error("dispose()", "The object type is not registered.  Please see one of the AppDomain 'registerClass()/registerType()' functions for more details.");
                        else
                            log("The object type is not registered.  Please see one of the AppDomain 'registerClass()/registerType()' functions for more details.", LogTypes.Error);
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

    // =======================================================================================================================

    /**
    * A TypeScript decorator used to seal a function and its prototype. Properties cannot be added, but existing ones can be updated.
    */
    export function sealed<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T {
        if (typeof target == CoreXT.OBJECT)
            Object.seal(target);
        if (typeof (<Object>target).prototype == CoreXT.OBJECT)
            Object.seal((<Object>target).prototype);
        return target;
    }

    /**
    * A TypeScript decorator used to freeze a function and its prototype.  Properties cannot be added, and existing ones cannot be changed.
    */
    export function frozen<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T {
        if (typeof target == CoreXT.OBJECT)
            Object.freeze(target);
        if (typeof (<Object>target).prototype == CoreXT.OBJECT)
            Object.freeze((<Object>target).prototype);
        return target;
    }

    // =======================================================================================================================
    // Function Parameter Dependency Injection Support

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

    // =======================================================================================================================

    /** The System module is the based module for most developer related API operations, and is akin to the 'System' .NET namespace. */
    export namespace System {
    }

    // =======================================================================================================================

    export interface ICallback<TSender> { (sender?: TSender): void }
    export interface IResultCallback<TSender> { (sender?: TSender, result?: any): any }
    export interface IErrorCallback<TSender> { (sender?: TSender, error?: any): any }

    /** The loader namespace contains low level functions for loading/bootstrapping the whole system. */
    export namespace Loader {

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

        class $ResourceRequest { // (inspired by the "promises" methodology: http://www.html5rocks.com/en/tutorials/es6/promises/, http://making.change.org/post/69613524472/promises-and-error-handling, http://goo.gl/9HeBrN)
            private $__index: number;

            /** The requested resource URL. */
            url: string;
            /** The requested resource type (to match against the server returned MIME type for data type verification). */
            type: ResourceTypes;

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

            /** A progress/error message related to the status (may not be the same as the response message). */
            get message(): string { // (for errors, aborts, timeouts, etc.)
                return this.$__message;
            }
            set message(value: string) {
                this.$__message = value;
                this.messages.push(this.$__message);
                if (console && console.log)
                    console.log(this.$__message);
            }
            private $__message: string;

            /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
            messages: string[] = [];

            /** If true (default), them this request is non-blocking, otherwise the calling script will be blocked until the request
              * completes loading.  Please note that no progress callbacks can occur during blocked operations (since the thread is
              * effectively 'paused' in this scenario).
              */
            async: boolean;

            private _onProgress: ICallback<$ResourceRequest>[];
            private _onReady: ICallback<$ResourceRequest>[]; // ('onReady' is triggered in order of request made, and only when all included dependencies have completed successfully)

            /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
            * There's also an 'on finally' which should execute on success OR failure, regardless.
            * For each entry, only ONE of any callback type will be set.
            */
            private _promiseChain: {
                onLoaded?: ICallback<$ResourceRequest>; // (resource is loaded, but may not be ready [i.e. previous scripts may not have executed yet])
                onError?: ICallback<$ResourceRequest>; // (there is one error entry [defined or not] for every 'onLoaded' event entry, and vice versa)
                onFinally?: ICallback<$ResourceRequest>;
            }[] = [];
            private _promiseChainIndex: number = 0; // (the current position in the event chain)

            _dependents: $ResourceRequest[]; // (parent resources dependant upon)
            private _dependentCompletedCount = 0; // (when this equals the # of 'dependents', the all parent resources have loaded [just faster than iterating over them])
            _dependants: $ResourceRequest[]; // (dependant child resources)

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
                if (success !== void 0 && success !== null && typeof success != FUNCTION || error !== void 0 && error !== null && typeof error !== FUNCTION)
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
                if (!request._dependents)
                    request._dependents = [];
                if (!this._dependants)
                    this._dependants = [];
                request._dependents.push(this);
                this._dependants.push(request);
                return request;
            }

            /**
             * Add a call-back handler for when the request completes successfully.
             * @param handler
             */
            ready(handler: ICallback<IResourceRequest>) {
                if (typeof handler == FUNCTION) {
                    if (!this._onReady)
                        this._onReady = [];
                    this._onReady.push(handler);
                    this._requeueHandlersIfNeeded();
                } else throw "Handler is not a function.";
                return this;
            }

            /** Adds a hook into the resource load progress event. */
            while(progressHandler: ICallback<IResourceRequest>) {
                if (typeof progressHandler == FUNCTION) {
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
                if (typeof errorHandler == FUNCTION) {
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
                if (typeof cleanupHandler == FUNCTION) {
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
                if (this._dependents)
                    for (var i = 0, n = this._dependents.length; i < n; ++i)
                        this._dependents[i].start();

                if (this.status == RequestStatuses.Pending) {
                    this.status = RequestStatuses.Loading; // (do this first to protect against any possible cyclical calls)

                    this.message = "Loading resource '" + this.url + "' ...";

                    // ... this request has not been started yet; attempt to load the resource ...
                    // ... 1. see first if this file is cached in the web storage, then load it from there instead ...

                    if (typeof Storage !== UNDEFINED)
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
                                this.message = "Loading completed.";

                                // ... check if the expected mime type matches, otherwise throw an error to be safe ...

                                if (<string><any>this.type != xhr.responseType) {
                                    this.setError("Resource type mismatch: expected type was '" + this.type + "', but received '" + xhr.responseType + "'.\r\n");
                                }
                                else {
                                    if (typeof Storage !== UNDEFINED)
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
                        xhr.onabort = () => { this.setError("Request aborted"); };
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
                    xhr.abort(); // (just in case)

                xhr.open("get", this.url, this.async);

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
                var msg = message;

                if (error) {
                    if (msg) msg += " ";
                    if (error.name)
                        msg = "(" + error.name + ") " + msg;
                    message += error.message || "";
                    if (error.stack) msg += "\r\nStack: \r\n" + error.stack + "\r\n";
                }

                this.message = msg;
                this.messages.push(this.message);
                this.status = RequestStatuses.Error;

                // ... send resource loading error messages to the console to aid debugging ...

                if (console)
                    if (console.error)
                        console.error(msg);
                    else if (console.log)
                        console.log(msg);
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
                            this.setError("Success handler failed:", e);
                            ++this._promiseChainIndex; // (the success callback failed, so trigger the error chain starting at next index)
                            this._doError();
                            return;
                        }
                        if (typeof data === OBJECT && data instanceof $ResourceRequest) {
                            // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                            if ((<$ResourceRequest>data).status == RequestStatuses.Error) {
                                this.setError("Rejected request returned.");
                                ++this._promiseChainIndex;
                                this._doError();
                                return;
                            } else {
                                // ... get the data from the request object ...
                                var newResReq = <$ResourceRequest>data;
                                if (newResReq.status >= RequestStatuses.Ready) {
                                    if (newResReq === this) continue; // ('self' [this] was returned, so go directly to the next item)
                                    data = newResReq.transformedData; // (the data is ready, so read now)
                                } else { // (loading is started, or still in progress, so wait; we simply hook into the request object to get notified when the data is ready)
                                    newResReq.ready((sender) => { this.$__transformedData = sender.transformedData; this._doNext(); })
                                        .catch((sender) => { this.setError("Resource returned from next handler has failed to load:", sender); this._doError(); });
                                    return;
                                }
                            }
                        }
                        this.$__transformedData = data;
                    } else if (handlers.onFinally) {
                        try {
                            handlers.onFinally.call(this);
                        } catch (e) {
                            this.setError("Cleanup handler failed:", e);
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
                    if (!this._dependents || !this._dependents.length) {
                        this.status = RequestStatuses.Ready; // (no parent resource dependencies, so this resource is 'ready' by default)
                        this.message = "Resource '" + this.url + "' has no dependencies, and is now ready.";
                    } else // ...need to determine if all parent (dependent) resources are completed first ...
                        if (this._dependentCompletedCount == this._dependents.length) {
                            this.status = RequestStatuses.Ready; // (all parent resource dependencies are now 'ready')
                            this.message = "All dependencies for resource '" + this.url + "' have loaded, and are now ready.";
                        } else {
                            this.message = "Resource '" + this.url + "' is waiting on dependencies (" + this._dependentCompletedCount + "/" + this._dependents.length + " ready so far)...";
                            return; // (nothing more to do yet)
                        }

                // ... call the local 'onReady' event, and then trigger the call on the children as required.

                if (this.status == RequestStatuses.Ready) {
                    if (this._onReady && this._onReady.length) {
                        try {
                            this._onReady.shift().call(this, this);
                            if (this._paused) return;
                        } catch (e) {
                            this.setError("Error in ready handler:", e);
                        }
                    }

                    for (var i = 0, n = this._dependants.length; i < n; ++i) {
                        ++this._dependants[i]._dependentCompletedCount;
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
                            this.setError("Error handler failed:", e);
                        }
                        if (typeof newData === OBJECT && newData instanceof $ResourceRequest) {
                            // ... a 'LoadRequest' was returned (see end of post http://goo.gl/9HeBrN#20715224, and also http://goo.gl/qKpcR3), so check it's status ...
                            if ((<$ResourceRequest>newData).status == RequestStatuses.Error)
                                return; // (no correction made, still in error; terminate the event chain here)
                            else {
                                var newResReq = <$ResourceRequest>newData;
                                if (newResReq.status >= RequestStatuses.Ready)
                                    newData = newResReq.transformedData;
                                else { // (loading is started, or still in progress, so wait)
                                    newResReq.ready((sender) => { this.$__transformedData = sender.transformedData; this._doNext(); })
                                        .catch((sender) => { this.setError("Resource returned from error handler has failed to load:", sender); this._doError(); });
                                    return;
                                }
                            }
                        }
                        // ... continue with the value from the error handler (even if none) ...
                        this.status = RequestStatuses.Loaded;
                        this.$__message = void 0; // (clear the current message [but keep history])
                        ++this._promiseChainIndex; // (pass on to next handler in the chain)
                        this.$__transformedData = newData;
                        this._doNext();
                        return;
                    } else if (handlers.onFinally) {
                        try {
                            handlers.onFinally.call(this);
                        } catch (e) {
                            this.setError("Cleanup handler failed:", e);
                        }
                    }
                }

                // ... if this is reached, then there are no following error handlers, so throw the existing message ...

                if (this.status == RequestStatuses.Error) {
                    var msgs = this.messages.join("\r\n· ");
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
                    this.$__message = "";
                    this.messages = [];

                    if (includeDependentResources)
                        for (var i = 0, n = this._dependents.length; i < n; ++i)
                            this._dependents[i].reload(includeDependentResources);

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

            static '$ResourceRequest Factory' = function (type = $ResourceRequest) {
                var _InstanceType = <{}>null && new type();
                var factoryType = class ResourceRequest extends type {
                    static $Type = type;
                    static $BaseFactory = <IFactoryType>null;

                    /** Returns a new module object only - does not load it. */
                    static 'new'(url: string, type: ResourceTypes, async?: boolean): typeof _InstanceType { return null; }

                    /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
                    static init($this: typeof _InstanceType, isnew: boolean, url: string, type: ResourceTypes, async: boolean = true): typeof _InstanceType {
                        if (url === void 0 || url === null) throw "A resource URL is required.";
                        if (type === void 0) throw "The resource type is required.";

                        if (_resourceRequestByURL[url])
                            return _resourceRequestByURL[url]; // (abandon this new object instance in favor of the one already existing and returned it)

                        $this.url = url;
                        $this.type = type;
                        $this.async = async;

                        $this.$__index = _resourceRequests.length;

                        _resourceRequests.push($this);
                        _resourceRequestByURL[$this.url] = $this;

                        return $this;
                    }
                }
                frozen(factoryType);
                return factoryType;
            }();

            // ----------------------------------------------------------------------------------------------------------------
        }

        export interface IResourceRequest extends $ResourceRequest { }

        /** Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
          * implementation designed to work better with the CoreXT system specifically, and to support parallel loading).
          * Note: It is advised to use 'CoreXT.Loader.loadResource()' to load resources instead of directly creating resource request objects.
          * Inheritance note: When creating via the 'new' operator, any already existing instance with the same URL will be returned,
          * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
          */
        export var ResourceRequest = TypeFactory.__RegisterFactoryType($ResourceRequest, $ResourceRequest['$ResourceRequest Factory']);

        // ====================================================================================================================

        var _resourceRequests: IResourceRequest[] = []; // (requests are loaded in parallel, but executed in order of request)
        var _resourceRequestByURL: { [url: string]: IResourceRequest } = {}; // (a quick named index lookup into '__loadRequests')

        /** Returns a load request promise-type object for a resource loading operation. */
        export function get(url: string, type?: ResourceTypes, asyc: boolean = true): IResourceRequest {
            if (url === void 0 || url === null) throw "A resource URL is required.";
            url = "" + url;
            if (type === void 0 || type === null) {
                // (make sure it's a string)
                // ... a valid type is required, but try to detect first ...
                var ext = (url.match(/(\.[A-Za-z0-9]+)(?:[\?\#]|$)/i) || []).pop();
                type = getResourceTypeFromExtension(ext);
                if (!type)
                    throw "The resource type is required.";
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
                safeEval(request.transformedData); // ('CoreXT.eval' is used for system scripts because some core scripts need initialize in the global scope [mostly due to TypeScript limitations])
                request.status = RequestStatuses.Executed;
                request.message = "The script has been executed.";
            } catch (e) {
                request.setError("There was an error executing script '" + request.url + "':", e);
            }
        }

        export function bootstrap() {
            // (note: the request order is the dependency order)

            var onReady = _SystemScript_onReady_Handler;

            // ... load the base scripts first (all of these are not modules, so they have to be loaded in the correct order) ...
            get("CoreXT.Utilities.js").ready(onReady) // (a lot of items depend on time [such as some utilities and logging] so this needs to be loaded first)
                .include(get("CoreXT.Globals.js")).ready(onReady)
                .include(get("CoreXT.Browser.js")).ready(onReady) // (in case some polyfills are needed after this point)
                .include(get("CoreXT.Scripts.js").ready(onReady))
                // ... load the rest of the core system next ...
                .include(get("System/CoreXT.System.js").ready(onReady))
                .include(get("System/CoreXT.System.PrimitiveTypes.js").ready(onReady))
                .include(get("System/CoreXT.System.AppDomain.js").ready(onReady))
                .include(get("System/CoreXT.System.Time.ts")).ready(onReady)
                .include(get("System/CoreXT.System.IO.js").ready(onReady))
                .include(get("System/CoreXT.System.Data.js").ready(onReady))
                .include(get("System/CoreXT.System.Diagnostics.js").ready(onReady))
                .include(get("System/CoreXT.System.Exception.js").ready(onReady))
                .include(get("System/CoreXT.System.Events.js").ready(onReady))
                .ready(() => {
                    // ... all core system scripts loaded, load the default manifests next ...
                    Scripts.getManifest() // (load the default manifest in the current path [defaults to 'manifest.js'])
                        .include(Scripts.getManifest("app.manifest")) // (load a custom named manifest; application launching begins here)
                        .ready((mod) => {
                            CoreXT.onReady.dispatch();
                            Scripts._tryRunApp();
                        }) // (triggered when 'app.manifest' is executed and ready)
                        .start();
                })
                .start(); // (note: while all requests are loaded in parallel [regardless of dependencies], all 'ready' events are fired in proper order)

            CoreXT.Loader.bootstrap = <any>noop(); // (prevent this function from being called again)
        }
    }

    // =======================================================================================================================

    export interface IndexedObject {
        [name: string]: any;
    }

    /** Internal: used when initializing CoreXT. */
    export var __$: IndexedObject = CoreXT;
}

CoreXT.safeEval = function (exp: string, p1?: any, p2?: any, p3?: any): any { return eval(exp); };
// (note: this allows executing 'eval' outside the private CoreXT scope, but still within a function scope to prevent polluting the global scope,
//  and also allows passing arguments scoped only to the request).

CoreXT.globalEval = function (exp: string, p1?: any, p2?: any, p3?: any): any { return (<any>0, eval)(exp); };
// (note: indirect 'eval' calls are always globally scoped; see more: http://perfectionkills.com/global-eval-what-are-the-options/#windoweval)

// ===========================================================================================================================

/** (See 'CoreXT') */
var corext = CoreXT; // (allow all lower case usage)

if (typeof $X == CoreXT.UNDEFINED)
    /** A shorthand form to use for the 'CoreXT' global reference. */
    var $X = CoreXT;

// ... users will need to make sure 'System' and/or 'using' are not in use (undefined or set to null before this script is executed) in order to use it as a valid type reference ...

if (typeof System == CoreXT.UNDEFINED || System === null) { // (users should reference "System.", but "CoreXT.System" can be used if the global 'System' is needed for something else)
    /** The base module for all CoreXT System namespace types. */
    var System = CoreXT.System; // (try to make this global, unless otherwise predefined ...)
}

CoreXT.Loader.bootstrap();
// TODO: Allow users to use 'CoreXT.Loader' to load their own scripts, and skip loading the CoreXT system.
