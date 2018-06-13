/** The current application version (user defined). */
declare var appVersion: string;
/**
 * The root namespace for the CoreXT system.
 */
declare namespace CoreXT {
    /** The current version of the CoreXT system. */
    var version: string;
    /** Returns the current user defined application version, or a default version. */
    var getAppVersion: () => string;
    var constructor: symbol;
}
/** (See 'CoreXT') */
declare var corext: typeof CoreXT;
interface Function {
    [index: string]: any;
}
interface Object {
    [index: string]: any;
}
interface Array<T> {
    [index: string]: any;
}
/** The "fake" host object is only used when there is no .NET host wrapper integration available.
* In this case, the environment is running as a simple web application.
*/
declare class __NonCoreXTHost__ implements IHostBridge {
    constructor();
    getCurrentDir(): string;
    isStudio(): boolean;
    isServer(): boolean;
    isClient(): boolean;
    setTitle(title: string): void;
    getTitle(): string;
    isDebugMode(): boolean;
}
declare var $ICE: IHostBridge_ICE;
/** An optional site root URL if the main site root path is in a virtual path. */
declare var siteBaseURL: string;
/** Root location of the application scripts, which by default is {site URL}+"/js/". */
declare var scriptsBaseURL: string;
/** Root location of the CSS files, which by default is {site URL}+"/css/". */
declare var cssBaseURL: string;
declare namespace CoreXT {
    interface IndexedObject {
        [name: string]: any;
    }
    namespace NativeTypes {
        interface IFunction extends Function {
        }
        interface IObject extends Object, IndexedObject {
        }
        interface IArray<T> extends Array<T> {
        }
        interface IString extends String {
        }
        interface INumber extends Number {
        }
        interface IBoolean extends Boolean {
        }
        interface IRegExp extends RegExp {
        }
        interface IDate extends Date {
        }
        interface IIMath extends Math {
        }
        interface IError extends Error {
        }
        interface IXMLHttpRequest extends XMLHttpRequest {
        }
        interface IHTMLElement extends HTMLElement {
        }
        interface IWindow extends Window {
        }
    }
    interface IStaticGlobals extends Window {
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
    type KeyOf<T> = keyof Required<T>;
    /** A reference to the host's global environment (convenient for nested TypeScript code, or when using strict mode [where this=undefined]).
    * This provides a faster, cleaner, consistent, and reliable method of referencing the global environment scope without having to resort to workarounds.
    */
    var global: IStaticGlobals;
    var host: IHostBridge;
    /** The root namespace name as the string constant. */
    const ROOT_NAMESPACE = "CoreXT";
    /** A simple function that does nothing (no operation).
    * This is used to clear certain function properties, such as when preventing client/server functions based on platform,
    * or when replacing the 'CoreXT.Loader.bootstrap()' function, which should only ever need to be called once.
    */
    function noop(...args: any[]): any;
    /** Evaluates a string within a Function scope at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to keep 'var' declarations, etc., within a function scope.
      * Note: By default, parameter indexes 0-9 are automatically assigned to parameter identifiers 'p0' through 'p9' for easy reference.
      */
    function safeEval(x: string, ...args: any[]): any;
    /** Evaluates a string directly at the GLOBAL level. This is more secure for executing scripts without exposing
      * private/protected variables wrapped in closures. Use this to allow 'var' declarations, etc., on the global scope.
      */
    function globalEval(x: string): any;
    enum Environments {
        /** Represents the CoreXT client core environment. */
        Browser = 0,
        /** Represents the CoreXT worker environment (where applications and certain modules reside). */
        Worker = 1,
        /** Represents the CoreXT server environment. */
        Server = 2
    }
    enum DebugModes {
        /** Run in release mode, which loads all minified module scripts, and runs the application automatically when ready. */
        Release = 0,
        /** Run in debug mode (default), which loads all un-minified scripts, and runs the application automatically when ready. */
        Debug_Run = 1,
        /**
          * Run in debug mode, which loads all un-minified scripts, but does NOT boot the system nor run the application automatically.
          * To manually start the CoreXT system boot process, call 'CoreXT.Loader.bootstrap()'.
          * Once the boot process completes, the application will not start automatically. To start the application process, call 'CoreXT.Scripts.runApp()".
          */
        Debug_Wait = 2
    }
    /** Sets the debug mode. A developer should set this to one of the desired 'DebugModes' values. The default is 'Debug_Run'. */
    var debugMode: DebugModes;
    /** Returns true if CoreXT is running in debug mode. */
    function isDebugging(): boolean;
    /** Returns the name of a namespace or variable reference at runtime. */
    function nameof(selector: () => any, fullname?: boolean): string;
    var FUNC_NAME_REGEX: RegExp;
    /** Attempts to pull the function name from the function object, and returns an empty string if none could be determined. */
    function getFunctionName(func: Function): string;
    /** Extends from a base type by chaining a derived type's 'prototype' to the base type's prototype.
    * This method takes into account any preset properties that may exist on the derived type's prototype.
    * Note: Extending an already extended derived type will recreate the prototype connection again using a new prototype instance pointing to the given base type.
    * Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
    * @param {Function} derivedType The derived type (function) that will extend from a base type.
    * @param {Function} baseType The base type (function) to extend to the derived type.
    * @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
    */
    function __extends<DerivedType extends Function, BaseType extends Function>(derivedType: DerivedType, baseType: BaseType, copyStaticProperties?: boolean): DerivedType;
    /**
     * Copies over the helper functions to the target and returns the target.
     *
     * CoreXT contains it's own copies of the TypeScript helper functions to help reduce code size. By default the global scope
     * is not polluted with these functions, but you can call this method (without any arguments) to set the functions on the
     * global scope.
     *
     * @param {object} target Allows copying the helper functions to a different object instance other than the global scope.
     */
    function installTypeScriptHelpers(target?: object): object;
    /**
     * Renders the TypeScript helper references in the 'var a=param['a'],b=param['b'],etc.;' format. This is used mainly when executing scripts wrapped in functions.
     * This format allows declaring local function scope helper variables that simply pull references from a given object
     * passed in to a single function parameter.
     *
     * Example: eval("function executeTSCodeInFunctionScope(p){"+renderHelperVars("p")+code+"}");
     *
     * Returns the code to be execute within scope using 'eval()'.
     */
    function renderHelperVarDeclarations(paramName: string): [string, object];
    /**
     * Renders the TypeScript helper references to already existing functions into a string to be executed using 'eval()'.
     * This format is used mainly to declare helpers at the start of a namespace or function body that simply pull
     * references to the already existing helper functions to help reduce code size.
     *
     * Example: namespace CoreXT{ eval(renderHelpers()); ...code that may require helpers... }
     *
     * Returns an array in the [{declarations string}, {helper object}] format.
     */
    function renderHelpers(): string;
}
declare namespace CoreXT {
    /** Set to true if ES2015+ (aka ES6+) is supported in the browser environment ('class', 'new.target', etc.). */
    var ES6: boolean;
    /** Set to true if ES2015+ (aka ES6+ - i.e. 'class', 'new.target', etc.) was targeted when this CoreXT JS code was transpiled. */
    var ES6Targeted: boolean;
    /** This is set to the detected running environment that scripts are executing in. Applications and certain modules all run in
      * protected web worker environments (dedicated threads), where there is no DOM. In these cases, this property will be set to
      * 'Environments.Worker'.
      * The core of CoreXT runs in the browser, and for those scripts, this will be set to 'Environments.Browser'.  Since
      * malicious scripts might hook into a user's key strokes to steal passwords, etc., only trusted scripts run in this zone.
      * For scripts running on the serve side, this will be set to 'Environments.Server'.
      */
    var Environment: Environments;
    /** Used with 'CoreXT.log(...)' to write to the host console, if available.
      */
    enum LogTypes {
        /** An important or critical action was a success. */
        Success = -1,
        /** General logging information - nothing of great importance (such as writing messages to developers in the console, or perhaps noting the entry/exit of a section of code), but could be good to know during support investigations. */
        Normal = 0,
        /** An important action has started, or important information must be noted (usually not debugging related, but could be good to know during support investigations). */
        Info = 1,
        /** A warning or non critical error has occurred. */
        Warning = 2,
        /** A error has occurred (usually critical). */
        Error = 3,
        /** Debugging details only. In a live system debugging related log writes are ignored. */
        Debug = 4,
        /** Usually used with more verbose logging to trace execution. In a live system debugging related log writes are ignored. */
        Trace = 5
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
    function log(title: string, message: string, type?: LogTypes, source?: object, throwOnError?: boolean, useLogger?: boolean): string;
    /** Logs the error message to the console (if available) and throws the error.
      *  By default errors are thrown instead of being returned.  Set 'throwException' to false to return logged error messages.
      * @param {string} title A title for this log message.
      * @param {string} message The message to log.
      * @param {object} source An optional object to associate with log.
      * @param {boolean} throwException If true (the default) then an exception with the message is thrown.
      * @param {boolean} useLogger If true (default) then 'System.Diagnostics.log()' is also called in addition to the console output.
      */
    function error(title: string, message: string, source?: object, throwException?: boolean, useLogger?: boolean): string;
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
    function getTypeName(object: object, cacheTypeName?: boolean): string;
    /**
     * Returns the full type name of the type or namespace, if available, or the name o the object itself if the full name (with namespaces) is not known.
     * @see getTypeName()
     */
    function getFullTypeName(object: object, cacheTypeName?: boolean): string;
    /** Returns true if the given object is empty, or an invalid value (eg. NaN, or an empty object, array, or string). */
    function isEmpty(obj: any): boolean;
    /**
    * A TypeScript decorator used to seal a function and its prototype. Properties cannot be added, but existing ones can be updated.
    */
    function sealed<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T;
    /**
    * A TypeScript decorator used to freeze a function and its prototype.  Properties cannot be added, and existing ones cannot be changed.
    */
    function frozen<T extends {}>(target: T, propertyName?: string, descriptor?: TypedPropertyDescriptor<any>): T;
    /**
     * A decorator used to add DI information for a function parameter.
     * @param args A list of items which are either fully qualified type names, or references to the type functions.
     * The order specified is important.  A new (transient) or existing (singleton) instance of the first matching type found is returned.
     */
    function $(...args: (IType<any> | string)[]): (target: any, paramName: string, index: number) => void;
    /** Holds utility methods for type management. All registered types and disposed objects are stored here. */
    namespace Types {
        /** Returns the root type object from nested type objects. Use this to get the root namespace  */
        function getRoot(type: ITypeInfo): ITypeInfo;
        /** Holds all the types registered globally by calling one of the 'Types.__register???()' functions. Types are not app-domain specific. */
        var __types: {
            [fullTypeName: string]: ITypeInfo;
        };
        /** Holds all disposed objects that can be reused. */
        var __disposedObjects: {
            [fulltypename: string]: IDomainObjectInfo[];
        };
        /**
         * If true the system will automatically track new objects created under this CoreXT context and store them in 'Types.__trackedObjects'.
         * The default is false to prevent memory leaks by those unaware of how the CoreXT factory pattern works.
         * Setting this to true (either here or within a specific AppDomain) means you take full responsibility to dispose all objects you create.
         */
        var autoTrackInstances: boolean;
        var __trackedObjects: IDisposable[];
        var __nextObjectID: number;
        /** Returns 'Types.__nextObjectID' and increments the value by 1. */
        function getNextObjectId(): number;
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
        function __new(this: IFactoryTypeInfo, ...args: any[]): NativeTypes.IObject;
        /**
         * Called to register factory types for a class (see also 'Types.__registerType()' for non-factory supported types).
         * This method should be called AFTER a factory type is fully defined.
         *
         * @param {IType} factoryType The factory type to associate with the type.
         * @param {modules} namespace A list of all namespaces up to the current type, usually starting with 'CoreXT' as the first namespace.
         * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type (function object) will have type information
         * applied (using the IFunctionInfo interface).
        */
        function __registerFactoryType<TClass extends IType, TFactory extends IType & IFactory, TNamespace extends object>(factoryType: TFactory & {
            $__type: TClass;
        }, namespace: TNamespace, addMemberTypeInfo?: boolean): TFactory & {
            $__type: TClass;
        };
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
        function __registerType<T extends IType, TParentTypeOrNamespace extends object>(type: T, parentTypeOrNS: TParentTypeOrNamespace, addMemberTypeInfo?: boolean): T;
        /**
         * Registers nested namespaces and adds type information.
         * @param {IType} namespaces A list of namespaces to register.
         * @param {IType} type An optional type (function constructor) to specify at the end of the name space list.
         */
        function __registerNamespace(root: {}, ...namespaces: string[]): ITypeInfo;
        function __disposeValidate(object: IDisposable, title: string, source?: any): void;
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
        function dispose(object: IDisposable, release?: boolean): void;
    }
    interface IClassFactory {
    }
    /** A 'Disposable' base type that implements 'IDisposable', which is the base for all CoreXT objects that can be disposed. */
    class Disposable implements IDisposable {
        /**
         * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
         * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
         * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
         *                          false to request that child objects remain connected after disposal (not released). This
         *                          can allow quick initialization of a group of objects, instead of having to pull each one
         *                          from the object pool each time.
         */
        dispose(release?: boolean): void;
    }
    /** Returns true if the specified object can be disposed using this CoreXT system. */
    function isDisposable(instance: IDisposable): boolean;
    /** Returns true if the given type (function) represents a primitive type constructor. */
    function isPrimitiveType(o: object): boolean;
    /**
     * Creates a 'Disposable' type from another base type. This is primarily used to extend primitive types.
     * Note: These types are NOT instances of 'CoreXT.Disposable', since they must have prototype chains that link to other base types.
     * @param {TBaseClass} baseClass The base class to inherit from.
     * @param {boolean} isPrimitiveOrHostBase Set this to true when inheriting from primitive types. This is normally auto-detected, but can be forced in cases
     * where 'new.target' (ES6) prevents proper inheritance from host system base types that are not primitive types.
     * This is only valid if compiling your .ts source for ES5 while also enabling support for ES6 environments.
     * If you compile your .ts source for ES6 then the 'class' syntax will be used and this value has no affect.
     */
    function DisposableFromBase<TBaseClass extends IType = ObjectConstructor>(baseClass: TBaseClass, isPrimitiveOrHostBase?: boolean): {
        new (...args: any[]): {
            /**
            * Releases the object back into the object pool. This is the default implementation which simply calls 'Types.dispose(this, release)'.
            * If overriding, make sure to call 'super.dispose()' or 'Types.dispose()' to complete the disposal process.
            * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
            *                          false to request that child objects remain connected after disposal (not released). This
            *                          can allow quick initialization of a group of objects, instead of having to pull each one
            *                          from the object pool each time.
            */
            dispose(release?: boolean): void;
        };
    } & TBaseClass;
    function FactoryType<TBaseFactory extends IType>(baseFactory?: {
        $__type: TBaseFactory;
    }): TBaseFactory;
    /**
     * Builds and returns a base type to be used with creating type factories. This function stores some type
     * information in static properties for reference.
     * @param {TBaseFactory} baseFactoryType The factory that this factory type derives from.
     * @param {TBaseType} staticBaseClass An optional base type to inherit static types from.
    */
    function FactoryBase<TBaseFactory extends IFactory, TBaseType extends IType = typeof Object>(baseFactoryType?: TBaseFactory, staticBaseClass?: TBaseType): {
        new (...args: any[]): {
            /** Set to true when the object is being disposed. By default this is undefined.  This is only set to true when 'dispose()' is first call to prevent cyclical calls. */
            $__disposing?: boolean;
            /** Set to true once the object is disposed. By default this is undefined, which means "not disposed".  This is only set to true when disposed, and false when reinitialized. */
            $__disposed?: boolean;
        };
        /** The underlying type associated with this factory type. */
        $__type: IType<object>;
        /** References the base factory. */
        readonly super: TBaseFactory;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
        /**
          * Called to register factory types with the internal types system (see also 'Types.__registerType()' for non-factory supported types).
          * Any static constructors defined will also be called at this point.
          *
          * @param {modules} namespace The parent namespace to the current type.
          * @param {boolean} addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
          * applied (using the IFunctionInfo interface).
         */
        $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
            $__type: TClass;
        }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
    } & TBaseType;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<Z extends keyof T, T extends object = typeof CoreXT.global>(firstNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, Z extends keyof T[A], T extends object = typeof CoreXT.global>(ns1: A, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, B extends keyof T[A], Z extends keyof T[A][B], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], Z extends keyof T[A][B][C], T extends object = typeof CoreXT>(ns1: A, ns2?: B, ns3?: C, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], Z extends keyof T[A][B][C][D], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], Z extends keyof T[A][B][C][D][E], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], Z extends keyof T[A][B][C][D][E][F], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], Z extends keyof T[A][B][C][D][E][F][G], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], H extends keyof T[A][B][C][D][E][F][G], Z extends keyof T[A][B][C][D][E][F][G][H], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, ns8?: H, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], H extends keyof T[A][B][C][D][E][F][G], I extends keyof T[A][B][C][D][E][F][G][H], Z extends keyof T[A][B][C][D][E][F][G][H][I], T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, ns8?: H, ns9?: I, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes. */
    function namespace<A extends keyof T, B extends keyof T[A], C extends keyof T[A][B], D extends keyof T[A][B][C], E extends keyof T[A][B][C][D], F extends keyof T[A][B][C][D][E], G extends keyof T[A][B][C][D][E][F], H extends keyof T[A][B][C][D][E][F][G], I extends keyof T[A][B][C][D][E][F][G][H], J extends keyof T[A][B][C][D][E][F][G][H][I], Z extends keyof T[A][B][C][D][E][F][G][H][I][J] = any, T extends object = typeof CoreXT.global>(ns1: A, ns2?: B, ns3?: C, ns4?: D, ns5?: E, ns6?: F, ns7?: G, ns8?: H, ns9?: I, ns10?: J, lastNsOrClassName?: Z, root?: T): void;
    /** Registers a namespace and optional class type. The type information is stored in the namespace objects.  Use 'ITypeInfo' to read the type information from namespaces and classes.
     * @param {function} namespacePathSelector A selector in the format '()=>A.B.C' or 'function(){A.B.C}' that specifies the FULL namespace path from the root object on global.
     */
    function namespace(namespacePathSelector: () => object, root?: object): void;
    /** Returns the call stack for a given error object. */
    function getErrorCallStack(errorSource: {
        stack?: string;
    }): string[];
    /** Returns the message of the specified error source by returning either 'errorSource' if it's a string, a formatted LogItem object,
      * a formatted Exception or Error object, or 'errorSource.message' if the source is an object with a 'message' property.
      */
    function getErrorMessage(errorSource: any): string;
    /** The most common mime types.  You can easily extend this enum with custom types, or force-cast strings to this type also. */
    enum ResourceTypes {
        Application_Script,
        Application_ECMAScript,
        Application_JSON,
        Application_ZIP,
        Application_GZIP,
        Application_PDF,
        Application_DefaultFormPost,
        Application_TTF,
        Multipart_BinaryFormPost,
        AUDIO_MP4,
        AUDIO_MPEG,
        AUDIO_OGG,
        AUDIO_AAC,
        AUDIO_CAF,
        Image_GIF,
        Image_JPEG,
        Image_PNG,
        Image_SVG,
        Image_GIMP,
        Text_CSS,
        Text_CSV,
        Text_HTML,
        Text_Plain,
        Text_RTF,
        Text_XML,
        Text_JQueryTemplate,
        Text_MarkDown,
        Video_AVI,
        Video_MPEG,
        Video_MP4,
        Video_OGG,
        Video_MOV,
        Video_WMV,
        Video_FLV
    }
    /** A map of popular resource extensions to resource enum type names.
      * Example 1: ResourceTypes[ResourceExtensions[ResourceExtensions.Application_Script]] === "application/javascript"
      * Example 2: ResourceTypes[ResourceExtensions[<ResourceExtensions><any>'.JS']] === "application/javascript"
      * Example 3: CoreXT.Loader.getResourceTypeFromExtension(ResourceExtensions.Application_Script);
      * Example 4: CoreXT.Loader.getResourceTypeFromExtension(".js");
      */
    enum ResourceExtensions {
        Application_Script,
        Application_ECMAScript,
        Application_JSON,
        Application_ZIP,
        Application_GZIP,
        Application_PDF,
        Application_TTF,
        AUDIO_MP4,
        AUDIO_MPEG,
        AUDIO_OGG,
        AUDIO_AAC,
        AUDIO_CAF,
        Image_GIF,
        Image_JPEG,
        Image_PNG,
        Image_SVG,
        Image_GIMP,
        Text_CSS,
        Text_CSV,
        Text_HTML,
        Text_Plain,
        Text_RTF,
        Text_XML,
        Text_JQueryTemplate,
        Text_MarkDown,
        Video_AVI,
        Video_MPEG,
        Video_MP4,
        Video_OGG,
        Video_MOV,
        Video_WMV,
        Video_FLV
    }
    /** Return the resource (MIME) type of a given extension (with or without the period). */
    function getResourceTypeFromExtension(ext: string): ResourceTypes;
    /** Return the resource (MIME) type of a given extension type. */
    function getResourceTypeFromExtension(ext: ResourceExtensions): ResourceTypes;
    enum RequestStatuses {
        /** The request has not been executed yet. */
        Pending = 0,
        /** The resource failed to load.  Check the request object for the error details. */
        Error = 1,
        /** The requested resource is loading. */
        Loading = 2,
        /** The requested resource has loaded (nothing more). */
        Loaded = 3,
        /** The requested resource is waiting on parent resources to complete. */
        Waiting = 4,
        /** The requested resource is ready to be used. */
        Ready = 5,
        /** The source is a script, and was executed (this only occurs on demand [not automatic]). */
        Executed = 6
    }
    /**
     * Returns true if the URL contains the specific action and controller names at the end of the URL path.
     * This of course assumes typical routing patterns in the format '/controller/action' or '/area/controller/action'.
     */
    function isPage(action: string, controller?: string, area?: string): boolean;
    /**
     * Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups], where
     * 'groups' index 0 is the full matched text, and 1 onwards are any matched groups).
     */
    function matches(regex: RegExp, text: string): string[][];
    /** Used to strip out script source mappings. Used with 'extractSourceMapping()'. */
    var SCRIPT_SOURCE_MAPPING_REGEX: RegExp;
    /** Holds details on extract script pragmas. @See extractPragmas() */
    class PragmaInfo {
        prefix: string;
        name: string;
        value: string;
        extras: string;
        /**
         * @param {string} prefix The "//#" part.
         * @param {string} name The pragma name, such as 'sourceMappingURL'.
         * @param {string} value The part after "=" in the pragma expression.
         * @param {string} extras Any extras on the line (like comments) that are not part of the extracted value.
         */
        constructor(prefix: string, name: string, value: string, extras: string);
        /**
         * Make a string from this source map info.
         * @param {string} valuePrefix An optional string to insert before the value, such as a sub-directory path, or missing protocol+server+port URL parts, etc.
         * @param {string} valueSuffix An optional string to insert after the value.
         */
        toString(valuePrefix?: string, valueSuffix?: string): string;
        valueOf(): string;
    }
    /** @See extractPragmas() */
    interface IExtractedPragmaDetails {
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
    function extractPragmas(src: string): IExtractedPragmaDetails;
    /**
     * Returns the base path based on the resource type.
     */
    function basePathFromResourceType(resourceType: string | ResourceTypes): string;
    /**
     * Converts the given value to a string and returns it.  'undefined' (void 0) and null become empty, string types are
     * returned as is, and everything else will be converted to a string by calling 'toString()', or simply '""+value' if
     * 'value.toString' is not a function. If for some reason a call to 'toString()' does not return a string the cycle
     * starts over with the new value until a string is returned.
     * Note: If no arguments are passed in (i.e. 'CoreXT.toString()'), then CoreXT.ROOT_NAMESPACE is returned, which should be the string "CoreXT".
     */
    function toString(value?: any): string;
    /** The System module is the based module for most developer related API operations, and is akin to the 'System' .NET namespace. */
    namespace System {
        /** This namespace contains types and routines for data communication, URL handling, and page navigation. */
        namespace IO {
            /** Path/URL based utilities. */
            namespace Path {
                /** Parses the URL into 1: protocol (without '://'), 2: host, 3: port, 4: path, 5: query (without '?'), and 6: fragment (without '#'). */
                var URL_PARSER_REGEX: RegExp;
                class URLBuilder {
                    /** Protocol (without '://'). */
                    protocol: string;
                    /** A username for login. */
                    username: string;
                    /** A password for login (not recommended!). */
                    password: string;
                    /** URL host. */
                    hostName: string;
                    /** Host port. */
                    port: string;
                    /** URL path. */
                    path: string;
                    /** Query (without '?'). */
                    query: string;
                    /** Fragment (without '#'). */
                    fragment: string;
                    constructor(
                    /** Protocol (without '://'). */
                    protocol: string, 
                    /** A username for login. */
                    username: string, 
                    /** A password for login (not recommended!). */
                    password: string, 
                    /** URL host. */
                    hostName: string, 
                    /** Host port. */
                    port: string, 
                    /** URL path. */
                    path: string, 
                    /** Query (without '?'). */
                    query: string, 
                    /** Fragment (without '#'). */
                    fragment: string);
                    /** Returns only  host + port parts combined. */
                    host(): string;
                    /** Returns only the protocol + host + port parts combined. */
                    origin(): string;
                    /** Builds the full URL from the parts specified in this instance. */
                    toString(): string;
                    static fromLocation(): URLBuilder;
                }
                /** Parses the URL into 1: protocol (without '://'), 2: host, 3: port, 4: path, 5: query (without '?'), and 6: fragment (without '#'). */
                function parse(url: string): URLBuilder;
                /**
                   * Appends 'path2' to 'path1', inserting a path separator character (/) if required.
                   * Set 'normalizePathSeparators' to true to normalize any '\' path characters to '/' instead.
                   */
                function combine(path1: string, path2: string, normalizePathSeparators?: boolean): string;
                /** Returns the protocol + host + port parts of the given absolute URL. */
                function getRoot(absoluteURL: string | URLBuilder): string;
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
                function resolve(path: string, currentResourceURL?: string, baseURL?: string): string;
                /** Fixes a URL by splitting it apart, trimming it, then recombining it along with a trailing forward slash (/) at the end. */
                function fix(url: string): string;
                /** Returns true if the specified extension is missing from the end of 'pathToFile'.
                  * An exception is made if special characters are detected (such as "?" or "#"), in which case true is always returned, as the resource may be returned
                  * indirectly via a server side script, or handled in some other special way).
                  * @param {string} ext The extension to check for (with or without the preceding period [with preferred]).
                  */
                function hasFileExt(pathToFile: string, ext: string): boolean;
                var QUERY_STRING_REGEX: RegExp;
                const Query_base: {
                    new (...args: any[]): {
                        /** Set to true when the object is being disposed. By default this is undefined.  This is only set to true when 'dispose()' is first call to prevent cyclical calls. */
                        $__disposing?: boolean;
                        /** Set to true once the object is disposed. By default this is undefined, which means "not disposed".  This is only set to true when disposed, and false when reinitialized. */
                        $__disposed?: boolean;
                    };
                    /** The underlying type associated with this factory type. */
                    $__type: IType<object>;
                    /** References the base factory. */
                    readonly super: {};
                    'new'?(...args: any[]): any;
                    init?(o: object, isnew: boolean, ...args: any[]): void;
                    /**
                      * Called to register factory types with the internal types system (see also 'Types.__registerType()' for non-factory supported types).
                      * Any static constructors defined will also be called at this point.
                      *
                      * @param {modules} namespace The parent namespace to the current type.
                      * @param {boolean} addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
                      * applied (using the IFunctionInfo interface).
                     */
                    $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                        $__type: TClass;
                    }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
                } & ObjectConstructor;
                /** Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
                  * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
                  * with all values escaped and ready to be appended to a URI. */
                class Query extends Query_base {
                    /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                       * @param {string} searchString A URI or 'location.search' string.
                       * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                       */
                    static 'new': (...args: any[]) => IQuery;
                    /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                       * @param {string} searchString A URI or 'location.search' string.
                       * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                       */
                    static init: (o: IQuery, isnew: boolean, searchString?: string, makeNamesLowercase?: boolean) => void;
                }
                namespace Query {
                    class $__type extends Disposable {
                        values: {
                            [index: string]: string;
                        };
                        /** Use to add additional query string values. The function returns the current object to allow chaining calls.
                            * Example: add({'name1':'value1', 'name2':'value2', ...});
                            * Note: Use this to also change existing values.
                            */
                        addOrUpdate(newValues: {
                            [index: string]: string;
                        }): $__type;
                        /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
                            * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
                            * Warning: If the new name already exists, it will be replaced.
                            */
                        rename(newNames: {
                            [index: string]: string;
                        }): $__type;
                        /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
                            * Example: remove(['name1', 'name2', 'name3']);
                            */
                        remove(namesToDelete: string[]): IQuery;
                        /** Creates and returns a duplicate of this object. */
                        clone(): IQuery;
                        appendTo(uri: string): string;
                        /** Returns the specified value, or a default value if nothing was found. */
                        getValue(name: string, defaultValueIfUndefined?: string): any;
                        /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
                        getLCValue(name: string, defaultValueIfUndefined?: string): string;
                        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                        getUCValue(name: string, defaultValueIfUndefined?: string): string;
                        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                        getNumber(name: string, defaultValueIfUndefined?: number): number;
                        /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
                            * The existing value is replaced by the encoded value, and the encoded value is returned.
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        encodeValue(name: string): string;
                        /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
                            * The existing value is replaced by the decoded value, and the decoded value is returned.
                            */
                        decodeValue(name: string): string;
                        /** Encode ALL query values (see 'encodeValue()').
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        encodeAll(): void;
                        /** Decode ALL query values (see 'encodeValue()').
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        decodeAll(): void;
                        /** Converts the underlying query values to a proper search string that can be appended to a URI. */
                        toString(): string;
                    }
                }
                interface IQuery extends Query.$__type {
                }
                function setLocation(url: string, includeExistingQuery?: boolean, bustCache?: boolean): void;
                /**
                 * Returns true if the page URL contains the given controller and action names (not case sensitive).
                 * This only works with typical default routing of "{host}/Controller/Action/etc.".
                 * @param action A controller action name.
                 * @param controller A controller name (defaults to "home" if not specified)
                 */
                function isView(action: string, controller?: string): boolean;
                /** This is set automatically to the query for the current page. */
                var pageQuery: IQuery;
            }
            const ResourceRequest_base: {
                new (...args: any[]): {
                    /** Set to true when the object is being disposed. By default this is undefined.  This is only set to true when 'dispose()' is first call to prevent cyclical calls. */
                    $__disposing?: boolean;
                    /** Set to true once the object is disposed. By default this is undefined, which means "not disposed".  This is only set to true when disposed, and false when reinitialized. */
                    $__disposed?: boolean;
                };
                /** The underlying type associated with this factory type. */
                $__type: IType<object>;
                /** References the base factory. */
                readonly super: {};
                'new'?(...args: any[]): any;
                init?(o: object, isnew: boolean, ...args: any[]): void;
                /**
                  * Called to register factory types with the internal types system (see also 'Types.__registerType()' for non-factory supported types).
                  * Any static constructors defined will also be called at this point.
                  *
                  * @param {modules} namespace The parent namespace to the current type.
                  * @param {boolean} addMemberTypeInfo If true (default), all member functions on the underlying class type will have type information
                  * applied (using the IFunctionInfo interface).
                 */
                $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                    $__type: TClass;
                }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
            } & ObjectConstructor;
            /**
             * Creates a new resource request object, which allows loaded resources using a "promise" style pattern (this is a custom
             * implementation designed to work better with the CoreXT system specifically, and to support parallel loading).
             * Note: It is advised to use 'CoreXT.Loader.loadResource()' to load resources instead of directly creating resource request objects.
             * Inheritance note: When creating via the 'new' factory method, any already existing instance with the same URL will be returned,
             * and NOT the new object instance.  For this reason, you should call 'loadResource()' instead.
             */
            class ResourceRequest extends ResourceRequest_base {
                /**
                 * If true (the default) then a '"_v_="+Date.now()' query item is added to make sure the browser never uses
                 * the cache. To change the variable used, set the 'cacheBustingVar' property also.
                 * Each resource request instance can also have its own value set separate from the global one.
                 * Note: CoreXT has its own caching that uses the local storage, where supported.
                 */
                static cacheBusting: boolean;
                /** See the 'cacheBusting' property. */
                static cacheBustingVar: string;
                /** Returns a new module object only - does not load it. */
                static 'new': (...args: any[]) => IResourceRequest;
                /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
                static init: (o: IResourceRequest, isnew: boolean, url: string, type: ResourceTypes | string, async?: boolean) => void;
            }
            namespace ResourceRequest {
                class $__type {
                    private $__index;
                    /** The requested resource URL. If the URL string starts with '~/' then it becomes relative to the content type base path. */
                    url: string;
                    /** The raw unresolved URL given for this resource. Use the 'url' property to resolve content roots when '~' is used. */
                    _url: string;
                    /** The requested resource type (to match against the server returned MIME type for data type verification). */
                    type: ResourceTypes | string;
                    /** The XMLHttpRequest object used for this request.  It's marked private to discourage access, but experienced
                      * developers should be able to use it if necessary to further configure the request for advanced reasons.
                      */
                    _xhr: XMLHttpRequest;
                    /** The raw data returned from the HTTP request.
                      * Note: This does not change with new data returned from callback handlers (new data is passed on as the first argument to
                      * the next call [see 'transformedData']).
                      */
                    data: any;
                    /** Set to data returned from callback handlers as the 'data' property value gets transformed.
                      * If no transformations were made, then the value in 'data' is returned.
                      */
                    readonly transformedData: any;
                    private $__transformedData;
                    /** The response code from the XHR response. */
                    responseCode: number;
                    /** The response code message from the XHR response. */
                    responseMessage: string;
                    /** The current request status. */
                    status: RequestStatuses;
                    /**
                     * A progress/error message related to the status (may not be the same as the response message).
                     * Setting this property sets the local message and updates the local message log. Make sure to set 'this.status' first before setting a message.
                     */
                    message: string;
                    private _message;
                    /** Includes the current message and all previous messages. Use this to trace any silenced errors in the request process. */
                    messageLog: string[];
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
                    cacheBusting: boolean;
                    /** See the 'cacheBusting' property. */
                    cacheBustingVar: string;
                    private _onProgress;
                    private _onReady;
                    /** This is a list of all the callbacks waiting on the status of this request (such as on loaded or error).
                    * There's also an 'on finally' which should execute on success OR failure, regardless.
                    * For each entry, only ONE of any callback type will be set.
                    */
                    private _promiseChain;
                    private _promiseChainIndex;
                    /**
                     * A list of parent requests that this request is depending upon.
                     * When 'start()' is called, all parents are triggered to load first, working downwards.
                     * Regardless of order, loading is in parallel asynchronously; however, the 'onReady' event will fire in the expected order.
                     * */
                    _parentRequests: IResourceRequest[];
                    private _parentCompletedCount;
                    _dependants: IResourceRequest[];
                    private _paused;
                    private _queueDoNext;
                    private _queueDoError;
                    private _requeueHandlersIfNeeded;
                    /** Triggers a success or error callback after the resource loads, or fails to load. */
                    then(success: IResultCallback<IResourceRequest>, error?: IErrorCallback<IResourceRequest>): this;
                    /** Adds another request and makes it dependent on the current 'parent' request.  When all parent requests have completed,
                      * the dependant request fires its 'onReady' event.
                      * Note: The given request is returned, and not the current context, so be sure to complete configurations before hand.
                      */
                    include<T extends IResourceRequest>(request: T): T;
                    /**
                     * Add a call-back handler for when the request completes successfully.
                     * This event is triggered after the resource successfully loads and all callbacks in the promise chain get called.
                     * @param handler
                     */
                    ready(handler: ICallback<IResourceRequest>): this;
                    /** Adds a hook into the resource load progress event. */
                    while(progressHandler: ICallback<IResourceRequest>): this;
                    /** Call this anytime while loading is in progress to terminate the request early. An error event will be triggered as well. */
                    abort(): void;
                    /**
                     * Provide a handler to catch any errors from this request.
                     */
                    catch(errorHandler: IErrorCallback<IResourceRequest>): this;
                    /**
                     * Provide a handler which should execute on success OR failure, regardless.
                     */
                    finally(cleanupHandler: ICallback<IResourceRequest>): this;
                    /** Starts loading the current resource.  If the current resource has dependencies, they are triggered to load first (in proper
                      * order).  Regardless of the start order, all scripts are loaded in parallel.
                      * Note: This call queues the start request in 'async' mode, which begins only after the current script execution is completed.
                      */
                    start(): this;
                    private _Start;
                    /** Upon return, the 'then' or 'ready' event chain will pause until 'continue()' is called. */
                    pause(): this;
                    /** After calling 'pause()', use this function to re-queue the 'then' or 'ready' even chain for continuation.
                      * Note: This queues on a timer with a 0 ms delay, and does not call any events before returning to the caller.
                      */
                    continue(): this;
                    private _doOnProgress;
                    setError(message: string, error?: {
                        name?: string;
                        message: string;
                        stack?: string;
                    }): void;
                    private _doNext;
                    private _doReady;
                    private _doError;
                    /** Resets the current resource data, and optionally all dependencies, and restarts the whole loading process.
                      * Note: All handlers (including the 'progress' and 'ready' handlers) are cleared and will have to be reapplied (clean slate).
                      * @param {boolean} includeDependentResources Reload all resource dependencies as well.
                      */
                    reload(includeDependentResources?: boolean): this;
                }
            }
            interface IResourceRequest extends ResourceRequest.$__type {
            }
            /** Returns a load request promise-type object for a resource loading operation. */
            function get(url: string, type?: ResourceTypes | string, asyc?: boolean): IResourceRequest;
        }
    }
    /**
     * Extracts and replaces source mapping pragmas. This is used mainly with XHR loading of scripts in order to execute them with
     * source mapping support while being served from a CoreXT .Net Core MVC project.
     */
    function fixSourceMappingsPragmas(sourcePragmaInfo: IExtractedPragmaDetails, scriptURL: string): string;
    /**
     * Returns the base URL used by the system.  This can be configured by setting the global 'siteBaseURL' property, or if using CoreXT.JS for
     * .Net Core MVC, make sure '@RenderCoreXTJSConfigurations()' is called before all scripts in the header section of your layout view.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    var baseURL: string;
    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    var baseScriptsURL: string;
    /**
     * Returns the base URL used by the system for loading scripts.  This can be configured by setting the global 'scriptBaseURL' property.
     * If no 'siteBaseURL' global property exists, the current page location is assumed.
     */
    var baseCSSURL: string;
    /**
     * This is set by default when '@RenderCoreXTJSConfigurations()' is called at the top of the layout page and a debugger is attached. It is
     * used to resolve source maps delivered through XHR while debugging.
     * Typically the server side web root file path matches the same root as the http root path in 'baseURL'.
     */
    var serverWebRoot: string;
    /**
     * Contains some basic static values and calculations used by time related functions within the system.
     */
    namespace Time {
        var __millisecondsPerSecond: number;
        var __secondsPerMinute: number;
        var __minsPerHour: number;
        var __hoursPerDay: number;
        var __daysPerYear: number;
        var __actualDaysPerYear: number;
        var __EpochYear: number;
        var __millisecondsPerMinute: number;
        var __millisecondsPerHour: number;
        var __millisecondsPerDay: number;
        var __millisecondsPerYear: number;
        var __ISO8601RegEx: RegExp;
        var __SQLDateTimeRegEx: RegExp;
        var __SQLDateTimeStrictRegEx: RegExp;
        /** The time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        var __localTimeZoneOffset: number;
    }
    namespace System {
    }
    interface ICallback<TSender> {
        (sender?: TSender): void;
    }
    /**
     * A handler that is called when a resource is loaded.
     * The data supplied may not be the original data. Each handler can apply transformations to the data. Any data returned replaces the
     * underlying data for the request and gets passed to the next callback in the chain (if any), which is useful for filtering.
     * Another resource request can also be returned, in which case the 'transformedData' value of that request becomes the result (unless that
     * request failed, which would cascade the failure the current request as well).
     */
    interface IResultCallback<TSender> {
        (sender?: TSender, data?: any): any | System.IO.IResourceRequest;
    }
    interface IErrorCallback<TSender> {
        (sender?: TSender, error?: any): any;
    }
    /**
     * The loader namespace contains low level functions for loading/bootstrapping the whole system.
     * Why use a loader instead of combining all scripts into one file? The main reason is so that individual smaller scripts can be upgraded
     * without needing to re-transfer the whole system to the client. It's much faster to just resend one small file that might change. This
     * also allows extending (add to) the existing scripts for system upgrades.
     */
    namespace Loader {
        interface ISystemLoadHandler {
            (): void;
        }
        /**
         * Use this function to register a handler to be called when the core system is loaded, just before 'app.manifest.ts' gets loaded.
         * Note: The PROPER way to load an application is via a manifest file (app.manifest.ts).  Very few functions and event hooks are available
         * until the system is fully loaded. For example, 'CoreXT.DOM.Loader' is not available until the system is loaded, which means you
         * cannot hook into 'CoreXT.DOM.Loader.onDOMLoaded()' or access 'CoreXT.Browser' properties until then. This is because all files
         * are dynamically loaded as needed (the CoreXT system uses the more efficient dynamic loading system).
         */
        function onSystemLoaded(handler: ISystemLoadHandler): void;
        /** Used by the bootstrapper in applying system scripts as they become ready.
          * Applications should normally never use this, and instead use the 'modules' system in the 'CoreXT.Scripts' namespace for
          * script loading.
          */
        function _SystemScript_onReady_Handler(request: System.IO.IResourceRequest): void;
        /** This is the root path to the boot scripts for CoreXT.JS. The default starts with '~/' in order to be relative to 'baseScriptsURL'. */
        var rootBootPath: string;
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
        function bootstrap(): void;
    }
    /** This is provided to allow callbacks to run just before 'CoreXT.Loader.bootstrap()' gets called (depending on the 'CoreXT.debugMode' setting).
     * * Setting 'CoreXT.debugMode' to 'CoreXT.DebugModes.Debug_Wait' prevents 'CoreXT.Loader.bootstrap()' from getting called automatically.
     * * Returning an explicit 'false' boolean value will also prevent the bootstrap from running automatically.
     */
    var onBeforeBootstrapHandlers: {
        (): void | boolean;
    }[];
}
