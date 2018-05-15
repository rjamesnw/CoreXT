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
        System.Exception = CoreXT.ClassFactory(System, void 0, function (base) {
            var Exception = (function (_super) {
                __extends(Exception, _super);
                function Exception() {
                    var _this = this;
                    if (!CoreXT.ES6)
                        eval("var _super = function() { return null; }");
                    _this = _super.call(this) || this;
                    return _this;
                }
                Exception.prototype.toString = function () { return this.message; };
                Exception.prototype.valueOf = function () { return this.message; };
                Exception.printStackTrace = function () {
                    var callstack = [];
                    var isCallstackPopulated = false;
                    try {
                        throw "";
                    }
                    catch (e) {
                        if (e.stack) {
                            var lines = e.stack.split('\n');
                            for (var i = 0, len = lines.length; i < len; ++i) {
                                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                                    callstack.push(lines[i]);
                                }
                            }
                            callstack.shift();
                            isCallstackPopulated = true;
                        }
                        else if (CoreXT.global["opera"] && e.message) {
                            var lines = e.message.split('\n');
                            for (var i = 0, len = lines.length; i < len; ++i) {
                                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                                    var entry = lines[i];
                                    if (lines[i + 1]) {
                                        entry += ' at ' + lines[i + 1];
                                        i++;
                                    }
                                    callstack.push(entry);
                                }
                            }
                            callstack.shift();
                            isCallstackPopulated = true;
                        }
                    }
                    if (!isCallstackPopulated) {
                        var currentFunction = arguments.callee.caller;
                        while (currentFunction) {
                            var fn = currentFunction.toString();
                            var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
                            callstack.push(fname);
                            currentFunction = currentFunction.caller;
                        }
                    }
                    return callstack;
                };
                Exception.from = function (message, source) {
                    if (source === void 0) { source = null; }
                    var createLog = true;
                    if (typeof message == 'object' && (message.title || message.message)) {
                        createLog = false;
                        if (source != void 0)
                            message.source = source;
                        source = message;
                        message = "";
                        if (source.title)
                            message += source.title;
                        if (source.message) {
                            if (message)
                                message += ": ";
                            message += source.message;
                        }
                    }
                    var caller = this.from.caller;
                    while (caller && (caller == System.Exception.error || caller == System.Exception.notImplemented || caller == CoreXT.log || caller == CoreXT.error
                        || typeof caller.$__fullname == 'string' && caller.$__fullname.substr(0, 17) == "System.Exception."))
                        caller = caller.caller;
                    if (caller) {
                        message += "\r\n\r\nStack:\r\n\r\n";
                        var stackMsg = "";
                        while (caller) {
                            var callerName = CoreXT.getFullTypeName(caller) || "/*anonymous*/";
                            var args = caller.arguments;
                            var _args = args && args.length > 0 ? CoreXT.global.Array.prototype.join.call(args, ', ') : "";
                            if (stackMsg)
                                stackMsg += "called from ";
                            stackMsg += callerName + "(" + _args + ")\r\n\r\n";
                            caller = caller.caller != caller ? caller.caller : null;
                        }
                        message += stackMsg;
                    }
                    return System.Exception.new(message, source, createLog);
                };
                Exception.error = function (title, message, source) {
                    if (System.Diagnostics && System.Diagnostics.log) {
                        var logItem = System.Diagnostics.log(title, message, CoreXT.LogTypes.Error);
                        return Exception.from(logItem, source);
                    }
                    else
                        return Exception.from(CoreXT.error(title, message, source, false, false), source);
                };
                Exception.notImplemented = function (functionNameOrTitle, source, message) {
                    var msg = "The function is not implemented." + (message ? " " + message : "");
                    if (System.Diagnostics && System.Diagnostics.log) {
                        var logItem = System.Diagnostics.log(functionNameOrTitle, msg, CoreXT.LogTypes.Error);
                        return Exception.from(logItem, source);
                    }
                    else
                        return Exception.from(CoreXT.error(functionNameOrTitle, msg, source, false, false), source);
                };
                Exception['ExceptionFactory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function (message, source, log) { return null; };
                    Factory.init = function (o, isnew, message, source, log) {
                        o.message = message;
                        o.source = source;
                        o.stack = (new Error()).stack;
                        if (log || log === void 0)
                            System.Diagnostics.log("Exception", message, CoreXT.LogTypes.Error);
                    };
                    return Factory;
                }(CoreXT.FactoryBase(Exception, null)));
                return Exception;
            }(Error));
            return [Exception, Exception["ExceptionFactory"]];
        });
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Exception.js.map