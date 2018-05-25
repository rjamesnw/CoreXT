// ############################################################################################################################
// Types for event management.
// ############################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        // ====================================================================================================================
        /** Encompasses event related types and functions.
          */
        var Events;
        (function (Events) {
            CoreXT.registerNamespace("CoreXT", "System", "Events");
            ;
            ;
            /** Controls how the event progression occurs. */
            var EventModes;
            (function (EventModes) {
                /** Trigger event on the way up to the target. */
                EventModes[EventModes["Capture"] = 0] = "Capture";
                /** Trigger event on the way down from the target. */
                EventModes[EventModes["Bubble"] = 1] = "Bubble";
                /** Trigger event on both the way up to the target, then back down again. */
                EventModes[EventModes["CaptureAndBubble"] = 2] = "CaptureAndBubble";
            })(EventModes = Events.EventModes || (Events.EventModes = {}));
            ;
            /**
              * The EventDispatcher wraps a specific event type, and manages the triggering of "handlers" (callbacks) when that event type
              * must be dispatched. Events are usually registered as static properties first (to prevent having to create and initialize
              * many event objects for every owning object instance. Class implementations contain linked event properties to allow creating
              * instance level event handler registration on the class only when necessary.
              */
            Events.EventDispatcher = CoreXT.ClassFactory(Events, void 0, function (base) {
                var EventDispatcher = /** @class */ (function (_super) {
                    __extends(EventDispatcher, _super);
                    function EventDispatcher() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.__associations = new WeakMap(); // (a mapping between an external object and this event instance - typically used to associated this event with an external object OTHER than the owner)
                        _this.__listeners = []; // (this is typed "any object type" to allow using delegate handler function objects later on)
                        /** If this is true, then any new handler added will automatically be triggered as well.
                        * This is handy in cases where an application state is persisted, and future handlers should always execute. */
                        _this.autoTrigger = false;
                        /** If true, then handlers are called only once, then removed (default is false). */
                        _this.removeOnTrigger = false;
                        /** This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters. */
                        _this.eventTriggerHandler = null;
                        /** True if the event can be cancelled. */
                        _this.canCancel = true;
                        /** A simple way to pass arguments to event handlers using arguments with static typing (calls 'dispatchEvent(null, false, false, arguments)').
                            * TIP: To prevent triggering the same event multiple times, use a custom state value in a call to 'setTriggerState()', and only call
                            * 'dispatch()' if true is returned (example: "someEvent.setTriggerState(someState) && someEvent.dispatch(...);", where the call to 'dispatch()'
                            * only occurs if true is returned from the previous statement).
                            */
                        _this.dispatch = (function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            return _this.dispatchEvent.apply(_this, args.unshift(null));
                        });
                        return _this;
                        // ----------------------------------------------------------------------------------------------------------------
                    }
                    /**
                     * Registers an event with a class type - typically as a static property.
                     * @param type A class reference where the static property will be registered.
                     * @param eventName The name of the event to register.
                     * @param eventMode Specifies the desired event traveling mode.
                     * @param removeOnTrigger If true, the event only fires one time, then clears all event handlers. Attaching handlers once an event fires in this state causes them to be called immediately.
                     * @param eventTriggerCallback This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters.
                     * @param customEventPropName The name of the property that will be associated with this event, and expected on parent objects
                     * for the capturing and bubbling phases.  If left undefined/null, then the default is assumed to be
                     * 'on[EventName]', where the first event character is made uppercase automatically.
                     * @param canCancel If true (default), this event can be cancelled (prevented from completing, so no other events will fire).
                     */
                    EventDispatcher.registerEvent = function (type, eventName, eventMode, removeOnTrigger, eventTriggerCallback, customEventPropName, canCancel) {
                        if (eventMode === void 0) { eventMode = EventModes.Capture; }
                        if (removeOnTrigger === void 0) { removeOnTrigger = false; }
                        if (canCancel === void 0) { canCancel = true; }
                        customEventPropName || (customEventPropName = EventDispatcher.createEventPropertyNameFromEventName(eventName)); // (the default supports the convention of {item}.on{Event}()).
                        var privateEventName = EventDispatcher.createPrivateEventName(eventName); // (this name is used to store the new event dispatcher instance, which is created on demand for every instance)
                        // ... create a "getter" in the prototype for 'type' so that, when accessed by specific instances, an event object will be created on demand - this greatly reduces memory
                        //    allocations when many events exist on a lot of objects) ...
                        var onEventProxy = function () {
                            var instance = this; // (instance is the object instance on which this event property reference was made)
                            if (typeof instance !== 'object') //?  || !(instance instanceof DomainObject.$type))
                                throw System.Exception.error("{Object}." + eventName, "Must be called on an object instance.", instance);
                            // ... check if the instance already created the event property for registering events specific to this instance ...
                            var eventProperty = instance[privateEventName];
                            if (typeof eventProperty !== 'object') // (undefined or not valid, so attempt to create one now)
                                instance[privateEventName] = eventProperty = Events.EventDispatcher.new(instance, eventName, removeOnTrigger, eventTriggerCallback, canCancel);
                            eventProperty.__eventPropertyName = customEventPropName;
                            eventProperty.__eventPrivatePropertyName = privateEventName;
                            return eventProperty;
                        };
                        //x ... first, set the depreciating cross-browser compatible access method ...
                        //x type.prototype["$__" + customEventPropName] = onEventProxy; // (ex: '$__onClick')
                        // ... create the event getter property and set the "on event" getter proxy ...
                        if (CoreXT.global.Object.defineProperty)
                            CoreXT.global.Object.defineProperty(type.prototype, customEventPropName, {
                                configurable: true,
                                enumerable: true,
                                writable: true,
                                get: onEventProxy
                            });
                        else
                            throw System.Exception.error("registerEvent: " + eventName, "This browser does not support 'Object.defineProperty()'. To support older browsers, call '_" + customEventPropName + "()' instead to get an instance specific reference to the EventDispatcher for that event (i.e. for 'click' event, do 'obj._onClick().attach(...)').", type);
                        return { _eventMode: eventMode, _eventName: eventName, _removeOnTrigger: removeOnTrigger }; // (the return doesn't matter at this time)
                    };
                    /**
                     * Creates an instance property name from a given event name by adding 'on' as a prefix.
                     * This is mainly used when registering events as static properties on types.
                     * @param {string} eventName The event name to create an event property from. If the given event name already starts with 'on', then the given name is used as is (i.e. 'click' becomes 'onClick').
                     */
                    EventDispatcher.createEventPropertyNameFromEventName = function (eventName) {
                        return eventName.match(/^on[^a-z]/) ? eventName : "on" + eventName.charAt(0).toUpperCase() + eventName.substring(1);
                    };
                    /**
                   * Returns a formatted event name in the form of a private event name like '$__{eventName}Event' (eg. 'click' becomes '$__clickEvent').
                   * The private event names are used to store event instances on the owning instances so each instance has it's own handlers list to manage.
                   */
                    EventDispatcher.createPrivateEventName = function (eventName) { return "$__" + eventName + "Event"; };
                    /** Return the underlying event name for this event object. */
                    EventDispatcher.prototype.getEventName = function () { return this.__eventName; };
                    /** Returns true if handlers exist on this event object instance. */
                    EventDispatcher.prototype.hasHandlers = function () { return !!this.__listeners.length; };
                    EventDispatcher.prototype.dispose = function () {
                        // ... remove all handlers ...
                        this.removeAllListeners();
                        // TODO: Detach from owner as well? //?
                    };
                    /**
                     * Associates this event instance with an object using a weak map. The owner of the instance is already associated by default.
                     * Use this function to associate other external objects other than the owner, such as DOM elements (there should only be one
                     * specific event instance per any object).
                     */
                    EventDispatcher.prototype.associate = function (obj) {
                        this.__associations.set(obj, this);
                        return this;
                    };
                    /** Disassociates this event instance from an object (an internal weak map is used for associations). */
                    EventDispatcher.prototype.disassociate = function (obj) {
                        this.__associations.delete(obj);
                        return this;
                    };
                    /** Returns true if this event instance is already associated with the specified object (a weak map is used). */
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
                    /** Dispatch the underlying event. Typically 'dispatch()' is called instead of calling this directly. Returns 'true' if all events completed, and 'false' if any handler cancelled the event.
                      * @param {any} triggerState If supplied, the event will not trigger unless the current state is different from the last state.  This is useful in making
                      * sure events only trigger once per state.  Pass in null (the default) to always dispatch regardless.  Pass 'undefined' to used the event
                      * name as the trigger state (this can be used for a "trigger only once" scenario).
                      * @param {boolean} canBubble Set to true to allow the event to bubble (where supported).
                      * @param {boolean} canCancel Set to true if handlers can abort the event (false means it has or will occur regardless).
                      * @param {string[]} args Custom arguments that will be passed on to the event handlers.
                      */
                    EventDispatcher.prototype.dispatchEvent = function (triggerState) {
                        if (triggerState === void 0) { triggerState = null; }
                        var args = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            args[_i - 1] = arguments[_i];
                        }
                        if (!this.setTriggerState(triggerState))
                            return; // (no change in state, so ignore this request)
                        // ... for capture phases, start at the bottom and work up; but need to build the chain first (http://stackoverflow.com/a/10654134/1236397) ...
                        // ('this.__parent' checks for event-instance-only chained events, whereas 'this.owner.parent' iterates events using the a parent-child dependency hierarchy from the owner)
                        var parent = this.__parent || this.owner && this.owner.parent || null;
                        // ... run capture/bubbling phases; first, build the event chain ...
                        var eventChain = System.Array.new(this); // ('this' [the current instance] is the last for capture, and first for bubbling)
                        if (parent) {
                            var eventPropertyName = this.__eventPropertyName; // (if exists, this references the 'on{EventName}' property getter that returns an even dispatcher object)
                            while (parent) {
                                var eventInstance = parent[eventPropertyName];
                                if (eventInstance instanceof EventDispatcher)
                                    eventChain.push(eventInstance);
                                parent = parent['__parent'];
                            }
                        }
                        var cancelled = false;
                        // ... do capture phase (root, towards target) ...
                        for (var n = eventChain.length, i = n - 1; i >= 0; --i) {
                            if (cancelled)
                                break;
                            var dispatcher = eventChain[i];
                            if (dispatcher.__listeners.length)
                                cancelled = dispatcher.onDispatchEvent(args, EventModes.Capture);
                        }
                        // ... do bubbling phase (target, towards root) ...
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
                    /** Calls the event handlers that match the event mode on the current event instance. */
                    EventDispatcher.prototype.onDispatchEvent = function (args, mode) {
                        args.push(this); // (add this event instance to the end of the arguments list to allow an optional target parameters to get a reference to the calling event)
                        this.__cancelled = false;
                        this.__dispatchInProgress = true;
                        try {
                            for (var i = 0, n = this.__listeners.length; i < n; ++i) {
                                var delegate = this.__listeners[i];
                                var cancelled = false;
                                if (delegate.$__eventMode == mode && delegate) {
                                    this.__handlerCallInProgress = delegate;
                                    if (this.__eventTriggerHandler)
                                        cancelled = this.__eventTriggerHandler(this, delegate, args, delegate.$__eventMode) === false; // (call any special trigger handler)
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
                    /** If the given state value is different from the last state value, the internal trigger state value will be updated, and true will be returned.
                        * If a state value of null is given, the request will be ignored, and true will always be returned.
                        * If you don't specify a value ('triggerState' is 'undefined') then the internal event name becomes the trigger state value (this can be used for a "trigger
                        * only once" scenario).  Use 'resetTriggerState()' to reset the internal trigger state when needed.
                        */
                    EventDispatcher.prototype.setTriggerState = function (triggerState) {
                        if (triggerState === void 0)
                            triggerState = this.__eventName;
                        if (triggerState !== null)
                            if (triggerState === this.__lastTriggerState)
                                return false; // (no change in state, so ignore this request)
                            else
                                this.__lastTriggerState = triggerState;
                        return true;
                    };
                    /** Resets the current internal trigger state to null. The next call to 'setTriggerState()' will always return true.
                        * This is usually called after a sequence of events have completed, in which it is possible for the cycle to repeat.
                        */
                    EventDispatcher.prototype.resetTriggerState = function () { this.__lastTriggerState = null; };
                    /** If called within a handler, prevents the other handlers from being called. */
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
                            //    --this.__handlerCountBeforeDispatch; // (if the handler being removed is not the current one in progress, then it will never be called, and thus the original count needs to change)
                            //if (handlerInfo.addFunctionName == "addEventListener")
                            //    document.removeEventListener(this.__eventName, handlerInfo.__internalCallback, false);
                            //else if (handlerInfo.addFunctionName == "attachEvent")
                            //    (<any>document.documentElement).detachEvent("onpropertychange", handlerInfo.__internalCallback);
                            // (else this is most likely the server side, and removing it from the array is good enough)
                            //? this[handlerInfo.key] = void 0; // (faster than deleting it, and prevents having to create the property over and over)
                            return handlerInfo;
                        }
                        return void 0;
                    };
                    EventDispatcher.prototype.removeListener = function (handler, func) {
                        // ... check if a delegate is given, otherwise attempt to create one ...
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
                    // -------------------------------------------------------------------------------------------------------------------
                    EventDispatcher['EventDispatcherFactory'] = function () {
                        return /** @class */ (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            /** Creates an event object for a specific even type.
                                * @param {TOwner} owner The owner which owns this event object.
                                * @param {string} eventName The name of the event which this event object represents.
                                * @param {boolean} removeOnTrigger If true, then handlers are called only once, then removed (default is false).
                                * @param {Function} eventTriggerHandler This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters.
                                * @param {boolean} canCancel If true, the event can be cancelled (prevented from completing, so no other events will fire).
                                */
                            Factory['new'] = function (owner, eventName, removeOnTrigger, eventTriggerHandler, canCancel) {
                                if (removeOnTrigger === void 0) { removeOnTrigger = false; }
                                if (eventTriggerHandler === void 0) { eventTriggerHandler = null; }
                                if (canCancel === void 0) { canCancel = true; }
                                return null;
                            };
                            /** Initializes/reinitializes an EventDispatcher instance. */
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
                                o.__eventPropertyName = EventDispatcher.createEventPropertyNameFromEventName(eventName); // (fix to support the convention of {item}.on{Event}().
                                o.owner = owner;
                                o.associate(owner);
                                o.__eventTriggerHandler = eventTriggerHandler;
                                o.canCancel = canCancel;
                                if (!isnew) {
                                    o.__listeners.length = 0;
                                }
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(EventDispatcher, System.DependentObject['ObjectFactory'])));
                    }();
                    return EventDispatcher;
                }(System.DependentObject));
                return [EventDispatcher, EventDispatcher["EventDispatcherFactory"]];
            }, "EventDispatcher");
            var EventDispatcherClass = /** @class */ (function (_super) {
                __extends(EventDispatcherClass, _super);
                function EventDispatcherClass() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return EventDispatcherClass;
            }(Events.EventDispatcher.$__type));
        })(Events = System.Events || (System.Events = {}));
        System.EventObject = CoreXT.ClassFactory(System, System.Object, function (base) {
            var EventObject = /** @class */ (function (_super) {
                __extends(EventObject, _super);
                function EventObject() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /** Call this if you wish to implement 'changing' events for supported properties.
                * If any event handler cancels the event, then 'false' will be returned.
                */
                EventObject.prototype.doPropertyChanging = function (name, newValue) {
                    if (this.onPropertyChanging)
                        return this.onPropertyChanging.dispatch(this, newValue);
                    else
                        return true;
                };
                /** Call this if you wish to implement 'changed' events for supported properties. */
                EventObject.prototype.doPropertyChanged = function (name, oldValue) {
                    if (this.onPropertyChanged)
                        this.onPropertyChanged.dispatch(this, oldValue);
                };
                // -------------------------------------------------------------------------------------------------------------------
                // This part uses the CoreXT factory pattern
                EventObject['EventObjectFactory'] = /** @class */ (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    /**
                    * Constructs a new Delegate object.
                    * @param {Object} object The instance on which the associated function will be called.  This should be undefined/null for static functions.
                    * @param {Function} func The function to be called on the associated object.
                    */
                    Factory['new'] = function () { return null; };
                    /**
                    * Reinitializes a disposed Delegate instance.
                    * @param o The Delegate instance to initialize, or re-initialize.
                    * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
                    * @param object The instance to bind to the resulting delegate object.
                    * @param func The function that will be called for the resulting delegate object.
                    */
                    Factory.init = function (o, isnew) {
                        this.super.init(o, isnew);
                    };
                    return Factory;
                }(CoreXT.FactoryBase(EventObject, base['ObjectFactory'])));
                return EventObject;
            }(System.Object.$__type));
            return [EventObject, EventObject["EventObjectFactory"]];
        }, "EventObject");
        // ====================================================================================================================
    })(System = CoreXT.System || (CoreXT.System = {}));
    // ========================================================================================================================
    var Browser;
    (function (Browser) {
        /** Triggered when the DOM has completed loading. */
        Browser.onReady = System.Events.EventDispatcher.new(CoreXT.Browser, "onReady", true);
    })(Browser = CoreXT.Browser || (CoreXT.Browser = {}));
    /** Triggered when all manifests have loaded. No modules have been executed at this point.
      * Note: 'onReady' is not called automatically if 'CoreXT.System.Diagnostics.debug' is set to 'Debug_Wait'.
      */
    CoreXT.onReady = System.Events.EventDispatcher.new(CoreXT, "onReady", true);
})(CoreXT || (CoreXT = {}));
// ############################################################################################################################
//# sourceMappingURL=CoreXT.System.Events.js.map