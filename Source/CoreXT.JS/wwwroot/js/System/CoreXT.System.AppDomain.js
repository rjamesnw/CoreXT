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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        CoreXT.registerNamespace("CoreXT", "System");
        var DependencyObject = (function (_super) {
            __extends(DependencyObject, _super);
            function DependencyObject() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(DependencyObject.prototype, "parent", {
                get: function () { return this.__parent; },
                enumerable: true,
                configurable: true
            });
            return DependencyObject;
        }(System.Object.$__type));
        System.DependencyObject = DependencyObject;
        var $AppDomain = (function (_super) {
            __extends($AppDomain, _super);
            function $AppDomain() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.__typeBridges = {};
                _this.autoTrack = false;
                _this.objects = new System.Collections.IndexedObjectCollection();
                return _this;
            }
            $AppDomain_1 = $AppDomain;
            Object.defineProperty($AppDomain, "default", {
                get: function () { return $AppDomain_1._default; },
                enumerable: true,
                configurable: true
            });
            $AppDomain.prototype.application = function () {
                if (!this.applications.length)
                    throw System.Exception.error("AppDomain", "This application domain has no application instances.", this);
                return this.applications[0];
            };
            $AppDomain.prototype.dispose = function (object, release) {
                if (release === void 0) { release = true; }
                var _object = object;
                if (_object !== void 0) {
                    if (_object.$__appDomain !== void 0 && _object.$__appDomain != this) {
                        _object.$__appDomain.dispose(_object, release);
                        return;
                    }
                    this.objects.removeObject(_object);
                    CoreXT.Types.dispose(_object, release);
                }
                else {
                    for (var i = this._applications.length - 1; i >= 0; --i)
                        this._applications[i].dispose(release);
                    this._applications.length = 0;
                }
            };
            $AppDomain.prototype.attachObject = function (object) {
                if (!type.$__parent || !type.$__name || !type.$__fullname)
                    throw System.Exception.error("with()", "The specified type '" + type.$__name + "' has not yet been registered properly using 'AppDomain.registerType()/.registerClass()'.", type);
                var type = object.constructor;
                this.objects.addObject(object);
                return object;
            };
            $AppDomain.prototype.with = function (factory) {
                var typeInfo = factory;
                if (!typeInfo.$__parent || !typeInfo.$__name || !typeInfo.$__fullname)
                    throw System.Exception.error("with()", "The specified class type has not yet been registered properly using 'Types.__registerFactoryType()'.", factory);
                var bridge = this.__typeBridges[typeInfo.$__fullname];
                if (!bridge) {
                    var $appDomain = this;
                    var bridgeConstructor = function ADBridge() { this.constructor = factory.constructor; this.$__appDomain = $appDomain; };
                    bridgeConstructor.prototype = factory;
                    this.__typeBridges[typeInfo.$__fullname] = bridge = new bridgeConstructor();
                }
                return bridge;
            };
            $AppDomain.prototype.createApplication = function (factory, title, description) {
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
            $AppDomain._default = new $AppDomain_1();
            $AppDomain.appDomains = [$AppDomain_1.default];
            $AppDomain['$AppDomain Factory'] = (function (_super) {
                __extends(Factory, _super);
                function Factory() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Factory.prototype['new'] = function (application) { return null; };
                Factory.prototype.init = function ($this, isnew, application) {
                    this.$__baseFactory.init($this, isnew);
                    $this.$__appDomain = $this;
                    $this.applications = typeof application == 'object' ? [application] : [];
                    return $this;
                };
                return Factory;
            }(CoreXT.FactoryBase($AppDomain_1, $AppDomain_1['$Object Factory']))).register(System);
            $AppDomain = $AppDomain_1 = __decorate([
                CoreXT.frozen
            ], $AppDomain);
            return $AppDomain;
            var $AppDomain_1;
        }(System.Object.$__type));
        System.AppDomain = $AppDomain['$AppDomain Factory'].$__type;
        var $Application = (function (_super) {
            __extends($Application, _super);
            function $Application() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            $Application_1 = $Application;
            Object.defineProperty($Application, "current", {
                get: function () {
                    return $Application_1._current;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty($Application, "focused", {
                get: function () {
                    return $Application_1._focused;
                },
                set: function (value) {
                    if ($Application_1._focused !== value) {
                        $Application_1._focused = value;
                        if (typeof value == 'object' && typeof value.focus == 'function')
                            value.focus();
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty($Application.prototype, "isFocused", {
                get: function () { return this._isFocused; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty($Application.prototype, "appID", {
                get: function () { return this._appID; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty($Application.prototype, "title", {
                get: function () { return this._title; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty($Application.prototype, "description", {
                get: function () { return this._description; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty($Application.prototype, "appDomains", {
                get: function () { return this._appDomains; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty($Application, "default", {
                get: function () { return $Application_1._default; },
                enumerable: true,
                configurable: true
            });
            $Application.prototype.application = function () {
                if (!this.applications.length)
                    throw System.Exception.error("AppDomain", "This application domain has no application instances.", this);
                return this.applications[0];
            };
            $Application.prototype._onAddToAppDomain = function (appDomain, app) {
            };
            $Application.prototype.focus = function () {
            };
            $Application.prototype.close = function () {
                for (var i = this._appDomains.length - 1; i > 0; --i)
                    this._appDomains[i].dispose();
                this._appDomains[0].dispose();
            };
            $Application._current = null;
            $Application._focused = null;
            $Application._default = System.Application.new(window.document.title, "Default Application", 0);
            $Application.applications = [$Application_1._default];
            $Application['$Application Factory'] = (function (_super) {
                __extends(Factory, _super);
                function Factory() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Factory.prototype['new'] = function (title, description, appID) { return null; };
                Factory.prototype.init = function ($this, isnew, title, description, appID) {
                    this.$__baseFactory.init($this, isnew);
                    $this.$__app = $this;
                    $this._title = title;
                    $this._description = description;
                    $this._appID = appID;
                    return $this;
                };
                return Factory;
            }(CoreXT.FactoryBase($Application_1, $Application_1['$Object Factory']))).register(System);
            $Application = $Application_1 = __decorate([
                CoreXT.frozen
            ], $Application);
            return $Application;
            var $Application_1;
        }(System.Object.$__type));
        System.Application = $Application['$Application Factory'].$__type;
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.AppDomain.js.map