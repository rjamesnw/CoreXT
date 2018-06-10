// ###########################################################################################################################
// Application Domains
// ###########################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Platform;
        (function (Platform) {
            CoreXT.namespace(function () { return CoreXT.System.Platform; });
            // =======================================================================================================================
            // Note: CoreXT.Environments contains the default supported target environments (platforms).
            var Contexts;
            (function (Contexts) {
                /** Creates a new isolated global script environment in the current window for scripts to run in.  An 'IFrame' is used
                  * on the client side, and a 'Worker' is used server side. (default) */
                Contexts[Contexts["Secure"] = 0] = "Secure";
                /** Creates a non-isolated global script environment in the current window for scripts to run in.  These script will
                  * have access to the host environment. An IFrame is used on the client side, and a new executing context is used
                  * server side. */
                Contexts[Contexts["Unsecure"] = 1] = "Unsecure";
                /** Creates a new isolated global script environment in a new window for scripts to run in. On the server side, this
                  * is always interpreted as a 'Worker' instance. */
                Contexts[Contexts["SecureWindow"] = 2] = "SecureWindow";
                /** Creates a new isolated global script environment in a new window for scripts to run in.  These script will
                  * have access to the host environment. A new executing context is used server side. */
                Contexts[Contexts["UnsecureWindow"] = 3] = "UnsecureWindow";
                /** The local executing context is the target. All scripts loaded into this context become merged with current application. */
                Contexts[Contexts["Local"] = 4] = "Local";
            })(Contexts = Platform.Contexts || (Platform.Contexts = {}));
            /**
             * A context is a container that manages a reference to a global script environment. Each new context creates a new
             * execution environment that keeps scripts from accidentally (or maliciously) populating/corrupting the host environment.
             * On the client side, this is accomplished by using IFrame objects.  On the server side, this is accomplished using
             * workers.  As well, on the client side, workers can be used to simulate server side communication during development.
             */
            var Context = /** @class */ (function (_super) {
                __extends(Context, _super);
                function Context() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /** Abstract: Cannot create instances of this abstract class. */
                Context['new'] = function () {
                    throw System.Exception.from("You cannot create instances of the abstract Context class.", this);
                };
                Context.init = function (o, isnew, context) {
                    if (context === void 0) { context = Contexts.Secure; }
                    this.super.init(o, isnew);
                    o['_contextType'] = context;
                };
                return Context;
            }(CoreXT.FactoryBase(System.Object)));
            Platform.Context = Context;
            (function (Context) {
                var $__type = /** @class */ (function (_super) {
                    __extends($__type, _super);
                    function $__type() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.x = 1;
                        return _this;
                    }
                    /** Load a resource (usually a script or page) into this context. */
                    $__type.prototype.load = function (url) {
                        throw System.Exception.notImplemented("load", this, "Try the default BrowserContext type instead.");
                    };
                    $__type[CoreXT.constructor] = function (factory) {
                        //factory.init = (o, isnew) => {
                        //};
                    };
                    return $__type;
                }(CoreXT.FactoryType(System.Object)));
                Context.$__type = $__type;
                Context.$__register(Platform);
            })(Context = Platform.Context || (Platform.Context = {}));
            // ========================================================================================================================
            /**
              * Where the Application object represents the base application properties for an AppDomain instance, the UIApplication
              * type, which inherits from Application, represents the UI side.
              * UIApplications encapsulate graph nodes, typically representing HTML, scripts, and modules, and confines them to a root working space.
              * Applications also reference script execution contexts. When application scripts are
              * loaded, they are isolated and run in the context of a new global scope.  This protects the host environment, and also
              * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
              * logins, private information, etc.
              * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
              */
            var UIApplication = /** @class */ (function (_super) {
                __extends(UIApplication, _super);
                function UIApplication() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                UIApplication['new'] = function (title, appID) { return null; };
                UIApplication.init = function (o, isnew, title, description, appID) {
                    this.super.init(o, isnew, title, description, appID);
                };
                return UIApplication;
            }(CoreXT.FactoryBase(System.Application)));
            Platform.UIApplication = UIApplication;
            (function (UIApplication) {
                var $__type = /** @class */ (function (_super) {
                    __extends($__type, _super);
                    function $__type() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this._windows = []; // (a list of windows owned by this application [there is always one entry, which is the application's own window]; note: Windows are also stored in a master window list in the system [where they are created first])
                        return _this;
                    }
                    Object.defineProperty($__type.prototype, "global", {
                        /** Returns the global context reference for the nested application. Each application gets their own virtual global scope. */
                        get: function () { return null; },
                        enumerable: true,
                        configurable: true
                    });
                    // -------------------------------------------------------------------------------------------------------------------
                    $__type.prototype._onAddToAppDomain = function (appDomain) {
                        for (var i = 0; i < appDomain.applications.length; i++)
                            if (appDomain.applications[i]._RootGraphNode == this._RootGraphNode)
                                throw "Cannot add application '" + this.title + "' as another application exists with the same target element.  Two applications cannot render to the same target.";
                    };
                    // ----------------------------------------------------------------------------------------------------------------
                    /** Disposes this UIApplication instance. */
                    $__type.prototype.dispose = function (release) {
                        // ... close all windows ([0] should always be the main application window, which will close last) ...
                        for (var i = this._windows.length - 1; i >= 0; --i)
                            if (this._windows[i].target != CoreXT.global)
                                this._windows[i].close();
                        for (var i = this._windows.length - 1; i >= 0; --i)
                            this._windows[i].dispose(release);
                        this._windows.length = 0;
                        _super.prototype.dispose.call(this);
                    };
                    ///** Registers a given type by name (constructor function), and creates the function on the last specified module if it doesn't already exist.
                    //* @param {Function} type The type (constructor function) to register.
                    //* @param {modules} parentModules A list of all modules up to the current type, usually starting with 'CoreXT' as the first module.
                    //* @param {boolean} addMemberTypeInfo If true (default), all member functions of any existing type (function object) will have type information
                    //* applied (using the IFunctionInfo interface).
                    //*/
                    //static registerType<T extends (...args)=>any>(type: string, parentModules: {}[], addMemberTypeInfo?: boolean): T;
                    //static registerType(type: Function, parentModules: {}[], addMemberTypeInfo?: boolean): ITypeInfo;
                    /** Attaches the object to this AppDomain.  The object must never exist in any other domains prior to this call.
                      * 'ITypeInfo' details will be updated for the object.  This is useful when
                      * See also: {AppDomain}.registerType()
                      * @param {T} object The object to add to this app domain.
                      * @param {{}} parentModule The parent module or scope in which the type exists.
                      * @param {{}} parentModule The parent module or scope in which the type exists.
                      */
                    $__type.prototype.attachObject = function (object) {
                        if (!type.$__parent || !type.$__name || !type.$__fullname)
                            throw System.Exception.error("with()", "The specified type '" + type.$__name + "' has not yet been registered properly using 'AppDomain.registerType()/.registerClass()'.", type);
                        var type = object.constructor;
                        this.objects.addObject(object);
                        return object;
                    };
                    //?/** Selects this application domain instance as the active domain when calling methods on a type. This is usually used
                    //  * when calling the '{type}.new()' method for creating new instances.
                    //  * Note: The focus for this AppDomain instance is limited to this call only (i.e. not persisted).
                    //  */
                    //?with<TClassModule extends IClassModule<Object.$Type>>(classModule: TClassModule): TClassModule {
                    //    var typeInfo = <ITypeInfo><any>classModule;
                    //    if (!typeInfo.$__parent || !typeInfo.$__name || !typeInfo.$__fullname)
                    //        throw Exception.error("with()", "The specified class module has not yet been registered properly using 'AppDomain.registerType()'.", classModule);
                    //    var bridge: IADBridge = this.__typeBridges[typeInfo.$__fullname];
                    //    if (!bridge) {
                    //        var _this = this;
                    //        bridge = <any>function ADBridge(): Object { return $Delegate.fastApply(classModule, _this, arguments); };
                    //        bridge.prototype = classModule; // (the bridge works only because "type" has STATIC properties, so a bridge object specific to this AppDomain is created, cached, and used)
                    //        // ... create a shell type for creating instances of the actual type ...
                    //        bridge.$__shellType = <any>(function () { this.constructor = classModule; (<Object.$Type>this).__app = _this; });
                    //        bridge.$__shellType.prototype = classModule.$Type.prototype;
                    //        this.__typeBridges[typeInfo.$__fullname] = bridge;
                    //    }
                    //    return <any>bridge;
                    //}
                    // ----------------------------------------------------------------------------------------------------------------
                    /** Try to bring the window for this application to the front. */
                    $__type.prototype.focus = function () {
                    };
                    // ----------------------------------------------------------------------------------------------------------------
                    $__type[CoreXT.constructor] = function (factory) {
                        //factory.init = (o, isnew) => {
                        //};
                    };
                    return $__type;
                }(CoreXT.FactoryType(System.Application)));
                UIApplication.$__type = $__type;
                UIApplication.$__register(Platform);
            })(UIApplication = Platform.UIApplication || (Platform.UIApplication = {}));
            // ====================================================================================================================
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Platform.js.map