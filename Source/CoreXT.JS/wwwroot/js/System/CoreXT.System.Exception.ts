// ###########################################################################################################################
// Types for error management.
// ###########################################################################################################################

namespace CoreXT.System {
    // =======================================================================================================================

    /** The Exception object is used to record information about errors that occur in an application.
    * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
    */
    export class Exception extends Error {

        message: string;
        source: object;

        /** Records information about errors that occur in the application.
        * Note: Creating an exception object automatically creates a corresponding log entry, unless the 'log' parameter is set to false.
        * @param {string} message The error message.
        * @param {object} source An object that is associated with the message, or null.
        * @param {boolean} log True to automatically create a corresponding log entry (default), or false to skip.
        */
        constructor(message: string, source: object, log?: boolean) {
            if (Browser.ES6)
                safeEval("var _super = function() { return null; }"); // (ES6 fix for extending built-in types [calling constructor not supported]; more details on it here: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work)
            super();
            this.message = message;
            this.source = source;
            if (log || log === void 0) System.Diagnostics.log("Exception", message, System.Diagnostics.LogTypes.Error);
        }

        /** Returns the error message for this exception instance. */
        toString() { return this.message; }
        valueOf() { return this.message; }

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
        static from(logItem: System.Diagnostics.LogItem, source?: object): Exception;
        /** Generates an exception object from a simple string message.
        * Note: This is different from 'error()' in that logging is more implicit (there is no 'title' parameter, and the log title defaults to "Exception").
        * Usage example: "throw System.Exception.from("Error message.", this);"
        * @param {string} message The error message.
        * @param {object} source The object that is the source of the error, or related to it.
        */
        static from(message: string, source?: object): Exception;
        static from(message: any, source: object = null): Exception {
            // (support LogItem objects natively as the exception message source)
            var createLog = true;
            if (typeof message == 'object' && ((<Diagnostics.LogItem>message).title || (<Diagnostics.LogItem>message).message)) {
                createLog = false; // (this is from a log item, so don't log a second time)
                if (source != void 0)
                    (<Diagnostics.LogItem>message).source = source;
                source = message;
                message = "";
                if ((<Diagnostics.LogItem>message).title)
                    message += (<Diagnostics.LogItem>message).title;
                if ((<Diagnostics.LogItem>message).message) {
                    if (message) message += ": ";
                    message += (<Diagnostics.LogItem>message).message;
                }
            }
            var callerFunction = System.Exception.from.caller;
            var callerFunctionInfo = <ITypeInfo><any>callerFunction;
            var callerName = callerFunctionInfo.$__name;
            //var srcName = callerFunction.substring(callerFunction.indexOf("function"), callerFunction.indexOf("("));
            var args = Exception.from.caller.arguments;
            var _args = args && args.length > 0 ? Array.prototype.join.call(args, ', ') : "";
            var callerSignature = (callerName ? "[" + callerName + "(" + _args + ")]" : "");
            message = (callerSignature ? callerSignature + ": " : "") + message + "\r\n\r\n";
            message += callerFunction + "\r\n\r\nStack:\r\n";
            var caller = callerFunction.caller;
            while (caller) {
                callerName = (<ITypeInfo><any>caller).$__name;
                args = caller.arguments;
                _args = args && args.length > 0 ? Array.prototype.join.call(args, ', ') : "";
                //srcName = callerFunction.substring(callerFunction.indexOf("function"), callerFunction.indexOf(")") + 1);
                if (callerName)
                    message += callerName + "(" + _args + ")\r\n";
                else
                    message += callerFunction + (_args ? " using arguments (" + _args + ")" : "") + "\r\n";
                caller = caller.caller != caller ? caller.caller : null; // (make sure not to fall into an infinite loop)
                caller = caller.caller;
            }
            return new Exception(message, source, createLog);
        }

        /** Logs an error with a title and message, and returns an associated 'Exception' object for the caller to throw.
        * The source of the exception object will be associated with the 'LogItem' object.
        */
        static error(title: string, message: string, source?: object): Exception {
            var logItem = System.Diagnostics.log(title, message, LogTypes.Error);
            return System.Exception.from(logItem, source);
        }

        /** Logs a "Not Implemented" error message with an optional title, and returns an associated 'Exception' object for the caller to throw.
        * The source of the exception object will be associated with the 'LogItem' object.
        * This function is typically used with non-implemented functions in abstract types.
        */
        static notImplemented(functionNameOrTitle: string, source?: object, message?: string): Exception {
            var logItem = System.Diagnostics.log(functionNameOrTitle, "The function is not implemented." + (message ? " " + message : ""), LogTypes.Error);
            return System.Exception.from(logItem, source);
        }
    }

    // =======================================================================================================================
}

// ###########################################################################################################################
