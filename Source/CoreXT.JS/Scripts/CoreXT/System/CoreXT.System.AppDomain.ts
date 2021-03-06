﻿// ############################################################################################################################################
// Application Domains
// ############################################################################################################################################

namespace CoreXT {
    export namespace System {
        namespace(() => CoreXT.System);

        // ====================================================================================================================================

        /** AppDomain Bridge, for use with 'AppDomain.with()' when selecting a different application domain when operating on CoreXT class types. */
        export interface IADBridge extends IDomainObjectInfo {
            // '$__appDomain' is the app domain that was selected using 'with()'. By adding a value for this in a bridge instance, the default app domain will be overridden.
        }

        // ====================================================================================================================================

        //x export class $DomainObject extends Factory(Object) {
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

        // ====================================================================================================================================

        /** 
         * Application domains encapsulate applications and confine them to a root working space.  When application scripts are
         * loaded, they are isolated and run in the context of a new global scope.  This protects the main window UI, and also
         * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
         * logins, payment details, etc.
         * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
         */
        export class AppDomain extends FactoryBase(CoreObject) {
            /** Get a new app domain instance.
                * @param application An optional application to add to the new domain.
                */
            static 'new': (application?: IApplication) => IAppDomain;
            /** Constructs an application domain for the specific application instance. */
            static init: (o: IAppDomain, isnew: boolean, application?: IApplication) => void;

            /** The default system wide application domain.
              * See 'System.Platform.AppDomain' for more details.
              */
            static get default(): IAppDomain { return AppDomain._default; }
            static set default(value: IAppDomain) {
                if (!value || !(value instanceof this.$__type)) error("AppDomain.default", "A valid 'AppDomain' instance is required.");
                this._default = value;
            }
            private static _default: IAppDomain;

            /** A list of all application domains in the system. */
            static readonly appDomains: IAppDomain[] = [AppDomain.default];
        }
        export namespace AppDomain {
            export class $__type extends FactoryType(CoreObject) {
                private _applications: IApplication[]; // (allows nesting/embedding child applications which usually run in their own global execution environment)
                private _modules: Scripts.IModule[];

                /** A type bridge is a object instance who's prototype points to the actual static function object.
                  * Each time "{AppDomain}.with()" is used, a bridge is created and cached here under the type name for reuse.
                  */
                private readonly __typeBridges: { [fullTypeName: string]: IADBridge } = {};

                /** Automatically tracks new objects created under this app domain. The default is undefined, in which case the global 'Types.autoTrackInstances' is used instead. */
                autoTrackInstances: boolean;

                private __objects: Collections.IIndexedObjectCollection<IDomainObjectInfo>;
                /** 
                 * A collection of all objects tracked by this application domain instance (see the 'autoTrackInstances' property).
                 * Each object is given an ID value that is unique for this specific AppDomain instance only.
                 */
                get objects() { return this.__objects; }

                // (why an object pool? http://www.html5rocks.com/en/tutorials/speed/static-mem-pools/)
                // Note: requires calling '{System.Object}.track()' or setting '{System.AppDomain}.autoTrack=true'.

                /** Returns the default (first) application for this domain. */
                application(): IApplication {
                    if (!this.applications.length)
                        throw Exception.error("AppDomain", "This application domain has no application instances.", this);
                    return this.applications[0];
                }

                /** Holds a list of all applications on this domain.
                  * Do not add applications directly to this array.  Use the 'createApplication()' function.
                  * To remove an application, just dispose it.
                  */
                applications: IApplication[];

                // -------------------------------------------------------------------------------------------------------------------------------

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
                    if (arguments.length > 0) {
                        Types.__disposeValidate(object, "{AppDomain}.dispose()", this);

                        // ... make sure 'dispose()' was called on the object for the correct app domain ...

                        if (typeof _object.$__appDomain == 'object' && _object.$__appDomain != this)
                            error("{AppDomain}.dispose()", "The given object cannot be disposed by this app domain as it belongs to a different instance.", this);

                        _object.$__disposing = true;

                        // ... verified that this is the correct domain; remove the object from the "active" list and erase it ...

                        if (_object.$__appDomainId >= 0)
                            this.objects.removeObject(_object);

                        Types.dispose(_object, release);
                    } else {
                        // ... dispose was called without parameters, so assume to dispose the app domain ...

                        for (var i = this._applications.length - 1; i >= 0; --i)
                            this._applications[i].dispose(release);

                        this._applications.length = 0;
                    }

                    //if (this == $AppDomain.default)
                    //    global.close(); // (the default app domain is assumed to be the browser window, so try to close it now)
                }

                ///** Registers a CoreXT type under a specified namespace and returns the given type reference when done.
                //  * Note: Prototype functions for registered types are also updated to support the ITypeInfo interface.
                //  * @param {object} classModule The class module container to register (the class to register in the module must have the name '$Type').
                //  * @param {modules} parentModules A list of all modules up to the current type, usually starting with 'CoreXT' as the first module.
                //  * Tip: If code completion is available, hover your mouse cursor over the class type to see the full namespace path.
                //  * @param {boolean} addMemberTypeInfo If true (default), all class member functions on the type (function object) will have type information
                //  * applied (using the IFunctionInfo interface).
                //  */
                //static registerType<T>(type: T, parentModules: object[], addMemberTypeInfo: boolean = true) : T {
                //    // ... get the type name for the class (only available on classes; modules end up being simple objects only) ...
                //    // (note: if 'classType' will be replaced on the last module with a new constructor function)

                //    // ***************
                //    // *************** TODONEXT: Need domain object to handle most of this perhaps, where applicable. ***************
                //    // ***************

                //    if (typeof type !== FUNCTION)
                //        throw Exception.error("registerClass()", "The 'classType' argument is not a valid constructor function.", type); // TODO: See if this can also be detected in ES2015 (ES6) using the specialized functions.

                //    //if (!(type instanceof Object.$__type))
                //    //    throw Exception.error("registerClass()", "Class is not of type 'System.Object'.", type);

                //    var classTypeInfo: ITypeInfo = <any>type;

                //    // ... validate that type info and module info exists, otherwise add/update it ...

                //    var modInfo = <INamespaceInfo><any>classTypeInfo.$__parent;

                //    if (!modInfo || !modInfo.$__name || !modInfo.$__fullname)
                //        this.registerType(type, parentModules, addMemberTypeInfo);

                //    // ... establish the static property definitions ...
                //    //? Property.__completePropertyRegistration(classTypeInfo);

                //    if (!type.prototype.hasOwnProperty("toString"))
                //        type.prototype.toString = function (): string { return (<INamespaceInfo>this).$__fullname; }

                //    //? if (!classType.prototype.hasOwnProperty("valueOf"))
                //    //    classType.prototype.valueOf = function () { return this; };

                //    return (newFunc || initFunc) ? <any>__RegisterFactoryType(type, newFunc, initFunc) : void 0;
                //    // (note: 'factoryDefinition' many not be defined if only registering a class with the AppDomain, where the class completed the factory registration part another way [see CoreXT primitive types])
                //}

                /** Attaches the object to this AppDomain.  The object must never exist in any other domains prior to this call.
                  * 'ITypeInfo' details will be updated for the object.  This is useful when 
                  * See also: {AppDomain}.registerType()
                  * @param {T} object The object to add to this app domain.
                  * @param {{}} parentModule The parent module or scope in which the type exists.
                  * @param {{}} parentModule The parent module or scope in which the type exists.
                  */
                attachObject<T extends object>(object: T): T {
                    //var type: IFunctionInfo = <IFunctionInfo>object.constructor;
                    var type = <IDomainObjectInfo><any>object;
                    if (type.$__disposing || type.$__disposed)
                        error("attachObject()", "The specified object instance of type '" + getFullTypeName(type) + "' is disposed.", type);
                    if (!type.$__corext || !type.$__appDomain || !type.dispose)
                        error("attachObject()", "The specified type '" + getFullTypeName(type) + "' is not valid for this operation. Make sure to use 'CoreXT.ClassFactory()' to create valid factory types, or make sure the 'IDomainObjectInfo' properties are satisfied.", type);
                    if (type.$__appDomain != this)
                        error("attachObject()", "The specified object instance of type '" + getFullTypeName(type) + "' is already attached to a different application domain.", type);
                    this.objects.addObject(<any>object);
                    return object;
                }

                /** Selects this application domain instance as the active domain when calling methods on a type. This is usually used
                  * as a chain method for getting a new instance from a type.
                  * Note: The focus for this AppDomain instance is limited to this call only (i.e. not persisted).
                  */
                with<TFactory extends IFactory>(type: TFactory): TFactory {
                    var typeInfo = <ITypeInfo><any>type;
                    if (!typeInfo.$__parent || !typeInfo.$__name || !typeInfo.$__fullname)
                        throw Exception.error("with()", "The specified type has not yet been registered properly. Extend from 'CoreXT.ClassFactory()' or use utility functions in 'CoreXT.Types' when creating factory types.", type);
                    var bridge: IADBridge = this.__typeBridges[typeInfo.$__fullname];
                    if (!bridge) {
                        var appDomain = this;
                        var bridgeConstructor: { new(): IADBridge } = <any>function ADBridge() { this.constructor = type.constructor; (<IADBridge>this).$__appDomain = appDomain; };
                        /* This references the type to perform some action on with the select app domain. Any property reference on the bridge is redirected to the class type. */
                        bridgeConstructor.prototype = type; // (the bridge works only because "type" has STATIC properties, so a bridge object specific to this AppDomain is created, cached, and used to intercept properties on the targeted type)
                        // ... cache the type so this bridge only has to be created once for this type ...
                        this.__typeBridges[typeInfo.$__fullname] = bridge = new bridgeConstructor();
                    }
                    return <any>bridge;
                }

                createApplication<TApp extends IType<IApplication>>(factory?: IFactory<TApp>, title?: string, description?: string): TApp {
                    //if (!Platform.UIApplication)
                    //    throw Exception.error("AppDomain.createApplication()", "");
                    var appIndex = this.applications.length;
                    var newApp = (<typeof Application><any>this.with(factory)).new(title, description, appIndex);
                    this.applications.push(newApp);
                    try {
                        newApp['_onAddToAppDomain'](this, newApp);
                        return <any>newApp;
                    }
                    catch (ex) {
                        this.applications.splice(appIndex, 1);
                        throw ex;
                    }
                }

                private static [constructor](factory: typeof AppDomain) {
                    factory.init = (o, isnew, application) => {
                        factory.super.init(o, isnew);
                        (<IDomainObjectInfo><any>o).$__appDomain = o;
                        o.__objects = Collections.IndexedObjectCollection.new<IDomainObjectInfo>();
                        o.__objects.__IDPropertyName = <KeyOf<IDomainObjectInfo>>"$__appDomainId";
                        o.applications = typeof application == 'object' ? [application] : [];
                        //? if (global.Object.freeze)
                        //?    global.Object.freeze($this); // (properties cannot be modified once set)
                    };
                }
            }

            AppDomain.$__register(System);
        }

        export interface IAppDomain extends AppDomain.$__type { }

        //x $AppDomain.prototype.createApplication = function createApplication<TApp extends typeof $Application>(classFactory?: IFactory<TApp>, parent?: Platform.UI.GraphNode, title?: string, description?: string, targetElement?: HTMLElement): TApp {
        //    if (!Platform.UIApplication)
        //        throw Exception.error("AppDomain.createApplication()", "");
        //    return (<$AppDomain>this).with(<any>classFactory || Platform.UIApplication)(parent, title, description, targetElement);
        //};

        // ===================================================================================================================================

        /** Applications wrap window reference targets, and any specified HTML for configuration and display. There can be many
          * applications in a single AppDomain.
          */
        export class Application extends FactoryBase(CoreObject) {
            static 'new': (title: string, description: string, appID: number) => IApplication;
            static init: (o: IApplication, isnew: boolean, title: string, description: string, appID: number) => void;

            // -------------------------------------------------------------------------------------------------------------------------------

            /** The default system wide application domain.
              * See 'System.Platform.AppDomain' for more details.
              */
            static get default(): IApplication { return Application._default; }
            static set default(value: IApplication) {
                if (!value || !(value instanceof Application.$__type)) error("Application.default", "A valid 'Application' instance is required.");
                Application._default = value;
            }
            private static _default: IApplication;

            // -------------------------------------------------------------------------------------------------------------------------------

            /** References the current running application that owns the current running environment. */
            static get current(): IApplication {
                return Application._current;
            }
            private static _current: IApplication = null;

            // -------------------------------------------------------------------------------------------------------------------------------

            /** A list of all applications in the system. */
            static applications: IApplication[] = [Application._default];

            /** References the application who's window currently has user focus. You can also set this property to change window focus. */
            static get focused(): IApplication {
                return Application._focused;
            }
            static set focused(value: IApplication) {
                if (Application._focused !== value) {
                    Application._focused = value;
                    if (typeof value == 'object' && typeof (<IApplication>value).focus == 'function')
                        (<IApplication>value).focus();
                }
            }
            private static _focused: IApplication = null;
        }
        export namespace Application {
            export class $__type extends FactoryType(CoreObject) {
                // --------------------------------------------------------------------------------------------------------------------------

                /** Returns true if this application is focused. */
                get isFocused(): boolean { return this._isFocused; }
                private _isFocused: boolean;

                get appID() { return this._appID; }
                private _appID: number; // (path format is "/userDBID/appID/", where 'userID' is the db record ID of the logged in user; example: https://inetos.com/1/1/index.html)

                get title() { return this._title; }
                private _title: string;

                get description() { return this._description; }
                private _description: string;

                get appDomains(): IAppDomain[] { return this._appDomains; }
                private _appDomains: IAppDomain[];

                private _applications: Application[]; // (allows nesting/embedding child applications which usually run in their own global execution environment)
                private _modules: Scripts.IModule[];

                /** Returns the default (first) application for this domain. */
                application(): Application {
                    if (!this.applications.length)
                        throw Exception.error("AppDomain", "This application domain has no application instances.", this);
                    return this.applications[0];
                }

                /** Holds a list of all applications on this domain.
                  * Do not add applications directly to this array.  Use the 'createApplication()' function.
                  * To remove an application, just dispose it.
                  */
                applications: Application[];

                // -------------------------------------------------------------------------------------------------------------------------------

                protected _onAddToAppDomain(appDomain: IAppDomain, app: IApplication) {
                }

                // -------------------------------------------------------------------------------------------------------------------------------

                /** Try to bring the window for this application to the front. */
                focus(): void {
                }

                // -------------------------------------------------------------------------------------------------------------------------------

                /** Closes the application by disposing all owned AppDomain instances, which also closes any opened windows, including the application's own window as well. */
                close(): void {
                    // ... close all except "self" ([0]), then close "self" ...
                    for (var i = this._appDomains.length - 1; i > 0; --i)
                        this._appDomains[i].dispose();
                    this._appDomains[0].dispose();
                }

                // -------------------------------------------------------------------------------------------------------------------------------

                private static [constructor](factory: typeof Application) {
                    factory.init = (o, isnew, title, description, appID) => {
                        factory.super.init(o, isnew);
                        (<IDomainObjectInfo><any>o).$__app = o;
                        o._title = title;
                        o._description = description;
                        o._appID = appID;
                    };
                }
            }

            Application.$__register(System);
        }

        export interface IApplication extends Application.$__type { }

        // ===================================================================================================================================
        // Create a default application domain and default application.
        // The default app domain is used for new objects created, and the default application can be used to easily represent the current web application.

        AppDomain.default = AppDomain.new();
        Application.default = Application.new(window.document.title, "Default Application", 0);

        frozen(AppDomain);
        frozen(Application);
    }

    // ========================================================================================================================================
}