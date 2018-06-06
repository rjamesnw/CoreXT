// #######################################################################################
// Types for error management.
// #######################################################################################

namespace CoreXT.System {
    // =============================================================================================

    /** 
     * The Exception object is used to record information about errors that occur in an application.
     * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
     */
    export class Exception extends FactoryBase() {
        /** Records information about errors that occur in the application.
           * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
           * @param {string} message The error message.
           * @param {object} source An object that is associated with the message, or null.
           * @param {boolean} log True to automatically create a corresponding log entry (default), or false to skip.
           */
        static 'new': (message: string, source: object, log?: boolean) => IException;
        /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
        static init: (o: IException, isnew: boolean, message: string, source: object, log?: boolean) => void;

        /** Returns the current call stack. */
        static printStackTrace(): string[] { // TODO: Review: http://www.eriwen.com/javascript/stacktrace-update/
            var callstack: string[] = [];
            var isCallstackPopulated = false;
            try {
                throw "";
            } catch (e) {
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
                else if (global["opera"] && e.message) { //Opera
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
        }

        /** Generates an exception object from a log item. This allows logging errors separately, then building exceptions from them after.
       * Usage example: "throw System.Exception.from(logItem, this);" (see also: 'System.Diagnostics.log()')
       * @param {Diagnostics.LogItem} logItem A log item entry to use as the error source.
       * @param {object} source The object that is the source of the error, or related to it.
       */
        static from(logItem: System.Diagnostics.ILogItem, source?: object): Exception.$__type;
        /** Generates an exception object from a simple string message.
            * Note: This is different from 'error()' in that logging is more implicit (there is no 'title' parameter, and the log title defaults to "Exception").
            * Usage example: "throw System.Exception.from("Error message.", this);"
            * @param {string} message The error message.
            * @param {object} source The object that is the source of the error, or related to it.
            */
        static from(message: string, source?: object): Exception.$__type;
        static from(message: any, source: object = null): Exception.$__type {
            // (support LogItem objects natively as the exception message source)
            var createLog = true;
            if (typeof message == 'object' && ((<Diagnostics.ILogItem>message).title || (<Diagnostics.ILogItem>message).message)) {
                createLog = false; // (this is from a log item, so don't log a second time)
                if (source != void 0)
                    (<Diagnostics.ILogItem>message).source = source;
                source = message;
                message = "";
                if ((<Diagnostics.ILogItem>source).title)
                    message += (<Diagnostics.ILogItem>source).title;
                if ((<Diagnostics.ILogItem>source).message) {
                    if (message) message += ": ";
                    message += (<Diagnostics.ILogItem>source).message;
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
                || typeof (<ITypeInfo>caller).$__fullname == 'string' && (<ITypeInfo>caller).$__fullname.substr(0, 17) == "System.Exception.")) // TODO: Create "inheritsFrom()" or similar methods.
                caller = caller.caller; // (skip the proxy functions that call this function)
            if (caller) {
                message += "\r\n\r\nStack:\r\n\r\n";
                var stackMsg = "";
                while (caller) {
                    var callerName = getFullTypeName(caller) || "/*anonymous*/";
                    var args = caller.arguments;
                    var _args = args && args.length > 0 ? global.Array.prototype.join.call(args, ', ') : "";
                    if (stackMsg) stackMsg += "called from ";
                    stackMsg += callerName + "(" + _args + ")\r\n\r\n";
                    caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
                }
                message += stackMsg;
            }
            return System.Exception.new(message, source, createLog);
        }

        /** 
         * Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object (if 'System.Diagnostics' is loaded).
         */
        static error(title: string, message: string, source?: object): Exception.$__type {
            if (System.Diagnostics && System.Diagnostics.log) {
                var logItem = System.Diagnostics.log(title, message, LogTypes.Error);
                return Exception.from(logItem, source);
            }
            else return Exception.from(error(title, message, source, false, false), source);
        }

        /** 
         * Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
         * The source of the exception object will be associated with the 'LogItem' object.
         * This function is typically used with non-implemented functions in abstract types.
         */
        static notImplemented(functionNameOrTitle: string, source?: object, message?: string): Exception.$__type {
            var msg = "The function is not implemented." + (message ? " " + message : "");
            if (System.Diagnostics && System.Diagnostics.log) {
                var logItem = System.Diagnostics.log(functionNameOrTitle, msg, LogTypes.Error);
                return Exception.from(logItem, source);
            }
            else return Exception.from(error(functionNameOrTitle, msg, source, false, false), source);
        }
    }
    export namespace Exception {
        export class $__type extends DisposableFromBase(Error) {
            source: object;
            /** Returns the error message for this exception instance. */
            toString() { return this.message; }
            valueOf() { return this.message; }

            private static [constructor](factory: typeof Exception) {
                factory.init = (o, isnew, message, source, log?) => {
                    o.message = message;
                    o.source = source;
                    o.stack = (new Error()).stack;
                    if (log || log === void 0) Diagnostics.log("Exception", message, LogTypes.Error);
                };
            }
        }
        Exception.register(System);
    }

    export interface IException extends InstanceType<typeof Exception.$__type> { }

    // =============================================================================================
}

// #######################################################################################
