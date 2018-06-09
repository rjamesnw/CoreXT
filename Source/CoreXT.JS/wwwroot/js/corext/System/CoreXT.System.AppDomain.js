// ############################################################################################################################################
// Application Domains
// ############################################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        CoreXT.namespace(function () { return CoreXT.System; });
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
        var AppDomain = /** @class */ (function (_super) {
            __extends(AppDomain, _super);
            function AppDomain() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(AppDomain, "default", {
                /** The default system wide application domain.
                  * See 'System.Platform.AppDomain' for more details.
                  */
                get: function () { return AppDomain._default; },
                set: function (value) {
                    if (!value || !(value instanceof this.$__type))
                        CoreXT.error("AppDomain.default", "A valid 'AppDomain' instance is required.");
                    this._default = value;
                },
                enumerable: true,
                configurable: true
            });
            /** A list of all application domains in the system. */
            AppDomain.appDomains = [AppDomain.default];
            return AppDomain;
        }(CoreXT.FactoryBase(System.Object)));
        System.AppDomain = AppDomain;
        (function (AppDomain) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    /** A type bridge is a object instance who's prototype points to the actual static function object.
                      * Each time "{AppDomain}.with()" is used, a bridge is created and cached here under the type name for reuse.
                      */
                    _this.__typeBridges = {};
                    return _this;
                }
                Object.defineProperty($__type.prototype, "objects", {
                    /**
                     * A collection of all objects tracked by this application domain instance (see the 'autoTrackInstances' property).
                     * Each object is given an ID value that is unique for this specific AppDomain instance only.
                     */
                    get: function () { return this.__objects; },
                    enumerable: true,
                    configurable: true
                });
                // (why an object pool? http://www.html5rocks.com/en/tutorials/speed/static-mem-pools/)
                // Note: requires calling '{System.Object}.track()' or setting '{System.AppDomain}.autoTrack=true'.
                /** Returns the default (first) application for this domain. */
                $__type.prototype.application = function () {
                    if (!this.applications.length)
                        throw System.Exception.error("AppDomain", "This application domain has no application instances.", this);
                    return this.applications[0];
                };
                $__type.prototype.dispose = function (object, release) {
                    if (release === void 0) { release = true; }
                    var _object = object;
                    if (arguments.length > 0) {
                        CoreXT.Types.__disposeValidate(object, "{AppDomain}.dispose()", this);
                        // ... make sure 'dispose()' was called on the object for the correct app domain ...
                        if (typeof _object.$__appDomain == 'object' && _object.$__appDomain != this)
                            CoreXT.error("{AppDomain}.dispose()", "The given object cannot be disposed by this app domain as it belongs to a different instance.", this);
                        _object.$__disposing = true;
                        // ... verified that this is the correct domain; remove the object from the "active" list and erase it ...
                        if (_object.$__appDomainId >= 0)
                            this.objects.removeObject(_object);
                        CoreXT.Types.dispose(_object, release);
                    }
                    else {
                        // ... dispose was called without parameters, so assume to dispose the app domain ...
                        for (var i = this._applications.length - 1; i >= 0; --i)
                            this._applications[i].dispose(release);
                        this._applications.length = 0;
                    }
                    //if (this == $AppDomain.default)
                    //    global.close(); // (the default app domain is assumed to be the browser window, so try to close it now)
                };
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
                $__type.prototype.attachObject = function (object) {
                    //var type: IFunctionInfo = <IFunctionInfo>object.constructor;
                    var type = object;
                    if (type.$__disposing || type.$__disposed)
                        CoreXT.error("attachObject()", "The specified object instance of type '" + CoreXT.getFullTypeName(type) + "' is disposed.", type);
                    if (!type.$__corext || !type.$__appDomain || !type.dispose)
                        CoreXT.error("attachObject()", "The specified type '" + CoreXT.getFullTypeName(type) + "' is not valid for this operation. Make sure to use 'CoreXT.ClassFactory()' to create valid factory types, or make sure the 'IDomainObjectInfo' properties are satisfied.", type);
                    if (type.$__appDomain != this)
                        CoreXT.error("attachObject()", "The specified object instance of type '" + CoreXT.getFullTypeName(type) + "' is already attached to a different application domain.", type);
                    this.objects.addObject(object);
                    return object;
                };
                /** Selects this application domain instance as the active domain when calling methods on a type. This is usually used
                  * as a chain method for getting a new instance from a type.
                  * Note: The focus for this AppDomain instance is limited to this call only (i.e. not persisted).
                  */
                $__type.prototype.with = function (type) {
                    var typeInfo = type;
                    if (!typeInfo.$__parent || !typeInfo.$__name || !typeInfo.$__fullname)
                        throw System.Exception.error("with()", "The specified type has not yet been registered properly. Extend from 'CoreXT.ClassFactory()' or use utility functions in 'CoreXT.Types' when creating factory types.", type);
                    var bridge = this.__typeBridges[typeInfo.$__fullname];
                    if (!bridge) {
                        var appDomain = this;
                        var bridgeConstructor = function ADBridge() { this.constructor = type.constructor; this.$__appDomain = appDomain; };
                        /* This references the type to perform some action on with the select app domain. Any property reference on the bridge is redirected to the class type. */
                        bridgeConstructor.prototype = type; // (the bridge works only because "type" has STATIC properties, so a bridge object specific to this AppDomain is created, cached, and used to intercept properties on the targeted type)
                        // ... cache the type so this bridge only has to be created once for this type ...
                        this.__typeBridges[typeInfo.$__fullname] = bridge = new bridgeConstructor();
                    }
                    return bridge;
                };
                $__type.prototype.createApplication = function (factory, title, description) {
                    //if (!Platform.UIApplication)
                    //    throw Exception.error("AppDomain.createApplication()", "");
                    var appIndex = this.applications.length;
                    var newApp = this.with(factory).new(title, description, appIndex);
                    this.applications.push(newApp);
                    try {
                        newApp['_onAddToAppDomain'](this, newApp);
                        return newApp;
                    }
                    catch (ex) {
                        this.applications.splice(appIndex, 1);
                        throw ex;
                    }
                };
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, application) {
                        factory.super.init(o, isnew);
                        o.$__appDomain = o;
                        o.__objects = System.Collections.IndexedObjectCollection.new();
                        o.__objects.__IDPropertyName = "$__appDomainId";
                        o.applications = typeof application == 'object' ? [application] : [];
                        //? if (global.Object.freeze)
                        //?    global.Object.freeze($this); // (properties cannot be modified once set)
                    };
                };
                return $__type;
            }(CoreXT.FactoryType(System.Object)));
            AppDomain.$__type = $__type;
            AppDomain.$__register(System);
        })(AppDomain = System.AppDomain || (System.AppDomain = {}));
        //x $AppDomain.prototype.createApplication = function createApplication<TApp extends typeof $Application>(classFactory?: IFactory<TApp>, parent?: Platform.UI.GraphNode, title?: string, description?: string, targetElement?: HTMLElement): TApp {
        //    if (!Platform.UIApplication)
        //        throw Exception.error("AppDomain.createApplication()", "");
        //    return (<$AppDomain>this).with(<any>classFactory || Platform.UIApplication)(parent, title, description, targetElement);
        //};
        // ===================================================================================================================================
        /** Applications wrap window reference targets, and any specified HTML for configuration and display. There can be many
          * applications in a single AppDomain.
          */
        var Application = /** @class */ (function (_super) {
            __extends(Application, _super);
            function Application() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(Application, "default", {
                // -------------------------------------------------------------------------------------------------------------------------------
                /** The default system wide application domain.
                  * See 'System.Platform.AppDomain' for more details.
                  */
                get: function () { return Application._default; },
                set: function (value) {
                    if (!value || !(value instanceof Application.$__type))
                        CoreXT.error("Application.default", "A valid 'Application' instance is required.");
                    Application._default = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Application, "current", {
                // -------------------------------------------------------------------------------------------------------------------------------
                /** References the current running application that owns the current running environment. */
                get: function () {
                    return Application._current;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Application, "focused", {
                /** References the application who's window currently has user focus. You can also set this property to change window focus. */
                get: function () {
                    return Application._focused;
                },
                set: function (value) {
                    if (Application._focused !== value) {
                        Application._focused = value;
                        if (typeof value == 'object' && typeof value.focus == 'function')
                            value.focus();
                    }
                },
                enumerable: true,
                configurable: true
            });
            Application._current = null;
            // -------------------------------------------------------------------------------------------------------------------------------
            /** A list of all applications in the system. */
            Application.applications = [Application._default];
            Application._focused = null;
            return Application;
        }(CoreXT.FactoryBase(System.Object)));
        System.Application = Application;
        (function (Application) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Object.defineProperty($__type.prototype, "isFocused", {
                    // --------------------------------------------------------------------------------------------------------------------------
                    /** Returns true if this application is focused. */
                    get: function () { return this._isFocused; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty($__type.prototype, "appID", {
                    get: function () { return this._appID; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty($__type.prototype, "title", {
                    get: function () { return this._title; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty($__type.prototype, "description", {
                    get: function () { return this._description; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty($__type.prototype, "appDomains", {
                    get: function () { return this._appDomains; },
                    enumerable: true,
                    configurable: true
                });
                /** Returns the default (first) application for this domain. */
                $__type.prototype.application = function () {
                    if (!this.applications.length)
                        throw System.Exception.error("AppDomain", "This application domain has no application instances.", this);
                    return this.applications[0];
                };
                // -------------------------------------------------------------------------------------------------------------------------------
                $__type.prototype._onAddToAppDomain = function (appDomain, app) {
                };
                // -------------------------------------------------------------------------------------------------------------------------------
                /** Try to bring the window for this application to the front. */
                $__type.prototype.focus = function () {
                };
                // -------------------------------------------------------------------------------------------------------------------------------
                /** Closes the application by disposing all owned AppDomain instances, which also closes any opened windows, including the application's own window as well. */
                $__type.prototype.close = function () {
                    // ... close all except "self" ([0]), then close "self" ...
                    for (var i = this._appDomains.length - 1; i > 0; --i)
                        this._appDomains[i].dispose();
                    this._appDomains[0].dispose();
                };
                // -------------------------------------------------------------------------------------------------------------------------------
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, title, description, appID) {
                        factory.super.init(o, isnew);
                        o.$__app = o;
                        o._title = title;
                        o._description = description;
                        o._appID = appID;
                    };
                };
                return $__type;
            }(CoreXT.FactoryType(System.Object)));
            Application.$__type = $__type;
            Application.$__register(System);
        })(Application = System.Application || (System.Application = {}));
        // ===================================================================================================================================
        // Create a default application domain and default application.
        // The default app domain is used for new objects created, and the default application can be used to easily represent the current web application.
        AppDomain.default = AppDomain.new();
        Application.default = Application.new(window.document.title, "Default Application", 0);
        CoreXT.frozen(AppDomain);
        CoreXT.frozen(Application);
    })(System = CoreXT.System || (CoreXT.System = {}));
    // ========================================================================================================================================
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.AppDomain.js.map