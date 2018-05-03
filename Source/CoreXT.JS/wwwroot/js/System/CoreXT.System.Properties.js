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
            var $PropertyEventBase = (function (_super) {
                __extends($PropertyEventBase, _super);
                function $PropertyEventBase() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.interceptors = null;
                    _this.listeners = null;
                    _this.filters = null;
                    return _this;
                }
                $PropertyEventBase.prototype.__DoOnPropertyChanging = function (owner, property, newValue) {
                    if (this.interceptors != null)
                        for (var i = 0, n = this.interceptors.length; i < n; ++i)
                            newValue = this.interceptors[i].call(owner, property, newValue);
                    return newValue;
                };
                $PropertyEventBase.prototype.__DoOnPropertyChanged = function (owner, property, initialValue) {
                    if (this.listeners != null)
                        for (var i = 0, n = this.listeners.length; i < n; ++i)
                            this.listeners[i].call(owner, property, initialValue);
                };
                $PropertyEventBase.prototype.__FilerValue = function (owner, property, value) {
                    if (this.filters != null)
                        for (var i = 0, n = this.filters.length; i < n; ++i)
                            value = this.filters[i].call(owner, property, value);
                    return value;
                };
                $PropertyEventBase.prototype.registerInterceptor = function (interceptor) {
                    if (!this.interceptors)
                        this.interceptors = [];
                    for (var i = this.interceptors.length - 1; i >= 0; --i)
                        if (this.interceptors[i] == interceptor)
                            return;
                    this.interceptors.push(interceptor);
                };
                $PropertyEventBase.prototype.unregisterInterceptor = function (interceptor) {
                    if (!this.interceptors)
                        return;
                    for (var i = this.interceptors.length - 1; i >= 0; --i)
                        if (this.interceptors[i] == interceptor) {
                            this.interceptors.splice(i, 1);
                            break;
                        }
                };
                $PropertyEventBase.prototype.registerListener = function (listener) {
                    if (!this.listeners)
                        this.listeners = [];
                    for (var i = this.listeners.length - 1; i >= 0; --i)
                        if (this.listeners[i] == listener)
                            return;
                    this.listeners.push(listener);
                };
                $PropertyEventBase.prototype.unregisterListener = function (listener) {
                    if (!this.listeners)
                        return;
                    for (var i = this.listeners.length - 1; i >= 0; --i)
                        if (this.listeners[i] == listener) {
                            this.listeners.splice(i, 1);
                            break;
                        }
                };
                $PropertyEventBase.prototype.registerFilter = function (filter) {
                    if (!this.filters)
                        this.filters = [];
                    for (var i = this.filters.length - 1; i >= 0; --i)
                        if (this.filters[i] == filter)
                            return;
                    this.filters.push(filter);
                };
                $PropertyEventBase.prototype.unregisterFilter = function (filter) {
                    if (!this.filters)
                        return;
                    for (var i = this.filters.length - 1; i >= 0; --i)
                        if (this.filters[i] == filter) {
                            this.filters.splice(i, 1);
                            break;
                        }
                };
                $PropertyEventBase['$PropertyEventBase Factory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory.prototype['new'] = function () { return null; };
                    Factory.prototype.init = function ($this, isnew) {
                        this.$__baseFactory.init($this, isnew);
                        return $this;
                    };
                    return Factory;
                }(CoreXT.FactoryBase($PropertyEventBase, $PropertyEventBase['$EventObject Factory']))).register(Platform);
                return $PropertyEventBase;
            }(System.EventObject.$__type));
            Platform.PropertyEventBase = $PropertyEventBase['$PropertyEventBase Factory'].$__type;
            var $StaticProperty = (function (_super) {
                __extends($StaticProperty, _super);
                function $StaticProperty() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.isVisual = false;
                    return _this;
                }
                $StaticProperty.prototype.createPropertyInstance = function (owner, value) {
                    return new Property(owner, this, value === void 0 ? this.defaultValue : value);
                };
                $StaticProperty.prototype.toString = function () { return this.name; };
                $StaticProperty.prototype.toLocaleString = function () { return this.name; };
                $StaticProperty.prototype.valueOf = function () { return this.name; };
                $StaticProperty['$StaticProperty Factory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory.prototype['new'] = function (name, isVisual) { return null; };
                    Factory.prototype.init = function ($this, isnew, name, isVisual) {
                        this.$__baseFactory.init($this, isnew);
                        $this.name = name;
                        $this.isVisual = isVisual;
                        return $this;
                    };
                    return Factory;
                }(CoreXT.FactoryBase($StaticProperty, $StaticProperty['$PropertyEventBase Factory']))).register(Platform);
                return $StaticProperty;
            }(Platform.PropertyEventBase.$__type));
            Platform.StaticProperty = $StaticProperty['$StaticProperty Factory'].$__type;
            var Property = (function (_super) {
                __extends(Property, _super);
                function Property(owner, staticProperty, value) {
                    var _this = _super.call(this) || this;
                    _this.owner = owner;
                    _this.staticProperty = staticProperty;
                    _this.value = value;
                    return _this;
                }
                Property.prototype.setValue = function (value, triggerChangeEvents) {
                    if (triggerChangeEvents === void 0) { triggerChangeEvents = true; }
                    if (value !== this.value) {
                        if (triggerChangeEvents && this.owner.__initialProperties) {
                            if (this.staticProperty && this.staticProperty.interceptors)
                                value = this.staticProperty.__DoOnPropertyChanging(this.owner, this, value);
                            if (this.owner.interceptors)
                                value = this.owner.__DoOnPropertyChanging(this.owner, this, value);
                            if (this.interceptors)
                                value = this.__DoOnPropertyChanging(this.owner, this, value);
                        }
                        this.value = value;
                        this.valueIsProperty = typeof value === 'object' && value instanceof Property;
                        if (triggerChangeEvents && this.owner.__initialProperties) {
                            if (this.triggerChangedEvent())
                                this.owner.onRedraw(true);
                        }
                    }
                };
                Property.prototype.getValue = function () {
                    var value = (this.valueIsProperty && this.value !== this) ? this.value.getValue() : this.value;
                    if (this.owner.__initialProperties) {
                        if (this.staticProperty && this.staticProperty.filters)
                            value = this.staticProperty.__FilerValue(this.owner, this, value);
                        if (this.owner.filters)
                            value = this.owner.__FilerValue(this.owner, this, value);
                        if (this.filters)
                            value = this.__FilerValue(this.owner, this, value);
                    }
                    return value;
                };
                Property.prototype.hasValue = function () { return !!this.value; };
                Property.prototype.triggerChangedEvent = function (initialValue) {
                    if (initialValue === void 0) { initialValue = false; }
                    if (this.staticProperty && this.staticProperty.listeners)
                        this.staticProperty.__DoOnPropertyChanged(this.owner, this, initialValue);
                    if (this.owner.listeners)
                        this.owner.__DoOnPropertyChanged(this.owner, this, initialValue);
                    if (this.listeners)
                        this.__DoOnPropertyChanged(this.owner, this, initialValue);
                    if (this.owner.__propertyChangedHandlers)
                        this.owner.__DoOnAnyPropertyChanged(this);
                    return this.staticProperty && this.staticProperty.isVisual && CoreXT.host.isClient();
                };
                Property.prototype.toString = function () { return (this.value || "").toString(); };
                Property.prototype.toLocaleString = function () { return (this.value || "").toLocaleString(); };
                Property.prototype.valueOf = function () { return this.value; };
                Property.prototype.clone = function () { return new Property(this.owner, this.staticProperty, CoreXT.Utilities.clone(this.value)); };
                return Property;
            }($PropertyEventBase));
            Platform.Property = Property;
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Properties.js.map