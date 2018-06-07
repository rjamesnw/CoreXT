declare namespace CoreXT.System.Platform {
    interface PropertyChangedHandler {
        (item: IGraphNode, property: IProperty): void;
    }
    /** Called BEFORE a property changes.
    * This is called if there's a need to modify property values as they are set.  This is similar to a filter function, except
    * the resulting value is persisted.
    * Note: The interceptor function MUST return either the new value passed in, or something else.
    */
    interface InterceptorCallback {
        (property: IProperty, newValue: any): any;
    }
    /** Called AFTER a property changes.
    * This is called if there's a need to be notified when properties have changed.
    * The parameter 'initialValue' is true when a graph item is being initialized for the first time. Use this to prevent
    * updating the UI in special cases (such as in UI.HTML, which initially prevents updating 'innerHTML',
    * which would destroy the child nodes).
    */
    interface ListenerCallback {
        (property: IProperty, initialValue: boolean): void;
    }
    /** Called when a property is being read from.
    * When properties are read from, any associated filters are executed to modify the underlying value before it gets returned
    * to the caller (such as when formatting data - example: converting 'M' to 'Male', '20131006' to 'October 6th, 2013', or
    * trimming spaces/formatting text, etc.).
    * Note: The filter function MUST return either the value passed in, or a new value.
    */
    interface FilterCallback {
        (property: IProperty, value: any): any;
    }
    const PropertyEventBase_base: {
        new (): {
            $__disposing?: boolean;
            $__disposed?: boolean;
        };
        $__type: IType<object>;
        readonly super: typeof EventObject;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
        $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
            $__type: TClass;
        }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
    };
    class PropertyEventBase extends PropertyEventBase_base {
        /**
           * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
           * layout that can render a view, or partial view.
           * @param parent If specified, the value will be wrapped in the created object.
           */
        static 'new'(): IPropertyEventBase;
        static init(o: IPropertyEventBase, isnew: boolean): void;
    }
    namespace PropertyEventBase {
        const $__type_base: typeof EventObject.$__type;
        class $__type extends $__type_base {
            /** A list of callbacks to execute BEFORE a value changes. */
            interceptors: InterceptorCallback[];
            /** A list of callbacks to execute AFTER a value changes. */
            listeners: ListenerCallback[];
            /** A series of callbacks to pass a value through when a property is read.  This allows derived types to convert
            * or translate inherited property values into new values as they are passed down the inheritance hierarchy chain. */
            filters: FilterCallback[];
            /**
            * @param {Property} property The source of this event.
            */
            __DoOnPropertyChanging(owner: IPropertyEventBase, property: IProperty, newValue: any): any;
            /**
            * @param {Property} property The source of this event.
            */
            __DoOnPropertyChanged(owner: IPropertyEventBase, property: IProperty, initialValue: boolean): void;
            /**
            * @param {Property} property The source of this event.
            * @param {any} value The result of each filter call is passed into this parameter for each successive call (in filter creation order).
            */
            __FilerValue(owner: IPropertyEventBase, property: IProperty, value: any): void;
            /** A list of callbacks to execute BEFORE this value changes. */
            registerInterceptor(interceptor: InterceptorCallback): void;
            unregisterInterceptor(interceptor: InterceptorCallback): void;
            /** A list of callbacks to execute AFTER this value changes. */
            registerListener(listener: ListenerCallback): void;
            unregisterListener(listener: ListenerCallback): void;
            /** Filters are called when a property is being read from.
            * Derived types should create filters if there's a need to notify a stored value before use (such as when formatting data,
            * such as converting 'M' to 'Male', '20131006' to 'October 6th, 2013', or trimming spaces/formatting text, etc.).
            */
            registerFilter(filter: FilterCallback): void;
            unregisterFilter(filter: FilterCallback): void;
        }
    }
    interface IPropertyEventBase extends PropertyEventBase.$__type {
    }
    const StaticProperty_base: {
        new (): {
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
    };
    class StaticProperty extends StaticProperty_base {
        /**
           * Creates a new basic GraphNode type.  A graph node is the base type for all UI related elements.  It is a logical
           * layout that can render a view, or partial view.
           * @param parent If specified, the value will be wrapped in the created object.
           */
        static 'new'(name: string, isVisual: boolean): IStaticProperty;
        static init(o: IStaticProperty, isnew: boolean, name: string, isVisual: boolean): void;
    }
    namespace StaticProperty {
        const $__type_base_1: typeof PropertyEventBase.$__type;
        class $__type extends $__type_base_1 {
            owner: typeof GraphNode.$__type;
            /** An internal name for the property.  This will also be the attribute set on the underlying UI element (so a name
            * of 'id' would set the 'id' attribute of the element). */
            name: string;
            /** The default value for new related instance properties. */
            defaultValue: any;
            /** If true (false by default), then 'onRedraw()' will be called when this property is updated. */
            isVisual: boolean;
            createPropertyInstance(owner: IGraphNode, value?: any): IProperty;
            toString(): string;
            toLocaleString(): string;
            valueOf(): any;
        }
    }
    interface IStaticProperty extends StaticProperty.$__type {
    }
    const Property_base: {
        new (): {
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
    };
    /** Represents a GraphItem instance property which holds a reference to the related static property information, and also stores the current instance value. */
    class Property extends Property_base {
        static 'new'(owner: IPropertyEventBase, staticProperty: IStaticProperty, value: any): IProperty;
        static init: (o: IProperty, isnew: boolean, owner: IPropertyEventBase, staticProperty: IStaticProperty, value: any) => void;
    }
    namespace Property {
        const $__type_base_2: typeof PropertyEventBase.$__type;
        class $__type extends $__type_base_2 {
            /** The 'GraphItem' instance that this property belongs to. */
            owner: IPropertyEventBase;
            /** A reference to the static property information for the property instance. */
            staticProperty: IStaticProperty;
            /** The current instance value for the property.
                * Note: You shouldn't read this directly unless you wish to bypass the filters.  Call 'getValue()' instead.
                * If you MUST access this value, you'll have to use the "(<any>property).value" format.
                */
            private __value;
            private __valueIsProperty;
            private __timeoutHandle;
            setValue(value: any, triggerChangeEvents?: boolean): void;
            getValue(): any;
            hasValue(): boolean;
            /** Trigger a 'changed' event - useful for reverting state changes made directly on UI elements. Also called initially
            * on new UI elements during the initial layout phase.  */
            triggerChangedEvent(initialValue?: boolean): boolean;
            toString(): string;
            toLocaleString(): string;
            valueOf(): any;
            /** Creates a deep copy of this graph item property instance via a call to 'Utilities.clone()'. */
            clone(): IProperty;
        }
    }
    interface IProperty extends Property.$__type {
    }
    interface IProperties {
        [index: string]: IProperty;
    }
}
