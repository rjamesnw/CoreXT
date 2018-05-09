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
            Platform.GraphNode = CoreXT.ClassFactory(Platform, Platform.PropertyEventBase, function (base) {
                var GraphNode = (function (_super) {
                    __extends(GraphNode, _super);
                    function GraphNode() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this._id = -1;
                        _this._name = "";
                        _this._displayName = "";
                        _this.__parent = null;
                        _this.__children = [];
                        _this.__properties = {};
                        _this.__initialProperties = null;
                        _this.__events = {};
                        _this.__propertyChangedHandlers = null;
                        return _this;
                    }
                    Object.defineProperty(GraphNode, "uiElementMap", {
                        get: function () { return this._uiElementMap; },
                        enumerable: true,
                        configurable: true
                    });
                    GraphNode.registerProperty = function (type, name, isVisual, changedCallback, changingCallback) {
                        if (isVisual === void 0) { isVisual = false; }
                        if (changedCallback === void 0) { changedCallback = null; }
                        if (changingCallback === void 0) { changingCallback = null; }
                        function exception(_msg) {
                            return System.Exception.from("GraphNode.registerProperty(" + CoreXT.getTypeName(type) + ", " + name + ", " + isVisual + "): " + _msg, this);
                        }
                        if (!type)
                            throw exception("A class type [function] is required for property registration.");
                        if (!name)
                            throw exception("A name is required for property registration.");
                        var sProp = Platform.StaticProperty.new(name, isVisual);
                        if (changedCallback != null)
                            sProp.registerListener(changedCallback);
                        if (changingCallback != null)
                            sProp.registerInterceptor(changingCallback);
                        var currentSP = type['__staticProperties'];
                        if (currentSP === void 0) {
                            type['__staticProperties'] = currentSP = [];
                            currentSP.parent = null;
                            currentSP.owner = type;
                        }
                        else if (currentSP.owner !== type) {
                            var typeSpecificSP = [];
                            typeSpecificSP.parent = currentSP;
                            typeSpecificSP.owner = type;
                            type['__staticProperties'] = currentSP = typeSpecificSP;
                        }
                        currentSP.push(sProp);
                        if (!CoreXT.global.Object.defineProperty)
                            exception("'Object.defineProperty()' not found. This JavaScript environment is not supported.");
                        CoreXT.global.Object.defineProperty(type, name, {
                            configurable: false,
                            writable: false,
                            get: function () { return this.getValue(sProp.name); },
                            set: function (value) { this.setValue(sProp.name, value); }
                        });
                        return sProp;
                    };
                    GraphNode.prototype.isInitialized = function () { return !!this.__initialProperties; };
                    GraphNode.prototype.resetProperties = function () {
                        var i, n, p;
                        for (p in this.__initialProperties)
                            this.__properties[p] = this.__initialProperties[p].clone();
                    };
                    GraphNode.prototype.updateInitialProperties = function () {
                        this.__initialProperties = {};
                        for (var p in this.__properties)
                            this.__initialProperties[p] = this.__properties[p].clone();
                    };
                    GraphNode.prototype.setValue = function (index, value, triggerChangeEvents) {
                        if (triggerChangeEvents === void 0) { triggerChangeEvents = true; }
                        var name = index.name || index;
                        if (typeof value === 'object' && value instanceof Platform.Property)
                            value = value.getValue();
                        var property = this.__properties[name];
                        if (property === void 0)
                            this.__properties[name] = property = Platform.Property.new(this, null, value);
                        else
                            property.setValue(value, triggerChangeEvents);
                        if (this.onPropertyValueSet && triggerChangeEvents)
                            this.onPropertyValueSet(name, value);
                        return this;
                    };
                    GraphNode.prototype.getValue = function (index) {
                        var name = index.name || index;
                        var property = this.__properties[name];
                        return (property === void 0) ? this['__' + name] : property.getValue();
                    };
                    GraphNode.prototype.getProperty = function (index) {
                        var name = index.name || index;
                        return this.__properties[name];
                    };
                    GraphNode.prototype.copyProperties = function (graphItem) {
                        var excludeList = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            excludeList[_i - 1] = arguments[_i];
                        }
                        for (var pname in graphItem.__properties)
                            if (excludeList && !~excludeList.indexOf(pname))
                                this.setValue(pname, graphItem.__properties[pname]);
                    };
                    GraphNode.prototype.__DoOnAnyPropertyChanged = function (property) {
                        if (this.__propertyChangedHandlers != null)
                            for (var i = 0, n = this.__propertyChangedHandlers.length; i < n; ++i)
                                this.__propertyChangedHandlers[i].call(this, this, property);
                    };
                    GraphNode.prototype.addPropertyChangedHandler = function (handler) {
                        if (!this.__propertyChangedHandlers)
                            this.__propertyChangedHandlers = [];
                        var i = this.__propertyChangedHandlers.indexOf(handler);
                        if (i == -1)
                            this.__propertyChangedHandlers.push(handler);
                    };
                    GraphNode.prototype.removePropertyChangedHandler = function (handler) {
                        var i;
                        if (this.__propertyChangedHandlers) {
                            i = this.__propertyChangedHandlers.indexOf(handler);
                            if (i > 0)
                                this.__propertyChangedHandlers.splice(i, 1);
                        }
                    };
                    GraphNode.prototype.getEvent = function (eventName) {
                        return this.__events[eventName];
                    };
                    GraphNode.prototype.on = function (eventName, handler) {
                        var existingEvent = this.getEvent(eventName);
                        if (existingEvent === void 0)
                            this.__events[eventName] = existingEvent = System.Events.EventDispatcher.new(this, eventName);
                        existingEvent.addListener(handler);
                        return existingEvent;
                    };
                    GraphNode.prototype.off = function (eventName, handler) {
                        var existingEvent = this.getEvent(eventName);
                        if (existingEvent !== void 0)
                            existingEvent.removeListener(this, handler);
                        return existingEvent;
                    };
                    GraphNode.prototype.clearHandlers = function (eventName) {
                        var existingEvent = this.getEvent(eventName);
                        if (existingEvent !== void 0)
                            existingEvent.removeAllListeners();
                        return existingEvent;
                    };
                    GraphNode.prototype.addChild = function (item) {
                        var i = this.__children.indexOf(item);
                        if (i == -1) {
                            if (item.__parent != null)
                                item.__parent.removeChild(item);
                            item.__parent = this;
                            this.__children.push(item);
                        }
                        return item;
                    };
                    GraphNode.prototype.detach = function () {
                        if (this.__parent && this.__parent.__element && this.__element)
                            this.__parent.__element.removeChild(this.__element);
                        this.__parent = null;
                        return this;
                    };
                    GraphNode.prototype.removeChildAt = function (itemIndex) {
                        if (itemIndex >= 0 && itemIndex < this.__children.length) {
                            var item = this.__children[itemIndex];
                            item.detach();
                            return this.__children[itemIndex];
                        }
                        return null;
                    };
                    GraphNode.prototype.removeChild = function (item) {
                        if (item) {
                            var i = this.__children.indexOf(item);
                            if (i >= 0)
                                this.removeChildAt(i);
                        }
                        return item;
                    };
                    GraphNode.prototype.removeAllChildren = function () {
                        var items = this.__children;
                        for (var i = items.length - 1; i >= 0; --i)
                            items[i].detach();
                        this.__children = [];
                        return items;
                    };
                    GraphNode.prototype.getItem = function (id) {
                        var prop = this.__properties['id'], i, n, item;
                        if (prop && prop.getValue() == id)
                            return this;
                        for (i = 0, n = this.__children.length; i < n; ++i) {
                            item = this.__children[i].getItem(id);
                            if (item !== void 0)
                                return item;
                        }
                        return void 0;
                    };
                    GraphNode.prototype.updateLayout = function (recursive) {
                        if (recursive === void 0) { recursive = true; }
                        if (this.onUpdateLayout)
                            this.onUpdateLayout();
                        if (recursive)
                            for (var i = 0, n = this.__children.length; i < n; ++i) {
                                this.__children[i].updateLayout(recursive);
                            }
                        if (this.__initialProperties == null) {
                            for (var pname in this.__properties)
                                if (this.__properties[pname].triggerChangedEvent(true))
                                    var doRedraw = true;
                            this.updateInitialProperties();
                        }
                        if (doRedraw)
                            this.onRedraw(false);
                    };
                    GraphNode.prototype.setHTMLTag = function (htmlTag) {
                        this.htmlTag = htmlTag;
                        if (this.__element != null && this.__element.nodeName != this.htmlTag) {
                            this.updateLayout();
                        }
                        return this;
                    };
                    GraphNode.prototype.createUIElement = function () {
                        throw System.Exception.notImplemented("'createUIElement()' must be overridden in a derived type, such as HTMLElement.");
                    };
                    GraphNode.prototype.assertSupportedElementTypes = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        this.htmlTag = (this.htmlTag || "").toLowerCase();
                        if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length)
                            args = args[0];
                        for (var i = 0; i < args.length; i++)
                            if (this.htmlTag == args[i])
                                return true;
                        throw System.Exception.from("The element type '" + this.htmlTag + "' is not supported for this GraphItem type.");
                    };
                    GraphNode.prototype.assertUnsupportedElementTypes = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        this.htmlTag = (this.htmlTag || "").toLowerCase();
                        if (args.length == 1 && typeof args[0] != 'undefined' && typeof args[0] != 'string' && args[0].length)
                            args = args[0];
                        for (var i = 0; i < args.length; i++)
                            if (this.htmlTag == args[i])
                                throw System.Exception.from("The element type '" + this.htmlTag + "' is not supported for this GraphItem type.");
                    };
                    GraphNode.prototype.onRedraw = function (recursive) {
                        if (recursive === void 0) { recursive = true; }
                        if (recursive)
                            for (var i = 0; i < this.__children.length; i++)
                                this.__children[i].onRedraw();
                    };
                    GraphNode.prototype.asEnumerable = function () {
                        return null;
                    };
                    GraphNode.prototype.iterator = function () { return this.asEnumerable(); };
                    GraphNode._uiElementMap = new WeakMap();
                    GraphNode.accessor = function (registeredProperty) {
                        return function (value) {
                            if (arguments.length > 0)
                                return this.setValue(registeredProperty, value);
                            return this.getValue(registeredProperty);
                        };
                    };
                    GraphNode.__nextID = 0;
                    GraphNode['GraphNodeFactory'] = (function (_super) {
                        __extends(Factory, _super);
                        function Factory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        Factory.prototype['new'] = function (parent) {
                            if (parent === void 0) { parent = null; }
                            return null;
                        };
                        Factory.prototype.init = function (o, isnew, parent) {
                            if (parent === void 0) { parent = null; }
                            this.super.init(o, isnew);
                            o._id = GraphNode.__nextID++;
                            var i, n, p, type = o.constructor, sp = type.__staticProperties;
                            if (sp !== void 0)
                                while (sp) {
                                    for (i = sp.length - 1; i >= 0; --i) {
                                        p = sp[i];
                                        o.__properties[p.name] = p.createPropertyInstance(o);
                                    }
                                    sp = sp.parent;
                                }
                            if (parent)
                                parent.addChild(o);
                            return o;
                        };
                        return Factory;
                    }(CoreXT.FactoryBase(GraphNode, base['PropertyEventBaseFactory'])));
                    return GraphNode;
                }(base));
                System.Object.defineProperty(GraphNode, 'uiElementMap', { writable: false, configurable: false });
                return [GraphNode, GraphNode["GraphNodeFactory"]];
            }, "GraphNode");
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Platform.Graph.js.map