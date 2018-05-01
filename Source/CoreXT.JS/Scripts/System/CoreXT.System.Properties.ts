// ###########################################################################################################################
// Types for specialized object property management.
// ###########################################################################################################################

namespace CoreXT.System.Platform {
    registerNamespace("CoreXT",  "System", "Platform");
    // ========================================================================================================================

    export interface PropertyChangedHandler { (item: IGraphNode, property: Property): void; }

    /** Called BEFORE a property changes.
    * This is called if there's a need to modify property values as they are set.  This is similar to a filter function, except
    * the resulting value is persisted.
    * Note: The interceptor function MUST return either the new value passed in, or something else.
    */
    export interface InterceptorCallback { (property: Property, newValue: any): any; }

    /** Called AFTER a property changes.
    * This is called if there's a need to be notified when properties have changed.
    * The parameter 'initialValue' is true when a graph item is being initialized for the first time. Use this to prevent
    * updating the UI in special cases (such as in UI.HTML, which initially prevents updating 'innerHTML',
    * which would destroy the child nodes).
    */
    export interface ListenerCallback { (property: Property, initialValue: boolean): void; }

    /** Called when a property is being read from.
    * When properties are read from, any associated filters are executed to modify the underlying value before it gets returned
    * to the caller (such as when formatting data - example: converting 'M' to 'Male', '20131006' to 'October 6th, 2013', or
    * trimming spaces/formatting text, etc.).
    * Note: The filter function MUST return either the value passed in, or a new value.
    */
    export interface FilterCallback { (property: Property, value: any): any; }

    // ========================================================================================================================

    class $PropertyEventBase extends EventObject.$__type {
        // -------------------------------------------------------------------------------------------------------------------

        /** A list of callbacks to execute BEFORE a value changes. */
        interceptors: InterceptorCallback[] = null;

        /** A list of callbacks to execute AFTER a value changes. */
        listeners: ListenerCallback[] = null;

        /** A series of callbacks to pass a value through when a property is read.  This allows derived types to convert 
        * or translate inherited property values into new values as they are passed down the inheritance hierarchy chain. */
        filters: FilterCallback[] = null;

        // -------------------------------------------------------------------------------------------------------------------

        /**
        * @param {Property} property The source of this event.
        */
        __DoOnPropertyChanging(owner: $PropertyEventBase, property: Property, newValue: any): any {
            if (this.interceptors != null)
                for (var i = 0, n = this.interceptors.length; i < n; ++i)
                    newValue = this.interceptors[i].call(owner, property, newValue);
            return newValue;
        }

        /**
        * @param {Property} property The source of this event.
        */
        __DoOnPropertyChanged(owner: $PropertyEventBase, property: Property, initialValue: boolean): void {
            if (this.listeners != null)
                for (var i = 0, n = this.listeners.length; i < n; ++i)
                    this.listeners[i].call(owner, property, initialValue);
        }

        /**
        * @param {Property} property The source of this event.
        * @param {any} value The result of each filter call is passed into this parameter for each successive call (in filter creation order).
        */
        __FilerValue(owner: $PropertyEventBase, property: Property, value: any): void {
            if (this.filters != null)
                for (var i = 0, n = this.filters.length; i < n; ++i)
                    value = this.filters[i].call(owner, property, value);
            return value;
        }

        // -------------------------------------------------------------------------------------------------------------------

        /** A list of callbacks to execute BEFORE this value changes. */
        registerInterceptor(interceptor: InterceptorCallback): void {
            if (!this.interceptors) this.interceptors = [];
            for (var i = this.interceptors.length - 1; i >= 0; --i)
                if (this.interceptors[i] == interceptor) return;
            this.interceptors.push(interceptor);
        }

        unregisterInterceptor(interceptor: InterceptorCallback): void {
            if (!this.interceptors) return;
            for (var i = this.interceptors.length - 1; i >= 0; --i)
                if (this.interceptors[i] == interceptor) {
                    this.interceptors.splice(i, 1);
                    break;
                }
        }

        // -------------------------------------------------------------------------------------------------------------------

        /** A list of callbacks to execute AFTER this value changes. */
        registerListener(listener: ListenerCallback): void {
            if (!this.listeners) this.listeners = [];
            for (var i = this.listeners.length - 1; i >= 0; --i)
                if (this.listeners[i] == listener) return;
            this.listeners.push(listener);
        }

        unregisterListener(listener: ListenerCallback): void {
            if (!this.listeners) return;
            for (var i = this.listeners.length - 1; i >= 0; --i)
                if (this.listeners[i] == listener) {
                    this.listeners.splice(i, 1);
                    break;
                }
        }

        // -------------------------------------------------------------------------------------------------------------------

        /** Filters are called when a property is being read from.
        * Derived types should create filters if there's a need to notify a stored value before use (such as when formatting data,
        * such as converting 'M' to 'Male', '20131006' to 'October 6th, 2013', or trimming spaces/formatting text, etc.).
        */
        registerFilter(filter: FilterCallback): void {
            if (!this.filters) this.filters = [];
            for (var i = this.filters.length - 1; i >= 0; --i)
                if (this.filters[i] == filter) return;
            this.filters.push(filter);
        }

        unregisterFilter(filter: FilterCallback): void {
            if (!this.filters) return;
            for (var i = this.filters.length - 1; i >= 0; --i)
                if (this.filters[i] == filter) {
                    this.filters.splice(i, 1);
                    break;
                }
        }

        // -------------------------------------------------------------------------------------------------------------------
        // This part uses the CoreXT factory pattern

        protected static '$PropertyEventBase Factory' = class Factory extends FactoryBase($PropertyEventBase, $PropertyEventBase['$EventObject Factory']) implements IFactory {
            /**
               * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
               * layout that can render a view, or partial view.
               * @param parent If specified, the value will be wrapped in the created object.
               */
            'new'(): InstanceType<typeof Factory.$__type> { return null; }

            init($this: InstanceType<typeof Factory.$__type>, isnew: boolean): InstanceType<typeof Factory.$__type> {
                this.$__baseFactory.init($this, isnew);
                return $this;
            }
        }.register(Platform);

        // -------------------------------------------------------------------------------------------------------------------
    }

    export interface IPropertyEventBase extends $PropertyEventBase { }
    export var PropertyEventBase = $PropertyEventBase['$PropertyEventBase Factory'].$__type;

    // =======================================================================================================================

    class $StaticProperty extends PropertyEventBase.$__type {
        owner: typeof GraphNode;

        /** An internal name for the property.  This will also be the attribute set on the underlying UI element (so a name
        * of 'id' would set the 'id' attribute of the element). */
        name: string;

        /** The default value for new related instance properties. */
        defaultValue: any;

        /** If true (false by default), then 'onRedraw()' will be called when this property is updated. */
        isVisual: boolean = false;

        // -------------------------------------------------------------------------------------------------------------------
        // This part uses the CoreXT factory pattern

        protected static '$StaticProperty Factory' = class Factory extends FactoryBase($StaticProperty, $StaticProperty['$PropertyEventBase Factory']) implements IFactory {
            /**
               * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
               * layout that can render a view, or partial view.
               * @param parent If specified, the value will be wrapped in the created object.
               */
            'new'(name: string, isVisual: boolean): InstanceType<typeof Factory.$__type> { return null; }

            init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, name: string, isVisual: boolean): InstanceType<typeof Factory.$__type> {
                this.$__baseFactory.init($this, isnew);
                $this.name = name;
                $this.isVisual = isVisual;
                return $this;
            }
        }.register(Platform);

        // -------------------------------------------------------------------------------------------------------------------

        createPropertyInstance(owner: IGraphNode, value?: any) {
            return new Property(owner, this, value === UNDEFINED ? this.defaultValue : value);
        }

        toString(): string { return this.name; }
        toLocaleString(): string { return this.name; }
        valueOf(): any { return this.name; }
    }

    export interface IStaticProperty extends $StaticProperty { }
    export var StaticProperty = $StaticProperty['$StaticProperty Factory'].$__type;

   // =======================================================================================================================

    /** Represents a GraphItem instance property which holds a reference to the related static property information, and also stores the current instance value. */
    export class Property extends $PropertyEventBase {
        // -------------------------------------------------------------------------------------------------------------------

        /** The 'GraphItem' instance or static type that this property belongs to. */
        owner: IGraphNode;

        /** A reference to the static property information for the property instance. */
        staticProperty: $StaticProperty; // WARNING: This is null for non-registered "ad-hoc" properties.

        /** The current instance value for the property.
        * Note: You shouldn't read this directly unless you wish to bypass the filters.  Call 'getValue()' instead.
        * If you MUST access this value, you'll have to use the "(<any>property).value" format.
        */
        private value: any;

        private valueIsProperty: boolean; // (true if the value is another property reference)

        private __timeoutHandle: number;

        // -------------------------------------------------------------------------------------------------------------------

        constructor(owner: IGraphNode, staticProperty: $StaticProperty, value: any) {
            super();
            this.owner = owner;
            this.staticProperty = staticProperty;
            this.value = value;
        }

        // -------------------------------------------------------------------------------------------------------------------

        setValue(value: any, triggerChangeEvents: boolean = true): void {
            if (value !== this.value) {
                if (triggerChangeEvents && this.owner.__initialProperties) { // (events are never triggered until the initial layout call has been made, since constructors may be setting up properties)
                    if (this.staticProperty && this.staticProperty.interceptors) // (note: ad-hoc properties don't have static info)
                        value = this.staticProperty.__DoOnPropertyChanging(this.owner, this, value);

                    if (this.owner.interceptors)
                        value = this.owner.__DoOnPropertyChanging(this.owner, this, value);

                    if (this.interceptors)
                        value = this.__DoOnPropertyChanging(this.owner, this, value); // (the more local call takes precedence [has the final say])
                }

                this.value = value;
                this.valueIsProperty = typeof value === 'object' && value instanceof Property;

                if (triggerChangeEvents && this.owner.__initialProperties) { // (events are never triggered until the initial layout call has been made, since constructors may be setting up properties)
                    if (this.triggerChangedEvent())
                        this.owner.onRedraw(true); // (make sure to update the display if a UI related property has changed)
                }
            }
        }

        getValue(): any {
            var value = (this.valueIsProperty && this.value !== this) ? (<Property>this.value).getValue() : this.value;

            if (this.owner.__initialProperties) { // (events are never triggered until the initial layout call has been made, since constructors may be setting up properties)
                if (this.staticProperty && this.staticProperty.filters) // (note: ad-hoc properties don't have static info)
                    value = this.staticProperty.__FilerValue(this.owner, this, value);

                if (this.owner.filters)
                    value = this.owner.__FilerValue(this.owner, this, value);

                if (this.filters)
                    value = this.__FilerValue(this.owner, this, value); // (the more local call takes precedence [has the final say])
            }

            return value;
        }

        hasValue(): boolean { return !!this.value; }

        // -------------------------------------------------------------------------------------------------------------------

        /** Trigger a 'changed' event - useful for reverting state changes made directly on UI elements. Also called initially
        * on new UI elements during the initial layout phase.  */
        triggerChangedEvent(initialValue: boolean = false) {
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

            return this.staticProperty && this.staticProperty.isVisual && host.isClient();
        }

        // -------------------------------------------------------------------------------------------------------------------

        toString(): string { return (this.value || "").toString(); }
        toLocaleString(): string { return (this.value || "").toLocaleString(); }
        valueOf(): any { return this.value; }

        // -------------------------------------------------------------------------------------------------------------------

        /** Creates a deep copy of this graph item property instance via a call to 'Utilities.clone()'. */
        clone(): Property { return new Property(this.owner, this.staticProperty, Utilities.clone(this.value)); }

        // -------------------------------------------------------------------------------------------------------------------
    }

    // =======================================================================================================================

    export interface IProperties { [index: string]: Property; }

    // =======================================================================================================================
}

// ###########################################################################################################################
