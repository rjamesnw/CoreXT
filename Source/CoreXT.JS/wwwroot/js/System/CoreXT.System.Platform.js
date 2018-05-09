var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Platform;
        (function (Platform) {
            CoreXT.registerNamespace("CoreXT", "System", "Platform");
            var Contexts;
            (function (Contexts) {
                Contexts[Contexts["Secure"] = 0] = "Secure";
                Contexts[Contexts["Unsecure"] = 1] = "Unsecure";
                Contexts[Contexts["SecureWindow"] = 2] = "SecureWindow";
                Contexts[Contexts["UnsecureWindow"] = 3] = "UnsecureWindow";
                Contexts[Contexts["Local"] = 4] = "Local";
            })(Contexts = Platform.Contexts || (Platform.Contexts = {}));
            Platform.Context = CoreXT.ClassFactory(Platform, System.Object, function (base) {
                var Context = (function (_super) {
                    __extends(Context, _super);
                    function Context() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Context.prototype.load = function (url) {
                        throw System.Exception.notImplemented("load", this, "Try the default BrowserContext type instead.");
                    };
                    Context['ContextFactory'] = function () {
                        var _this = this;
                        var factoryType = (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory.prototype.init = function ($this, isnew, context) {
                                if (context === void 0) { context = Contexts.Secure; }
                                this.super.init($this, isnew);
                                $this._contextType = context;
                                return $this;
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(Context, Context['ObjectFactory'])));
                        factoryType['new'] = function (context) {
                            if (context === void 0) { context = Contexts.Secure; }
                            throw System.Exception.from("You cannot create instances of the abstract Context class.", _this);
                        };
                        return factoryType;
                    }();
                    return Context;
                }(base));
                return [Context, Context["ContextFactory"]];
            });
            Platform.UIApplication = CoreXT.ClassFactory(Platform, System.Application, function (base) {
                var UIApplication = (function (_super) {
                    __extends(UIApplication, _super);
                    function UIApplication() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this._windows = [];
                        return _this;
                    }
                    Object.defineProperty(UIApplication.prototype, "global", {
                        get: function () { return null; },
                        enumerable: true,
                        configurable: true
                    });
                    UIApplication.prototype._onAddToAppDomain = function (appDomain) {
                        for (var i = 0; i < appDomain.applications.length; i++)
                            if (appDomain.applications[i]._RootGraphNode == this._RootGraphNode)
                                throw "Cannot add application '" + this.title + "' as another application exists with the same target element.  Two applications cannot render to the same target.";
                    };
                    UIApplication.prototype.dispose = function (release) {
                        for (var i = this._windows.length - 1; i >= 0; --i)
                            if (this._windows[i].target != CoreXT.global)
                                this._windows[i].close();
                        for (var i = this._windows.length - 1; i >= 0; --i)
                            this._windows[i].dispose(release);
                        this._windows.length = 0;
                        _super.prototype.dispose.call(this);
                    };
                    UIApplication.prototype.attachObject = function (object) {
                        if (!type.$__parent || !type.$__name || !type.$__fullname)
                            throw System.Exception.error("with()", "The specified type '" + type.$__name + "' has not yet been registered properly using 'AppDomain.registerType()/.registerClass()'.", type);
                        var type = object.constructor;
                        this.objects.addObject(object);
                        return object;
                    };
                    UIApplication.prototype.focus = function () {
                    };
                    UIApplication['$UIApplication Factory'] = (function (_super) {
                        __extends(Factory, _super);
                        function Factory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        Factory.prototype['new'] = function (title, appID) { return null; };
                        Factory.prototype.init = function ($this, isnew, title, description, appID) {
                            this.super.init($this, isnew, title, description, appID);
                            return $this;
                        };
                        return Factory;
                    }(CoreXT.FactoryBase(UIApplication, UIApplication['ApplicationFactory'])));
                    return UIApplication;
                }(base));
                return [UIApplication, UIApplication["UIApplicationFactory"]];
            });
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Platform.js.map