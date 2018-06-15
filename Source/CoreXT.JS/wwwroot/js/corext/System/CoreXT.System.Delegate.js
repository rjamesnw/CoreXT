// ###########################################################################################################################
// Callback Delegates (serializable - closures should not be used)
// ###########################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        CoreXT.namespace(function () { return CoreXT.System; });
        ;
        /**
         * Represents a function of a specific object instance.
         * Functions have no reference to any object instance when invoked statically.  This means when used as "handlers" (callbacks)
         * the value of the 'this' reference is either the global scope, or undefined (in strict mode).   Delegates couple the target
         * object instance (context of the function call [using 'this']) with a function reference.  This allows calling a function
         * on a specific object instance by simply invoking it via the delegate. If not used with closures, a delegate may also be
         * serialized.
         * Note: If the target object is undefined, then 'null' is assumed and passed in as 'this'.
         */
        var Delegate = /** @class */ (function (_super) {
            __extends(Delegate, _super);
            function Delegate() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /** Creates and returns a string that uniquely identifies the combination of the object instance and function for
             * this delegate.  Since every delegate has a unique object ID across an application domain, key strings can help
             * prevent storage of duplicate delegates all pointing to the same target.
             * Note: The underlying object and function must be registered types first.
             * See 'AppDomain.registerClass()/.registerType()' for more information.
             */
            Delegate.getKey = function (object, func) {
                var isstatic = Delegate.__validate("getKey()", object, func);
                var id = isstatic ? (object === void 0 || object === null ? '-1' : object.$__fullname) : object.$__id.toString();
                return id + "," + func.$__name; // (note: -1 means "global scope")
            };
            Delegate.__validate = function (callername, object, func) {
                var isstatic = object === void 0 || object === null || !!object.$__fullname; // ('$__fullname' exists on modules and registered type objects)
                if (!isstatic && typeof object.$__id != 'number')
                    throw System.Exception.error("Delegate." + callername, "The object for this delegate does not contain a numerical '$__id' value (used as a global object reference for serialization), or '$__fullname' value (for static type references).  See 'AppDomain.registerClass()'.", this);
                return isstatic;
            };
            return Delegate;
        }(CoreXT.FactoryBase(System.Object)));
        System.Delegate = Delegate;
        (function (Delegate) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                //? static readonly $Type = $Delegate;
                $__type.prototype[CoreXT.constructor] = function () {
                    /** Generates "case" statements for function templates.  The function template is converted into a string, the resulting cases get inserted,
                      * and the compiled result is returned.  This hard-codes the logic for greatest speed, and if more parameters are need, can easily be expanded.
                    */
                    function makeCases(argsIndexStart, caseCountMax, func, funcName, contextStr, argsStr) {
                        var ftext = func.toString();
                        var matchRegex = /^.*case 1:.*/m;
                        var cases = "", argtext = "";
                        for (var i = argsIndexStart, n = argsIndexStart + caseCountMax; i < n; ++i)
                            cases += "case " + (1 + i) + ": return " + funcName + "(" + contextStr + (argtext += argsStr + "[" + i + "], ") + "this);\r\n";
                        return CoreXT.safeEval("(" + ftext.replace(matchRegex, cases) + ")");
                    }
                    // TODO: Look into using the "...spread" operator for supported browsers, based on support: https://goo.gl/a5tvW1
                    Delegate.fastApply = makeCases(0, 20, function (func, context, args) {
                        if (!arguments.length)
                            throw System.Exception.error("Delegate.fastApply()", "No function specified.");
                        if (typeof func !== 'function')
                            throw System.Exception.error("Delegate.fastApply()", "Function object expected.");
                        if (arguments.length == 1 || context == void 0 && (args == void 0 || !args.length))
                            return func();
                        switch (args.length) {
                            case 1: return func.call(context, args[0]); /* (this line is matched by the regex and duplicated as needed) */
                            default: return func.apply(context, args); /* (no arguments supplied) */
                        }
                    }, "func.call", "context, ", "args");
                    Delegate.fastCall = makeCases(0, 20, function (func, context) {
                        if (!arguments.length)
                            throw System.Exception.error("Delegate.fastCall()", "No function specified.");
                        if (typeof func !== 'function')
                            throw System.Exception.error("Delegate.fastApply()", "Function object expected.");
                        var restArgsLength = arguments.length - 2; /* (subtract func and context parameters from the count to get the "...rest" args) */
                        if (arguments.length == 1 || context == void 0 && !restArgsLength)
                            return func();
                        switch (restArgsLength) {
                            case 1: return func.call(context, arguments[0]); /* (this line is matched by the regex and duplicated as needed) */
                            default: return func.apply(context, arguments); /* (no arguments supplied) */
                        }
                    }, "func.call", "context, ", "arguments");
                    $__type.prototype.invoke = makeCases(0, 20, function () {
                        var $this = this;
                        if (!arguments.length)
                            return $this.func(this.object, this);
                        var context = (arguments[0] === void 0) ? $this : arguments[0];
                        switch (arguments.length) {
                            case 1: return $this.func(context, arguments[1], this);
                            default: return $this.func.apply(this, [context].concat(arguments, this));
                        }
                    }, "$this.func", "context, ", "arguments");
                    var call = function () {
                        var $this = this;
                        if (!arguments.length)
                            return $this.func(this.object, this);
                        switch (arguments.length) {
                            case 1: return $this.func($this.object, arguments[1], this);
                            default: return $this.func.apply(this, [$this.object].concat(arguments, this));
                        }
                    };
                    $__type.prototype.call = ((System.Browser.type != System.Browser.BrowserTypes.IE) ?
                        makeCases(0, 20, call, "$this.func", "$this.object, ", "arguments")
                        : makeCases(0, 20, call, "$this.__boundFunc", "", "arguments"));
                    var apply = function (context, argsArray) {
                        var $this = this;
                        if (arguments.length == 1) { // (only array given)
                            argsArray = context;
                            context = $this.object;
                        }
                        else if (arguments.length > 1 && $this.apply != $this.__apply)
                            return $this.__apply(context, argsArray); // (only the non-bound version can handle context changes)
                        if (argsArray == void 0 || !argsArray.length)
                            return $this.invoke(context, this);
                        switch (argsArray.length) {
                            case 1: return $this.func(context, argsArray[0], this);
                            default: return $this.func.apply(this, [context].concat(argsArray, this));
                        }
                    };
                    $__type.prototype.__apply = makeCases(0, 20, apply, "$this.func", "context, ", "args"); // (keep reference to the non-bound version as a fallback for user defined contexts)
                    $__type.prototype.apply = ((System.Browser.type != System.Browser.BrowserTypes.IE) ? $__type.prototype.__apply : makeCases(0, 20, apply, "$this.__boundFunc", "", "args")); // (note: bound functions are faster in IE)
                };
                Object.defineProperty($__type.prototype, "key", {
                    /** A read-only key string that uniquely identifies the combination of object instance and function in this delegate.
                    * This property is set for new instances by default.  Calling 'update()' will update it if necessary.
                    */
                    get: function () { return this.__key; },
                    enumerable: true,
                    configurable: true
                });
                //? private static $this_REPLACE_REGEX = /([^A-Za-z$_\.])this([^A-Za-z$_])/gm;
                /** If the 'object' or 'func' properties are modified directly, call this function to update the internal bindings. */
                $__type.prototype.update = function () {
                    if (typeof this.func != 'function')
                        System.Exception.error("Delegate", "The function value is not a function:\r\n {Delegate}.func = " + this.func, this.func);
                    if (this.func.bind)
                        this.__boundFunc = this.func.bind(this, this.object); // (this can be faster in some cases [i.e. IE])
                    if (this.object instanceof System.Object.$__type)
                        this.__key = Delegate.getKey(this.object, this.func); // (this also validates the properties first)
                    else
                        this.__key = void 0;
                    return this;
                };
                /** Attempts to serialize the delegate.  This can only succeed if the underlying object reference is registered with
                * an 'AppDomain', and the underlying function reference implements 'IFunctionInfo' (for the '$__name' property).  Be
                * careful when using function closures, as only the object ID and function name are stored. The object ID and function
                * name are used to look up the object context and function when loading from saved data.
                */
                $__type.prototype.getData = function (data) {
                    var isstatic = Delegate['__validate']("getData()", this.object, this.func);
                    if (!isstatic)
                        data.addValue("id", this.object.$__id);
                    data.addValue("ft", this.__functionText);
                };
                /**
                 * Load this delegate from serialized data (See also: getData()).
                 * @param data
                 */
                $__type.prototype.setData = function (data) {
                    var objid = data.getNumber("id");
                    this.object = this.$__appDomain.objects.getObjectForceCast(objid);
                    this.__functionText = data.getValue("ft");
                    this.update();
                    // TODO: Consider functions that implement ITypeInfo, and use that if they are registered.
                };
                $__type.prototype.equal = function (value) {
                    return typeof value == 'object' && value instanceof Delegate.$__type
                        && value.object === this.object && value.func === this.func;
                };
                // -------------------------------------------------------------------------------------------------------------------
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, object, func) {
                        factory.super.init(o, isnew);
                        if (object === void 0)
                            object = null;
                        o.object = object;
                        o.func = func;
                        o.update();
                    };
                };
                return $__type;
            }(CoreXT.FactoryType(System.Object)));
            Delegate.$__type = $__type;
            Delegate.$__register(System);
        })(Delegate = System.Delegate || (System.Delegate = {}));
        // =======================================================================================================================
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Delegate.js.map