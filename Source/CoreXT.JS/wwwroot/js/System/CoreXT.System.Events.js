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
        var Events;
        (function (Events) {
            CoreXT.registerNamespace("CoreXT", "System", "Events");
            ;
            ;
            var EventModes;
            (function (EventModes) {
                EventModes[EventModes["Capture"] = 0] = "Capture";
                EventModes[EventModes["Bubble"] = 1] = "Bubble";
                EventModes[EventModes["CaptureAndBubble"] = 2] = "CaptureAndBubble";
            })(EventModes = Events.EventModes || (Events.EventModes = {}));
            ;
            Events.EventDispatcher = CoreXT.ClassFactory(CoreXT.Scripts, void 0, function (base) {
                var EventDispatcher = (function (_super) {
                    __extends(EventDispatcher, _super);
                    function EventDispatcher() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.__associations = new WeakMap();
                        _this.__listeners = [];
                        _this.autoTrigger = false;
                        _this.removeOnTrigger = false;
                        _this.eventTriggerHandler = null;
                        _this.canCancel = true;
                        _this.dispatch = (function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            return _this.dispatchEvent.apply(_this, args.unshift(null));
                        });
                        return _this;
                    }
                    EventDispatcher.registerEvent = function (type, eventName, eventMode, removeOnTrigger, eventTriggerCallback, customEventPropName, canCancel) {
                        if (eventMode === void 0) { eventMode = EventModes.Capture; }
                        if (removeOnTrigger === void 0) { removeOnTrigger = false; }
                        if (canCancel === void 0) { canCancel = true; }
                        customEventPropName || (customEventPropName = EventDispatcher.createEventPropertyNameFromEventName(eventName));
                        var privateEventName = EventDispatcher.createPrivateEventName(eventName);
                        var onEventProxy = function () {
                            var instance = this;
                            if (typeof instance !== 'object')
                                throw System.Exception.error("{Object}." + eventName, "Must be called on an object instance.", instance);
                            var eventProperty = instance[privateEventName];
                            if (typeof eventProperty !== 'object')
                                instance[privateEventName] = eventProperty = Events.EventDispatcher.new(instance, eventName, removeOnTrigger, eventTriggerCallback, canCancel);
                            eventProperty.__eventPropertyName = customEventPropName;
                            eventProperty.__eventPrivatePropertyName = privateEventName;
                            return eventProperty;
                        };
                        if (CoreXT.global.Object.defineProperty)
                            CoreXT.global.Object.defineProperty(type.prototype, customEventPropName, {
                                configurable: true,
                                enumerable: true,
                                writable: true,
                                get: onEventProxy
                            });
                        else
                            throw System.Exception.error("registerEvent: " + eventName, "This browser does not support 'Object.defineProperty()'. To support older browsers, call '_" + customEventPropName + "()' instead to get an instance specific reference to the EventDispatcher for that event (i.e. for 'click' event, do 'obj._onClick().attach(...)').", type);
                        return { _eventMode: eventMode, _eventName: eventName, _removeOnTrigger: removeOnTrigger };
                    };
                    EventDispatcher.createEventPropertyNameFromEventName = function (eventName) {
                        return eventName.match(/^on[^a-z]/) ? eventName : "on" + eventName.charAt(0).toUpperCase() + eventName.substring(1);
                    };
                    EventDispatcher.createPrivateEventName = function (eventName) { return "$__" + eventName + "Event"; };
                    EventDispatcher.prototype.getEventName = function () { return this.__eventName; };
                    EventDispatcher.prototype.hasHandlers = function () { return !!this.__listeners.length; };
                    EventDispatcher.prototype.dispose = function () {
                        this.removeAllListeners();
                    };
                    EventDispatcher.prototype.associate = function (obj) {
                        this.__associations.set(obj, this);
                        return this;
                    };
                    EventDispatcher.prototype.disassociate = function (obj) {
                        this.__associations.delete(obj);
                        return this;
                    };
                    EventDispatcher.prototype.isAssociated = function (obj) {
                        return this.__associations.has(obj);
                    };
                    EventDispatcher.prototype._getHandlerIndex = function (handler) {
                        if (handler instanceof System.Delegate) {
                            var object = handler.object;
                            var func = handler.func;
                        }
                        else if (handler instanceof Function) {
                            object = null;
                            func = handler;
                        }
                        else
                            throw System.Exception.error("_getHandlerIndex()", "The given handler is not valid.  A Delegate type or function was expected.", this);
                        for (var i = 0, n = this.__listeners.length; i < n; ++i) {
                            var h = this.__listeners[i];
                            if (h.object == object && h.func == func)
                                return i;
                        }
                        return -1;
                    };
                    EventDispatcher.prototype.attach = function (handler, eventMode) {
                        if (eventMode === void 0) { eventMode = EventModes.Capture; }
                        if (this._getHandlerIndex(handler) == -1) {
                            var delegate = handler instanceof System.Delegate ? handler : System.Delegate.new(this, handler);
                            delegate.$__eventMode = eventMode;
                            this.__listeners.push(delegate);
                        }
                        return this;
                    };
                    EventDispatcher.prototype.dispatchEvent = function (triggerState) {
                        if (triggerState === void 0) { triggerState = null; }
                        var args = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            args[_i - 1] = arguments[_i];
                        }
                        if (!this.setTriggerState(triggerState))
                            return;
                        var parent = this.__parent || this.owner && this.owner.parent || null;
                        var eventChain = System.Array.new(this);
                        if (parent) {
                            var eventPropertyName = this.__eventPropertyName;
                            while (parent) {
                                var eventInstance = parent[eventPropertyName];
                                if (eventInstance instanceof EventDispatcher)
                                    eventChain.push(eventInstance);
                                parent = parent['__parent'];
                            }
                        }
                        var cancelled = false;
                        for (var n = eventChain.length, i = n - 1; i >= 0; --i) {
                            if (cancelled)
                                break;
                            var dispatcher = eventChain[i];
                            if (dispatcher.__listeners.length)
                                cancelled = dispatcher.onDispatchEvent(args, EventModes.Capture);
                        }
                        for (var i = 0, n = eventChain.length; i < n; ++i) {
                            if (cancelled)
                                break;
                            var dispatcher = eventChain[i];
                            if (dispatcher.__listeners.length)
                                cancelled = dispatcher.onDispatchEvent(args, EventModes.Bubble);
                        }
                        return !cancelled;
                    };
                    EventDispatcher.prototype.__exception = function (msg, error) {
                        if (error)
                            msg += "\r\nInner error: " + CoreXT.getErrorMessage(error);
                        return System.Exception.error("{EventDispatcher}.dispatchEvent():", "Error in event " + this.__eventName + " on object type '" + CoreXT.getTypeName(this.owner) + "': " + msg, { exception: error, event: this, handler: this.__handlerCallInProgress });
                    };
                    EventDispatcher.prototype.onDispatchEvent = function (args, mode) {
                        args.push(this);
                        this.__cancelled = false;
                        this.__dispatchInProgress = true;
                        try {
                            for (var i = 0, n = this.__listeners.length; i < n; ++i) {
                                var delegate = this.__listeners[i];
                                var cancelled = false;
                                if (delegate.$__eventMode == mode && delegate) {
                                    this.__handlerCallInProgress = delegate;
                                    if (this.__eventTriggerHandler)
                                        cancelled = this.__eventTriggerHandler(this, delegate, args, delegate.$__eventMode) === false;
                                    else
                                        cancelled = delegate.apply(args) === false;
                                }
                                if (cancelled && this.canCancel) {
                                    this.__cancelled = true;
                                    break;
                                }
                            }
                        }
                        catch (ex) {
                            throw this.__exception("Error executing handler #" + i + ".", ex);
                        }
                        finally {
                            this.__dispatchInProgress = false;
                            this.__handlerCallInProgress = null;
                        }
                        return this.__cancelled;
                    };
                    EventDispatcher.prototype.setTriggerState = function (triggerState) {
                        if (triggerState === void 0)
                            triggerState = this.__eventName;
                        if (triggerState !== null)
                            if (triggerState === this.__lastTriggerState)
                                return false;
                            else
                                this.__lastTriggerState = triggerState;
                        return true;
                    };
                    EventDispatcher.prototype.resetTriggerState = function () { this.__lastTriggerState = null; };
                    EventDispatcher.prototype.cancel = function () {
                        if (this.__dispatchInProgress)
                            if (this.canCancel)
                                this.__cancelled = true;
                            else
                                throw this.__exception("This even dispatcher does not support canceling events.");
                    };
                    EventDispatcher.prototype.__indexOf = function (object, handler) {
                        for (var i = this.__listeners.length - 1; i >= 0; --i) {
                            var d = this.__listeners[i];
                            if (d.object == object && d.func == handler)
                                return i;
                        }
                        return -1;
                    };
                    EventDispatcher.prototype.__removeListener = function (i) {
                        if (i >= 0 && i < this.__listeners.length) {
                            var handlerInfo = (i == this.__listeners.length - 1 ? this.__listeners.pop() : this.__listeners.splice(i, 1)[0]);
                            if (this.__dispatchInProgress && this.__handlerCallInProgress === handlerInfo)
                                throw this.__exception("Cannot remove a listener while it is executing.");
                            return handlerInfo;
                        }
                        return void 0;
                    };
                    EventDispatcher.prototype.removeListener = function (handler, func) {
                        if (typeof func == 'function') {
                            this.__removeListener(this.__indexOf(handler, func));
                        }
                        else {
                            this.__removeListener(this.__indexOf(handler.object, handler.func));
                        }
                    };
                    EventDispatcher.prototype.removeAllListeners = function () {
                        for (var i = this.__listeners.length - 1; i >= 0; --i)
                            this.__removeListener(i);
                    };
                    EventDispatcher['EventDispatcherFactory'] = function () {
                        return (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory['new'] = function (owner, eventName, removeOnTrigger, eventTriggerHandler, canCancel) {
                                if (removeOnTrigger === void 0) { removeOnTrigger = false; }
                                if (eventTriggerHandler === void 0) { eventTriggerHandler = null; }
                                if (canCancel === void 0) { canCancel = true; }
                                return null;
                            };
                            Factory.init = function (o, isnew, owner, eventName, removeOnTrigger, eventTriggerHandler, canCancel) {
                                if (removeOnTrigger === void 0) { removeOnTrigger = false; }
                                if (eventTriggerHandler === void 0) { eventTriggerHandler = null; }
                                if (canCancel === void 0) { canCancel = true; }
                                this.super.init(o, isnew);
                                if (typeof eventName !== 'string')
                                    eventName = '' + eventName;
                                if (!eventName)
                                    throw "An event name is required.";
                                o.__eventName = eventName;
                                o.__eventPropertyName = EventDispatcher.createEventPropertyNameFromEventName(eventName);
                                o.owner = owner;
                                o.associate(owner);
                                o.__eventTriggerHandler = eventTriggerHandler;
                                o.canCancel = canCancel;
                                if (!isnew) {
                                    o.__listeners.length = 0;
                                }
                                return o;
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(EventDispatcher, System.DependencyObject['ObjectFactory'])));
                    }();
                    return EventDispatcher;
                }(System.DependencyObject));
                return [EventDispatcher, EventDispatcher["EventDispatcherFactory"]];
            });
            var EventDispatcherClass = (function (_super) {
                __extends(EventDispatcherClass, _super);
                function EventDispatcherClass() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return EventDispatcherClass;
            }(Events.EventDispatcher.$__type));
        })(Events = System.Events || (System.Events = {}));
        System.EventObject = CoreXT.ClassFactory(System, System.Object, function (base) {
            var EventObject = (function (_super) {
                __extends(EventObject, _super);
                function EventObject() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                EventObject.prototype.doPropertyChanging = function (name, newValue) {
                    if (this.onPropertyChanging)
                        return this.onPropertyChanging.dispatch(this, newValue);
                    else
                        return true;
                };
                EventObject.prototype.doPropertyChanged = function (name, oldValue) {
                    if (this.onPropertyChanged)
                        this.onPropertyChanged.dispatch(this, oldValue);
                };
                EventObject['EventObjectFactory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function () { return null; };
                    Factory.init = function (o, isnew) {
                        this.super.init(o, isnew);
                        return o;
                    };
                    return Factory;
                }(CoreXT.FactoryBase(EventObject, base['ObjectFactory'])));
                return EventObject;
            }(System.Object.$__type));
            return [EventObject, EventObject["EventObjectFactory"]];
        }, "EventObject");
    })(System = CoreXT.System || (CoreXT.System = {}));
    var Browser;
    (function (Browser) {
        Browser.onReady = System.Events.EventDispatcher.new(CoreXT.Browser, "onReady", true);
    })(Browser = CoreXT.Browser || (CoreXT.Browser = {}));
    CoreXT.onReady = System.Events.EventDispatcher.new(CoreXT, "onReady", true);
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Events.js.map