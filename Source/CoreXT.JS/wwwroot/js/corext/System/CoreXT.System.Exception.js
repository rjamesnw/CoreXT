// #######################################################################################
// Types for error management.
// #######################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        // =============================================================================================
        /**
         * The Exception object is used to record information about errors that occur in an application.
         * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
         */
        var Exception = /** @class */ (function (_super) {
            __extends(Exception, _super);
            function Exception() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /** Returns the current call stack. */
            Exception.printStackTrace = function () {
                var callstack = [];
                var isCallstackPopulated = false;
                try {
                    throw "";
                }
                catch (e) {
                    if (e.stack) { //Firefox
                        var lines = e.stack.split('\n');
                        for (var i = 0, len = lines.length; i < len; ++i) {
                            if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                                callstack.push(lines[i]);
                            }
                        }
                        //Remove call to printStackTrace()
                        callstack.shift();
                        isCallstackPopulated = true;
                    }
                    else if (CoreXT.global["opera"] && e.message) { //Opera
                        var lines = e.message.split('\n');
                        for (var i = 0, len = lines.length; i < len; ++i) {
                            if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                                var entry = lines[i];
                                //Append next line also since it has the file info
                                if (lines[i + 1]) {
                                    entry += ' at ' + lines[i + 1];
                                    i++;
                                }
                                callstack.push(entry);
                            }
                        }
                        //Remove call to printStackTrace()
                        callstack.shift();
                        isCallstackPopulated = true;
                    }
                }
                if (!isCallstackPopulated) { //IE and Safari
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
                // (support LogItem objects natively as the exception message source)
                var createLog = true;
                if (typeof message == 'object' && (message.title || message.message)) {
                    createLog = false; // (this is from a log item, so don't log a second time)
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
                //var callerFunction = System.Exception.from.caller;
                //var callerFunctionInfo = <ITypeInfo><any>callerFunction;
                //var callerName = getFullTypeName(callerFunctionInfo) || "/*anonymous*/";
                ////var srcName = callerFunction.substring(callerFunction.indexOf("function"), callerFunction.indexOf("("));
                //var args = callerFunction.arguments;
                //var _args = args && args.length > 0 ? global.Array.prototype.join.call(args, ', ') : "";
                //var callerSignature = (callerName ? "[" + callerName + "(" + _args + ")]" : "");
                //message += (callerSignature ? callerSignature + ": " : "") + message + "\r\n\r\n";
                var caller = this.from.caller;
                while (caller && (caller == System.Exception.error || caller == System.Exception.notImplemented || caller == CoreXT.log || caller == CoreXT.error
                    || typeof caller.$__fullname == 'string' && caller.$__fullname.substr(0, 17) == "System.Exception.")) // TODO: Create "inheritsFrom()" or similar methods.
                    caller = caller.caller; // (skip the proxy functions that call this function)
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
                        caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
                    }
                    message += stackMsg;
                }
                return System.Exception.new(message, source, createLog);
            };
            /**
             * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
             * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
             */
            Exception.error = function (title, message, source) {
                if (System.Diagnostics && System.Diagnostics.log) {
                    var logItem = System.Diagnostics.log(title, message, CoreXT.LogTypes.Error);
                    return Exception.from(logItem, source);
                }
                else
                    return Exception.from(CoreXT.error(title, message, source, false, false), source);
            };
            /**
             * Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
             * The source of the exception object will be associated with the 'LogItem' object.
             * This function is typically used with non-implemented functions in abstract types.
             */
            Exception.notImplemented = function (functionNameOrTitle, source, message) {
                var msg = "The function is not implemented." + (message ? " " + message : "");
                if (System.Diagnostics && System.Diagnostics.log) {
                    var logItem = System.Diagnostics.log(functionNameOrTitle, msg, CoreXT.LogTypes.Error);
                    return Exception.from(logItem, source);
                }
                else
                    return Exception.from(CoreXT.error(functionNameOrTitle, msg, source, false, false), source);
            };
            return Exception;
        }(CoreXT.FactoryBase()));
        System.Exception = Exception;
        (function (Exception) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /** Returns the error message for this exception instance. */
                $__type.prototype.toString = function () { return this.message; };
                $__type.prototype.valueOf = function () { return this.message; };
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, message, source, log) {
                        o.message = message;
                        o.source = source;
                        o.stack = (new Error()).stack;
                        if (log || log === void 0)
                            System.Diagnostics.log("Exception", message, CoreXT.LogTypes.Error);
                    };
                };
                return $__type;
            }(CoreXT.DisposableFromBase(Error)));
            Exception.$__type = $__type;
            Exception.$__register(System);
        })(Exception = System.Exception || (System.Exception = {}));
        // =============================================================================================
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
// #######################################################################################
//# sourceMappingURL=CoreXT.System.Exception.js.map