// ###########################################################################################################################
// Application Domains
// ###########################################################################################################################

namespace CoreXT {
    export module System {

        // =======================================================================================================================

        /** AppDomain Bridge, for use with 'AppDomain.with()' when selecting a different application domain when operating on CoreXT class types. */
        export interface IADBridge extends IDomainObjectInfo {
            // '$__appDomain' is the app domain that was selected using 'with()'. By adding a value for this in a bridge instance, the default app domain will be overridden.
        }

        // =======================================================================================================================

        //x export class $DomainObject extends Object.$Type {
        //    //static ' '?= class FactoryRoot {
        //    //    static DomainObject_factory?: IFactoryType<$DomainObject> = {

        //    //    }

        //    //    /** Used to register CoreXT classes with the system. See 'AppDomain.registerClass()'. */
        //    //    static __register?: RegisterDelegate = () => $DomainObject.$__completeRegistration($DomainObject,
        //    //        FactoryRoot.DomainObject_factory.new, FactoryRoot.DomainObject_factory.init);
        //    //}

        //    // -------------------------------------------------------------------------------------------------------------------
        //}

        //var factoryRoot = $DomainObject[' ']; // (unfortunately, this is required for now: https://github.com/microsoft/typescript/issues/6606)

        ///** The base type for all CoreXT classes. Users should normally reference 'System.Object' instead of this lower level object. */
        //export var DomainObject = factoryRoot.__register<$DomainObject, typeof $DomainObject, typeof factoryRoot.DomainObject_factory>();

        // =======================================================================================================================

        export abstract class DependencyObject extends Object.$Type {
            get parent() { return this.__parent; }
            protected __parent: DependencyObject;
        }

        // =======================================================================================================================

        /** Application domains encapsulate applications and confine them to a root working space.  When application scripts are
             * loaded, they are isolated and run in the context of a new global scope.  This protects the main window UI, and also
             * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
             * logins, payment details, etc.
             * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
             */
        @frozen
        class $AppDomain extends Object.$Type {

            private _applications: $Application[]; // (allows nesting/embedding child applications which usually run in their own global execution environment)
            private _modules: Scripts.IModule[];

            /** The default system wide application domain.
              * See 'System.Platform.AppDomain' for more details.
              */
            static get default(): $AppDomain { return $AppDomain._default; }
            private static readonly _default: $AppDomain = new $AppDomain();

            /** A list of all application domains in the system. */
            static readonly appDomains: $AppDomain[] = [$AppDomain.default];

            /** Holds all the class types in the system registered by calling 'AppDomain.registerType()'. */
            static readonly _types: { [fullTypeName: string]: ITypeInfo } = {};

            /** A type bridge is a object instance who's prototype points to the actual static function object.
              * Each time "{AppDomain}.with()" is used, a bridge is created and cached here under the type name for reuse.
              */
            private readonly __typeBridges: { [fullTypeName: string]: IADBridge } = {};

            /** A collection of all objects created via this application domain instance. Each object is given an ID value
              * that is unique for this specific AppDomain instance only.
              */
            objects: Collections.IIndexedObjectCollection<IDomainObjectInfo> = new Collections.IndexedObjectCollection<IDomainObjectInfo>();
            // (why an object pool? http://www.html5rocks.com/en/tutorials/speed/static-mem-pools/)

            /** Returns the default (first) application for this domain. */
            application(): $Application {
                if (!this.applications.length)
                    throw Exception.error("AppDomain", "This application domain has no application instances.", this);
                return this.applications[0];
            }

            /** Holds a list of all applications on this domain.
              * Do not add applications directly to this array.  Use the 'createApplication()' function.
              * To remove an application, just dispose it.
              */
            applications: $Application[];

            // ----------------------------------------------------------------------------------------------------------------

            /** Disposes this AppDomain instance. */
            dispose(): void;
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
            dispose(object: IDisposable, release?: boolean): void;
            dispose(object?: IDisposable, release: boolean = true): void {
                var _object: IDomainObjectInfo = <any>object;
                if (_object !== void 0) {
                    // ... make sure 'dispose()' was called on the object ...

                    if (_object.$__appDomain !== void 0 && _object.$__appDomain != this) {
                        _object.$__appDomain.dispose(_object, release);
                        return;
                    }

                    // ... remove the object from the "active" list and erase it ...

                    this.objects.removeObject(_object);

                    TypeFactory.dispose(_object, release);
                } else {
                    for (var i = this._applications.length - 1; i >= 0; --i)
                        this._applications[i].dispose(release);

                    this._applications.length = 0;
                }

                //if (this == $AppDomain.default)
                //    global.close(); // (the default app domain is assumed to be the browser window, so try to close it now)
            }

            ///** Registers a given type by name (constructor function), and creates the function on the last specified module if it doesn't already exist.
            //* @param {Function} type The type (constructor function) to register.
            //* @param {modules} parentModules A list of all modules up to the current type, usually starting with 'CoreXT' as the first module.
            //* @param {boolean} addMemberTypeInfo If true (default), all member functions of any existing type (function object) will have type information
            //* applied (using the IFunctionInfo interface).
            //*/
            //static registerType<T extends (...args)=>any>(type: string, parentModules: {}[], addMemberTypeInfo?: boolean): T;
            //static registerType(type: Function, parentModules: {}[], addMemberTypeInfo?: boolean): ITypeInfo;

            /** Registers a given type (constructor function).  The type reference is expected to already exist.
              *
              * DO NOT use this to register CoreXT class types.  Use the 'registerClass()' function instead. This function is
              * used to register global types, and indirectly called by 'registerClass()' for CoreXT types (classes).
              * @param {IType} type The type (constructor function) to register.
              * @param {modules} parentModules A list of all modules up to the current type, usually starting with 'CoreXT' as the first module.
              * @param {boolean} addMemberTypeInfo If true (default), all member functions on the type (function object) will have type information
              * applied (using the IFunctionInfo interface).
              */
            static registerType(type: IType<any>, parentModules: object[], addMemberTypeInfo = true): any {

                if (parentModules === void 0)
                    throw Exception.error("registerType()", "A list of namespace modules is required, up to but not including the class type.", type);
                if (!parentModules)
                    parentModules = []; // (null was given perhaps to force global scope)
                else
                    parentModules = parentModules.slice(); // (use copy only just in case, since we will be modifying it)

                var _type = <ITypeInfo>type, namespaceItem: {} = CoreXT.global, mod: IModuleInfo, pname: string, name: string, fullname: string;
                if (!_type.$__name)
                    _type.$__name = Object.getTypeName(_type);

                parentModules.push(type); // (put the type on the end so we can include this in the loop also)

                if (!_type.$__parent || !_type.$__fullname) {
                    // ... refresh the type information by cycling through the given modules ...

                    for (var i = 0, n = parentModules.length; i < n; ++i) {
                        mod = <IModuleInfo>parentModules[i];
                        if (!mod.$__parent) {
                            // ... module type info missing, add it now; first, find the reference to get the name ...
                            name = "";
                            for (pname in namespaceItem)
                                if (namespaceItem[pname] === mod) {
                                    name = pname;
                                    break;
                                }
                            if (!name)
                                throw Exception.error("registerType()", ((i == n - 1) ? "The type to be registered" : (i == 0 ? "The first module" : "Module " + (1 + i))) + " cannot be found in the" + ((i == 0) ? " root scope." : " preceding module.")
                                    + " Please double check you have the correct modules that precede the type being registered.", _type);
                            fullname = fullname ? fullname + "." + name : name;
                            mod.$__parent = <IModuleInfo>namespaceItem; // (each module will have a reference to its parent module [object], and its local and full type names; note: the CoreXT parent will be pointing to 'CoreXT.global')
                            if (mod != _type) // (modules cannot be nested in class types)
                                mod.$__modules = <any>mod; // ('$__modules' just provides an easy way to navigate TypeScript type information by module name)
                            else
                                mod.$__modules = <any>mod.$__parent; // ('$__modules', when accessed on a class type, will reference the parent module)
                            mod.$__name = name; // (the local module name)
                            mod.$__fullname = fullname; // (the fully qualified namespace name for this module)
                        }
                        namespaceItem = mod;
                    }

                    _type.$__fullname = fullname = fullname ? fullname + "." + _type.$__name : _type.$__name;
                }
                else fullname = _type.$__fullname;

                // ... scan the type's prototype functions and update the type information (only function names at this time) ...
                // TODO: Consider parsing the function parameters as well and add this information for developers.

                if (addMemberTypeInfo) {
                    var prototype = type['prototype'], func: IFunctionInfo;

                    for (var pname in prototype) {
                        func = prototype[pname];
                        if (typeof func == FUNCTION) {
                            func.$__parent = <IModuleInfo>_type;
                            func.$__name = pname;
                            func.$__fullname = fullname + "." + pname;
                        }
                    }
                }

                // ... register the type ...
                // (all registered type names will be made available here globally, since types are not AppDomain specific)

                $AppDomain._types[fullname] = <ITypeInfo><any>type;

                return _type;
            }

            /** Registers a CoreXT class type and returns the given type reference when done.
              * Note: Prototype functions for registered types are also updated to support the ITypeInfo interface.
              * @param {object} classModule The class module container to register (the class to register in the module must have the name '$Type').
              * @param {modules} parentModules A list of all modules up to the current type, usually starting with 'CoreXT' as the first module.
              * Tip: If intellisense is available, hover your mouse cursor over the class type to see the full namespace path.
              * @param {boolean} addMemberTypeInfo If true (default), all class member functions on the type (function object) will have type information
              * applied (using the IFunctionInfo interface).
              */
            static registerClass<TInstance extends NativeTypes.IObject, TClass extends ICoreXTClassType<TInstance>, TNew extends NewDelegate<TInstance>, TInit extends InitDelegate<TInstance>> //IFactoryType<TInstance>
                (classType: TClass, newFunc: TNew, initFunc: TInit, parentModules: object[], addMemberTypeInfo: boolean = true)
                : TClass & IFactoryType<TNew, TInit> & IRegisteredType<TClass> {
                // ... get the type name for the class (only available on classes; modules end up being simple objects only) ...
                // (note: if 'classType' will be replaced on the last module with a new constructor function)

                // ***************
                // *************** TODONEXT: Need domain object to handle most of this perhaps, where applicable. ***************
                // ***************

                if (typeof classType !== FUNCTION)
                    throw Exception.error("registerClass()", "The 'classType' argument is not a valid constructor function.", classType); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

                if (!(classType instanceof Object))
                    throw Exception.error("registerClass()", "Class is not of type 'System.Object'.", classType);

                var classTypeInfo: ITypeInfo = <any>classType;

                // ... validate that type info and module info exists, otherwise add/update it ...

                var modInfo = <IModuleInfo><any>classTypeInfo.$__parent;

                if (!modInfo || !modInfo.$__name || !modInfo.$__fullname)
                    this.registerType(classType, parentModules, addMemberTypeInfo);

                // ... establish the static property definitions ...
                //? Property.__completePropertyRegistration(classTypeInfo);

                if (!classType.prototype.hasOwnProperty("toString"))
                    classType.prototype.toString = function (): string { return (<IModuleInfo>this).$__fullname; }

                //? if (!classType.prototype.hasOwnProperty("valueOf"))
                //    classType.prototype.valueOf = function () { return this; };

                return (newFunc || initFunc) ? <any>__RegisterFactoryType(classType, newFunc, initFunc) : void 0;
                // (note: 'factoryDefinition' many not be defined if only registering a class with the AppDomain, where the class completed the factory registration part another way [see CoreXT primitive types])
            }

            /** Attaches the object to this AppDomain.  The object must never exist in any other domains prior to this call.
              * 'ITypeInfo' details will be updated for the object.  This is useful when 
              * See also: {AppDomain}.registerType()
              * @param {T} object The object to add to this app domain.
              * @param {{}} parentModule The parent module or scope in which the type exists.
              * @param {{}} parentModule The parent module or scope in which the type exists.
              */
            attachObject<T extends {}>(object: T): T {
                if (!type.$__parent || !type.$__name || !type.$__fullname)
                    throw Exception.error("with()", "The specified type '" + type.$__name + "' has not yet been registered properly using 'AppDomain.registerType()/.registerClass()'.", type);
                var type: IFunctionInfo = <IFunctionInfo>object.constructor;
                this.objects.addObject(<any>object);
                return object;
            }

            /** Selects this application domain instance as the active domain when calling methods on a type. This is usually used
              * as a chain method for getting a new instance from a type.
              * Note: The focus for this AppDomain instance is limited to this call only (i.e. not persisted).
              */
            with<TClassType extends ICoreXTClassType<IObject>>(classType: TClassType): TClassType {
                var typeInfo = <ITypeInfo><any>classType;
                if (!typeInfo.$__parent || !typeInfo.$__name || !typeInfo.$__fullname)
                    throw Exception.error("with()", "The specified class type has not yet been registered properly using 'AppDomain.registerType()'.", classType);
                var bridge: IADBridge = this.__typeBridges[typeInfo.$__fullname];
                if (!bridge) {
                    var $appDomain = this;
                    var bridgeConstructor: { new(): IADBridge } = <any>function ADBridge() { this.constructor = classType.constructor; (<IADBridge>this).$__appDomain = $appDomain; };
                    /* This references the type to perform some action on with the select app domain. Any property reference on the bridge is redirected to the class type. */
                    bridgeConstructor.prototype = classType; // (the bridge works only because "type" has STATIC properties, so a bridge object specific to this AppDomain is created, cached, and used to intercept properties on the targeted type)
                    // ... cache the type so this bridge only has to be created once for this type ...
                    this.__typeBridges[typeInfo.$__fullname] = bridge = new bridgeConstructor();
                }
                return <any>bridge;
            }

            private __validateElementTarget(appTitle: string, targetElement: Platform.UI.IUIObject) { //??
                for (var i = 0; i < this.applications.length; i++)
                    if ((<Platform.UI.View.$Type<any>><any>this.applications[i]).__uiElement == targetElement)
                        throw "Cannot add application '" + appTitle + "' as another application exists with the same target element.  Two applications cannot render to the same target.";
            }

            createApplication: <TApp extends $Application>(appClassMod?: ICallableType<TApp>, parent?: Platform.GraphItem.$Type, title?: string, description?: string, targetElement?: HTMLElement) => TApp;

            // -------------------------------------------------------------------------------------------------------------------

            static '$AppDomain Factory' = function () {
                return frozen(class Factory {
                    static $Type = $AppDomain;
                    static $InstanceType = <{}>null && new Factory.$Type();
                    static $BaseFactory = $AppDomain['$Object Factory'];

                    /** Get a new app domain instance.
                    * @param application An optional application to add to the new domain.
                    */
                    static 'new'(application?: $Application): typeof Factory.$InstanceType { return null; }

                    /** Constructs an application domain for the specific application instance. */
                    static init($this: typeof Factory.$InstanceType, isnew: boolean, application?: $Application): typeof Factory.$InstanceType {
                        this.$BaseFactory.init($this, isnew);
                        (<IDomainObjectInfo><any>$this).$__appDomain = $this;
                        $this.applications = typeof application == OBJECT ? [application] : [];
                        //? if (global.Object.freeze)
                        //?    global.Object.freeze($this); // (properties cannot be modified once set)
                        return $this;
                    }
                });
            }();

            // -------------------------------------------------------------------------------------------------------------------
        }

        export interface IAppDomain extends $AppDomain { }
        export var AppDomain = TypeFactory.__RegisterFactoryType($AppDomain, $AppDomain['$AppDomain Factory']);

        $AppDomain.prototype.createApplication = function createApplication<TApp extends $Application>(appClassMod?: ICallableType<TApp>, parent?: Platform.UI.GraphNode, title?: string, description?: string, targetElement?: HTMLElement): TApp {
            if (!Platform.UIApplication)
                throw Exception.error("AppDomain.createApplication()", "");
            return (<$AppDomain>this).with(<any>appClassMod || Platform.UIApplication)(parent, title, description, targetElement);
        };

        // ====================================================================================================================

        /** Applications wrap window reference targets, and any specified HTML for configuration and display. There can be many
          * applications in a single AppDomain.
          */
        @frozen
        class $Application extends Object.$Type {
            // ----------------------------------------------------------------------------------------------------------------

            /** References the current running application that owns the current running environment. */
            static get current(): IApplication {
                return $Application._current;
            }
            private static _current: IApplication = null;

            /** References the application who's window currently has user focus. You can also set this property to change window focus. */
            static get focused(): IApplication {
                return $Application._focused;
            }
            static set focused(value: IApplication) {
                if ($Application._focused !== value) {
                    $Application._focused = value;
                    if (typeof value == OBJECT && typeof (<$Application>value).focus == FUNCTION)
                        (<IApplication>value).focus();
                }
            }
            private static _focused: IApplication = null;

            /** Returns true if this application is focused. */
            get isFocused(): boolean { return this._isFocused; }
            private _isFocused: boolean;

            private _appID: number; // (path format is "/userDBID/appID/", where 'userID' is the db record ID of the logged in user; example: https://inetos.com/1/1/index.html)
            private _title: string;

            get appDomains(): $AppDomain[] { return this._appDomains; }
            private _appDomains: $AppDomain[];

            private _applications: $Application[]; // (allows nesting/embedding child applications which usually run in their own global execution environment)
            private _modules: Scripts.IModule[];

            /** The default system wide application domain.
              * See 'System.Platform.AppDomain' for more details.
              */
            static get default(): IApplication { return $Application._default; }
            private static _default: $Application = Application.new(window.document.title, 0);

            /** A list of all applications in the system. */
            static applications: $Application[] = [$Application._default];

            /** Returns the default (first) application for this domain. */
            application(): $Application {
                if (!this.applications.length)
                    throw Exception.error("AppDomain", "This application domain has no application instances.", this);
                return this.applications[0];
            }

            /** Holds a list of all applications on this domain.
              * Do not add applications directly to this array.  Use the 'createApplication()' function.
              * To remove an application, just dispose it.
              */
            applications: $Application[];

            // ----------------------------------------------------------------------------------------------------------------
            
            static '$Application Factory' = function () {
                return frozen(class Factory {
                    static $Type = $Application;
                    static $InstanceType = <{}>null && new Factory.$Type();
                    static $BaseFactory = $Application['$Object Factory'];

                    static 'new'(title: string, appID: number): typeof Factory.$InstanceType { return null; }

                    static init($this: typeof Factory.$InstanceType, isnew: boolean, title: string, appID: number): typeof Factory.$InstanceType {
                        this.$InstanceType.init($this, isnew);
                        (<IDomainObjectInfo><any>$this).$__app = $this;
                        $this._title = title;
                        $this._appID = appID;
                        return $this;
                    }
                });
            }();

            // ----------------------------------------------------------------------------------------------------------------

            /** Try to bring the window for this application to the front. */
            focus(): void {
            }

            // ----------------------------------------------------------------------------------------------------------------

            /** Closes the application by disposing all owned AppDomain instances, which also closes any opened windows, including the application's own window as well. */
            close(): void {
                // ... close all except "self" ([0]), then close "self" ...
                for (var i = this._appDomains.length - 1; i > 0; --i)
                    this._appDomains[i].dispose();
                this._appDomains[0].dispose();
            }

            // ----------------------------------------------------------------------------------------------------------------
        }

        export interface IApplication extends $Application { }
        export var Application = TypeFactory.__RegisterFactoryType($Application, $Application['$Application Factory']);

        // ====================================================================================================================

        // ... register the basic types ...
        $AppDomain.registerType(global.Object, null, false);
        $AppDomain.registerType(global.Function, null, false);
        $AppDomain.registerType(global.Array, null, false);
        $AppDomain.registerType(global.Boolean, null, false);
        $AppDomain.registerType(global.Number, null, false);
        $AppDomain.registerType(global.String, null, false);
        $AppDomain.registerType(global.Date, null, false);
        $AppDomain.registerType(global.RegExp, null, false);

        $AppDomain.registerClass(Object, null, [CoreXT, System]);
    }

    // =======================================================================================================================
}