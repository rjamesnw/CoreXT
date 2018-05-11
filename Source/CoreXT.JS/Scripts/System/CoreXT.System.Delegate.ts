// ###########################################################################################################################
// Callback Delegates (serializable - closures should not be used)
// ###########################################################################################################################

namespace CoreXT.System {
    registerNamespace("CoreXT", "System");
    // =======================================================================================================================

    export interface DelegateFunction<TObj extends object=object> { (...args: any[]): any };

    /** 
     * Represents a function of a specific object instance.
     * Functions have no reference to any object instance when invoked statically.  This means when used as "handlers" (callbacks)
     * the value of the 'this' reference is either the global scope, or undefined (in strict mode).   Delegates couple the target
     * object instance (context of the function call [using 'this']) with a function reference.  This allows calling a function
     * on a specific object instance by simply invoking it via the delegate. If not used with closures, a delegate may also be
     * serialized.
     * Note: If the target object is undefined, then 'null' is assumed and passed in as 'this'.
     */
    export var Delegate = ClassFactory(System, Object,
        (base) => {
            class Delegate<TObj extends object, TFunc extends DelegateFunction<object>> extends base {

                //? static readonly $Type = $Delegate;

                /** Implements a more efficient '{function}.apply()' function when a small number of parameters are supplied. */
                static fastApply?(func: Function, context: {}, args: { [index: number]: any; length: number; }): any;

                /** Implements a more efficient '{function}.call()' function when a small number of parameters are supplied. */
                static fastCall?(func: Function, context: {}, ...args: any[]): any;

                private ___static_ctor(): void {
                    /** Generates "case" statements for function templates.  The function template is converted into a string, the resulting cases get inserted,
                      * and the compiled result is returned.  This hard-codes the logic for greatest speed, and if more parameters are need, can easily be expanded.
                    */
                    function makeCases(argsIndexStart: number, caseCountMax: number, func: Function, funcName: string, contextStr: string, argsStr: string): Function {
                        var ftext = func.toString();
                        var matchRegex = /^.*case 1:.*/m;
                        var cases = "", argtext = "";
                        for (var i = argsIndexStart, n = argsIndexStart + caseCountMax; i < n; ++i)
                            cases += "case " + (1 + i) + ": return " + funcName + "(" + contextStr + (argtext += argsStr + "[" + i + "], ") + "this);\r\n";
                        return safeEval("(" + ftext.replace(matchRegex, cases) + ")");
                    }
                    // TODO: Look into using the "...spread" operator for supported browsers, based on support: https://goo.gl/a5tvW1

                    Delegate.fastApply = <any>makeCases(0, 20, function (func: Function, context: {}, args: { [index: number]: any; length: number; }) {
                        if (!arguments.length) throw Exception.error("Delegate.fastApply()", "No function specified.");
                        if (typeof func !== 'function') throw Exception.error("Delegate.fastApply()", "Function object expected.");
                        if (arguments.length == 1 || context == void 0 && (args == void 0 || !args.length)) return func();
                        switch (args.length) {
                            case 1: return func.call(context, args[0]); /* (this line is matched by the regex and duplicated as needed) */
                            default: return func.apply(context, args); /* (no arguments supplied) */
                        }
                    }, "func.call", "context, ", "args");

                    Delegate.fastCall = <any>makeCases(0, 20, function (func: Function, context: {}) {
                        if (!arguments.length) throw Exception.error("Delegate.fastCall()", "No function specified.");
                        if (typeof func !== 'function') throw Exception.error("Delegate.fastApply()", "Function object expected.");
                        var restArgsLength = arguments.length - 2; /* (subtract func and context parameters from the count to get the "...rest" args) */
                        if (arguments.length == 1 || context == void 0 && !restArgsLength) return func();
                        switch (restArgsLength) {
                            case 1: return func.call(context, arguments[0]); /* (this line is matched by the regex and duplicated as needed) */
                            default: return func.apply(context, arguments); /* (no arguments supplied) */
                        }
                    }, "func.call", "context, ", "arguments");

                    Delegate.prototype.invoke = <any>makeCases(0, 20, function () {
                        var $this = <Delegate<TObj, TFunc>>this;
                        if (!arguments.length) return $this.func(this.object, this);
                        var context = (arguments[0] === void 0) ? $this : arguments[0];
                        switch (arguments.length) {
                            case 1: return $this.func(context, arguments[1], this);
                            default: return $this.func.apply(this, [context].concat(arguments, this));
                        }
                    }, "$this.func", "context, ", "arguments");

                    var call = function () {
                        var $this = <Delegate<TObj, TFunc>>this;
                        if (!arguments.length) return $this.func(this.object, this);
                        switch (arguments.length) {
                            case 1: return $this.func($this.object, arguments[1], this);
                            default: return $this.func.apply(this, [$this.object].concat(<TObj[]><any>arguments, this));
                        }
                    };
                    Delegate.prototype.call = <any>((Browser.type != Browser.BrowserTypes.IE) ?
                        makeCases(0, 20, call, "$this.func", "$this.object, ", "arguments")
                        : makeCases(0, 20, call, "$this.__boundFunc", "", "arguments"));

                    var apply = function (context: object, argsArray: any[]) { // (tests: http://jsperf.com/delegate-object-test/2)
                        var $this = <Delegate<TObj, TFunc>>this;
                        if (arguments.length == 1) { // (only array given)
                            argsArray = <any>context;
                            context = $this.object;
                        } else if (arguments.length > 1 && $this.apply != $this.__apply)
                            return $this.__apply(context, argsArray); // (only the non-bound version can handle context changes)
                        if (argsArray == void 0 || !argsArray.length) return $this.invoke(context, this);
                        switch (argsArray.length) {
                            case 1: return $this.func(context, argsArray[0], this);
                            default: return $this.func.apply(this, [context].concat(argsArray, this));
                        }
                    };
                    Delegate.prototype.__apply = <any>makeCases(0, 20, apply, "$this.func", "context, ", "args"); // (keep reference to the non-bound version as a fallback for user defined contexts)
                    Delegate.prototype.apply = <any>((Browser.type != Browser.BrowserTypes.IE) ? Delegate.prototype.__apply : makeCases(0, 20, apply, "$this.__boundFunc", "", "args")); // (note: bound functions are faster in IE)
                }
                private static __static_ctor = Delegate.prototype.___static_ctor();

                /** A read-only key string that uniquely identifies the combination of object instance and function in this delegate.
                * This property is set for new instances by default.  Calling 'update()' will update it if necessary.
                */
                get key() { return this.__key; }
                private __key: string;

                /** The function to be called on the associated object. */
                func: IFunctionInfo;
                private __boundFunc: TFunc;
                private __functionText: string;

                /** The instance on which the associated function will be called.  This should be undefined/null for static functions. */
                object: TObj;

                //? private static $this_REPLACE_REGEX = /([^A-Za-z$_\.])this([^A-Za-z$_])/gm;

                /** If the 'object' or 'func' properties are modified directly, call this function to update the internal bindings. */
                update() {
                    if (typeof this.func != 'function')
                        Exception.error("Delegate", "The function value is not a function:\r\n {Delegate}.func = " + this.func, this.func);
                    if (this.func.bind)
                        this.__boundFunc = this.func.bind(this, this.object); // (this can be faster in some cases [i.e. IE])
                    if (this.object instanceof Object)
                        this.__key = Delegate.getKey(<any>this.object, this.func); // (this also validates the properties first)
                    else
                        this.__key = void 0;
                    return this;
                }

                private static __validate(callername: string, object: NativeTypes.IObject, func: DelegateFunction<object>): boolean { // (returns 'true' if static)
                    var isstatic: boolean = object === void 0 || object === null || !!(<INamespaceInfo><any>object).$__fullname; // ('$__fullname' exists on modules and registered type objects)
                    if (!isstatic && typeof object.$__id != 'number')
                        throw Exception.error("Delegate." + callername, "The object for this delegate does not contain a numerical '$__id' value (used as a global object reference for serialization), or '$__fullname' value (for static type references).  See 'AppDomain.registerClass()'.", this);
                    return isstatic;
                }

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
                private __apply: (context: {}, args: any[]) => any; // (used as a fallback in case '__boundFunc' is used in the 'apply' routine)

                /** Attempts to serialize the delegate.  This can only succeed if the underlying object reference is registered with 
                * an 'AppDomain', and the underlying function reference implements 'IFunctionInfo' (for the '$__name' property).  Be
                * careful when using function closures, as only the object ID and function name are stored. The object ID and function
                * name are used to look up the object context and function when loading from saved data.
                */
                getData(data: SerializedData): void {
                    var isstatic = Delegate.__validate("getData()", this.object, this.func);
                    if (!isstatic)
                        data.addValue("id", (<IDomainObjectInfo><any>this.object).$__id);
                    data.addValue("ft", this.__functionText);
                }
                /**
                 * Load this delegate from serialized data (See also: getData()).
                 * @param data
                 */
                setData(data: SerializedData): void {
                    var objid = data.getNumber("id");
                    this.object = (<IDomainObjectInfo><any>this).$__appDomain.objects.getObjectForceCast<TObj>(objid);
                    this.__functionText = data.getValue("ft");
                    this.update();
                    // TODO: Consider functions that implement ITypeInfo, and use that if they are registered.
                }

                /** Creates and returns a string that uniquely identifies the combination of the object instance and function for
                  * this delegate.  Since every delegate has a unique object ID across an application domain, key strings can help
                  * prevent storage of duplicate delegates all pointing to the same target.
                  * Note: The underlying object and function must be registered types first.
                  * See 'AppDomain.registerClass()/.registerType()' for more information.
                  */
                static getKey<TFunc extends DelegateFunction<object>>(object: IObject, func: TFunc): string {
                    var isstatic = Delegate.__validate("getKey()", object, func);
                    var id = isstatic ? (object === void 0 || object === null ? '-1' : (<INamespaceInfo><any>object).$__fullname) : object.$__id.toString();
                    return id + "," + (<IFunctionInfo><any>func).$__name; // (note: -1 means "global scope")
                }

                equal(value: any): boolean {
                    return typeof value == 'object' && value instanceof Delegate
                        && (<Delegate<any, any>>value).object === this.object && (<Delegate<any, any>>value).func === this.func;
                }

                // -------------------------------------------------------------------------------------------------------------------
                // This part uses the CoreXT factory pattern

                protected static readonly 'DelegateFactory' = class Factory extends FactoryBase(Delegate, base['ObjectFactory'])<object, DelegateFunction<object>> {
                    /**
                     * Constructs a new Delegate object.
                     * @param {Object} object The instance on which the associated function will be called.  This should be undefined/null for static functions.
                     * @param {Function} func The function to be called on the associated object.
                     */
                    static 'new'<TObj extends object, TFunc extends DelegateFunction<object>>(object: TObj, func: TFunc): Delegate<TObj, TFunc> { return null; }

                    /**
                     * Reinitializes a disposed Delegate instance.
                     * @param o The Delegate instance to initialize, or re-initialize.
                     * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
                     * @param object The instance to bind to the resulting delegate object.
                     * @param func The function that will be called for the resulting delegate object.
                     */
                    static init<TObj extends object, TFunc extends DelegateFunction<object>>(o: Delegate<TObj, TFunc>, isnew: boolean, object: TObj, func: TFunc) {
                        this.super.init(o, isnew);
                        if (object === void 0) object = null;
                        o.object = object;
                        o.func = <any>func;
                        o.update();
                        return o;
                    }
                };

                // -------------------------------------------------------------------------------------------------------------------
            }
            return [Delegate, Delegate["DelegateFactory"]];
        },
        "Delegate"
    );

    declare class DelegateClass<TObj extends object, TFunc extends DelegateFunction<object>> extends Delegate.$__type<TObj, TFunc> { }
    export interface IDelegate<TObj extends object=object, TFunc extends DelegateFunction<object>=DelegateFunction<object>> extends DelegateClass<TObj, TFunc> { }

    // =======================================================================================================================
}

