// ###########################################################################################################################
// Types for specialized object property management.
// ###########################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Platform;
        (function (Platform) {
            CoreXT.namespace(function () { return CoreXT.System.Platform; });
            // ========================================================================================================================
            var PropertyEventBase = /** @class */ (function (_super) {
                __extends(PropertyEventBase, _super);
                function PropertyEventBase() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /**
                   * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
                   * layout that can render a view, or partial view.
                   * @param parent If specified, the value will be wrapped in the created object.
                   */
                PropertyEventBase['new'] = function () { return null; };
                PropertyEventBase.init = function (o, isnew) {
                    this.super.init(o, isnew);
                };
                return PropertyEventBase;
            }(CoreXT.FactoryBase(System.EventObject)));
            Platform.PropertyEventBase = PropertyEventBase;
            (function (PropertyEventBase) {
                var $__type = /** @class */ (function (_super) {
                    __extends($__type, _super);
                    function $__type() {
                        // -------------------------------------------------------------------------------------------------------------------
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        /** A list of callbacks to execute BEFORE a value changes. */
                        _this.interceptors = null;
                        /** A list of callbacks to execute AFTER a value changes. */
                        _this.listeners = null;
                        /** A series of callbacks to pass a value through when a property is read.  This allows derived types to convert
                        * or translate inherited property values into new values as they are passed down the inheritance hierarchy chain. */
                        _this.filters = null;
                        return _this;
                    }
                    // -------------------------------------------------------------------------------------------------------------------
                    /**
                    * @param {Property} property The source of this event.
                    */
                    $__type.prototype.__DoOnPropertyChanging = function (owner, property, newValue) {
                        if (this.interceptors != null)
                            for (var i = 0, n = this.interceptors.length; i < n; ++i)
                                newValue = this.interceptors[i].call(owner, property, newValue);
                        return newValue;
                    };
                    /**
                    * @param {Property} property The source of this event.
                    */
                    $__type.prototype.__DoOnPropertyChanged = function (owner, property, initialValue) {
                        if (this.listeners != null)
                            for (var i = 0, n = this.listeners.length; i < n; ++i)
                                this.listeners[i].call(owner, property, initialValue);
                    };
                    /**
                    * @param {Property} property The source of this event.
                    * @param {any} value The result of each filter call is passed into this parameter for each successive call (in filter creation order).
                    */
                    $__type.prototype.__FilerValue = function (owner, property, value) {
                        if (this.filters != null)
                            for (var i = 0, n = this.filters.length; i < n; ++i)
                                value = this.filters[i].call(owner, property, value);
                        return value;
                    };
                    // -------------------------------------------------------------------------------------------------------------------
                    /** A list of callbacks to execute BEFORE this value changes. */
                    $__type.prototype.registerInterceptor = function (interceptor) {
                        if (!this.interceptors)
                            this.interceptors = [];
                        for (var i = this.interceptors.length - 1; i >= 0; --i)
                            if (this.interceptors[i] == interceptor)
                                return;
                        this.interceptors.push(interceptor);
                    };
                    $__type.prototype.unregisterInterceptor = function (interceptor) {
                        if (!this.interceptors)
                            return;
                        for (var i = this.interceptors.length - 1; i >= 0; --i)
                            if (this.interceptors[i] == interceptor) {
                                this.interceptors.splice(i, 1);
                                break;
                            }
                    };
                    // -------------------------------------------------------------------------------------------------------------------
                    /** A list of callbacks to execute AFTER this value changes. */
                    $__type.prototype.registerListener = function (listener) {
                        if (!this.listeners)
                            this.listeners = [];
                        for (var i = this.listeners.length - 1; i >= 0; --i)
                            if (this.listeners[i] == listener)
                                return;
                        this.listeners.push(listener);
                    };
                    $__type.prototype.unregisterListener = function (listener) {
                        if (!this.listeners)
                            return;
                        for (var i = this.listeners.length - 1; i >= 0; --i)
                            if (this.listeners[i] == listener) {
                                this.listeners.splice(i, 1);
                                break;
                            }
                    };
                    // -------------------------------------------------------------------------------------------------------------------
                    /** Filters are called when a property is being read from.
                    * Derived types should create filters if there's a need to notify a stored value before use (such as when formatting data,
                    * such as converting 'M' to 'Male', '20131006' to 'October 6th, 2013', or trimming spaces/formatting text, etc.).
                    */
                    $__type.prototype.registerFilter = function (filter) {
                        if (!this.filters)
                            this.filters = [];
                        for (var i = this.filters.length - 1; i >= 0; --i)
                            if (this.filters[i] == filter)
                                return;
                        this.filters.push(filter);
                    };
                    $__type.prototype.unregisterFilter = function (filter) {
                        if (!this.filters)
                            return;
                        for (var i = this.filters.length - 1; i >= 0; --i)
                            if (this.filters[i] == filter) {
                                this.filters.splice(i, 1);
                                break;
                            }
                    };
                    // -------------------------------------------------------------------------------------------------------------------
                    $__type[CoreXT.constructor] = function (factory) {
                        //factory.init = (o, isnew) => {
                        //};
                    };
                    return $__type;
                }(CoreXT.FactoryType(System.EventObject)));
                PropertyEventBase.$__type = $__type;
                PropertyEventBase.$__register(Platform);
            })(PropertyEventBase = Platform.PropertyEventBase || (Platform.PropertyEventBase = {}));
            // =======================================================================================================================
            var StaticProperty = /** @class */ (function (_super) {
                __extends(StaticProperty, _super);
                function StaticProperty() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /**
                   * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
                   * layout that can render a view, or partial view.
                   * @param parent If specified, the value will be wrapped in the created object.
                   */
                StaticProperty['new'] = function (name, isVisual) { return null; };
                StaticProperty.init = function (o, isnew, name, isVisual) {
                    this.super.init(o, isnew);
                    o.name = name;
                    o.isVisual = isVisual;
                };
                return StaticProperty;
            }(CoreXT.FactoryBase(PropertyEventBase)));
            Platform.StaticProperty = StaticProperty;
            (function (StaticProperty) {
                var $__type = /** @class */ (function (_super) {
                    __extends($__type, _super);
                    function $__type() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        /** If true (false by default), then 'onRedraw()' will be called when this property is updated. */
                        _this.isVisual = false;
                        return _this;
                    }
                    $__type.prototype.createPropertyInstance = function (owner, value) {
                        return Platform.Property.new(owner, this, value === void 0 ? this.defaultValue : value);
                    };
                    $__type.prototype.toString = function () { return this.name; };
                    $__type.prototype.toLocaleString = function () { return this.name; };
                    $__type.prototype.valueOf = function () { return this.name; };
                    $__type[CoreXT.constructor] = function (factory) {
                        //factory.init = (o, isnew) => {
                        //};
                    };
                    return $__type;
                }(CoreXT.FactoryType(PropertyEventBase)));
                StaticProperty.$__type = $__type;
                StaticProperty.$__register(Platform);
            })(StaticProperty = Platform.StaticProperty || (Platform.StaticProperty = {}));
            // =======================================================================================================================
            /** Represents a GraphItem instance property which holds a reference to the related static property information, and also stores the current instance value. */
            var Property = /** @class */ (function (_super) {
                __extends(Property, _super);
                function Property() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Property['new'] = function (owner, staticProperty, value) { return null; };
                return Property;
            }(CoreXT.FactoryBase(PropertyEventBase)));
            Platform.Property = Property;
            (function (Property) {
                var $__type = /** @class */ (function (_super) {
                    __extends($__type, _super);
                    function $__type() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    // --------------------------------------------------------------------------------------------------------------------------
                    $__type.prototype.setValue = function (value, triggerChangeEvents) {
                        if (triggerChangeEvents === void 0) { triggerChangeEvents = true; }
                        if (value !== this.__value) {
                            if (triggerChangeEvents && this.owner.__initialProperties) { // (events are never triggered until the initial layout call has been made, since constructors may be setting up properties)
                                if (this.staticProperty && this.staticProperty.interceptors) // (note: ad-hoc properties don't have static info)
                                    value = this.staticProperty.__DoOnPropertyChanging(this.owner, this, value);
                                if (this.owner.interceptors)
                                    value = this.owner.__DoOnPropertyChanging(this.owner, this, value);
                                if (this.interceptors)
                                    value = this.__DoOnPropertyChanging(this.owner, this, value); // (the more local call takes precedence [has the final say])
                            }
                            this.__value = value;
                            this.__valueIsProperty = typeof value === 'object' && value instanceof Property.$__type;
                            if (triggerChangeEvents && this.owner.__initialProperties) { // (events are never triggered until the initial layout call has been made, since constructors may be setting up properties)
                                if (this.triggerChangedEvent())
                                    this.owner.onRedraw(true); // (make sure to update the display if a UI related property has changed)
                            }
                        }
                    };
                    $__type.prototype.getValue = function () {
                        var value = (this.__valueIsProperty && this.__value !== this) ? this.__value.getValue() : this.__value;
                        if (this.owner.__initialProperties) { // (events are never triggered until the initial layout call has been made, since constructors may be setting up properties)
                            if (this.staticProperty && this.staticProperty.filters) // (note: ad-hoc properties don't have static info)
                                value = this.staticProperty.__FilerValue(this.owner, this, value);
                            if (this.owner.filters)
                                value = this.owner.__FilerValue(this.owner, this, value);
                            if (this.filters)
                                value = this.__FilerValue(this.owner, this, value); // (the more local call takes precedence [has the final say])
                        }
                        return value;
                    };
                    $__type.prototype.hasValue = function () { return !!this.__value; };
                    // -------------------------------------------------------------------------------------------------------------------
                    /** Trigger a 'changed' event - useful for reverting state changes made directly on UI elements. Also called initially
                    * on new UI elements during the initial layout phase.  */
                    $__type.prototype.triggerChangedEvent = function (initialValue) {
                        if (initialValue === void 0) { initialValue = false; }
                        if (this.staticProperty && this.staticProperty.listeners) // (note: ad-hoc properties don't have static info)
                            this.staticProperty.__DoOnPropertyChanged(this.owner, this, initialValue);
                        if (this.owner.listeners)
                            this.owner.__DoOnPropertyChanged(this.owner, this, initialValue);
                        if (this.listeners)
                            this.__DoOnPropertyChanged(this.owner, this, initialValue); // (the more local call takes precedence [has the final say])
                        // ... trigger handlers that wish to know if ANY property has changed ...
                        if (this.owner.__propertyChangedHandlers)
                            this.owner.__DoOnAnyPropertyChanged(this);
                        // ... return true if a visual state property was updated - this means a redraw() callback may be required ...
                        return this.staticProperty && this.staticProperty.isVisual && CoreXT.host.isClient();
                    };
                    // -------------------------------------------------------------------------------------------------------------------
                    $__type.prototype.toString = function () { return (this.__value || "").toString(); };
                    $__type.prototype.toLocaleString = function () { return (this.__value || "").toLocaleString(); };
                    $__type.prototype.valueOf = function () { return this.__value; };
                    // -------------------------------------------------------------------------------------------------------------------
                    /** Creates a deep copy of this graph item property instance via a call to 'Utilities.clone()'. */
                    $__type.prototype.clone = function () { return Platform.Property.new(this.owner, this.staticProperty, CoreXT.Utilities.clone(this.__value)); };
                    // -------------------------------------------------------------------------------------------------------------------
                    $__type[CoreXT.constructor] = function (factory) {
                        factory.init = function (o, isnew, owner, staticProperty, value) {
                            factory.super.init(o, isnew);
                            o.owner = owner;
                            o.staticProperty = staticProperty;
                            o.__value = value;
                        };
                    };
                    return $__type;
                }(CoreXT.FactoryType(PropertyEventBase)));
                Property.$__type = $__type;
                Property.$__register(Platform);
            })(Property = Platform.Property || (Platform.Property = {}));
            // =======================================================================================================================
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
// ###########################################################################################################################
//# sourceMappingURL=CoreXT.System.Properties.js.map