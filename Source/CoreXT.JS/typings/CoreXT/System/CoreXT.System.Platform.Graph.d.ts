declare namespace CoreXT.System.Platform {
    interface IEvents {
        [index: string]: Events.IEventDispatcher<IGraphNode, (ev: Event) => any>;
    }
    const GraphNode_base: {
        new (...args: any[]): {
            $__disposing?: boolean;
            $__disposed?: boolean;
        };
        $__type: IType<object>;
        readonly super: typeof PropertyEventBase;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
        $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
            $__type: TClass;
        }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
    } & (new () => object);
    /** A graph item represents a single node on the application graph. */
    class GraphNode extends GraphNode_base {
        /**
            * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
            * layout that can render a view, or partial view.
            * @param parent If specified, the value will be wrapped in the created object.
            */
        static 'new'(parent?: IGraphNode): IGraphNode;
        static init(o: IGraphNode, isnew: boolean, parent?: IGraphNode): void;
        /** Registers a list of UI attribute names that, when updated, may trigger a redraw event.
        * @param {GraphItem} factory Your derived 'GraphItem' type.
        * @param {string} name The property name to set internally (this can be different from the static property name).
        * Note: The name you choose will also be set as an attribute on the element, so for example, using 'id' or 'name'
        * as a name will also update the underlying element's 'id' and 'name' attributes.
        * @param {boolean} isVisual Set this to true on properties that affect the visual display of an element.  For example,
        * some derived graph items may contain text, size, or color type properties that, when updated, should be reflected on
        * the UI.  This is managed internally by automatically triggering a call to 'onRedraw()' to update the visual state.
        * @param {Function} changedCallback A callback to execute when the property has changed.
        * @param {Function} changingCallback A callback to execute before the property changes.
        */
        static registerProperty(factory: IFactory, name: string, isVisual?: boolean, changedCallback?: ListenerCallback, changingCallback?: InterceptorCallback): IStaticProperty;
        /** This is a counter used to get a unique ID to all graph items. */
        private static __nextID;
        /** The UI map is week mapping used to associate graph nodes with UI elements. */
        static readonly uiElementMap: WeakMap<object, IGraphNode>;
        private static _uiElementMap;
        /** Returns a default accessor (get/set) function to be used when creating accessor functions in GraphItem derived types.
        * When 'GraphItem' is extended, the developer normally creates special "property functions" that get and set values in
        * the internal 'properties' observable array (such as "x = obj.X()" for "get", and "obj.X(x)" for "set"+"get").
        * The 'observablePropertyName' parameter is the name that will be used when calling '{GraphItem}.setProperty()' and
        * '{GraphItem}.getProperty()' (which ultimately updates the 'properties' array, allowing listeners to be notified).
        * Typically, the properties used with accessors include HTML attributes specific to a particular element, but can
        * also include custom attributes not part of the element object as well. This allows creating special element
        * objects that are a combination of multiple elements, allowing for a very flexible UI model.
        */
        static accessor: (registeredProperty: IStaticProperty) => any;
    }
    namespace GraphNode {
        const $__type_base: typeof PropertyEventBase.$__type;
        class $__type extends $__type_base {
            /** The ID of this graph item, which is useful for synchronizing the graph tree with the server side. */
            _id: number;
            /** A globally unique name for this graph item. */
            _name: string;
            /** The display name for this graph item, which is useful if developing in an IDE. */
            _displayName: string;
            __parent: IGraphNode;
            __children: IArray<IGraphNode>;
            /** Holds a collection of properties, indexed by property name, that are used by the active instance.
            */
            __properties: IProperties;
            /**
            * Holds a copy of the 'properties' collection before the application starts (set during the initial layout phase).
            * This allows quick restarting the application later if desired.
            */
            __initialProperties: IProperties;
            /** Holds a list of event handlers indexed by event name for this GraphItem instance. */
            __events: IEvents;
            /** Holds a list of registered handlers to be notified when any property changes within this graph item. */
            __propertyChangedHandlers: PropertyChangedHandler[];
            isInitialized(): boolean;
            /** Causes the instance '__properties' collection to be replaced by a brand-new copy of the property values in the '__initialProperties' collection. */
            resetProperties(): void;
            /** This is called internally in the layout phase upon creating elements for the first time. */
            updateInitialProperties(): void;
            /** Sets an observable property value on the graph item object.
            * Observable properties can trigger events to allow the UI to update as required.
            * @see also: {@link getProperty}
            * @param {boolean} triggerChangeEvent If true (default), causes a change event to be triggered.  Set this to false to prevent any listeners from being called.
            */
            setValue(property: IStaticProperty, value: any, triggerChangeEvents?: boolean): this;
            /** Sets an observable property value on the graph item object.
            * Observable properties can trigger events to allow the UI to update as required.
            * @see also: {@link getProperty}
            * @param {boolean} triggerChangeEvent If true (default), causes a change event to be triggered.  Set this to false to prevent any listeners from being called.
            */
            setValue(name: string, value: any, triggerChangeEvents?: boolean): this;
            /** An optional function that is called to let derived types know that a value is being set.  This allows any associated UI elements to also update, if any. */
            protected onPropertyValueSet?(name: string, value: any): void;
            /** Gets an observable property value from the graph item object.
            * Observable properties can trigger events to allow the UI to update as required.
            * @see also: {@link setProperty}
            */
            getValue(property: IStaticProperty): any;
            /** Gets an observable property value from the graph item object.
            * Observable properties can trigger events to allow the UI to update as required.
            * @see also: {@link setProperty}
            */
            getValue(name: string): any;
            /** Returns the instance property details for the specified static property definition. */
            getProperty(property: IStaticProperty): IProperty;
            /** Returns the instance property details for the specified property name. */
            getProperty(name: string): IProperty;
            /** Copies over properties from the specified graph item. */
            copyProperties(graphItem: IGraphNode, ...excludeList: string[]): void;
            __DoOnAnyPropertyChanged(property: IProperty): void;
            /** Adds a handler that will be called when a property is added, modified, or deleted.
            * @see also: {@link removePropertyChangedHandler}
            */
            addPropertyChangedHandler(handler: PropertyChangedHandler): void;
            /** Removes property change handlers.
            * @see also: {@link addPropertyChangedHandler}
            */
            removePropertyChangedHandler(handler: PropertyChangedHandler): void;
            /** Returns the event manager object for the specified event name. */
            getEvent(eventName: string): Events.IEventDispatcher<IGraphNode, (ev: Event) => any>;
            /** Attaches an event handler to the specified event name and returns the event entry. */
            on(eventName: string, handler: (ev: Event) => any): Events.IEventDispatcher<IGraphNode, (ev: Event) => any>;
            /** Detaches an event handler from the specified event name and returns the event entry. */
            off(eventName: string, handler: (ev: Event) => any): Events.IEventDispatcher<IGraphNode, (ev: Event) => any>;
            /** Removes all event handlers for the specified event name and returns the event entry. */
            clearHandlers(eventName: string): Events.IEventDispatcher<IGraphNode, (ev: Event) => any>;
            addChild(item: IGraphNode): IGraphNode;
            /** Detaches this GraphItem from the logical graph tree, but does not remove it from the parent's child list.
              * Only call this function if you plan to manually remove the child from the parent.
              */
            detach(): this;
            removeChildAt(itemIndex: number): IGraphNode;
            removeChild(item: IGraphNode): IGraphNode;
            removeAllChildren(): IGraphNode[];
            /** Returns the graph item with the specified ID (similar to 'getElementById()'). */
            getItem(id: string): IGraphNode;
            /** The function is called by the system in order to generate/update the initial properties and HTML elements for display.
            * @param {boolean} recursive Set to false to only update this graph item, ignoring all children.
            */
            updateLayout(recursive?: boolean): void;
            protected onUpdateLayout?(): void;
            /** The function is called in order to produce an HTML element that represents the graph item.
                * The base class, by default, simply returns a new 'HTMLDivElement' element (which doesn't display anything).
                * It is expected that implementers will override this function in derived classes if any custom UI is to be generated.
                * If the derived type doesn't represent a UI element, don't override this function.
                */
            createUIElement(): Node;
            /** Updates the visual display of all child graph items (@see GraphItem.updateLayout).
            * Expected to be overridden by derived types that store their layout/css information in the observable properties.
            * This function is called when properties are completely replaced (such as when loading a project), rather than
            * calling an event for each property set, which can be much slower.
            * Typically, derived types simply update their CSS, innerHTML, or both, in this function.
            */
            onRedraw(recursive?: boolean): void;
            /** Returns an enumerable that can be used to iterate over the child graph items. */
            asEnumerable(): IEnumerable<IGraphNode>;
            /**
             * Returns an iterator to support Iteration for ES5/ES3.
             */
            iterator(): IEnumerable<IGraphNode>;
        }
    }
    interface IGraphNode extends GraphNode.$__type {
    }
}
