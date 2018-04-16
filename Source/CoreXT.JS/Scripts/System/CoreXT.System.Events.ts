// ############################################################################################################################
// Types for event management.
// ############################################################################################################################

namespace CoreXT {
    export namespace System {
        // ====================================================================================================================

        /** Encompasses event related types and functions.
          */
        export namespace Events {

            /** Represents an event callback function. */
            export interface EventHandler { (_this: {}, ...args: any[]): void | boolean };

            /** The event trigger handler is called to allow custom handling of event handlers when an event occurs. */
            export interface EventTriggerHandler<TOwner extends object, TCallback extends EventHandler> { (event: $EventDispatcher<TOwner, TCallback>, handler: TCallback): void };

            /** Controls how the event progression occurs. */
            export enum EventModes {
                /** Trigger event on the way up to the target. */
                Capture,
                /** Trigger event on the way down from the target. */
                Bubble,
                /** Trigger event on both the way up to the target, then back down again. */
                CaptureAndBubble
            };

            /** The EventDispatcher wraps a specific event type, and manages the triggering of "handlers" (callbacks) when that event type
              * must be dispatched. Events are usually registered as static properties first (to prevent having to create and initialize
              * many event objects for every owning object instance. Class implementations contain linked event properties to allow creating
              * instance level event handler registration on the class only when necessary.
              */
            class $EventDispatcher<TOwner extends object, TCallback extends EventHandler> extends DependencyObject {

                /**
                 * Registers an event with a class type - typically as a static property. 
                 * @param type A class reference where the static property will be registered.
                 * @param eventName The name of the event to register.
                 * @param eventMode Specifies the desired event traveling mode.
                 * @param removeOnTrigger If true, the event only fires one time, then clears all event handlers. Attaching handlers once an event fires in this state causes them to be called immediately.
                 * @param eventTriggerCallback This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters.
                 * @param customEventPropName The name of the property that will be associated with this event, and expected on parent
                 * objects for the capturing and bubbling phases.  If left undefined/null, then the default is assumed to be
                 * 'on[EventName]', where the first event character is made uppercase automatically.
                 * @param canCancel If true (default), this event can be cancelled (prevented from completing, so no other events will fire).
                 */
                static registerEvent<TOwner extends object, TCallback extends EventHandler>(type: { new(...args: any[]): TOwner }, eventName: string,
                    eventMode: EventModes = EventModes.Capture, removeOnTrigger: boolean = false, eventTriggerCallback?: EventTriggerHandler<TOwner, TCallback>,
                    customEventPropName?: string, canCancel: boolean = true)
                    : { _eventMode: EventModes; _eventName: string; _removeOnTrigger: boolean; eventFuncType: () => $EventDispatcher<TOwner, TCallback>; eventPropertyType: $EventDispatcher<TOwner, TCallback> } {

                    customEventPropName || (customEventPropName = EventDispatcher.createEventPropertyNameFromEventName(eventName)); // TODO: fix to support the convention of {item}.on{Event}().
                    var privateEventName = "$__" + eventName + "Event"; // (this name is used to store the new event dispatcher instance, which is created on demand for every instance)

                    var onEventProxy = function (): $EventDispatcher<object, EventHandler> {
                        var instance = <object>this; // (instance is the object instance on which this event property reference was made)
                        if (typeof instance !== OBJECT) //?  || !(instance instanceof DomainObject.$type))
                            throw Exception.error("{Object}." + eventName, "Must be called on an object instance.", instance);
                        // ... check if the instance already created the event property for registering events specific to this instance ...
                        var eventProperty: $EventDispatcher<object, EventHandler> = instance[privateEventName];
                        if (typeof eventProperty !== OBJECT)
                            instance[privateEventName] = eventProperty = EventDispatcher.new<object, EventHandler>(instance, eventName, removeOnTrigger, eventTriggerCallback, canCancel);
                        eventProperty.__eventPropertyName = customEventPropName;
                        return eventProperty;
                    };

                    // ... first, set the depreciating cross-browser compatible access method ...

                    type.prototype["$__" + customEventPropName] = onEventProxy; // (ex: '$__onClick')

                    // ... next, if supported, create the event getter property ...

                    if (global.Object.defineProperty)
                        global.Object.defineProperty(type.prototype, customEventPropName, {
                            configurable: true,
                            enumerable: true,
                            writable: true,
                            get: onEventProxy //? function () { return onEventProxy.call(this); }
                        });
                    else
                        throw Exception.error("registerEvent: " + eventName, "This browser does not support 'Object.defineProperty()'. To support older browsers, call '_" + customEventPropName + "()' instead to get an instance specific reference to the EventDispatcher for that event (i.e. for 'click' event, do 'obj._onClick().attach(...)').", type);

                    return <any>{ _eventMode: eventMode, _eventName: eventName, _removeOnTrigger: removeOnTrigger }; // (the return doesn't matter at this time)
                }

                /**
                 * Creates an instance property name from a given event name by adding 'on' as a prefix.
                 * This is mainly used when registering events as static properties on types.
                 * @param {string} eventName The event name to create an event property from. If the given event name already starts with 'on', then the given name is used as is (i.e. 'click' becomes 'onClick').
                 */
                static createEventPropertyNameFromEventName(eventName: string): string {
                    return eventName.match(/^on[^a-z]/) ? eventName : "on" + eventName.charAt(0).toUpperCase() + eventName.substring(1);
                }

                owner: TOwner;

                private __eventName: string;
                private __handlers: IDelegate<object, TCallback>[] = []; // (this is typed "any object type" to allow using delegate handler function objects later on)
                /** If a parent value is set, then the event chain will travel the parent hierarchy from this event dispatcher. If not set, the owner is assumed instead. */
                protected __parent: $EventDispatcher<any, EventHandler>;
                private __eventTriggerHandler: EventTriggerHandler<TOwner, TCallback>;
                private __eventPropertyName: string;
                private __lastTriggerState: string;
                private __cancelled: boolean; // (true if the handler wants to stop further handler calls)

                /** Return the underlying event name for this event object. */
                getEventName() { return this.__eventName; }

                /** If this is true, then any new handler added will automatically be triggered as well.
                * This is handy in cases where an application state is persisted, and future handlers should always execute. */
                autoTrigger: boolean = false;

                /** Returns true if handlers exist on this event object instance. */
                hasHandlers(): boolean { return !!this.__handlers.length; }

                /** If true, then handlers are called only once, then removed (default is false). */
                removeOnTrigger: boolean = false;
                /** This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters. */
                eventTriggerHandler: EventTriggerHandler<TOwner, TCallback> = null;
                /** True if the event can be cancelled. */
                canCancel: boolean = true;

                dispose(): void {
                    // ... remove all handlers ...
                    this.removeAllListeners();
                    // TODO: Detach from owner as well? //?
                }

                _getHandlerIndex(handler: TCallback): number;
                _getHandlerIndex(handler: IDelegate<object, TCallback>): number;
                _getHandlerIndex(handler: TCallback | IDelegate<object, TCallback>): number {
                    if (handler instanceof Delegate) {
                        var object = handler.object;
                        var func = <TCallback>handler.func;
                    }
                    else if (handler instanceof Function) {
                        object = null;
                        func = handler;
                    } else throw Exception.error("_getHandlerIndex()", "The given handler is not valid.  A Delegate type or function was expected.", this);

                    for (var i = 0, n = this.__handlers.length; i < n; ++i) {
                        var h = this.__handlers[i];
                        if (h.object == object && h.func == func)
                            return i;
                    }

                    return -1;
                }

                /** Adds a handler (callback) to this event.
                * Note: The registered owner of the underlying dispatch handler will be used as the context of all attached handlers.
                */
                attach(handler: TCallback, eventMode?: EventModes): this;
                attach(handler: IDelegate<object, TCallback>, eventMode?: EventModes): this;
                attach(handler: TCallback | IDelegate<object, TCallback>, eventMode: EventModes = EventModes.Capture): this {
                    if (this._getHandlerIndex(<any>handler) == -1) {
                        var delegate = handler instanceof Delegate ? handler : Delegate.new(this, handler);
                        this.__handlers.push(delegate);
                    }
                    return this;
                }

                /** Dispatch the underlying event. Returns true if all events completed, and false if any handler cancelled the event.
                  * @param {any} triggerState If supplied, the event will not trigger unless the current state is different from the last state.  This is useful in making
                  * sure events only trigger once per state.  Pass in null (the default) to always dispatch regardless.  Pass 'undefined' to used the event
                  * name as the trigger state (this can be used for a "trigger only once" scenario).
                  * @param {boolean} canBubble Set to true to allow the event to bubble (where supported).
                  * @param {boolean} canCancel Set to true if handlers can abort the event (false means it has or will occur regardless).
                  * @param {string[]} args Custom arguments that will be passed on to the event handlers.
                  */
                dispatchEvent(triggerState: any = null, ...args: any[]): boolean { // TODO: Don't' use '...args'
                    if (!this.setTriggerState(triggerState))
                        return; // (no change in state, so ignore this request)

                    // ... for capture phases, start at the bottom and work up; but need to build the chain first (http://stackoverflow.com/a/10654134/1236397) ...
                    // ('this.$__parent' checks for instance chained events, whereas 'this.owner.$__parent' checks static chained events)

                    var parent: DependencyObject = this.__parent || this.owner && (<DependencyObject><any>this.owner).parent || null;

                    var eventChain: IEventDispatcher<any, any>[] = Array.new(this); // ('this' is the last for capture, and first for bubbling)

                    if (parent) { // (run capture/bubbling phases)
                        var eventPropFuncName = '$__' + this.__eventPropertyName; // (if exists, this references the property function that returns an even dispatcher object [for instances only])
                        while (parent) {
                            var epf = <() => $EventDispatcher<any, any>>parent[eventPropFuncName];
                            if (typeof epf == FUNCTION && epf instanceof $EventDispatcher)
                                eventChain.push(epf());
                            parent = parent['__parent'];
                        }
                    }

                    this.__cancelled = false;

                    // ... do capture phase (root, towards target) ...
                    for (var n = eventChain.length, i = n - 1; i >= 0; --i) {
                        if (this.__cancelled) break;
                        var dispatcher = eventChain[i];
                        if (dispatcher.__handlers.length)
                            dispatcher.__dispatchEvent.call(dispatcher, args, EventModes.Capture);
                    }

                    // ... do bubbling phase (target, towards root) ...
                    for (var i = 0, n = eventChain.length; i < n; ++i) {
                        if (this.__cancelled) break;
                        var dispatcher = eventChain[i];
                        if (dispatcher.__handlers.length)
                            dispatcher.__dispatchEvent.call(dispatcher, args, EventModes.Bubble);
                    }

                    return !this.__cancelled;
                }

                /** If the given state value is different from the last state value, the internal trigger state value will be updated, and true will be returned.
                * If a state value of null is given, the request will be ignored, and true will always be returned.
                * If you don't specify a value ('undefined' is received) then the internal event name becomes the trigger state value (this can be used for a "trigger
                * only once" scenario).  Use 'resetTriggerState()' to reset the internal trigger state when needed.
                */
                setTriggerState(triggerState?: any): boolean {
                    if (triggerState === void 0) triggerState = this.__eventName;
                    if (triggerState !== null)
                        if (triggerState === this.__lastTriggerState)
                            return false; // (no change in state, so ignore this request)
                        else
                            this.__lastTriggerState = triggerState;
                    return true;
                }

                /** Resets the current internal trigger state to null. The next call to 'setTriggerState()' will always return true.
                * This is usually called after a sequence of events have completed, in which it is possible for the cycle to repeat.
                */
                resetTriggerState() { this.__lastTriggerState = null; }

                /** A simple way to pass arguments to event handlers using arguments with static typing (calls 'dispatchEvent(null, false, false, arguments)').
                * TIP: To prevent triggering the same event multiple times, use a custom state value in a call to 'setTriggerState()', and only call
                * 'dispatch()' if true is returned (example: "someEvent.setTriggerState(someState) && someEvent.dispatch(...);", where the call to 'dispatch()'
                * only occurs if true is returned from the previous statement).
                */
                dispatch: TCallback = <TCallback><any>((...args: any[]) => {
                    return this.dispatchEvent.apply(this, args.unshift(null));
                });

                /** If called within a handler, prevents the other handlers from being called. */
                cancel(): void {
                    if (this.__dispatchInProgress)
                        if (this.canCancel)
                            this.__cancelled = true;
                        else
                            throw Exception.error("Cancel Event '" + this.__eventName + "'", "This even dispatcher does not support canceling events.", this);
                }

                private __indexOf(object: object, handler: TCallback) {
                    for (var i = this.__handlers.length - 1; i >= 0; --i) {
                        var d = this.__handlers[i];
                        if (d.object == object && d.func == <any>handler)
                            return i;
                    }
                    return -1;
                }

                private __removeListener(i: number) {
                    if (i >= 0 && i < this.__handlers.length) {
                        var handlerInfo = (i == this.__handlers.length - 1 ? this.__handlers.pop() : this.__handlers.splice(i, 1)[0]);

                        if (this.__handlerCallInProgress && this.__handlerCallInProgress != handlerInfo)
                            --this.__handlerCountBeforeDispatch; // (if the handler being removed is not the current one in progress, then it will never be called, and thus the original count needs to change)

                        if (handlerInfo.addFunctionName == "addEventListener")
                            document.removeEventListener(this.__eventName, handlerInfo.__internalCallback, false);
                        else if (handlerInfo.addFunctionName == "attachEvent")
                            (<any>document.documentElement).detachEvent("onpropertychange", handlerInfo.__internalCallback);
                        // (else this is most likely the server side, and removing it from the array is good enough)
                        this[handlerInfo.key] = void 0; // (faster than deleting it, and prevents having to create the property over and over)
                    }
                }

                removeListener(object: NativeTypes.IObject, func: TCallback): void;
                removeListener(handler: IDelegate<TOwner, TCallback>): void;
                removeListener(handler: IDelegate<TOwner, TCallback>, func?: TCallback): void {
                    // ... check if a delegate is given, otherwise attempt to create one ...
                    if (typeof func == 'function') {
                        this.__removeListener(this.__indexOf(handler, func));
                    } else {
                        this.__removeListener(this.__indexOf(handler.object, <TCallback><Function>handler.func));
                    }
                }

                removeAllListeners() {
                    for (var i = this.__handlers.length - 1; i >= 0; --i)
                        this.__removeListener(i);
                }

                // -------------------------------------------------------------------------------------------------------------------

                protected static '$EventDispatcher Factory' = function () {
                    type TInstance<TOwner extends object, TCallback extends EventHandler> = $EventDispatcher<TOwner, TCallback>;
                    return class Factory extends FactoryBase($EventDispatcher, $EventDispatcher['$Object Factory']) implements IFactory {

                        /** Creates an event object for a specific even type.
                            * @param {TOwner} owner The owner which owns this event object.
                            * @param {string} eventName The name of the event which this event object represents.
                            * @param {boolean} removeOnTrigger If true, then handlers are called only once, then removed (default is false).
                            * @param {Function} eventTriggerHandler This is a hook which is called every time a handler needs to be called.  This exists mainly to support handlers called with special parameters.
                            * @param {boolean} canCancel If true, the event can be cancelled (prevented from completing, so no other events will fire).
                            */
                        'new'<TOwner extends object, TCallback extends EventHandler>(owner: TOwner, eventName: string, removeOnTrigger: boolean = false,
                            eventTriggerHandler: EventTriggerHandler<TOwner, TCallback> = null, canCancel: boolean = true): $EventDispatcher<TOwner, TCallback> { return null; }

                        /** Initializes/reinitializes an EventDispatcher instance. */
                        init<TOwner extends object, TCallback extends EventHandler>($this: $EventDispatcher<TOwner, TCallback>, isnew: boolean, owner: TOwner, eventName: string,
                            removeOnTrigger: boolean = false, eventTriggerHandler: EventTriggerHandler<TOwner, TCallback> = null, canCancel: boolean = true): $EventDispatcher<TOwner, TCallback> {

                            this.$__baseFactory.init($this, isnew);

                            if (typeof eventName !== STRING) eventName = '' + eventName;
                            if (!eventName) throw "An event name is required.";

                            $this.__eventName = eventName;
                            $this.__eventPropertyName = EventDispatcher.createEventPropertyNameFromEventName(eventName); // (fix to support the convention of {item}.on{Event}().

                            $this.owner = owner;
                            $this.__eventTriggerHandler = eventTriggerHandler;

                            $this.canCancel = canCancel;

                            if (!isnew) {
                                $this.__handlers.length = 0;
                            }

                            return $this;
                        }
                    }.register([CoreXT, System, Events]);
                }();

                // ----------------------------------------------------------------------------------------------------------------
            }

            export interface IEventDispatcher<TOwner extends object, TCallback extends EventHandler> extends $EventDispatcher<TOwner, TCallback> { }
            export var EventDispatcher = $EventDispatcher['$EventDispatcher Factory'].$__type;
        }

        // =======================================================================================================================

        export interface IPropertyChangingHandler<TSender extends IEventObject> { (sender: TSender, newValue: any): boolean }
        export interface IPropertyChangedHandler<TSender extends IEventObject> { (sender: TSender, oldValue: any): void }

        export interface INotifyPropertyChanged<TSender extends IEventObject> {
            /** Triggered when a supported property is about to change.  This does not work for all properties by default, but only those which call 'doPropertyChanging' in their implementation. */
            onPropertyChanging: Events.IEventDispatcher<TSender, IPropertyChangingHandler<TSender>>;

            /** Triggered when a supported property changes.  This does not work for all properties by default, but only those which call 'doPropertyChanged' in their implementation. */
            onPropertyChanged: Events.IEventDispatcher<TSender, IPropertyChangedHandler<TSender>>;

            /** Call this if you wish to implement change events for supported properties. */
            doPropertyChanging(name: string, newValue: any): boolean;

            /** Call this if you wish to implement change events for supported properties. */
            doPropertyChanged(name: string, oldValue: any): void;
        }

        class $EventObject extends Object.$__type implements INotifyPropertyChanged<IEventObject>
        {
            /** Triggered when a supported property is about to change.  This does not work for all properties by default, but only those
              * which call 'doPropertyChanging' in their implementation.
              */
            onPropertyChanging: Events.IEventDispatcher<IEventObject, IPropertyChangingHandler<IEventObject>>;

            /** Triggered when a supported property changes.  This does not work for all properties by default, but only those
              * which call 'doPropertyChanged' in their implementation.
              */
            onPropertyChanged: Events.IEventDispatcher<IEventObject, IPropertyChangedHandler<IEventObject>>;

            /** Call this if you wish to implement 'changing' events for supported properties.
            * If any event handler cancels the event, then 'false' will be returned.
            */
            doPropertyChanging(name: string, newValue: any): boolean {
                if (this.onPropertyChanging)
                    return this.onPropertyChanging.dispatch(this, newValue);
                else
                    return true;
            }

            /** Call this if you wish to implement 'changed' events for supported properties. */
            doPropertyChanged(name: string, oldValue: any): void {
                if (this.onPropertyChanged)
                    this.onPropertyChanged.dispatch(this, oldValue);
            }

            // -------------------------------------------------------------------------------------------------------------------
            // This part uses the CoreXT factory pattern

            protected static '$EventObject Factory' = class Factory extends FactoryBase($EventObject, $EventObject['$Object Factory']) implements IFactory {
                /**
                    * Constructs a new Delegate object.
                    * @param {Object} object The instance on which the associated function will be called.  This should be undefined/null for static functions.
                    * @param {Function} func The function to be called on the associated object.
                    */
                'new'(): InstanceType<typeof Factory.$__type> { return null; }

                /**
                    * Reinitializes a disposed Delegate instance.
                    * @param $this The Delegate instance to initialize, or re-initialize.
                    * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
                    * @param object The instance to bind to the resulting delegate object.
                    * @param func The function that will be called for the resulting delegate object.
                    */
                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean): InstanceType<typeof Factory.$__type> {
                    this.$__baseFactory.init($this, isnew);
                    return $this;
                }
            }.register([CoreXT, System]);

            // -------------------------------------------------------------------------------------------------------------------
        }

        export interface IEventObject extends $EventObject { }
        export var EventObject = $EventObject['$EventObject Factory'].$__type;

        // ====================================================================================================================
    }

    // ========================================================================================================================

    export namespace Browser {
        /** Triggered when the DOM has completed loading. */
        export var onReady = System.Events.EventDispatcher.new<typeof CoreXT.Browser, { (): void }>(CoreXT.Browser, "onReady", true);
    }

    /** Triggered when all manifests have loaded. No modules have been executed at this point.
      * Note: 'onReady' is not called automatically if 'CoreXT.System.Diagnostics.debug' is set to 'Debug_Wait'.
      */
    export var onReady = System.Events.EventDispatcher.new<typeof CoreXT, { (): void }>(CoreXT, "onReady", true);

}
// ############################################################################################################################
