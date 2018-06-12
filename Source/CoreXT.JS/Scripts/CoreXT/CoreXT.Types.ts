// ###########################################################################################################################
// Types for event management.
// ###########################################################################################################################

namespace CoreXT {
    // ===================================================================================================================
    // Some core basic interfaces to begin with (interfaces don't contribute to the resulting JS size).

    /** Provides a mechanism for object cleanup.
    * See also: 'dispose(...)' helper functions. */
    export interface IDisposable {
        /** Set to true when the object is being disposed. By default this is undefined.  This is only set to true when 'dispose()' is first call to prevent cyclical calls. */
        $__disposing?: boolean;
        /** Set to true once the object is disposed. By default this is undefined, which means "not disposed".  This is only set to true when disposed, and false when reinitialized. */
        $__disposed?: boolean;
        /** 
         * Returns a reference to the CoreXT system that created the object.  This is set automatically when creating instances from factories.
         * Note: Setting this to null/undefined will prevent an instance from being disposable.
         */
        $__corext?: {};
        /** 
        * Releases the object back into the object pool. 
        * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
        *                          false to request that child objects remain connected after disposal (not released). This
        *                          can allow quick initialization of a group of objects, instead of having to pull each one
        *                          from the object pool each time.
        */
        dispose(release?: boolean): void;
    }

    /** Type-cast class references to this interface to access type specific information, where available. */
    export interface ITypeInfo {
        /** The parent namespace object that contains the type (function instance).
          * Note: This value is only set on types registered using '{AppDomain}.registerType()'.
          */
        $__parent?: ITypeInfo | INamespaceInfo | IClassInfo | IFunctionInfo;

        /** Returns the name of this type.
          * Note: This is the object type name taken from the constructor (if one exists), and is not the FULL type name (no namespace).
          * Note: This value is only set on types registered using '{AppDomain}.registerType()'.
          */
        $__name?: string;

        /** Returns the full name of this type (includes the namespace).
          * Note: This value is only set on types registered using '{AppDomain}.registerType()'.
          */
        $__fullname?: string;
    }

    /** Domain information for every CoreXT 'Object' instance. */
    export interface IDomainObjectInfo extends IDisposable {
        /** A reference to the application domain that this object belongs to. */
        $__appDomain?: System.IAppDomain;

        /** 
         * The Application that this object instance belongs to. By default, this is always the current global application. In special cases, this may
         * refer to objects created do to communications with a child application.  When a child app closes, the related local objects will become
         * disposed as well.
         */
        $__app?: System.IApplication;

        /** 
         * The ID of this object, which is only useful for tracking objects within the local CoreXT client.
         * If setting this yourself, call 'Types.getNextObjectId()' for the next valid value.
         */
        $__id?: number; // (value is set and maintained by a Collections.IndexedObjectCollcetion instance; see 'CoreXT.objects' [static collection])

        /** 
          * The ID of this object within an application domain instance, if used, otherwise this is undefined.
          */
        $__appDomainId?: number; // (value is set and maintained by a Collections.IndexedObjectCollcetion instance; see 'CoreXT.objects' [static collection])

        /**
         * The globally unique ID (GUID) of this object, which is useful for synchronizing across networks (among other things).
         * Internally, all objects have a numbered ID in '$__id', which is unique only within the local client. If a '$__globalId' ID exists, 
         * it is trackable across the entire client/server side environment.  This is set usually by calling 'Utilities.createGUID()'.
         * Note: This value is only set automatically for tracked objects. If objects are not tracked by default you have to set this yourself.
         */
        $__globalId?: string; // (value is set and maintained by a Collections.IndexedObjectCollcetion instance; see 'CoreXT.objects' [static collection])

        ///** Used by the system (when calling 'Type.new(...)') to initialize/reinitialize a new/disposed object. */
        //x init<T extends object>(...args: any[]): T;
    }
    
    export interface IType<TInstance = object> {
        new(...args: any[]): TInstance;
    }

    export interface IFunction<ReturnType = any> {
        (...args: any[]): ReturnType;
    }

    /** Type-cast CoreXT namespace objects to this interface to access namespace specific type information. */
    export interface INamespaceInfo extends ITypeInfo {
        $__namespaces: NativeTypes.IArray<object>;
    }

    /** Type-cast function objects to this interface to access type specific information. */
    export interface IFunctionInfo extends Function, ITypeInfo {
        (...args: any[]): any;

        /** If specified, defines the expected types to use for injection into the function's parameters.
         * Each entry is for a single parameter, and is a array of items where each item is either a string, naming the fully-qualified type name, or an object reference to the type (function) that is expected.
         * To declare the parameter types for a constructor function (or any function), use the @
         */
        $__argumentTypes?: (IType<any> | string)[][];
    }

    /** Type-cast CoreXT classes (functions) to this interface to access class specific type information. */
    export interface IClassInfo<TInstance extends object = object> extends ITypeInfo, IType<TInstance> {
        /** This is a reference to the underlying class type for this factory type. */
        $__type: IType<TInstance>

        /** Represents the static properties on a factory type. */
        $__factoryType?: IFactoryTypeInfo;

        /** The base factory type of the factory in '$__factory'. This is provided to maintain a factory inheritance chain. */
        $__baseFactoryType?: { new(): IFactory } & ITypeInfo;
    }

    export interface NewDelegate<TInstance extends NativeTypes.IObject> { (...args: any[]): void | null | TInstance }

    export interface InitDelegate<TInstance extends NativeTypes.IObject> { (o: TInstance, isnew: boolean, ...args: any[]): void }

    /** Represents the static properties on a factory type. */
    export interface IFactoryTypeInfo<TClass extends IType = IType/*, TFactory extends IFactory = IFactory*/> extends IClassInfo<InstanceType<TClass>>, IFactory<TClass> {
        //x /** A factory instance created from this factory type which serves as a singleton for creating instances of the underlying 'TClass' type. */
        //x $__factory?: TFactory;

        /** The factory from the inherited base type, or null/undefined if this object does not inherit from an object with a factory pattern. */
        $__baseFactoryType: IFactoryTypeInfo;

        /** This is set to true when 'init()' is called. The flag is used to determine if 'super.init()' was called. If not then it is called automatically. */
        $__initCalled?: boolean;
    }

    /** Represents the factory methods of a factory instance. */
    export interface IFactory<TClass extends IType = IType, TNew extends NewDelegate<InstanceType<TClass>> = NewDelegate<InstanceType<TClass>>, TInit extends InitDelegate<InstanceType<TClass>> = InitDelegate<InstanceType<TClass>>> {

        /** Used in place of the constructor to create a new instance of the underlying object type for a specific domain.
          * This allows the reuse of disposed objects to prevent garbage collection hits that may cause the application to lag, and
          * also makes sure the object is associated with an application domain.
          * Objects that derive from 'DomainObject' should register the type and supply a custom 'init' function instead of a
          * constructor (in fact, only a default constructor should exist). This is done by creating a static property on the class
          * that uses 'AppDomain.registerCall()' to register the type. See 'NativeTypes.IObject.__register' for more information.
          *
          * Performance note: When creating thousands of objects continually, proper CoreXT object disposal (and subsequent cache of the
          * instances) means the GC doesn't have to keep engaging to clear up the abandoned objects.  While using the "new" operator may
          * be faster than using "{type}.new()" at first, the application actually becomes very lagged while the GC keeps eventually kicking
          * in. This is why CoreXT objects are cached and reused as much as possible, and why you should try to refrain from using the 'new',
          * operator, or any other operation that creates objects that the GC has to manage on a blocking thread.
          */
        'new'?: TNew;

        /** This is called internally to initialize a blank instance of the underlying type. Users should call the 'new()'
          * constructor function to get new instances, and 'dispose()' to release them when done.
          */
        init?: TInit
    }

    /** Represents the factory methods of a factory instance, including other protected instance properties used by the factory methods. */
    export interface IFactoryInternal<TClass extends IType<object> = IType<object>, TFactory extends { new(): IFactory } = { new(): IFactory }>
        extends IFactory<TClass> {
        /** The underlying type associated with this factory instance. */
        type: TClass; //x & InstanceType<TFactory> & { $__type: TClass }
        //x /** The factory instance containing the methods for creating instances of the underlying type '$__type'. */
        //x factory?: InstanceType<TFactory>;
        /** The immediate base factory type to this factory. */
        super: TFactory;
    }

    ///** Represents a static property on a class module. */
    //? export interface IStaticProperty<TDataType> { }

    ///** Stores static property registration details. */
    //?export interface IStaticPropertyInfo<TDataType> {
    //    parent: IStaticPropertyInfo<any>; // References the parent static property list (if any).  This is null on most base type.
    //    owner: IClassInfo<{}>; // The class type that owns this static property list.
    //    namedIndex: { [index: string]: IStaticProperty<any> }; // A named hash table used to quickly lookup a static property by name (shared by all type levels).
    //}

    // ===================================================================================================================

    /**
     * Supports Iteration for ES5/ES3. To use, create a new type derived from this one, or implement the IEnumerable<T> interface.
     */
    export abstract class Enumerable<T> implements Iterator<T>
    {
        next(value?: any): IteratorResult<T> {
            throw System.Exception.notImplemented('next', this);
        }

        return(value?: any): IteratorResult<T> {
            throw System.Exception.notImplemented('return', this);
        }

        throw(e?: any): IteratorResult<T> {
            throw System.Exception.notImplemented('throw', this);
        }
    }

    /**
    * Supports Iteration for ES5/ES3. To use, implement this interface, or create a new type derived from Enumerable<T>.
    */
    export interface IEnumerable<T> extends Enumerable<T> { }

    // =======================================================================================================================
}

// ###########################################################################################################################
// TODO: Consider adding a dependency injection system layer.
