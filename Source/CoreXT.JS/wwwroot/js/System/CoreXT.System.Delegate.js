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
        ;
        var $Delegate = (function (_super) {
            __extends($Delegate, _super);
            function $Delegate() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            $Delegate.prototype.___static_ctor = function () {
                function makeCases(argsIndexStart, caseCountMax, func, funcName, contextStr, argsStr) {
                    var ftext = func.toString();
                    var matchRegex = /^.*case 1:.*/m;
                    var cases = "", argtext = "";
                    for (var i = argsIndexStart, n = argsIndexStart + caseCountMax; i < n; ++i)
                        cases += "case " + (1 + i) + ": return " + funcName + "(" + contextStr + (argtext += argsStr + "[" + i + "], ") + "this);\r\n";
                    return CoreXT.safeEval("(" + ftext.replace(matchRegex, cases) + ")");
                }
                $Delegate.fastApply = makeCases(0, 20, function (func, context, args) {
                    if (!arguments.length)
                        throw System.Exception.error("Delegate.fastApply()", "No function specified.");
                    if (typeof func !== 'function')
                        throw System.Exception.error("Delegate.fastApply()", "Function object expected.");
                    if (arguments.length == 1 || context == void 0 && (args == void 0 || !args.length))
                        return func();
                    switch (args.length) {
                        case 1: return func.call(context, args[0]);
                        default: return func.apply(context, args);
                    }
                }, "func.call", "context, ", "args");
                $Delegate.fastCall = makeCases(0, 20, function (func, context) {
                    if (!arguments.length)
                        throw System.Exception.error("Delegate.fastCall()", "No function specified.");
                    if (typeof func !== 'function')
                        throw System.Exception.error("Delegate.fastApply()", "Function object expected.");
                    var restArgsLength = arguments.length - 2;
                    if (arguments.length == 1 || context == void 0 && !restArgsLength)
                        return func();
                    switch (restArgsLength) {
                        case 1: return func.call(context, arguments[0]);
                        default: return func.apply(context, arguments);
                    }
                }, "func.call", "context, ", "arguments");
                $Delegate.prototype.invoke = makeCases(0, 20, function () {
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
                $Delegate.prototype.call = ((CoreXT.Browser.type != CoreXT.Browser.BrowserTypes.IE) ?
                    makeCases(0, 20, call, "$this.func", "$this.object, ", "arguments")
                    : makeCases(0, 20, call, "$this.__boundFunc", "", "arguments"));
                var apply = function (context, argsArray) {
                    var $this = this;
                    if (arguments.length == 1) {
                        argsArray = context;
                        context = $this.object;
                    }
                    else if (arguments.length > 1 && $this.apply != $this.__apply)
                        return $this.__apply(context, argsArray);
                    if (argsArray == void 0 || !argsArray.length)
                        return $this.invoke(context, this);
                    switch (argsArray.length) {
                        case 1: return $this.func(context, argsArray[0], this);
                        default: return $this.func.apply(this, [context].concat(argsArray, this));
                    }
                };
                $Delegate.prototype.__apply = makeCases(0, 20, apply, "$this.func", "context, ", "args");
                $Delegate.prototype.apply = ((CoreXT.Browser.type != CoreXT.Browser.BrowserTypes.IE) ? $Delegate.prototype.__apply : makeCases(0, 20, apply, "$this.__boundFunc", "", "args"));
            };
            Object.defineProperty($Delegate.prototype, "key", {
                get: function () { return this.__key; },
                enumerable: true,
                configurable: true
            });
            $Delegate.prototype.update = function () {
                if (typeof this.func != 'function')
                    System.Exception.error("Delegate", "The function value is not a function:\r\n {Delegate}.func = " + this.func, this.func);
                if (this.func.bind)
                    this.__boundFunc = this.func.bind(this, this.object);
                if (this.object instanceof System.Object)
                    this.__key = $Delegate.getKey(this.object, this.func);
                else
                    this.__key = void 0;
                return this;
            };
            $Delegate.__validate = function (callername, object, func) {
                var isstatic = object === void 0 || object === null || !!object.$__fullname;
                if (!isstatic && typeof object.$__id != 'number')
                    throw System.Exception.error("Delegate." + callername, "The object for this delegate does not contain a numerical '$__id' value (used as a global object reference for serialization), or '$__fullname' value (for static type references).  See 'AppDomain.registerClass()'.", this);
                return isstatic;
            };
            $Delegate.prototype.getData = function (data) {
                var isstatic = $Delegate.__validate("getData()", this.object, this.func);
                if (!isstatic)
                    data.addValue("id", this.object.$__id);
                data.addValue("ft", this.__functionText);
            };
            $Delegate.prototype.setData = function (data) {
                var objid = data.getNumber("id");
                this.object = this.$__appDomain.objects.getObjectForceCast(objid);
                this.__functionText = data.getValue("ft");
                this.update();
            };
            $Delegate.getKey = function (object, func) {
                var isstatic = $Delegate.__validate("getKey()", object, func);
                var id = isstatic ? (object === void 0 || object === null ? '-1' : object.$__fullname) : object.$__id.toString();
                return id + "," + func.$__name;
            };
            $Delegate.prototype.equal = function (value) {
                return typeof value == 'object' && value instanceof $Delegate
                    && value.object === this.object && value.func === this.func;
            };
            $Delegate.__static_ctor = $Delegate.prototype.___static_ctor();
            $Delegate['$Delegate Factory'] = function () {
                return (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory.prototype['new'] = function (object, func) { return null; };
                    Factory.prototype.init = function ($this, isnew, object, func) {
                        this.$__baseFactory.init($this, isnew);
                        if (object === void 0)
                            object = null;
                        $this.object = object;
                        $this.func = func;
                        $this.update();
                        return $this;
                    };
                    return Factory;
                }(CoreXT.FactoryBase($Delegate, $Delegate['$Object Factory']))).register(System);
            }();
            return $Delegate;
        }(System.Object.$__type));
        System.Delegate = $Delegate['$Delegate Factory'].$__type;
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Delegate.js.map