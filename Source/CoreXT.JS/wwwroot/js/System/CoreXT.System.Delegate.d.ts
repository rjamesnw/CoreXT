declare namespace CoreXT.System {
    interface DelegateFunction<TObj extends object = object> {
        (...args: any[]): any;
    }
    const Delegate_base: {
        new (): {
            $__disposing?: boolean;
            $__disposed?: boolean;
        };
        $__type: IType<object>;
        readonly super: typeof Object;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
        $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
            $__type: TClass;
        }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
    };
    /**
     * Represents a function of a specific object instance.
     * Functions have no reference to any object instance when invoked statically.  This means when used as "handlers" (callbacks)
     * the value of the 'this' reference is either the global scope, or undefined (in strict mode).   Delegates couple the target
     * object instance (context of the function call [using 'this']) with a function reference.  This allows calling a function
     * on a specific object instance by simply invoking it via the delegate. If not used with closures, a delegate may also be
     * serialized.
     * Note: If the target object is undefined, then 'null' is assumed and passed in as 'this'.
     */
    class Delegate extends Delegate_base {
        /**
         * Constructs a new Delegate object.
         * @param {Object} object The instance on which the associated function will be called.  This should be undefined/null for static functions.
         * @param {Function} func The function to be called on the associated object.
         */
        static 'new': <TObj extends object, TFunc extends DelegateFunction>(object: TObj, func: TFunc) => IDelegate<TObj, TFunc>;
        /**
        * Reinitializes a disposed Delegate instance.
        * @param o The Delegate instance to initialize, or re-initialize.
        * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
        * @param object The instance to bind to the resulting delegate object.
        * @param func The function that will be called for the resulting delegate object.
        */
        static init: <TObj extends object, TFunc extends DelegateFunction>(o: IDelegate<TObj, TFunc>, isnew: boolean, ...args: any[]) => void;
        /**
         * Implements a more efficient '{function}.apply()' function when a small number of parameters are supplied.
         * This works better because a direct function call 'o.func(args[0], args[1], etc...)' is many times faster than 'o.func.apply(o, args)'.
         */
        static fastApply?(func: Function, context: {}, args: {
            [index: number]: any;
            length: number;
        }): any;
        /**
         * Implements a more efficient '{function}.call()' function when a small number of parameters are supplied.
         * This works better because a direct function call 'o.func(args[0], args[1], etc...)' is many times faster than 'o.func.apply(o, args)'.
         */
        static fastCall?(func: Function, context: {}, ...args: any[]): any;
        /** Creates and returns a string that uniquely identifies the combination of the object instance and function for
         * this delegate.  Since every delegate has a unique object ID across an application domain, key strings can help
         * prevent storage of duplicate delegates all pointing to the same target.
         * Note: The underlying object and function must be registered types first.
         * See 'AppDomain.registerClass()/.registerType()' for more information.
         */
        static getKey<TFunc extends DelegateFunction>(object: IObject, func: TFunc): string;
        protected static __validate(callername: string, object: NativeTypes.IObject, func: DelegateFunction): boolean;
    }
    namespace Delegate {
        const $__type_base: typeof Object.$__type;
        class $__type<TObj extends object, TFunc extends DelegateFunction> extends $__type_base {
            /** A read-only key string that uniquely identifies the combination of object instance and function in this delegate.
            * This property is set for new instances by default.  Calling 'update()' will update it if necessary.
            */
            readonly key: string;
            private __key;
            /** The function to be called on the associated object. */
            func: IFunctionInfo;
            private __boundFunc;
            private __functionText;
            /** The instance on which the associated function will be called.  This should be undefined/null for static functions. */
            object: TObj;
            /** If the 'object' or 'func' properties are modified directly, call this function to update the internal bindings. */
            update(): this;
            /** Invokes the delegate directly. Pass undefined/void 0 for the first parameter, or a custom object context. */
            invoke: TFunc;
            /** Invoke the delegate with a fixed number of arguments (do not pass the object context ['this'] as the first parameter - use "invoke()" instead).
            * Note: This does not simply invoke "call()" on the function, but implements much faster calling patterns based on number of arguments, and browser type.
            */
            call: (...args: any[]) => any;
            /** Invoke the delegate using an array of arguments.
            * Note: This does not simply invoke "apply()" on the function, but implements much faster calling patterns based on number of arguments, and browser type.
            */
            apply: {
                /** Invoke the delegate using an array of arguments.
                * Note: This does not simply invoke "apply()" on the function, but implements much faster calling patterns based on number of arguments, and browser type.
                */
                (args: any[]): any;
                /** Invoke the delegate using a specific object context and array of arguments.
                * Note: This does not simply invoke "apply()" on the function, but implements much faster calling patterns based on number of arguments, and browser type.
                */
                (context: {}, args: any[]): any;
            };
            private __apply;
            /** Attempts to serialize the delegate.  This can only succeed if the underlying object reference is registered with
            * an 'AppDomain', and the underlying function reference implements 'IFunctionInfo' (for the '$__name' property).  Be
            * careful when using function closures, as only the object ID and function name are stored. The object ID and function
            * name are used to look up the object context and function when loading from saved data.
            */
            getData(data: SerializedData): void;
            /**
             * Load this delegate from serialized data (See also: getData()).
             * @param data
             */
            setData(data: SerializedData): void;
            equal(value: any): boolean;
        }
    }
    interface IDelegate<TObj extends object = object, TFunc extends DelegateFunction = DelegateFunction> extends Delegate.$__type<TObj, TFunc> {
    }
}
